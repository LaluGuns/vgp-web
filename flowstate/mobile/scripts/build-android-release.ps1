param(
  [switch]$CreateUploadKeyIfMissing,
  [string]$ExpectedUploadCertSha256 = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FlowRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
$WorkspaceRoot = Split-Path -Parent $FlowRoot
$AndroidRoot = Join-Path $FlowRoot "mobile\android"
$Artifacts = Join-Path $FlowRoot "artifacts\android-release"
$CredentialRoot = Join-Path $env:LOCALAPPDATA "Flow\release-credentials"
$KeystorePath = Join-Path $CredentialRoot "flow-upload.jks"
$CredentialPath = Join-Path $CredentialRoot "flow-upload-credentials.xml"
$Alias = "flow-upload"
$ManifestPath = Join-Path $FlowRoot "mobile\SOURCE_MANIFEST_SHA256.txt"
$AuthorityPath = Join-Path $FlowRoot "mobile\BUILD_AUTHORITY.json"
$AndroidSdkRoot = $null
$ApkSignerPath = $null

function Invoke-Checked {
  param(
    [Parameter(Mandatory=$true)][string]$Command,
    [Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments
  )
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Command failed with exit code $LASTEXITCODE" }
}

function New-RandomPassword {
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  return ([System.BitConverter]::ToString($bytes)).Replace("-", "").ToLowerInvariant()
}

function ConvertTo-PlainText {
  param([Parameter(Mandatory=$true)][Security.SecureString]$SecureString)
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Assert-Tool {
  param([Parameter(Mandatory=$true)][string]$Name, [string]$Message = "")
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    if ($Message) { throw $Message }
    throw "$Name is required"
  }
}

function Assert-ReleaseEnvironment {
  if ($env:OS -ne "Windows_NT") { throw "The signed Flow release build must run on Windows." }

  Assert-Tool node "Node.js 24 is required."
  Assert-Tool npm "npm is required."
  Assert-Tool java "JDK 21 is required."
  Assert-Tool keytool "keytool is required. Install/use JDK 21."
  Assert-Tool jarsigner "jarsigner is required. Install/use JDK 21."
  Assert-Tool jar "jar is required. Install/use JDK 21."

  $nodeVersion = (& node -p "process.versions.node").Trim()
  if ($LASTEXITCODE -ne 0 -or -not $nodeVersion.StartsWith("24.")) {
    throw "Flow signed release builds require Node.js 24.x. Found: $nodeVersion"
  }

  $javaVersionText = (& java -version 2>&1 | Out-String)
  if ($LASTEXITCODE -ne 0 -or $javaVersionText -notmatch 'version "21(?:\.|")') {
    throw "Flow signed release builds require JDK 21. java -version returned: $javaVersionText"
  }

  $script:AndroidSdkRoot = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { $null }
  if (-not $script:AndroidSdkRoot -or -not (Test-Path $script:AndroidSdkRoot)) {
    throw "Android SDK is required. Set ANDROID_HOME or ANDROID_SDK_ROOT."
  }
  if (-not (Test-Path (Join-Path $script:AndroidSdkRoot "platforms\android-36\android.jar"))) {
    throw "Android SDK platform 36 is required."
  }
  $script:ApkSignerPath = Join-Path $script:AndroidSdkRoot "build-tools\36.0.0\apksigner.bat"
  if (-not (Test-Path $script:ApkSignerPath)) {
    throw "Android build-tools 36.0.0 is required for release verification."
  }
}

function Assert-CleanGitAuthority {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { return $null }

  Push-Location $FlowRoot
  try {
    & git rev-parse --is-inside-work-tree *> $null
    if ($LASTEXITCODE -ne 0) { return $null }

    $status = (& git status --porcelain -- .)
    if ($LASTEXITCODE -ne 0) { throw "Unable to inspect Git worktree state." }
    if ($status) {
      throw "Refusing to build a signed release from a dirty Flow worktree. Commit/revert changes first."
    }

    $commit = (& git rev-parse HEAD).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $commit) { throw "Unable to resolve Git authority commit." }
    return $commit
  }
  finally { Pop-Location }
}

function Test-SourceManifest {
  if (-not (Test-Path $ManifestPath)) { return $false }

  $checked = 0
  foreach ($line in Get-Content $ManifestPath) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line -notmatch '^([0-9a-fA-F]{64})\s+\*?(.+)$') {
      throw "Invalid source-manifest line: $line"
    }

    $expected = $Matches[1].ToLowerInvariant()
    $relative = $Matches[2].Trim()
    $candidate = Join-Path $WorkspaceRoot ($relative -replace '/', '\')
    if (-not (Test-Path $candidate -PathType Leaf)) {
      throw "Source-manifest file is missing: $relative"
    }

    $actual = (Get-FileHash -Algorithm SHA256 $candidate).Hash.ToLowerInvariant()
    if ($actual -ne $expected) {
      throw "Source authority mismatch for $relative. Expected $expected, got $actual"
    }
    $checked++
  }

  if ($checked -lt 1) { throw "Source manifest did not contain any files." }
  Write-Host "Source manifest verified: $checked files"
  return $true
}

