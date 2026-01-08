import { ScanResponse } from "../types";

// =================================================================
// 🎚️ HYBRID MODE SWITCH
// =================================================================

// GANTI JADI 'true'  -> Kalau mau demo pakai Laptop (Localhost)
// GANTI JADI 'false' -> Kalau mau demo pakai Website Online
const IS_DEV = false;

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
        // Ini kuncinya! Kita ambil pesan error asli dari Backend
        if (errorData.error) errorMessage = errorData.error;
      } catch {}

      throw new Error(errorMessage);
    }

    return (await res.json()) as ScanResponse;
  } catch (err: any) {
    console.error("[API Error]", err);

    // [MODIFIKASI] Bagian ini saya hapus/komentar biar pesan "Access Denied" dari backend MUNCUL.
    // if (err.message.includes("403") || err.message.includes("Server Error")) {
    //    throw new Error("Gagal scan. Jika pakai PythonAnywhere Free...");
    // }

    // Kita lempar error apa adanya (biar pesan dari backend kelihatan di layar)
    throw new Error(err.message || `Gagal terhubung ke Backend (${IS_DEV ? 'Localhost' : 'Server'}). Pastikan server nyala.`);
  }
};