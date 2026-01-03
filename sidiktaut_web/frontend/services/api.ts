import { ScanResponse } from "../types";

// Pastikan ini sesuai settingan proxy vite kamu. 
// Kalau error 404, coba ganti jadi "http://127.0.0.1:5000"
const API_BASE_URL = "/api"; 

export const scanUrl = async (url: string): Promise<ScanResponse> => {
  try {
    const res = await fetch(`${API_BASE_URL}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    // 1. TANGKAP RESPON ERROR DARI BACKEND (400, 401, 429, dll)
    if (!res.ok) {
      let errorMessage = `Server Error (${res.status})`;
      
      try {
        // Coba bongkar pesan rahasia dari backend (JSON)
        const errorData = await res.json();
        if (errorData.error) {
          errorMessage = errorData.error; // Contoh: "API Key Invalid"
        }
      } catch (e) {
        // Kalau gagal baca JSON (misal error HTML dari proxy), biarkan default message
      }
      
      // Lempar error asli dari backend ke Scanner.tsx
      throw new Error(errorMessage);
    }

    // 2. PARSE DATA SUKSES (200 OK)
    const data = await res.json();
    return data as ScanResponse;

  } catch (err: any) {
    console.error("[API Error]", err);

    // 3. TANGKAP ERROR MATI TOTAL (Koneksi Putus / Backend Down)
    // Error 'Failed to fetch' cuma muncul kalau browser gagal menghubungi server sama sekali
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      throw new Error("Backend tidak merespon. Pastikan server (app.py) berjalan.");
    }

    // Jika bukan error koneksi (berarti error validasi/API key tadi), lempar apa adanya
    throw err;
  }
};