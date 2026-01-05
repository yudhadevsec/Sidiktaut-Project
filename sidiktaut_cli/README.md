# Sidiktaut CLI v.0.1
Tools forensik URL via terminal. Dilengkapi fitur Trace Redirect dan Auto Logging untuk analisis mendalam.

## Fitur Utama
- **Pelacakan Shortlink & Redirect**: Membongkar bit.ly/shortlink sampai ke akar.
- **Full Report**: Laporan .txt lengkap dengan metadata dan kategori web.
- **Global Command**: Bisa dijalankan dari terminal mana saja.

## Cara Install
1. Clone repo ini.
2. Install library: `pip install -r requirements.txt`
3. Buat file `.env` dan isi: `VT_API_KEY=api_key_virustotal_kamu`
4. Jalankan: `python sidiktaut.py`