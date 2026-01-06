import { ScanResponse } from "../types";

// =================================================================
// 🎚️ HYBRID MODE SWITCH
// Ubah IS_DEV menjadi:
// true  = Mode Development (Laptop Sendiri / Localhost)
// false = Mode Production (Server PythonAnywhere)
// =================================================================

const IS_DEV = false; // <--- GANTI TRUE/FALSE DISINI SAJA

const API_BASE_URL = IS_DEV 
  ? "http://127.0.0.1:5000" 
  : "https://yudhadevsec.pythonanywhere.com";

console.log(`[SidikTaut] Mode: ${IS_DEV ? 'DEV (Local)' : 'PROD (Online)'}`);

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

    if (err.message.includes("403") || err.message.includes("Server Error")) {
       throw new Error("Gagal scan. Jika pakai PythonAnywhere Free, ingat hanya bisa scan situs Whitelist (Google, Youtube, dll).");
    }

    throw new Error(`Gagal terhubung ke Backend (${IS_DEV ? 'Localhost' : 'Server'}). Pastikan server nyala.`);
  }
};