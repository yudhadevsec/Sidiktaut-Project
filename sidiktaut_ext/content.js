/**
 * SIDIKTAUT CONTENT SCRIPT (FINAL VERSION - TABS & ANTI-ERROR)
 * Features:
 * 1. Tampilan Mirip Web Dashboard (Tabs: Malicious, Clean, Undetected)
 * 2. Auto-Retry jika Service Worker tidur (Fix Error Scan)
 * 3. Style Modern (Card, Shadow, clean fonts)
 */

// --- 1. INISIALISASI ---
(async function init() {
  if (window.self !== window.top) return;
  
  // Cek validitas URL (Hanya http/https)
  const url = window.location.href;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return;

  try {
    // Cek koneksi ekstensi
    if (!chrome.runtime?.id) return;

    const settings = await chrome.storage.sync.get(["sidik_ask_scan", "sidik_auto_scan"]);
    if (settings.sidik_auto_scan || settings.sidik_ask_scan === false) return;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setTimeout(injectAskPopup, 1500));
    } else {
      setTimeout(injectAskPopup, 1500);
    }
  } catch (e) {
    // Silent fail jika context invalid
  }
})();

// --- 2. LISTENER DARI BACKGROUND ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SHOW_DETAIL_OVERLAY") {
    showDetailOverlay(request.data);
  }
});

// --- 3. UTILS: SHADOW DOM ---
function getOrCreateShadow() {
  let container = document.getElementById("sidiktaut-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "sidiktaut-root";
    document.body.appendChild(container);
    const shadow = container.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = getStyles(); // Mengambil CSS dari fungsi di bawah
    shadow.appendChild(style);
    return shadow;
  }
  return container.shadowRoot;
}

// --- 4. POPUP TANYA (TOAST KECIL) ---
function injectAskPopup() {
  if (document.getElementById("sidiktaut-root")) return;
  if (!chrome.runtime?.id) return;

  const shadow = getOrCreateShadow();
  
  let iconUrl = "";
  try { iconUrl = chrome.runtime.getURL("icon.png"); } catch(e) { return; }

  const wrapper = document.createElement("div");
  wrapper.className = "st-toast"; 
  
  wrapper.innerHTML = `
    <div class="st-toast-main">
        <div class="st-toast-content">
          <div class="st-toast-icon">
            <img src="${iconUrl}" alt="ST">
          </div>
          <div class="st-toast-text">
            <h4 class="st-font-bold" id="toastTitle">Verifikasi Keamanan</h4>
            <p class="st-text-xs st-text-muted" id="toastDesc">Scan halaman ini sekarang?</p>
          </div>
        </div>
        <div class="st-toast-actions">
          <button id="btnScan" class="st-btn-primary-sm">Scan</button>
          <button id="btnCloseMini" class="st-btn-icon-sm">&times;</button>
        </div>
    </div>
    <div class="st-toast-footer">
        <button id="btnNever" class="st-link-tiny">Jangan tanya lagi untuk situs manapun</button>
    </div>
  `;

  shadow.appendChild(wrapper);

  const ui = {
    btnScan: shadow.getElementById("btnScan"),
    btnClose: shadow.getElementById("btnCloseMini"),
    btnNever: shadow.getElementById("btnNever"),
    title: shadow.getElementById("toastTitle"),
    desc: shadow.getElementById("toastDesc")
  };

  const closeToast = () => {
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'translateY(-10px)';
      setTimeout(() => {
          const root = document.getElementById("sidiktaut-root");
          if(root) root.remove();
      }, 300);
  };

  ui.btnClose.onclick = closeToast;
  
  ui.btnNever.onclick = () => {
      try {
          chrome.storage.sync.set({ sidik_ask_scan: false }, closeToast);
      } catch (e) { closeToast(); }
  };
  
  // --- LOGIC SCAN ANTI-ERROR (PENTING!) ---
  ui.btnScan.onclick = () => {
    // 1. Cek Koneksi Internet
    if (!navigator.onLine) {
      ui.title.textContent = "Offline";
      ui.title.style.color = "#ef4444";
      ui.desc.textContent = "Cek koneksi internet Anda.";
      return;
    }

    // 2. Cek Koneksi Ekstensi (INI BIANG KEROK ERROR)
    if (!chrome.runtime?.id) {
        ui.title.textContent = "Terputus";
        ui.title.style.color = "#ef4444";
        ui.desc.textContent = "Koneksi usang. Mohon refresh halaman.";
        ui.btnScan.textContent = "Refresh Page";
        ui.btnScan.onclick = () => window.location.reload(); // Tombol berubah fungsi jadi Refresh
        return;
    }

    ui.btnScan.textContent = "Loading...";
    ui.btnScan.disabled = true;
    ui.btnNever.style.display = "none"; 

    // Kirim pesan ke Background
    try {
        chrome.runtime.sendMessage({ action: "REQUEST_SCAN", url: window.location.href }, (response) => {
            
            // 1. DETEKSI BACKGROUND MATI (Runtime Error)
            if (chrome.runtime.lastError) {
                console.warn("Service Worker Sleep, Retrying...", chrome.runtime.lastError);
                ui.title.textContent = "Menghubungkan...";
                
                // COBA LAGI SETELAH 1 DETIK (Membangunkan Service Worker)
                setTimeout(() => {
                    try {
                        chrome.runtime.sendMessage({ action: "REQUEST_SCAN", url: window.location.href }, (retryRes) => {
                            if (retryRes && retryRes.success) {
                                showDetailOverlay(retryRes.data);
                            } else {
                                ui.title.textContent = "Gagal";
                                ui.title.style.color = "#ef4444";
                                ui.desc.textContent = "Sistem sibuk/error. Coba reload halaman.";
                                ui.btnScan.textContent = "Reload";
                                ui.btnScan.disabled = false;
                                ui.btnScan.onclick = () => window.location.reload();
                            }
                        });
                    } catch(err) {
                        ui.btnScan.textContent = "Reload";
                        ui.btnScan.onclick = () => window.location.reload();
                    }
                }, 1500);
                return;
            }

            // 2. DETEKSI ERROR API
            if (!response || !response.success) {
                ui.title.textContent = "Gagal";
                ui.title.style.color = "#ef4444";
                ui.desc.textContent = response?.error || "Server sibuk.";
                ui.btnScan.textContent = "Tutup";
                ui.btnScan.disabled = false;
                ui.btnScan.onclick = closeToast;
                return;
            }

            // 3. SUKSES
            showDetailOverlay(response.data);
        });
    } catch (e) {
        ui.title.textContent = "Error";
        ui.desc.textContent = "Koneksi terputus. Refresh halaman.";
        ui.btnScan.textContent = "Refresh";
        ui.btnScan.onclick = () => window.location.reload();
    }
  };
}

