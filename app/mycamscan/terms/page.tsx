import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';

export const metadata: Metadata = {
    title: "MyCamScan Terms of Use",
    description: "Terms of Use for MyCamScan, the private on-device document scanner and searchable-PDF app for Android by Kreasi Virzy Nusantara.",
    alternates: { canonical: "https://www.virzyguns.com/mycamscan/terms" },
    openGraph: {
        title: "MyCamScan Terms of Use | Virzy Guns Production",
        description: "Terms of Use for the MyCamScan app.",
        url: "https://www.virzyguns.com/mycamscan/terms",
    },
    robots: {
        index: true,
        follow: true,
    },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function MyCamScanTermsPage() {
    return (
        <PolicyPage
            eyebrow="MyCamScan · Virzy Guns Production"
            title="Terms of Use"
            summary="These are the canonical Terms of Use for the MyCamScan Android app. English is the primary version; the Indonesian version (Bahasa Indonesia) follows at the end of the page."
            effectiveDate="30 September 2026 (last updated 7 October 2026)"
            sections={[
                {
                    title: "License to use the App",
                    content: (
                        <>
                            <p>These Terms of Use (&quot;Terms&quot;) are an agreement between you and <strong className="font-semibold text-white/85">PT Kreasi Virzy Nusantara (Virzy Guns Production)</strong> (&quot;we&quot;, &quot;us&quot;), the publisher of the MyCamScan app for Android (package <code className="rounded bg-white/10 px-1 py-0.5 text-[0.9em] text-sky-100">com.virzyguns.mycamscan</code>, the &quot;App&quot;). By installing or using the App you agree to these Terms. If you do not agree, do not use the App. Please also read our <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="https://virzyguns.com/mycamscan/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
                            <p>We grant you a personal, non-exclusive, non-transferable, revocable license to install and use the App on devices you own or control, for your own lawful personal or business document scanning, for as long as you comply with these Terms. The App is licensed, not sold. We and our licensors keep all rights in the App, its code, design, name and logo, except the rights expressly granted here. Third-party components (including open-source software and Google components) are governed by their own licenses; nothing in these Terms limits rights you have under those licenses.</p>
                            <p><a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="#bahasa-indonesia">Bahasa Indonesia</a> (Indonesian version) is available at the end of this page.</p>
                        </>
                    ),
                },
                {
                    title: "Acceptable use",
                    content: (
                        <>
                            <p>You agree not to:</p>
                            <ul className={listClass}><li>use the App to scan, store or share content that is illegal, or that you have no right to copy (for example forged documents, or material you are legally prohibited from copying such as banknotes or government IDs where copying is restricted);</li><li>infringe anyone&apos;s privacy, intellectual property or other rights, or scan people&apos;s documents without authority;</li><li>copy, modify, reverse engineer, decompile or extract source code from the App, except to the extent applicable law allows despite this restriction;</li><li>remove or bypass ads, consent forms, license checks or purchase verification other than by buying &quot;Remove Ads&quot;;</li><li>interfere with the App, Google services it uses, or Google Play billing, or use the App to distribute malware;</li><li>resell, sublicense, or publish the App or a modified version of it under our name.</li></ul>
                            <p>You are responsible for how you use scans and exports, including complying with laws that apply to the documents you scan.</p>
                        </>
                    ),
                },
                {
                    title: "Your content",
                    content: (
                        <>
                            <p>Your scans, images, OCR text and PDFs (&quot;Your Content&quot;) belong to you. We do not claim any ownership or license over Your Content, and we do not receive it: it stays in the App&apos;s private storage on your device unless you choose to share it (see the Privacy Policy). You are responsible for backing up Your Content. The App does not back up to the cloud and Android Auto Backup is turned off, so uninstalling the App, clearing its data, resetting or losing your device, or a software fault can permanently delete Your Content.</p>
                            <p>When you share a file with another app or person, their terms and privacy practices apply, not ours.</p>
                        </>
                    ),
                },
                {
                    title: "OCR and scan results",
                    content: (
                        <>
                            <p>Text recognition (OCR) and automatic edge detection are automated and can be inaccurate, especially with poor lighting, handwriting, unusual fonts, low resolution, or languages/scripts other than those the App supports. <strong className="font-semibold text-white/85">Check every result before you rely on it</strong>, particularly for legal, financial, medical or other important use. The App is a convenience tool and is not a substitute for professional advice or an official copy of a document. Scan output may not be accepted as a legal or original document by third parties.</p>
                        </>
                    ),
                },
                {
                    title: "Ads, Google services and updates",
                    content: (
                        <>
                            <p>The free App shows ads provided by Google AdMob. The App also uses Google Play services (including the ML Kit Document Scanner) and Google Play Billing, which are provided by Google under Google&apos;s terms. Google may change or discontinue those services, which may change how the App works. We may update, change or discontinue features at any time, and updates may be required to keep using the App. We are not responsible for ads&apos; content or for third-party sites and apps reached from ads, but you can report ads to Google.</p>
                        </>
                    ),
                },
                {
                    title: "Premium purchase (\"Remove Ads\")",
                    content: (
                        <>
                            <ul className={listClass}><li>&quot;Remove Ads&quot; is a <strong className="font-semibold text-white/85">one-time, non-consumable in-app purchase</strong> made through Google Play. The price is shown in Google Play in your local currency before you buy, and may include taxes.</li><li>It removes ads from the App for the Google account that bought it. It is not a subscription and does not renew.</li><li><strong className="font-semibold text-white/85">Restore:</strong> if you reinstall the App or use a new device, sign in with the same Google account and restore the purchase through Google Play (use the restore option in the App where shown).</li><li><strong className="font-semibold text-white/85">Refunds:</strong> payments are processed by Google. Refunds are governed by <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="https://support.google.com/googleplay/answer/2479637" target="_blank" rel="noopener noreferrer">Google Play&apos;s refund policy</a> and applicable consumer law. We cannot issue refunds ourselves for Google Play purchases; contact Google Play support, or contact us and we will help you where we can.</li><li>The purchase covers the &quot;Remove Ads&quot; feature only, for as long as we offer the App or the feature. If we ever discontinue the App, we will give reasonable notice where practical. We may change the features that &quot;Remove Ads&quot; covers in future only in ways that do not bring back ads on your existing purchase.</li><li>Mandatory consumer rights in your country are not affected.</li></ul>
                        </>
                    ),
                },
                {
                    title: "Intellectual property and feedback",
                    content: (
                        <>
                            <p>The MyCamScan name, logo and App design belong to PT Kreasi Virzy Nusantara. If you send us feedback or suggestions, you allow us to use them without obligation to you.</p>
                        </>
                    ),
                },
                {
                    title: "Disclaimer of warranties",
                    content: (
                        <>
                            <p>To the fullest extent permitted by law, the App is provided <strong className="font-semibold text-white/85">&quot;as is&quot; and &quot;as available&quot;</strong>, without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, accuracy of OCR or scan results, uninterrupted or error-free operation, and non-infringement. We do not warrant that the App will meet your requirements, be compatible with every device, or that data will never be lost. Some jurisdictions do not allow certain disclaimers, so parts of this section may not apply to you.</p>
                        </>
                    ),
                },
                {
                    title: "Limitation of liability",
                    content: (
                        <>
                            <p>To the fullest extent permitted by law, we are not liable for indirect, incidental, special, consequential or punitive damages, or for loss of data, documents, profits, revenue, business or goodwill, arising from your use of or inability to use the App, including errors in OCR or scanned output. Our total liability for any claim relating to the App is limited to the amount you paid us for the App in the 12 months before the claim (which is zero if you have not made a purchase), or the minimum amount the law requires if higher. Nothing in these Terms limits liability that cannot be limited by law, such as liability for fraud, or for death or personal injury caused by negligence, or your mandatory consumer rights.</p>
                        </>
                    ),
                },
                {
                    title: "Termination",
                    content: (
                        <>
                            <p>You may stop using the App at any time by uninstalling it. We may suspend or end your license if you breach these Terms. Sections that by their nature should survive (including 3, 7, 8, 9, 11) survive termination.</p>
                        </>
                    ),
                },
                {
                    title: "Governing law and disputes",
                    content: (
                        <>
                            <p>These Terms are governed by the laws of the <strong className="font-semibold text-white/85">Republic of Indonesia</strong>, without regard to conflict of laws rules. Disputes should first be raised with us at the contact below so we can try to settle them in good faith. If not resolved, the courts of the competent District Court for the Company&apos;s domicile in Indonesia have jurisdiction, subject to any mandatory consumer protection rules that give you the right to bring a claim in the courts of the country where you live. </p>
                        </>
                    ),
                },
                {
                    title: "Changes to these Terms",
                    content: (
                        <>
                            <p>We may update these Terms. The &quot;last updated&quot; date shows the current version. For material changes we will give notice in the App or on the Google Play listing. If you keep using the App after changes take effect, you accept them; if you do not agree, stop using the App.</p>
                        </>
                    ),
                },
                {
                    title: "General",
                    content: (
                        <>
                            <p>If any part of these Terms is unenforceable, the rest remains in effect. Our failure to enforce a right is not a waiver. You may not assign these Terms; we may assign them in connection with a business transfer. These Terms and the Privacy Policy are the entire agreement between us about the App.</p>
                        </>
                    ),
                },
                {
                    title: "Contact",
                    content: (
                        <>
                            <p>PT Kreasi Virzy Nusantara<br />E-mail: <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="mailto:founder@virzyguns.com">founder@virzyguns.com</a><br />Address: Indonesia<br />Website: <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="https://virzyguns.com/mycamscan">https://virzyguns.com/mycamscan</a><br />Terms URL: <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="https://virzyguns.com/mycamscan/terms">https://virzyguns.com/mycamscan/terms</a></p>
                            <p><span className="font-semibold text-white/85">Bahasa Indonesia:</span> the Indonesian version is at the end of this page (<a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="#bahasa-indonesia">Bahasa Indonesia</a>). If the two versions differ, the Indonesian version applies for users in Indonesia and the English version applies elsewhere.</p>
                        </>
                    ),
                },
                {
                    id: 'bahasa-indonesia',
                    title: "Bahasa Indonesia: Ketentuan Penggunaan MyCamScan",
                    content: (
                        <>
                            <p className="text-sm text-white/55">Tanggal berlaku: 30 September 2026 · Terakhir diperbarui: 7 Oktober 2026</p>
                            <p>Ketentuan Penggunaan (&quot;Ketentuan&quot;) ini adalah perjanjian antara Anda dan <strong className="font-semibold text-white/85">PT Kreasi Virzy Nusantara (Virzy Guns Production)</strong> (&quot;kami&quot;), penerbit aplikasi MyCamScan untuk Android (paket <code className="rounded bg-white/10 px-1 py-0.5 text-[0.9em] text-sky-100">com.virzyguns.mycamscan</code>, &quot;Aplikasi&quot;). Dengan memasang atau menggunakan Aplikasi, Anda menyetujui Ketentuan ini. Jika tidak setuju, jangan gunakan Aplikasi. Baca juga <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="https://virzyguns.com/mycamscan/privacy" target="_blank" rel="noopener noreferrer">Kebijakan Privasi</a> kami.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">1. Lisensi penggunaan Aplikasi</h3>
                            <p>Kami memberi Anda lisensi pribadi, non-eksklusif, tidak dapat dialihkan, dan dapat dicabut untuk memasang dan menggunakan Aplikasi pada perangkat yang Anda miliki atau kendalikan, untuk memindai dokumen secara sah untuk keperluan pribadi atau usaha Anda, selama Anda mematuhi Ketentuan ini. Aplikasi dilisensikan, bukan dijual. Kami dan pemberi lisensi kami mempertahankan semua hak atas Aplikasi, kode, desain, nama, dan logonya, kecuali hak yang secara tegas diberikan di sini. Komponen pihak ketiga (termasuk perangkat lunak sumber terbuka dan komponen Google) diatur oleh lisensinya masing-masing; tidak ada ketentuan di sini yang membatasi hak Anda berdasarkan lisensi tersebut.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">2. Penggunaan yang dapat diterima</h3>
                            <p>Anda setuju untuk tidak:</p>
                            <ul className={listClass}><li>memakai Aplikasi untuk memindai, menyimpan, atau membagikan konten yang melanggar hukum, atau yang tidak berhak Anda salin (misalnya dokumen palsu, atau materi yang dilarang hukum untuk difotokopi seperti uang kertas atau dokumen identitas pemerintah bila penyalinannya dibatasi);</li><li>melanggar privasi, kekayaan intelektual, atau hak orang lain, atau memindai dokumen orang lain tanpa kewenangan;</li><li>menyalin, mengubah, merekayasa balik, mendekompilasi, atau mengekstrak kode sumber Aplikasi, kecuali sejauh hukum yang berlaku tetap mengizinkannya;</li><li>menghilangkan atau menghindari iklan, formulir persetujuan, pemeriksaan lisensi, atau verifikasi pembelian selain dengan membeli &quot;Hilangkan Iklan&quot;;</li><li>mengganggu Aplikasi, layanan Google yang digunakannya, atau penagihan Google Play, atau memakai Aplikasi untuk menyebarkan perangkat lunak berbahaya;</li><li>menjual kembali, mensublisensikan, atau menerbitkan Aplikasi atau versi modifikasinya dengan nama kami.</li></ul>
                            <p>Anda bertanggung jawab atas cara Anda memakai hasil pindai dan ekspor, termasuk mematuhi hukum yang berlaku untuk dokumen yang Anda pindai.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">3. Konten Anda</h3>
                            <p>Hasil pindai, gambar, teks OCR, dan PDF Anda (&quot;Konten Anda&quot;) adalah milik Anda. Kami tidak mengklaim kepemilikan atau lisensi apa pun atas Konten Anda, dan kami tidak menerimanya: konten tersebut tetap di penyimpanan privat Aplikasi di perangkat Anda kecuali Anda memilih membagikannya (lihat Kebijakan Privasi). Anda bertanggung jawab mencadangkan Konten Anda. Aplikasi tidak mencadangkan ke cloud dan Android Auto Backup dimatikan, sehingga menghapus instalasi Aplikasi, menghapus datanya, mengatur ulang atau kehilangan perangkat, atau gangguan perangkat lunak dapat menghapus Konten Anda secara permanen.</p>
                            <p>Ketika Anda membagikan berkas ke aplikasi atau orang lain, ketentuan dan praktik privasi mereka yang berlaku, bukan milik kami.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">4. OCR dan hasil pindai</h3>
                            <p>Pengenalan teks (OCR) dan deteksi tepi otomatis bersifat otomatis dan dapat tidak akurat, terutama pada pencahayaan buruk, tulisan tangan, huruf tidak lazim, resolusi rendah, atau bahasa/aksara di luar yang didukung Aplikasi. <strong className="font-semibold text-white/85">Periksa setiap hasil sebelum Anda mengandalkannya</strong>, terutama untuk keperluan hukum, keuangan, medis, atau keperluan penting lainnya. Aplikasi adalah alat bantu dan bukan pengganti nasihat profesional atau salinan resmi dokumen. Hasil pindai mungkin tidak diterima pihak ketiga sebagai dokumen hukum atau asli.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">5. Iklan, layanan Google, dan pembaruan</h3>
                            <p>Aplikasi gratis menampilkan iklan yang disediakan Google AdMob. Aplikasi juga memakai Google Play services (termasuk ML Kit Document Scanner) dan Google Play Billing, yang disediakan Google berdasarkan ketentuan Google. Google dapat mengubah atau menghentikan layanan tersebut, yang dapat mengubah cara kerja Aplikasi. Kami dapat memperbarui, mengubah, atau menghentikan fitur kapan saja, dan pembaruan mungkin diperlukan agar Aplikasi tetap dapat dipakai. Kami tidak bertanggung jawab atas isi iklan atau situs dan aplikasi pihak ketiga yang dijangkau dari iklan, tetapi Anda dapat melaporkan iklan ke Google.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">6. Pembelian premium (&quot;Hilangkan Iklan&quot;)</h3>
                            <ul className={listClass}><li>&quot;Hilangkan Iklan&quot; adalah <strong className="font-semibold text-white/85">pembelian dalam aplikasi satu kali (non-consumable)</strong> melalui Google Play. Harga ditampilkan di Google Play dalam mata uang lokal Anda sebelum membeli, dan dapat sudah termasuk pajak.</li><li>Pembelian ini menghilangkan iklan di Aplikasi untuk akun Google yang membelinya. Ini bukan langganan dan tidak diperpanjang otomatis.</li><li><strong className="font-semibold text-white/85">Pemulihan:</strong> jika Anda memasang ulang Aplikasi atau memakai perangkat baru, masuk dengan akun Google yang sama dan pulihkan pembelian melalui Google Play (gunakan opsi pulihkan di Aplikasi jika tersedia).</li><li><strong className="font-semibold text-white/85">Pengembalian dana:</strong> pembayaran diproses oleh Google. Pengembalian dana diatur oleh <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="https://support.google.com/googleplay/answer/2479637" target="_blank" rel="noopener noreferrer">kebijakan pengembalian dana Google Play</a> dan hukum perlindungan konsumen yang berlaku. Kami tidak dapat mengembalikan dana sendiri untuk pembelian Google Play; hubungi dukungan Google Play, atau hubungi kami dan kami akan membantu sejauh mampu.</li><li>Pembelian hanya mencakup fitur &quot;Hilangkan Iklan&quot;, selama kami menawarkan Aplikasi atau fitur tersebut. Jika suatu saat Aplikasi kami hentikan, kami akan memberi pemberitahuan yang wajar bila memungkinkan. Kami tidak akan mengubah cakupan &quot;Hilangkan Iklan&quot; sehingga iklan muncul kembali pada pembelian Anda yang sudah ada.</li><li>Hak konsumen yang bersifat wajib di negara Anda tidak terpengaruh.</li></ul>
                            <h3 className="pt-4 text-lg font-semibold text-white">7. Kekayaan intelektual dan masukan</h3>
                            <p>Nama MyCamScan, logo, dan desain Aplikasi adalah milik PT Kreasi Virzy Nusantara. Jika Anda mengirim masukan atau saran, Anda mengizinkan kami memakainya tanpa kewajiban kepada Anda.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">8. Penafian jaminan</h3>
                            <p>Sejauh diizinkan hukum, Aplikasi disediakan <strong className="font-semibold text-white/85">&quot;apa adanya&quot; dan &quot;sebagaimana tersedia&quot;</strong>, tanpa jaminan apa pun, baik tersurat maupun tersirat, termasuk kelayakan untuk diperdagangkan, kesesuaian untuk tujuan tertentu, keakuratan hasil OCR atau pindai, pengoperasian tanpa gangguan atau tanpa kesalahan, dan tidak melanggar hak pihak lain. Kami tidak menjamin Aplikasi memenuhi kebutuhan Anda, kompatibel dengan semua perangkat, atau bahwa data tidak akan pernah hilang. Beberapa yurisdiksi tidak mengizinkan penafian tertentu, sehingga sebagian bagian ini mungkin tidak berlaku bagi Anda.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">9. Pembatasan tanggung jawab</h3>
                            <p>Sejauh diizinkan hukum, kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, konsekuensial, atau yang bersifat menghukum, atau atas hilangnya data, dokumen, keuntungan, pendapatan, usaha, atau reputasi, yang timbul dari penggunaan atau ketidakmampuan menggunakan Aplikasi, termasuk kesalahan pada OCR atau hasil pindai. Total tanggung jawab kami atas klaim apa pun terkait Aplikasi dibatasi pada jumlah yang Anda bayarkan kepada kami untuk Aplikasi dalam 12 bulan sebelum klaim (nol jika Anda belum melakukan pembelian), atau jumlah minimum yang diwajibkan hukum jika lebih tinggi. Tidak ada ketentuan di sini yang membatasi tanggung jawab yang menurut hukum tidak dapat dibatasi, seperti tanggung jawab atas penipuan, atau kematian atau cedera badan akibat kelalaian, maupun hak konsumen Anda yang bersifat wajib.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">10. Pengakhiran</h3>
                            <p>Anda dapat berhenti memakai Aplikasi kapan saja dengan menghapus instalasinya. Kami dapat menangguhkan atau mengakhiri lisensi Anda jika Anda melanggar Ketentuan ini. Bagian yang menurut sifatnya harus tetap berlaku (termasuk 3, 7, 8, 9, 11) tetap berlaku setelah pengakhiran.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">11. Hukum yang berlaku dan sengketa</h3>
                            <p>Ketentuan ini diatur oleh hukum <strong className="font-semibold text-white/85">Republik Indonesia</strong>, tanpa memperhatikan asas pertentangan hukum. Sengketa sebaiknya lebih dulu disampaikan kepada kami melalui kontak di bawah agar dapat diselesaikan secara musyawarah dengan itikad baik. Jika tidak terselesaikan, pengadilan di Pengadilan Negeri yang berwenang sesuai domisili Perusahaan di Indonesia berwenang, dengan tetap menghormati aturan perlindungan konsumen yang bersifat wajib yang memberi Anda hak mengajukan gugatan di pengadilan negara tempat tinggal Anda. </p>
                            <h3 className="pt-4 text-lg font-semibold text-white">12. Perubahan Ketentuan</h3>
                            <p>Kami dapat memperbarui Ketentuan ini. Tanggal &quot;terakhir diperbarui&quot; menunjukkan versi terbaru. Untuk perubahan penting kami akan memberi pemberitahuan di Aplikasi atau di halaman Google Play. Jika Anda terus memakai Aplikasi setelah perubahan berlaku, Anda menyetujuinya; jika tidak setuju, berhenti memakai Aplikasi.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">13. Ketentuan umum</h3>
                            <p>Jika ada bagian Ketentuan ini yang tidak dapat diberlakukan, bagian lainnya tetap berlaku. Tidak menegakkan suatu hak bukan berarti melepaskan hak tersebut. Anda tidak boleh mengalihkan Ketentuan ini; kami dapat mengalihkannya sehubungan dengan pengalihan usaha. Ketentuan ini dan Kebijakan Privasi merupakan keseluruhan perjanjian kita mengenai Aplikasi.</p>
                            <h3 className="pt-4 text-lg font-semibold text-white">14. Kontak</h3>
                            <p>PT Kreasi Virzy Nusantara<br />Email: <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="mailto:founder@virzyguns.com">founder@virzyguns.com</a><br />Alamat: Indonesia<br />Situs: <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="https://virzyguns.com/mycamscan">https://virzyguns.com/mycamscan</a><br />URL Ketentuan: <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="https://virzyguns.com/mycamscan/terms">https://virzyguns.com/mycamscan/terms</a></p>
                            <p><span className="font-semibold text-white/85">English:</span> the English version is at the top of this page. Jika terdapat perbedaan antara kedua versi, versi Bahasa Indonesia berlaku bagi pengguna di Indonesia dan versi bahasa Inggris berlaku di tempat lain.</p>
                        </>
                    ),
                },
            ]}
        />
    );
}
