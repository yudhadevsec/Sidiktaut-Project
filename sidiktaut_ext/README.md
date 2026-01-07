# SidikTaut Extension

**SidikTaut Extension** adalah add on browser berbasis **Manifest V3** yang dirancang untuk memberikan perlindungan keamanan tautan secara *real-time*.

Ekstensi ini akan menganalisis link tanpa perlu repot buka tab/web baru, satset tanpa ribet

---

## Fitur Utama

1.  **Click it RIGHT?:** Klik kanan pada link apa saja di website -> Pilih **"SidikTaut: Scan Link Ini"**.
2.  **Tanya untuk Scan:** Akan muncul pop up untuk scan link yang baru dibuka
3.  **In WebPage Scan:** Akses cepat untuk scan link manual lewat ikon di toolbar browser.

---

## Konfigurasi Backend (WAJIB!)

Sebelum menginstall, kamu **wajib** mengatur kemana ekstensi ini harus menghubungi server (Backend).

1.  Buka file `background.js` dan `popup.js` menggunakan text editor (VS Code/Notepad).
2.  Cari baris kode paling atas yang bertuliskan **KONFIGURASI HYBRID**.
3.  Ubah nilai variabel `IS_DEV` sesuai kondisi backend Anda:

    * **Set `true`** → Jika Backend Python (`app.py`) berjalan di laptop kamu sendiri (**Localhost**).
    * **Set `false`** → Jika Backend berjalan di Server Online (**PythonAnywhere**).

    **Contoh Code:**
    ```javascript
    // Ganti true jika pakai localhost, false jika pakai server online
    const IS_DEV = true; 
    ```
    *(Jangan lupa simpan perubahan file setelah diedit)*

---

## Install di Chrome / Edge / Brave

Karena ekstensi ini masih dalam tahap pengembangan (Developer Mode) dan belum ada di Web Store, instalasinya dilakukan secara manual:

1.  Buka browser (Chrome/Edge).
2.  Ketik **`chrome://extensions`** di address bar, lalu tekan Enter.
3.  Aktifkan tombol **Developer mode** (Biasanya ada di pojok kanan atas).
4.  Klik tombol **Load unpacked** (Muat yang belum dibuka).
5.  Pilih **folder `extension`** ini (pilih foldernya, bukan filenya).
6.  Selesai! Sidiktaut Extension akan muncul di toolbar browser kamu dan siap dipakai.

---

## Cara Menggunakan

### Cara 1: Scan Cepat (Click it RIGHT?)
1.  Temukan link/tautan di website mana saja.
2.  **Klik Kanan** pada link tersebut.
3.  Pilih menu **🛡️ Scan Link Ini**.
4.  Tunggu sebentar, hasil akan muncul lewat notifikasi.

### Cara 2: In WebPage Scan (Popup)
1.  Klik ikon ekstensi dan pilih **SidikTaut** di pojok kanan atas browser (di sebelah address bar).
2.  Link dari tab yang sedang aktif akan otomatis terisi (atau ketik manual).
3.  Klik tombol **SCAN SEKARANG**.

### Cara 3: Tanya untuk scan (Popup)
1.  Saat buka link baru akan muncul notifikasi **Verifikasi Keamanan** Klik scan
2.  Dan tadaaa, hasil analisis akan muncul
---

## Troubleshooting

* **Error "Failed to fetch" / "Network Error":**
    * Pastikan Backend Python (`app.py`) sudah dijalankan.
    * Pastikan konfigurasi `IS_DEV` di file `background.js` sudah benar (`true` untuk localhost).
* **Menu Klik Kanan tidak muncul:**
    * Coba reload ekstensi di halaman `chrome://extensions` (klik ikon panah memutar).
    * Refresh halaman web yang sedang Anda buka.