// --- 5. OVERLAY DETAIL (MODAL BESAR DENGAN TABS) ---
function showDetailOverlay(data) {
  const shadow = getOrCreateShadow();
  
  // Bersihkan elemen lama
  const oldWrapper = shadow.querySelector(".st-overlay-backdrop"); 
  const oldToast = shadow.querySelector(".st-toast");
  if (oldWrapper) oldWrapper.remove();
  if (oldToast) oldToast.remove();

  const malicious = data.malicious || 0;
  const harmless = data.harmless || 0;
  const undetected = data.undetected || 0;

  // --- RENDER LIST SESUAI KATEGORI (TABS) ---
  const renderList = (category) => {
      const listContainer = shadow.getElementById('listContainer');
      if (!listContainer) return;

      if (!data.details || data.details.length === 0) {
          listContainer.innerHTML = `<div class="st-empty-state">Tidak ada data detail.</div>`;
          return;
      }

      // Filter Data berdasarkan Tab
      const filtered = data.details.filter(v => {
          const res = (v.result || "unknown").toLowerCase();
          const isBad = ["malicious", "phishing", "malware", "suspicious"].some(k => res.includes(k));
          const isClean = ["clean", "harmless", "safe"].some(k => res.includes(k));
          
          if (category === 'malicious') return isBad; 
          if (category === 'harmless') return isClean; 
          if (category === 'undetected') return !isBad && !isClean; 
          return true;
      });

      if (filtered.length === 0) {
          listContainer.innerHTML = `<div class="st-empty-state">Aman. Tidak ada deteksi di kategori ini.</div>`;
          return;
      }

      // Render HTML List (Style Rapi Lurus ke Bawah)
      listContainer.innerHTML = filtered.map(v => {
          const res = (v.result || "Unknown").toLowerCase();
          const isBad = ["malicious", "phishing", "malware", "suspicious"].some(k => res.includes(k));
          const isClean = ["clean", "harmless", "safe"].some(k => res.includes(k));
          
          let rowClass = "row-default";
          let iconHtml = `<span class="st-icon-gray">?</span>`;
          let textClass = "text-gray";
          let badgeClass = "badge-gray";

          if (isBad) {
              rowClass = "row-danger";
              // Icon Merah
              iconHtml = `<svg class="st-icon-danger" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
              textClass = "text-danger";
              badgeClass = "badge-danger";
          } else if (isClean) {
              rowClass = "row-safe";
              // Icon Hijau
              iconHtml = `<svg class="st-icon-safe" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
              textClass = "text-safe";
              badgeClass = "badge-safe";
          }

          return `
              <div class="st-row ${rowClass}">
                  <div class="st-row-left">
                     ${iconHtml}
                     <span class="st-vendor-name ${textClass}">${v.engine_name}</span>
                  </div>
                  <div class="st-badge-pill ${badgeClass}">
                      ${v.result}
                  </div>
              </div>
          `;
      }).join("");
  };

  const wrapper = document.createElement("div");
  wrapper.className = "st-overlay-backdrop"; 
  
  // HTML STRUKTUR (DENGAN TOMBOL TABS)
  wrapper.innerHTML = `
    <div class="st-modal">
        <div class="st-modal-header">
            <div class="st-modal-title-group">
                <svg class="st-icon-shield" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <h3>Detail Analisis</h3>
            </div>
            <button id="btnCloseDetail" class="st-btn-close">&times;</button>
        </div>

        <div class="st-stats-bar">
            <div id="tabMalicious" class="st-stat-pill ${malicious > 0 ? 'pill-active' : ''}" style="cursor:pointer">
                <span>Malicious</span>
                <span class="st-stat-count">${malicious}</span>
            </div>
            <div id="tabHarmless" class="st-stat-pill" style="cursor:pointer">
                <span>Clean</span>
                <span class="st-stat-count">${harmless}</span>
            </div>
            <div id="tabUndetected" class="st-stat-pill" style="cursor:pointer">
                <span>Undetected</span>
                <span class="st-stat-count">${undetected}</span>
            </div>
        </div>

        <div id="listContainer" class="st-modal-body custom-scrollbar">
            </div>
    </div>
  `;

  shadow.appendChild(wrapper);

  // --- LOGIC CLICK TABS ---
  const tabMal = shadow.getElementById('tabMalicious');
  const tabSafe = shadow.getElementById('tabHarmless');
  const tabUn = shadow.getElementById('tabUndetected');

  const switchTab = (activeBtn, category) => {
      [tabMal, tabSafe, tabUn].forEach(btn => btn.classList.remove('pill-active'));
      activeBtn.classList.add('pill-active');
      renderList(category);
  };

  tabMal.onclick = () => switchTab(tabMal, 'malicious');
  tabSafe.onclick = () => switchTab(tabSafe, 'harmless');
  tabUn.onclick = () => switchTab(tabUn, 'undetected');

  // Default Tab Logic: Tampilkan Malicious jika ada, kalau tidak Clean
  if (malicious > 0) {
      renderList('malicious');
  } else {
      switchTab(tabSafe, 'harmless');
  }

  const closeFunc = () => {
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'translateX(20px)';
      setTimeout(() => {
          const root = document.getElementById("sidiktaut-root");
          if(root) root.remove();
      }, 200);
  };
  
  shadow.getElementById("btnCloseDetail").onclick = closeFunc;
  wrapper.onclick = (e) => { 
      if (e.target === wrapper) closeFunc();
  };
}

