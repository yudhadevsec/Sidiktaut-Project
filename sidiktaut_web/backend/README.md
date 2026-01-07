# 💻 SidikTaut CLI - Terminal Link Forensic Tool

**SidikTaut CLI** adalah versi command-line interface dari ekosistem SidikTaut. Alat ini dirancang untuk *Cyber Security Researcher* atau *System Administrator* yang membutuhkan analisis link cepat, mendalam, dan bisa disimpan ke dalam file log (Forensic Report).

![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)
![VirusTotal](https://img.shields.io/badge/API-VirusTotal_v3-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-Open_Source-green?style=for-the-badge)

## 🚀 Fitur Unggulan

* **🕵️‍♂️ Redirect Tracer:** Melacak jalur redirect (URL pendek/hidden) hingga ke tujuan akhir sebelum di-scan.
* **📝 Forensic Logging:** Menyimpan hasil analisis lengkap ke dalam file teks (`.txt`) untuk dokumentasi.
* **📊 Detailed Vendor Report:** Menampilkan detail deteksi dari setiap vendor antivirus.
* **🔄 Interactive & Argument Mode:** Bisa dijalankan interaktif (menu) atau sekali jalan (argument).
* **✨ Beautiful UI:** Tampilan terminal berwarna menggunakan `colorama`.

## 🛠️ Instalasi

1.  **Clone Repository**
    ```bash
    git clone [https://github.com/USERNAME_KAMU/Sidiktaut-Project.git](https://github.com/USERNAME_KAMU/Sidiktaut-Project.git)
    cd Sidiktaut-Project/sidiktaut_cli
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```
    *(Atau install manual: `pip install requests python-dotenv colorama`)*

3.  **Konfigurasi API Key**
    Buat file `.env` di folder yang sama dengan script:
    ```env
    VT_API_KEY=masukkan_api_key_virustotal_kamu
    ```

## 📖 Cara Penggunaan

### 1. Mode Interaktif (Menu)
Cukup jalankan script tanpa argumen:
```bash
python sidiktaut.py