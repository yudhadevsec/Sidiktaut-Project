# 🌐 SidikTaut Web (Dashboard)

**SidikTaut Web** adalah antarmuka visual (GUI) utama untuk menganalisis keamanan tautan. Bagian ini terdiri dari dua komponen yang harus dijalankan secara bersamaan:
1.  **Backend (Python Flask):** Otak sistem yang terhubung ke VirusTotal.
2.  **Frontend (React + Vite):** Tampilan antarmuka yang digunakan pengguna.

---

## 🛠️ Persiapan (Dependencies)

Pastikan di komputer kamu sudah terinstall:
* **Python** (v3.8 ke atas)
* **Node.js** (v16 ke atas)

---

## 🚀 Cara Menjalankan (Step-by-Step)

Untuk menjalankan web ini, kamu membutuhkan **2 Terminal** yang aktif bersamaan.

### TERMINAL 1: Menyalakan Backend 🐍

Backend bertugas memproses data. Jangan tutup terminal ini selama web digunakan.

1.  Buka terminal, masuk ke folder backend:
    ```bash
    cd backend
    ```
2.  Install library Python (hanya perlu sekali di awal):
    ```bash
    pip install -r requirements.txt
    ```
3.  **WAJIB:** Buat file baru bernama `.env` di dalam folder `backend/`, lalu isi dengan API Key VirusTotal kamu:
    ```text
    VT_API_KEY=masukkan_api_key_kamu_disini
    FLASK_DEBUG=True
    PORT=5000
    ```
4.  Jalankan server:
    ```bash
    python app.py
    ```
    ✅ **Indikator Sukses:** Muncul tulisan `Running on http://127.0.0.1:5000`.

---

### TERMINAL 2: Menyalakan Frontend ⚛️

Buka terminal baru (klik tombol `+` di terminal VS Code) untuk menjalankan tampilan web.

1.  Masuk ke folder frontend:
    ```bash
    cd frontend
    ```
2.  Install library JavaScript (hanya perlu sekali di awal):
    ```bash
    npm install
    ```
3.  Jalankan web:
    ```bash
    npm run dev
    ```
    ✅ **Indikator Sukses:** Muncul tulisan `Local: http://localhost:3000`.

---

## 📖 Cara Menggunakan

1.  Buka browser (Chrome/Edge/Firefox).
2.  Akses alamat: **`http://localhost:3000`**
3.  Masukkan link yang ingin diperiksa di kolom pencarian.
4.  Klik tombol **SCAN**.
    * *Scan Awal:* Butuh waktu 3-5 detik (Request ke API).
    * *Scan Ulang:* Instan (Mengambil data dari Cache).

---

## ❓ Solusi Masalah (Troubleshooting)

* **Error "Network Error" saat Scan:**
    Cek **Terminal 1 (Backend)**. Pastikan server Python masih menyala dan tidak error. Frontend tidak bisa bekerja tanpa Backend.

* **Error "Module not found":**
    Artinya ada library yang belum terinstall.
    * Di Backend: Jalankan `pip install -r requirements.txt`
    * Di Frontend: Jalankan `npm install`

* **Tampilan Web Kosong/Putih:**
    Coba refresh browser atau matikan Frontend di Terminal 2 (`Ctrl+C`), lalu jalankan ulang `npm run dev`.