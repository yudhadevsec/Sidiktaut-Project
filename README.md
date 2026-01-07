# 🕵️‍♂️ SidikTaut - Link Analyzer & URL Forensics

> **Analisis Link Satset Tanpa Ribet.**
> *Advanced URL Forensics, Redirect Tracing, & Malware Detection.*

**SidikTaut** adalah platform analisis keamanan tautan (URL) yang dirancang untuk mendeteksi ancaman siber seperti *Phishing*, *Malware*, dan tautan mencurigakan secara *real-time*. Dibangun dengan arsitektur **Hybrid**, sistem ini dapat berjalan mulus baik di lingkungan lokal (Development) maupun server produksi (PythonAnywhere).

![Project Status](https://img.shields.io/badge/Status-Active_Development-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_Flask_Extension-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🚀 Fitur Utama

* **🔍 Deep Scanning:** Integrasi langsung dengan **VirusTotal API v3** untuk reputasi keamanan tingkat lanjut dan deteksi malware.
* **twisted_rightwards_arrows: Trace Redirects (Hops):** Melacak jalur pengalihan URL dari awal hingga tujuan akhir untuk membongkar teknik *cloaking* atau pemendek URL.
* **📸 Visual Forensics:** Fitur preview screenshot website target yang aman, memungkinkan pengguna melihat isi web tanpa perlu membukanya.
* **🆔 Whois & Domain Age:** Mendeteksi umur domain untuk mengidentifikasi situs "baru lahir" yang seringkali mencurigakan.
* **🌐 Multi-Platform Ecosystem:**
    * **Web Dashboard:** Antarmuka modern & responsif (Dark Mode support).
    * **Chrome Extension:** Analisis link langsung saat browsing via Context Menu & Overlay.
    * **CLI Tool:** Untuk kebutuhan forensik via terminal.
* **⚡ Hybrid Architecture:** Backend dikonfigurasi cerdas untuk menangani permintaan dari Localhost maupun Production Server dengan pengaturan CORS yang fleksibel.

---

## 📂 Struktur Proyek

```bash
sidiktaut-root/
├── backend/          # API Server (Flask, Python, Whois, Requests)
├── frontend/         # Web Dashboard (React, Vite, Tailwind, Framer Motion)
└── extension/        # Browser Extension (Manifest V3, Service Worker)