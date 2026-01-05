/**
 * SIDIKTAUT BACKGROUND SERVICE (HYBRID MODE)
 */

// =================================================================
// 🎚️ HYBRID MODE SWITCH (Pilih salah satu, comment yang tidak dipakai)
// =================================================================

// [MODE 1] DEVELOPMENT (Localhost)
// const API_ENDPOINT = "http://127.0.0.1:5000/scan";

// [MODE 2] PRODUCTION (PythonAnywhere) - DEFAULT
const API_ENDPOINT = "https://yudhadevsec.pythonanywhere.com/scan";

// =================================================================


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sidiktaut_scan_link",
    title: "🛡️ Scan Link Ini",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  console.log("Menu clicked:", info);

  if (info.menuItemId === "sidiktaut_scan_link" && info.linkUrl) {
    performScanAndNotify(info.linkUrl);
  }
});

  chrome.storage.sync.get(["sidik_auto_scan", "sidik_ask_scan"], (res) => {
    if (res.sidik_auto_scan === undefined) chrome.storage.sync.set({ sidik_auto_scan: false });
    if (res.sidik_ask_scan === undefined) chrome.storage.sync.set({ sidik_ask_scan: true });
  });

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
    const settings = await chrome.storage.sync.get(["sidik_auto_scan"]);
    if (settings.sidik_auto_scan) {
      performScanAndNotify(tab.url);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "REQUEST_SCAN") {
    handleScanRequest(request.url, sendResponse);
    return true;
  }
});

async function handleScanRequest(url, sendResponse) {
  try {
    const data = await fetchScanData(url);
    sendResponse({ success: true, data });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function fetchScanData(url) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CLIENT-ID": "sidiktaut-extension"
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error(`Server Error: ${response.status}`);
    return await response.json();
  } catch (err) {
    throw new Error("Gagal terhubung ke Backend. Pastikan server nyala.");
  }
}

async function performScanAndNotify(url) {
  // 1. Buat ID unik untuk loading saja
  const loadingId = `loading-${Date.now()}`;
  
  chrome.notifications.create(loadingId, {
    type: "basic",
    iconUrl: "icon.png",
    title: "SidikTaut",
    message: "Sedang menganalisis link...",
    priority: 0,
    silent: true
  });

  try {
    const data = await fetchScanData(url);
    
    // 2. Hapus loading SEBELUM membuat hasil dengan ID yang berbeda
    chrome.notifications.clear(loadingId);

    // 3. Buat ID unik untuk hasil
    const resultId = `result-${Date.now()}`;
    const malicious = data.malicious || 0;
    const isSafe = malicious === 0;

    // Simpan data ke storage menggunakan resultId sebagai key
    const storageKey = `data_${resultId}`;
    await chrome.storage.local.set({ [storageKey]: data });

    chrome.notifications.create(resultId, {
      type: "basic",
      iconUrl: "icon.png",
      title: isSafe ? "✅ Link Aman" : "⚠️ BAHAYA TERDETEKSI",
      message: isSafe 
        ? `Reputasi: ${data.reputation}/100. Klik tombol di bawah untuk detail.`
        : `Peringatan! ${malicious} ancaman terdeteksi. Klik untuk detail.`,
      buttons: [{ title: "🔍 Lihat Detail Keamanan" }],
      priority: 2,
      requireInteraction: true // Notif tidak akan hilang otomatis
    });

  } catch (error) {
    chrome.notifications.clear(loadingId);
    console.error("Scan Error:", error);
  }
}

// Update listener klik tombol agar sesuai dengan key baru
chrome.notifications.onButtonClicked.addListener(async (notifId, btnIdx) => {
  if (btnIdx === 0) {
    const storageKey = `data_${notifId}`; // Sesuaikan dengan key di atas
    const result = await chrome.storage.local.get(storageKey);
    const data = result[storageKey];

    if (data) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { 
          action: "SHOW_DETAIL_OVERLAY", 
          data: data 
        });
      }
      chrome.storage.local.remove(storageKey);
    }
  }
});
