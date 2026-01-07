# SidikTaut: Link Analyzer

**SidikTaut** adalah platform analisis keamanan tautan (URL) yang dirancang untuk mendeteksi ancaman siber seperti *Phishing*, *Malware*, dan tautan mencurigakan secara *real-time*. Dibangun dengan arsitektur **Hybrid**, sistem ini dapat berjalan mulus baik di lingkungan lokal (Development) maupun server produksi (PythonAnywhere).

---

## Fitur Utama

* **Deep Scanning:** Integrasi langsung dengan **VirusTotal API v3** untuk reputasi keamanan tingkat lanjut dan deteksi malware.
* **Trace Redirects (Hops):** Melacak jalur pengalihan URL dari awal hingga tujuan akhir untuk membongkar teknik *cloaking* atau pemendek URL.
* **Visual Forensics:** Fitur preview screenshot website target yang aman, memungkinkan pengguna melihat isi web tanpa perlu membukanya.
* **Whois & Domain Age:** Mendeteksi umur domain untuk mengidentifikasi situs "baru lahir" yang seringkali mencurigakan.
* **Multi-Platform Ecosystem:**
    * **SidikTaut Web:** Antarmuka modern & responsif (Dark Mode support).
    * **SidikTaut Extension:** Analisis link langsung saat browsing via Context Menu & Overlay.
    * **SidikTaut CLI:** Untuk kebutuhan forensik via terminal.
* **Hybrid Architecture:** Backend dikonfigurasi untuk menangani permintaan dari Localhost maupun Production Server dengan pengaturan CORS yang fleksibel.
