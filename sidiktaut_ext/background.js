/**
 * SIDIKTAUT BACKGROUND SERVICE (AUTO-INJECT FIX)
 */

// [MODE 2] PRODUCTION (PythonAnywhere)
const API_ENDPOINT = "https://yudhadevsec.pythonanywhere.com/scan";

// 1. Reset & Init saat install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "sidiktaut_scan_link",
      title: "🛡️ Scan Link Ini",
      contexts: ["link"]
    });
  });
});

// 2. Listener Klik Kanan
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "sidiktaut_scan_link" && info.linkUrl) {
    performScanAndNotify(info.linkUrl);
  }
});

// 3. Fungsi Utama Scan
async function performScanAndNotify(url) {
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
    // Fetch ke Backend
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CLIENT-ID": "sidiktaut-ext" },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error("Server Error");
    const data = await response.json();
    
    chrome.notifications.clear(loadingId);

    // Simpan data
    const resultId = `res-${Date.now()}`;
    const malicious = data.malicious || 0;
    const isSafe = malicious === 0;
    
    const storageKey = `data_${resultId}`;
    await chrome.storage.local.set({ [storageKey]: data });

    // Tampilkan Notifikasi Hasil
    chrome.notifications.create(resultId, {
      type: "basic",
      iconUrl: "icon.png",
      title: isSafe ? "✅ Link Aman" : "⚠️ BAHAYA TERDETEKSI",
      message: isSafe 
        ? `Score: ${data.reputation}/100. Klik untuk detail.`
        : `Ditemukan ${malicious} ancaman! Klik untuk detail.`,
      buttons: [{ title: "🔍 Lihat Detail" }],
      priority: 2,
      requireInteraction: true // Notif diam sampai diklik
    });

  } catch (error) {
    chrome.notifications.clear(loadingId);
    chrome.notifications.create(`err-${Date.now()}`, {
      type: "basic", iconUrl: "icon.png", title: "Gagal", message: "Koneksi backend error."
    });
  }
}

// 4. HANDLER KLIK NOTIFIKASI (TOMBOl & BADAN)
chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
  if (btnIdx === 0) openDetail(notifId);
});

chrome.notifications.onClicked.addListener((notifId) => {
  openDetail(notifId);
});

// 5. LOGIKA BARU: AUTO-INJECT SCRIPT
async function openDetail(notifId) {
  const storageKey = `data_${notifId}`;
  const res = await chrome.storage.local.get(storageKey);
  const data = res[storageKey];

  if (!data) return; // Data kadaluarsa/hilang

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  // Cek apakah URL valid (bukan chrome:// settings)
  if (!tab.url.startsWith("http")) {
    chrome.notifications.create("err-url", {
      type: "basic", iconUrl: "icon.png", title: "Error", message: "Detail tidak bisa dibuka di halaman sistem browser."
    });
    return;
  }

  try {
    // COBA 1: Kirim langsung (Normal)
    await chrome.tabs.sendMessage(tab.id, { action: "SHOW_DETAIL_OVERLAY", data });
  } catch (err) {
    console.log("Content script mati, mencoba inject ulang...", err);
    
    // COBA 2: Inject Script Manual (Penyelamat)
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
      
      // Tunggu sebentar biar script load, lalu kirim lagi
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: "SHOW_DETAIL_OVERLAY", data });
      }, 500);
      
    } catch (injectErr) {
      console.error("Gagal inject:", injectErr);
      chrome.notifications.create("err-inject", {
        type: "basic", iconUrl: "icon.png", title: "Gagal Membuka", 
        message: "Mohon REFRESH halaman web ini dan coba lagi."
      });
    }
  }
}