// --- 6. CSS LENGKAP (Styling User + Fixes) ---
function getStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }
    
    @keyframes slideInRight { 
        from { transform: translateX(50px); opacity: 0; } 
        to { transform: translateX(0); opacity: 1; } 
    }

    /* TOAST */
    .st-toast { 
        position: fixed; top: 24px; right: 24px; z-index: 2147483647; 
        background: #ffffff; width: 340px; border-radius: 16px; 
        padding: 16px; box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.15); 
        border: 1px solid #f3f4f6;
        display: flex; flex-direction: column; gap: 12px;
        animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        transition: all 0.3s ease;
    }
    
    .st-toast-main { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .st-toast-content { display: flex; align-items: center; gap: 12px; flex: 1; }
    .st-toast-icon { width: 38px; height: 38px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .st-toast-icon img { width: 22px; height: 22px; }
    .st-toast-text h4 { margin: 0; font-size: 14px; font-weight: 700; color: #111827; }
    .st-toast-text p { margin: 2px 0 0; font-size: 12px; color: #6b7280; line-height: 1.3; }
    
    .st-toast-actions { display: flex; align-items: center; gap: 8px; }
    .st-toast-footer { border-top: 1px solid #f3f4f6; padding-top: 8px; text-align: center; }
    .st-link-tiny { background: none; border: none; font-size: 11px; color: #9ca3af; cursor: pointer; text-decoration: none; transition: 0.2s; }
    .st-link-tiny:hover { color: #6b7280; text-decoration: underline; }

    .st-btn-primary-sm { background: #2563eb; color: white; border: none; padding: 7px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; white-space: nowrap; }
    .st-btn-primary-sm:hover { background: #1d4ed8; }
    .st-btn-primary-sm:disabled { background: #93c5fd; cursor: not-allowed; }
    .st-btn-icon-sm { background: transparent; border: none; font-size: 18px; color: #d1d5db; cursor: pointer; }
    .st-btn-icon-sm:hover { color: #4b5563; }

    /* OVERLAY BACKDROP */
    .st-overlay-backdrop { 
        position: fixed; top: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; 
        background: rgba(0,0,0,0.1); z-index: 9999999; 
        display: flex; justify-content: flex-end; align-items: flex-start; 
        padding: 24px; transition: 0.2s;
    }

    /* MODAL */
    .st-modal { 
        background: #ffffff; width: 400px; max-height: 90vh; 
        border-radius: 24px; display: flex; flex-direction: column; 
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.25); 
        animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid #e5e7eb;
    }

    .st-modal-header { padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 24px 24px 0 0; }
    .st-modal-title-group { display: flex; align-items: center; gap: 10px; }
    .st-icon-shield { color: #2563eb; }
    .st-modal-header h3 { margin: 0; font-size: 17px; font-weight: 800; color: #111827; letter-spacing: -0.3px; }
    .st-btn-close { background: #fef2f2; border: 1px solid #fee2e2; color: #ef4444; width: 30px; height: 30px; border-radius: 10px; font-size: 18px; cursor: pointer; line-height: 1; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .st-btn-close:hover { background: #ef4444; color: white; border-color: #ef4444; }

    /* STATS TABS */
    .st-stats-bar { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 0 24px 18px; background: #fff; }
    .st-stat-pill { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; align-items: center; font-size: 11px; font-weight: 600; color: #6b7280; transition: all 0.2s; }
    .st-stat-pill:hover { background: #f3f4f6; border-color: #e5e7eb; }
    .st-stat-count { font-size: 15px; font-weight: 800; color: #1f2937; margin-top: 4px; }
    
    .pill-active { background: #fff1f2; border-color: #ffe4e6; color: #e11d48; }
    .pill-active .st-stat-count { color: #be123c; }

    /* LIST CONTENT */
    .st-modal-body { 
        flex: 1; overflow-y: auto; padding: 18px 24px; 
        background: #fff; display: flex; flex-direction: column; gap: 8px;
        border-radius: 0 0 24px 24px;
        border-top: 1px solid #f3f4f6; 
    }

    .st-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; width: 100%; border-radius: 12px; border: 1px solid transparent; transition: 0.2s; }
    .st-row-left { display: flex; align-items: center; gap: 10px; overflow: hidden; flex: 1; }
    .st-vendor-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    .st-badge-pill { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; flex-shrink: 0; }

    .row-danger { background: #fef2f2; border-color: #fee2e2; }
    .text-danger { color: #1f2937; }
    .badge-danger { background: #fee2e2; color: #ef4444; }

    .row-safe { background: #ecfdf5; border-color: #d1fae5; }
    .text-safe { color: #1f2937; }
    .badge-safe { background: #d1fae5; color: #059669; }

    .row-default { background: #f9fafb; border-color: #f3f4f6; }
    .text-gray { color: #4b5563; }
    .badge-gray { background: #e5e7eb; color: #6b7280; }

    .st-icon-danger { color: #ef4444; flex-shrink: 0; }
    .st-icon-safe { color: #10b981; flex-shrink: 0; }
    .st-icon-gray { color: #9ca3af; font-weight: bold; width: 16px; text-align: center; flex-shrink: 0; }

    .st-empty-state { text-align: center; color: #9ca3af; font-size: 13px; padding: 40px; }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
  `;
}