function Read-BuildAuthority {
  if (-not (Test-Path $AuthorityPath)) { return $null }
  try {
    return (Get-Content $AuthorityPath -Raw | ConvertFrom-Json)
  }
  catch {
    throw "BUILD_AUTHORITY.json is invalid: $($_.Exception.Message)"
  }
}

function Get-VersionInfo {
  $gradlePath = Join-Path $AndroidRoot "app\build.gradle"
  if (-not (Test-Path $gradlePath)) { throw "Generated Android app/build.gradle is missing." }
  $gradle = Get-Content $gradlePath -Raw
  if ($gradle -notmatch 'versionCode\s+(\d+)') { throw "Unable to resolve versionCode." }
  $versionCode = [int]$Matches[1]
  if ($gradle -notmatch 'versionName\s+"([^"]+)"') { throw "Unable to resolve versionName." }
  $versionName = $Matches[1]
  return [pscustomobject]@{ VersionCode = $versionCode; VersionName = $versionName }
}

function Export-UploadCertificate {
  $der = Join-Path $env:TEMP ("flow-upload-cert-" + [guid]::NewGuid().ToString("N") + ".der")
  $pem = Join-Path $Artifacts "FLOW_UPLOAD_CERTIFICATE.pem"
  try {
    Invoke-Checked keytool -exportcert -keystore $KeystorePath -storepass:env FLOW_UPLOAD_STORE_PASSWORD -alias $Alias -file $der | Out-Null
    Invoke-Checked keytool -exportcert -rfc -keystore $KeystorePath -storepass:env FLOW_UPLOAD_STORE_PASSWORD -alias $Alias -file $pem | Out-Null

    $sha256 = (Get-FileHash -Algorithm SHA256 $der).Hash.ToLowerInvariant()
    $sha1 = (Get-FileHash -Algorithm SHA1 $der).Hash.ToLowerInvariant()
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($der)

    return [pscustomobject]@{
      Sha256 = $sha256
      Sha1 = $sha1
      Subject = $cert.Subject
      Issuer = $cert.Issuer
      NotBeforeUtc = $cert.NotBefore.ToUniversalTime().ToString("o")
      NotAfterUtc = $cert.NotAfter.ToUniversalTime().ToString("o")
    }
  }
  finally {
    Remove-Item $der -Force -ErrorAction SilentlyContinue
  }
}

function Assert-NoNativeLibraries {
  param([Parameter(Mandatory=$true)][string]$BundlePath)

  $entries = & jar tf $BundlePath
  if ($LASTEXITCODE -ne 0) { throw "Unable to inspect AAB contents with jar." }
  $native = @($entries | Where-Object { $_ -match '\.so$' })
  if ($native.Count -gt 0) {
    $preview = ($native | Select-Object -First 20) -join ", "
    throw "Native .so libraries were introduced into the Flow AAB. The release authority currently expects zero native shared libraries. Explicit 16 KB page-size compatibility verification is required before release. Found: $preview"
  }
  Write-Host "Native library gate PASS: no .so files in AAB"
  return 0
}

function Get-GradleVersion {
  Push-Location $AndroidRoot
  try {
    $output = (& .\gradlew.bat --version | Out-String)
    if ($LASTEXITCODE -ne 0) { throw "Unable to read Gradle version." }
    if ($output -match 'Gradle\s+([^\s]+)') { return $Matches[1] }
    return "unknown"
  }
  finally { Pop-Location }
}

Assert-ReleaseEnvironment

$gitCommit = Assert-CleanGitAuthority
$manifestVerified = Test-SourceManifest
$authority = Read-BuildAuthority

