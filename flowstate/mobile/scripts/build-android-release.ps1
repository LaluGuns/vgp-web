param(
  [switch]$SkipNpmCi
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FlowRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
$AndroidRoot = Join-Path $FlowRoot "mobile\android"
$Artifacts = Join-Path $FlowRoot "artifacts\android-release"
$CredentialRoot = Join-Path $env:LOCALAPPDATA "Flow\release-credentials"
$KeystorePath = Join-Path $CredentialRoot "flow-upload.jks"
$CredentialPath = Join-Path $CredentialRoot "flow-upload-credentials.xml"
$Alias = "flow-upload"

function Invoke-Checked {
  param([Parameter(Mandatory=$true)][string]$Command, [Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments)
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Command failed with exit code $LASTEXITCODE" }
}

function New-RandomPassword {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return ([System.BitConverter]::ToString($bytes)).Replace("-", "").ToLowerInvariant()
}

function ConvertTo-PlainText {
  param([Parameter(Mandatory=$true)][Security.SecureString]$SecureString)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is required" }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "npm is required" }
if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) { throw "keytool is required. Install/use JDK 21." }
if (-not (Get-Command jarsigner -ErrorAction SilentlyContinue)) { throw "jarsigner is required. Install/use JDK 21." }

New-Item -ItemType Directory -Force -Path $CredentialRoot | Out-Null
New-Item -ItemType Directory -Force -Path $Artifacts | Out-Null

if ((Test-Path $KeystorePath) -xor (Test-Path $CredentialPath)) {
  throw "Flow signing state is incomplete. Keep both $KeystorePath and $CredentialPath together, or restore the missing file before building."
}

if (-not (Test-Path $KeystorePath)) {
  Write-Host "Creating a dedicated Flow Google Play upload key in LOCALAPPDATA..."
  $password = New-RandomPassword
  Invoke-Checked keytool -genkeypair -v -keystore $KeystorePath -storetype JKS -alias $Alias -keyalg RSA -keysize 4096 -validity 10000 -storepass $password -keypass $password -dname "CN=Virzy Guns, OU=Mobile, O=PT Kreasi Virzy Nusantara, L=Lombok Tengah, ST=Nusa Tenggara Barat, C=ID"

  $secure = ConvertTo-SecureString $password -AsPlainText -Force
  [pscustomobject]@{
    Alias = $Alias
    KeystorePath = $KeystorePath
    StorePassword = $secure
    KeyPassword = $secure
  } | Export-Clixml -Path $CredentialPath

  Remove-Variable password -ErrorAction SilentlyContinue
  Write-Host "Upload key created. Password backup is DPAPI-encrypted for this Windows user."
}

$credentials = Import-Clixml -Path $CredentialPath
if ($credentials.Alias -ne $Alias) { throw "Unexpected Flow upload-key alias in credential backup" }
if ($credentials.KeystorePath -ne $KeystorePath) { throw "Unexpected Flow keystore path in credential backup" }

$storePassword = ConvertTo-PlainText $credentials.StorePassword
$keyPassword = ConvertTo-PlainText $credentials.KeyPassword

try {
  $env:FLOW_UPLOAD_STORE_FILE = $KeystorePath
  $env:FLOW_UPLOAD_STORE_PASSWORD = $storePassword
  $env:FLOW_UPLOAD_KEY_ALIAS = $Alias
  $env:FLOW_UPLOAD_KEY_PASSWORD = $keyPassword

  Push-Location $FlowRoot
  try {
    if (-not $SkipNpmCi) { Invoke-Checked npm ci }
    Invoke-Checked npm run mobile:verify
    Invoke-Checked npm run mobile:test
    Invoke-Checked npm run mobile:typecheck
    Invoke-Checked npm run mobile:build
    Invoke-Checked npm audit --omit=dev --audit-level=high
    Invoke-Checked npm run mobile:apply:android
    Invoke-Checked npx cap sync android
    Invoke-Checked npm run mobile:verify:android-release

    Push-Location $AndroidRoot
    try {
      Invoke-Checked .\gradlew.bat --no-daemon clean bundleRelease lintRelease testDebugUnitTest
    }
    finally { Pop-Location }

    $BuiltAab = Join-Path $AndroidRoot "app\build\outputs\bundle\release\app-release.aab"
    if (-not (Test-Path $BuiltAab)) { throw "Signed release AAB was not produced" }

    Invoke-Checked jarsigner -verify -strict -certs $BuiltAab

    $FinalAab = Join-Path $Artifacts "flow-android-v1.0.0-build1-signed.aab"
    Copy-Item -Force $BuiltAab $FinalAab
    $hash = (Get-FileHash -Algorithm SHA256 $FinalAab).Hash.ToLowerInvariant()
    "$hash  flow-android-v1.0.0-build1-signed.aab" | Set-Content -Encoding ascii (Join-Path $Artifacts "SHA256SUMS.txt")

    $certOutput = & keytool -list -v -keystore $KeystorePath -storepass $storePassword -alias $Alias
    if ($LASTEXITCODE -ne 0) { throw "Unable to read Flow upload certificate metadata" }
    $safeCertLines = $certOutput | Select-String -Pattern "Alias name:|Entry type:|Owner:|Valid from:|SHA1:|SHA256:|Signature algorithm name:|Subject Public Key Algorithm:" | ForEach-Object { $_.Line.Trim() }
    @(
      "Flow Android upload signing record",
      "Keystore path: $KeystorePath",
      "Alias: $Alias",
      "Private key and passwords are not stored in this artifact or repository.",
      "Password backup: $CredentialPath (Windows DPAPI encrypted).",
      "",
      $safeCertLines
    ) | Set-Content -Encoding utf8 (Join-Path $Artifacts "FLOW_ANDROID_SIGNING_CERT.txt")

    Write-Host ""
    Write-Host "FLOW ANDROID SIGNED RELEASE BUILD PASS"
    Write-Host "AAB: $FinalAab"
    Write-Host "SHA256: $hash"
    Write-Host "Signing metadata: $(Join-Path $Artifacts 'FLOW_ANDROID_SIGNING_CERT.txt')"
    Write-Host "Next gate: upload this AAB to Google Play Internal Testing and complete a real test purchase/restore cycle."
  }
  finally { Pop-Location }
}
finally {
  Remove-Item Env:FLOW_UPLOAD_STORE_FILE -ErrorAction SilentlyContinue
  Remove-Item Env:FLOW_UPLOAD_STORE_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:FLOW_UPLOAD_KEY_ALIAS -ErrorAction SilentlyContinue
  Remove-Item Env:FLOW_UPLOAD_KEY_PASSWORD -ErrorAction SilentlyContinue
  Remove-Variable storePassword -ErrorAction SilentlyContinue
  Remove-Variable keyPassword -ErrorAction SilentlyContinue
}
