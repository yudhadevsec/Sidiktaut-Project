/**
 * SIDIKTAUT BACKGROUND SERVICE (FULL HYBRID FIX)
 */

// =================================================================
// 🔧 KONFIGURASI HYBRID
// =================================================================
const IS_DEV = false; // <--- SAKLAR UTAMA (true = Local, false = PythonAnywhere)

const API_ENDPOINT = IS_DEV 
  ? "http://127.0.0.1:5000/scan" 
  : "https://yudhadevsec.pythonanywhere.com/scan";

console.log(`[SidikTaut] Running in ${IS_DEV ? 'DEV' : 'PROD'} mode.`);
console.log(`[SidikTaut] Endpoint: ${API_ENDPOINT}`);

// =================================================================
// 1. LISTENER UTAMA (INI YANG KEMARIN HILANG!)
// =================================================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // A. Handle Request Scan dari Content Script (Toast di Web)
  if (request.action === "REQUEST_SCAN" && request.url) {
    
    // Panggil fungsi scan dan kirim balik hasilnya
    performScan(request.url)
      .then(data => sendResponse({ success: true, data: data }))
      .catch(err => sendResponse({ success: false, error: err.message }));

    return true; // Wajib: Memberitahu Chrome kalau responnya Asynchronous
  }

  // B. Handle Request lain (misal show detail overlay)
  if (request.action === "SHOW_DETAIL_OVERLAY") {
    // Teruskan ke tab yang aktif (Content Script)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, request);
      }
    });
  }
});

// =================================================================
// 2. CONTEXT MENU (Klik Kanan)
// =================================================================
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "sidiktaut_scan_link",
      title: "🛡️ Scan Link Ini",
      contexts: ["link"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "sidiktaut_scan_link" && info.linkUrl) {
    handleContextMenuScan(info.linkUrl);
  }
});

// =================================================================
// 3. FUNGSI INTI (Core Logic)
// =================================================================

// Fungsi Scan Murni (Fetch ke Backend)
async function performScan(url) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CLIENT-ID": "sidiktaut-ext" },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
        // Coba baca pesan error dari server jika ada
        try {
            const errData = await response.json();
            throw new Error(errData.error || "Server Error");
        } catch (e) {
            throw new Error(`Koneksi Gagal (${response.status})`);
        }
    }
    
    return await response.json();
  } catch (error) {
    console.error("Scan Error:", error);
    // Pesan error yang lebih bersahabat
    if (error.message.includes("Failed to fetch")) {
        throw new Error(IS_DEV 
            ? "Gagal connect ke Localhost. Nyalakan 'python app.py'!" 
            : "Koneksi internet/server bermasalah.");
    }
    throw error;
  }
}

// Handler Khusus Klik Kanan (Pakai Notifikasi)
async function handleContextMenuScan(url) {
  const loadingId = `loading-${Date.now()}`;
  
  chrome.notifications.create(loadingId, {
    type: "basic",
    iconUrl: "icon.png",
    title: "SidikTaut",
    message: "Sedang menganalisis link...",
    priority: 1,
    silent: true
  });

  try {
    const data = await performScan(url); // Re-use fungsi fetch diatas
    
    chrome.notifications.clear(loadingId);

    // Simpan data untuk detail
    const resultId = `res-${Date.now()}`;
    const storageKey = `data_${resultId}`;
    await chrome.storage.local.set({ [storageKey]: data });

    // Tampilkan Hasil
    const malicious = data.malicious || 0;
    const isSafe = malicious === 0;

    chrome.notifications.create(resultId, {
      type: "basic",
      iconUrl: "icon.png",
      title: isSafe ? "✅ Link Aman" : "⚠️ BAHAYA TERDETEKSI",
      message: isSafe 
        ? `Score: ${data.reputation}/100. Klik untuk detail.`
        : `Ditemukan ${malicious} ancaman! Klik untuk detail.`,
      buttons: [{ title: "🔍 Lihat Detail" }],
      priority: 2,
      requireInteraction: true 
    });

  } catch (error) {
    chrome.notifications.clear(loadingId);
    chrome.notifications.create(`err-${Date.now()}`, {
      type: "basic", iconUrl: "icon.png", title: "Gagal", message: error.message
    });
  }
}

// 4. HANDLER KLIK NOTIFIKASI
chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => openDetail(notifId));
chrome.notifications.onClicked.addListener((notifId) => openDetail(notifId));

// 5. INJECT SCRIPT (Untuk Buka Detail dari Notifikasi)
async function openDetail(notifId) {
  const storageKey = `data_${notifId}`;
  const res = await chrome.storage.local.get(storageKey);
  const data = res[storageKey];
  if (!data) return; 

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  if (!tab.url.startsWith("http")) {
    chrome.notifications.create("err-url", {
      type: "basic", iconUrl: "icon.png", title: "Error", message: "Detail tidak bisa dibuka di halaman sistem."
    });
    return;
  }

  // Kirim data ke Content Script untuk ditampilkan
  try {
    await chrome.tabs.sendMessage(tab.id, { action: "SHOW_DETAIL_OVERLAY", data });
  } catch (err) {
    // Fallback: Inject script jika content script belum load
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    }).then(() => {
        setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { action: "SHOW_DETAIL_OVERLAY", data });
        }, 500);
    });
  }
}