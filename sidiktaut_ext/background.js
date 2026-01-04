/**
 * SIDIKTAUT BACKGROUND SERVICE
 */

const API_ENDPOINT = "https://yudhadevsec.pythonanywhere.com/scan";

// --- Event Listeners ---

chrome.runtime.onInstalled.addListener(() => {
  // Membuat Context Menu saat klik kanan
  chrome.contextMenus.create({
    id: "sidiktaut_scan_link",
    title: "🛡️ Scan Link Ini",
    contexts: ["link"]
  });

  // Set default settings jika belum ada
  chrome.storage.sync.get(["sidik_auto_scan", "sidik_ask_scan"], (res) => {
    if (res.sidik_auto_scan === undefined) chrome.storage.sync.set({ sidik_auto_scan: false });
    if (res.sidik_ask_scan === undefined) chrome.storage.sync.set({ sidik_ask_scan: true });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  console.log("Menu clicked:", info);
  if (info.menuItemId === "sidiktaut_scan_link" && info.linkUrl) {
    performScanAndNotify(info.linkUrl);
  }
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
    return true; // Return true untuk menandakan respon bersifat asinkron
  }
});

// --- Helper Functions ---

async function handleScanRequest(url, sendResponse) {
  try {
    const data = await fetchScanData(url);
    sendResponse({ success: true, data: data });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function fetchScanData(url) {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CLIENT-ID": "sidiktaut-extension"
    },
    body: JSON.stringify({ url: url })
  });

  if (!response.ok) throw new Error("Gagal terhubung ke Backend (Cek app.py)");
  return await response.json();
}

async function performScanAndNotify(url) {
  // PERBAIKAN: Menambahkan backtick (`) yang hilang
  const notifId = `scan-${Date.now()}`;

  chrome.notifications.create(notifId, {
    type: "basic",
    iconUrl: "icon.png",
    title: "SidikTaut",
    message: "Memindai URL...",
    priority: 0,
    silent: true
  });

  try {
    const data = await fetchScanData(url);
    chrome.notifications.clear(notifId);

    const malicious = data.malicious || 0;
    const isSafe = malicious === 0;

    // PERBAIKAN: Menambahkan backtick (`) untuk template literals
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: isSafe ? "✅ Link Aman" : "⚠️ BAHAYA TERDETEKSI",
      message: isSafe 
        ? `Reputasi: ${data.reputation}/100. Aman.` 
        : `Ditemukan ${malicious} ancaman berbahaya!`,
      priority: 2,
      requireInteraction: !isSafe
    });

  } catch (error) {
    chrome.notifications.clear(notifId);
    console.error(error);
  }
}