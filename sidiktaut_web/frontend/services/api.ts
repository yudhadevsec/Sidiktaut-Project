import { ScanResponse } from "../types";

// ✅ UPDATE: Pakai URL Hugging Face yang sudah Running (Bukan PythonAnywhere lagi)
const API_BASE_URL = "https://yudhadevsec-sidiktaut.hf.space";

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

    if (
      err.message.includes("Failed to fetch") ||
      err.message.includes("NetworkError")
    ) {
      // ✅ Pesan error diperbarui
      throw new Error("Gagal terhubung ke server SidikTaut (Hugging Face). Cek koneksi internet Anda.");
    }

    throw err;
  }
};