if ($authority) {
  if ($authority.package -ne "com.virzyguns.flow") { throw "Unexpected package in BUILD_AUTHORITY.json" }
  if ($authority.versionName -ne "1.0.0" -or [int]$authority.versionCode -ne 1) {
    throw "Unexpected version in BUILD_AUTHORITY.json"
  }
  if ($gitCommit -and $authority.commit -and $gitCommit -ne $authority.commit) {
    throw "Git HEAD does not match packaged BUILD_AUTHORITY.json commit."
  }
}

New-Item -ItemType Directory -Force -Path $CredentialRoot | Out-Null
if (Test-Path $Artifacts) { Remove-Item -Recurse -Force $Artifacts }
New-Item -ItemType Directory -Force -Path $Artifacts | Out-Null

if ((Test-Path $KeystorePath) -xor (Test-Path $CredentialPath)) {
  throw "Flow signing state is incomplete. Keep both $KeystorePath and $CredentialPath together, or restore the missing file before building."
}

if (-not (Test-Path $KeystorePath)) {
  if (-not $CreateUploadKeyIfMissing) {
    throw "No Flow upload key exists at $KeystorePath. Refusing to create a new signing identity implicitly. If this is the first Play signing setup and you have confirmed there is no existing Flow upload key/certificate to preserve, rerun with -CreateUploadKeyIfMissing."
  }

  Write-Host "Creating a dedicated Flow Google Play upload key in LOCALAPPDATA..."
  $password = New-RandomPassword
  try {
    $env:FLOW_NEW_KEY_PASSWORD = $password
    Invoke-Checked keytool -genkeypair -v -keystore $KeystorePath -storetype JKS -alias $Alias -keyalg RSA -keysize 4096 -validity 10000 -storepass:env FLOW_NEW_KEY_PASSWORD -keypass:env FLOW_NEW_KEY_PASSWORD -dname "CN=Virzy Guns, OU=Mobile, O=PT Kreasi Virzy Nusantara, L=Lombok Tengah, ST=Nusa Tenggara Barat, C=ID"

    $secure = ConvertTo-SecureString $password -AsPlainText -Force
    [pscustomobject]@{
      Alias = $Alias
      KeystorePath = $KeystorePath
      StorePassword = $secure
      KeyPassword = $secure
    } | Export-Clixml -Path $CredentialPath
  }
  finally {
    Remove-Item Env:FLOW_NEW_KEY_PASSWORD -ErrorAction SilentlyContinue
    Remove-Variable password -ErrorAction SilentlyContinue
  }
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

  Invoke-Checked keytool -list -keystore $KeystorePath -storepass:env FLOW_UPLOAD_STORE_PASSWORD -alias $Alias
  $cert = Export-UploadCertificate

  $expectedCert = $ExpectedUploadCertSha256.Trim().Replace(":", "").ToLowerInvariant()
  if ($expectedCert -and $expectedCert -notmatch '^[0-9a-f]{64}$') {
    throw "ExpectedUploadCertSha256 must be exactly 64 hexadecimal characters, with optional colons."
  }
  if ($expectedCert -and $cert.Sha256 -ne $expectedCert) {
    throw "Flow upload certificate SHA-256 mismatch. Expected $expectedCert, got $($cert.Sha256). Do not upload this build to Play."
  }
  if ([datetime]$cert.NotAfterUtc -le (Get-Date).ToUniversalTime()) {
    throw "Flow upload certificate is expired."
  }

  Push-Location $FlowRoot
  try {
    Invoke-Checked npm ci
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
      Invoke-Checked .\gradlew.bat --no-daemon clean assembleRelease bundleRelease lintRelease testDebugUnitTest testReleaseUnitTest
    }
    finally { Pop-Location }

    $BuiltAab = Join-Path $AndroidRoot "app\build\outputs\bundle\release\app-release.aab"
    $BuiltApk = Join-Path $AndroidRoot "app\build\outputs\apk\release\app-release.apk"
    if (-not (Test-Path $BuiltAab)) { throw "Signed release AAB was not produced" }
    if (-not (Test-Path $BuiltApk)) { throw "Signed release APK was not produced" }

    Invoke-Checked jarsigner -verify -strict -certs $BuiltAab
    Invoke-Checked $ApkSignerPath verify --verbose --print-certs $BuiltApk
    $nativeLibraryCount = Assert-NoNativeLibraries -BundlePath $BuiltAab

    $version = Get-VersionInfo
    $finalBase = "flow-android-v$($version.VersionName)-build$($version.VersionCode)"
    $FinalAab = Join-Path $Artifacts "$finalBase-signed.aab"
    $FinalApk = Join-Path $Artifacts "$finalBase-signed.apk"
    Copy-Item -Force $BuiltAab $FinalAab
    Copy-Item -Force $BuiltApk $FinalApk

    $aabHash = (Get-FileHash -Algorithm SHA256 $FinalAab).Hash.ToLowerInvariant()
    $apkHash = (Get-FileHash -Algorithm SHA256 $FinalApk).Hash.ToLowerInvariant()
    @(
      "$aabHash  $(Split-Path -Leaf $FinalAab)",
      "$apkHash  $(Split-Path -Leaf $FinalApk)"
    ) | Set-Content -Encoding ascii (Join-Path $Artifacts "SHA256SUMS.txt")

    @(
      "Flow Android upload signing record",
      "Keystore path: $KeystorePath",
      "Alias: $Alias",
      "Private key and passwords are not stored in this artifact or repository.",
      "Password backup: $CredentialPath (Windows DPAPI encrypted).",
      "Certificate SHA-256: $($cert.Sha256)",
      "Certificate SHA-1: $($cert.Sha1)",
      "Subject: $($cert.Subject)",
      "Issuer: $($cert.Issuer)",
      "Valid from UTC: $($cert.NotBeforeUtc)",
      "Valid until UTC: $($cert.NotAfterUtc)"
    ) | Set-Content -Encoding utf8 (Join-Path $Artifacts "FLOW_ANDROID_SIGNING_CERT.txt")

    $sourceCommit = if ($authority -and $authority.commit) { [string]$authority.commit } elseif ($gitCommit) { $gitCommit } else { "unknown" }
    $sourceBranch = if ($authority -and $authority.branch) { [string]$authority.branch } else { "unknown" }
    $sourceManifestSha256 = if (Test-Path $ManifestPath) { (Get-FileHash -Algorithm SHA256 $ManifestPath).Hash.ToLowerInvariant() } else { "not-packaged" }
    $packageLockSha256 = (Get-FileHash -Algorithm SHA256 (Join-Path $FlowRoot "package-lock.json")).Hash.ToLowerInvariant()
    $releaseScriptSha256 = (Get-FileHash -Algorithm SHA256 $MyInvocation.MyCommand.Path).Hash.ToLowerInvariant()
    $nodeVersion = (& node -p "process.versions.node").Trim()
    $javaVersion = (& java -version 2>&1 | Select-Object -First 1 | Out-String).Trim()
    $gradleVersion = Get-GradleVersion

    [ordered]@{
      product = "Flow"
      package = "com.virzyguns.flow"
      versionName = $version.VersionName
      versionCode = $version.VersionCode
      sourceBranch = $sourceBranch
      sourceCommit = $sourceCommit
      sourceManifestVerified = [bool]$manifestVerified
      sourceManifestSha256 = $sourceManifestSha256
      packageLockSha256 = $packageLockSha256
      releaseScriptSha256 = $releaseScriptSha256
      buildUtc = (Get-Date).ToUniversalTime().ToString("o")
      node = $nodeVersion
      java = $javaVersion
      gradle = $gradleVersion
      aab = (Split-Path -Leaf $FinalAab)
      aabSha256 = $aabHash
      aabBytes = (Get-Item $FinalAab).Length
      apk = (Split-Path -Leaf $FinalApk)
      apkSha256 = $apkHash
      apkBytes = (Get-Item $FinalApk).Length
      uploadCertificateSha256 = $cert.Sha256
      uploadCertificateSha1 = $cert.Sha1
      nativeSharedLibraryCount = $nativeLibraryCount
      jarsignerStrictVerified = $true
      apkSignerVerified = $true
      releaseLintPassed = $true
      debugUnitTestsPassed = $true
      releaseUnitTestsPassed = $true
      productionDependencyAuditPassed = $true
      internalTestingPassed = $false
    } | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $Artifacts "FLOW_ANDROID_BUILD_RECEIPT.json")

    Write-Host ""
    Write-Host "FLOW ANDROID SIGNED RELEASE BUILD PASS"
    Write-Host "AAB: $FinalAab"
    Write-Host "AAB SHA256: $aabHash"
    Write-Host "APK: $FinalApk"
    Write-Host "APK SHA256: $apkHash"
    Write-Host "Upload cert SHA256: $($cert.Sha256)"
    Write-Host "Build receipt: $(Join-Path $Artifacts 'FLOW_ANDROID_BUILD_RECEIPT.json')"
    Write-Host "Next gate remains Google Play Internal Testing. Do not call production-ready before real Play/runtime checks pass."
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
