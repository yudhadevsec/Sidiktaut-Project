import { ScanResponse } from "../types";

// =================================================================
// 🎚️ HYBRID MODE SWITCH (Pilih salah satu, comment yang tidak dipakai)
// =================================================================

// [MODE 1] DEVELOPMENT (Localhost)
// Gunakan ini saat develop di laptop sendiri
// const API_BASE_URL = "http://localhost:5000";

// [MODE 2] PRODUCTION (PythonAnywhere)
// Gunakan ini saat deploy ke Vercel atau demo ke dosen (Online)
const API_BASE_URL = "https://yudhadevsec.pythonanywhere.com";

// =================================================================

export const scanUrl = async (url: string): Promise<ScanResponse> => {
  try {
    const res = await fetch(`${API_BASE_URL}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      let errorMessage = `Server Error (${res.status})`;

      try {
        const errorData = await res.json();
        if (errorData.error) errorMessage = errorData.error;
      } catch {}

      throw new Error(errorMessage);
    }

    return (await res.json()) as ScanResponse;
  } catch (err: any) {
    console.error("[API Error]", err);

    // Deteksi error khas PythonAnywhere (Whitelist Block)
    if (err.message.includes("403") || err.message.includes("Server Error")) {
       throw new Error("Gagal scan. Jika pakai PythonAnywhere Free, ingat hanya bisa scan situs Whitelist (Google, Youtube, dll).");
    }

    throw new Error("Gagal terhubung ke Backend. Pastikan server nyala.");
  }
};