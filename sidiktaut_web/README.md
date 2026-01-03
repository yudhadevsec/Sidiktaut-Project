SidikTaut adalah aplikasi web untuk mendeteksi keamanan sebuah tautan (URL). Aplikasi ini menggunakan **VirusTotal API** untuk mengecek apakah sebuah link mengandung Phishing, Malware, atau ancaman siber lainnya.

Project ini terdiri dari dua bagian utama:
1.  **Backend (Python Flask):** Mengurus logika API, Caching, dan Hashing.
2.  **Frontend (React + Vite):** Sebagai tampilan / visual yang interaktif

---

## Dependencies

Sebelum mulai, pastikan di laptop kamu sudah terinstall:
1.  **Python** (versi 3.8 ke atas) → Buat menjalankan backend.
2.  **Node.js** (versi 16 ke atas) → Buat jalanin Frontend.

---

## 🚀 Cara Instalasi & Menjalankan

Ikuti langkah ini step by step agar program tidak error. Kita akan membutuhkan 2 Terminal untuk menjalankan web.

### Langkah 1: Menyalakan Backend.

Backend bertugas mengambil data dari VirusTotal.

1.  Buka terminal di VS Code.
2.  Masuk ke folder backend:
    ```bash
    cd sidiktaut_web/backend
    ```
3.  Install library Python yang dibutuhkan (cukup sekali aja):
    ```bash
    pip install -r requirements.txt
    ```
4.  **PENTING:** Buat file baru bernama `.env` di dalam folder `backend/`, lalu isi dengan API Key VirusTotal kamu:
    ```text
    VT_API_KEY=masukkan_kunci_api_virustotal_disini
    ```
5.  Jalankan server:
    ```bash
    python app.py
    ```
    ✅ *Indikator Sukses:* Muncul tulisan `Running on http://127.0.0.1:5000`.
    ⚠️ **Jangan tutup terminal ini!** Jangan tutup/berhentikan terminal ini. Karena sebagai syarat pertama untuk menjalankan web

---

### Langkah 2: Menyalakan Frontend

Buka **Terminal Baru** (klik tombol `+` di terminal VS Code) untuk menjalankan tampilan web.

1.  Pastikan posisi terminal ada di root folder (sejajar dengan package.json), lalu install library Javascript:
    ```bash
    npm install
    ```
2.  Jalankan web di localhost.
    ```bash
    npm run dev
    ```
    ✅ *Indikator Sukses:* Muncul tulisan `Local: http://localhost:3000`.

---

## Cara menggunakan

1.  Buka browser apapun (contoh: chrome)
2.  Ketik alamat: **`http://localhost:3000`**
3.  **Coba Scan:**
    * Copy link yang mencurigakan (atau link aman seperti `google.com`).
    * Paste di kolom input.
    * Klik tombol **SCAN**.
4.  **Lihat Hasil:**
    * Jika link baru, web akan loading sekitar 3 detik (Web sedang request ke virus total karena link belum pernah di scan sebelumnya)
    * Jika link sudah pernah discan, hasil muncul instan (Fitur Caching).

---

## Teknologi yang digunakan

* **Bahasa:** Python (Backend), TypeScript/React (Frontend).
* **Algoritma:** Hash Map ($O(1)$ lookup) untuk efisiensi caching.
* **Keamanan:** SHA-256 Hashing untuk integritas data URL.
* **Styling:** Tailwind CSS (Modern UI).

---

## Troubleshooting (Jika ada error)

* **Error: "Network Error" saat Scan:**
    Cek terminal Backend. Pastikan `python app.py` masih jalan dan tidak mati. Frontend butuh Backend untuk bekerja.
    
* **Error: "Module not found" (Flask/React):**
    Berarti kamu lupa install library.
    * Di Backend: ketik `pip install -r requirements.txt`
    * Di Frontend: ketik `npm install`

* **Web Tampilannya Putih/Kosong:**
    Coba refresh browser atau restart perintah `npm run dev`.
