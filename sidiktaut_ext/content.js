/**
 * SIDIKTAUT CONTENT SCRIPT (FINAL + OFFLINE DETECTION)
 */

const log = (msg) => console.log(`[SidikTaut Content] ${msg}`);

(async function init() {
  if (window.self !== window.top) return;

  try {
    const settings = await chrome.storage.sync.get(["sidik_ask_scan", "sidik_auto_scan"]);
    if (settings.sidik_auto_scan || settings.sidik_ask_scan === false) return;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setTimeout(injectPopup, 1000));
    } else {
      setTimeout(injectPopup, 1000);
    }
  } catch (e) {
    console.error("Init Error:", e);
  }
})();

function injectPopup() {
  if (document.getElementById("sidiktaut-root")) return;

  const iconUrl = chrome.runtime.getURL("icon.png");
  const container = document.createElement("div");
  container.id = "sidiktaut-root";
  const shadow = container.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .st-overlay { position: fixed; top: 24px; right: 24px; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; animation: slideIn 0.3s ease-out; }
    .st-card { background: #1c1c1e; color: #fff; width: 320px; border-radius: 14px; padding: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); overflow: hidden; max-height: 80vh; display: flex; flex-direction: column; }
    
    .st-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-shrink: 0; }
    .st-icon-box { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
    .st-icon-box img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .st-title { font-weight: 700; font-size: 15px; margin: 0; color: white; }
    
    .st-content { flex-grow: 1; overflow-y: auto; } 
    .st-desc { font-size: 13px; color: #aeaeb2; margin: 0 0 16px 0; line-height: 1.4; }
    
    .st-actions { display: flex; gap: 10px; margin-bottom: 10px; margin-top: auto; }
    .st-btn { flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;}
    
    .btn-blue { background: #0a84ff; color: white; }
    .btn-blue:hover { background: #0077ed; }
    .btn-blue:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .btn-gray { background: #3a3a3c; color: white; }
    .btn-gray:hover { background: #48484a; }
    
    .btn-link { background: none; border: none; width: 100%; color: #8e8e93; font-size: 11px; cursor: pointer; padding: 6px; margin-top: 4px; }
    .btn-link:hover { color: #aeaeb2; text-decoration: underline; }
    
    .text-safe { color: #32d74b !important; }
    .text-danger { color: #ff453a !important; }

    /* Styles Detail List */
    .st-detail-list { margin-top: 10px; max-height: 300px; overflow-y: auto; border-top: 1px solid #333; padding-top: 10px; }
    .st-vendor-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #2c2c2e; font-size: 12px; }
    .st-vendor-name { font-weight: 600; color: #fff; }
    .st-vendor-res { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
    .res-clean { background: rgba(50, 215, 75, 0.2); color: #32d74b; }
    .res-malicious { background: rgba(255, 69, 58, 0.2); color: #ff453a; }
    .st-empty { text-align: center; color: #666; font-size: 12px; padding: 20px; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #1c1c1e; }
    ::-webkit-scrollbar-thumb { background: #3a3a3c; border-radius: 3px; }

    @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeOut { to { opacity: 0; transform: scale(0.95); } }
  `;

  const wrapper = document.createElement("div");
  wrapper.className = "st-overlay";
  
  wrapper.innerHTML = `
    <div class="st-card" id="mainCard">
      <div class="st-header">
        <div class="st-icon-box"><img src="${iconUrl}" alt="SidikTaut"></div>
        <h4 class="st-title" id="titleText">Verifikasi Keamanan</h4>
      </div>
      
      <div class="st-content" id="contentArea">
        <p class="st-desc" id="descText">Situs ini belum dipindai. Jalankan SidikTaut untuk mendeteksi ancaman?</p>
      </div>

      <div class="st-actions" id="btnGroup">
        <button id="btnScan" class="st-btn btn-blue">Scan Sekarang</button>
        <button id="btnClose" class="st-btn btn-gray">Tutup</button>
      </div>
      
      <button id="btnNever" class="btn-link">Jangan tanya lagi untuk situs manapun</button>
    </div>
  `;

  shadow.appendChild(style);
  shadow.appendChild(wrapper);
  document.body.appendChild(container);

  const ui = {
    title: shadow.getElementById("titleText"),
    desc: shadow.getElementById("descText"),
    contentArea: shadow.getElementById("contentArea"),
    btnScan: shadow.getElementById("btnScan"),
    btnClose: shadow.getElementById("btnClose"),
    btnNever: shadow.getElementById("btnNever"),
    btnGroup: shadow.getElementById("btnGroup")
  };

  // --- LOGIC UTAMA ---

  ui.btnScan.onclick = () => {
    // 1. CEK KONEKSI INTERNET (Anti Macet)
    if (!navigator.onLine) {
      ui.title.textContent = "Tidak Ada Internet";
      ui.title.classList.add("text-danger");
      ui.desc.textContent = "Gagal memindai. Pastikan perangkat Anda terhubung ke internet.";
      return; 
    }

    // 2. Jika Online, Lanjut
    ui.btnScan.textContent = "Menganalisis...";
    ui.btnScan.disabled = true;
    ui.btnClose.style.display = "none";
    ui.btnNever.style.display = "none";

    chrome.runtime.sendMessage({ action: "REQUEST_SCAN", url: window.location.href }, (response) => {
      // Handle Runtime Error (Background mati)
      if (chrome.runtime.lastError) {
        ui.title.textContent = "Error Sistem";
        ui.desc.textContent = "Ekstensi perlu dimuat ulang.";
        return;
      }
      handleResult(response, ui, wrapper, shadow);
    });
  };

  ui.btnClose.onclick = () => closePopup(wrapper);
  ui.btnNever.onclick = () => {
    chrome.storage.sync.set({ sidik_ask_scan: false }, () => closePopup(wrapper));
  };
}

function handleResult(response, ui, wrapper, shadow) {
  ui.btnGroup.innerHTML = ""; 

  if (response && response.success) {
    const data = response.data;
    const isSafe = data.malicious === 0;

    if (isSafe) {
      ui.title.textContent = "✅ Link Aman";
      ui.title.classList.add("text-safe");
      ui.desc.textContent = `Aman. Reputasi VirusTotal: ${data.reputation}/100.`;
    } else {
      ui.title.textContent = "⚠️ BAHAYA";
      ui.title.classList.add("text-danger");
      ui.desc.textContent = `Peringatan! ${data.malicious} Vendor menandai situs ini berbahaya.`;
    }

    // Tombol Detail & Tutup
    const btnDetail = document.createElement("button");
    btnDetail.className = "st-btn btn-blue";
    btnDetail.textContent = "Lihat Detail";
    btnDetail.onclick = () => showDetailView(data, ui, wrapper, shadow);

    const btnClose = document.createElement("button");
    btnClose.className = "st-btn btn-gray";
    btnClose.textContent = "Tutup";
    btnClose.onclick = () => closePopup(wrapper);

    ui.btnGroup.appendChild(btnDetail);
    ui.btnGroup.appendChild(btnClose);

  } else {
    // Error Handling
    ui.title.textContent = "Gagal Terhubung";
    ui.title.classList.add("text-danger");
    ui.desc.textContent = "Server backend tidak merespon.";
    
    const btnClose = document.createElement("button");
    btnClose.className = "st-btn btn-gray";
    btnClose.textContent = "Tutup";
    btnClose.style.width = "100%";
    btnClose.onclick = () => closePopup(wrapper);
    ui.btnGroup.appendChild(btnClose);
  }
}

function showDetailView(data, ui, wrapper, shadow) {
  ui.title.textContent = "Detail Analisis";
  ui.title.classList.remove("text-safe", "text-danger");

  let listHtml = '<div class="st-detail-list">';
  if (data.details && data.details.length > 0) {
    const sortedDetails = data.details.sort((a, b) => {
      const aBad = isBad(a.result);
      const bBad = isBad(b.result);
      return bBad - aBad; 
    });

    sortedDetails.forEach(v => {
      const resultText = v.result || "Unknown";
      const isMalicious = isBad(resultText);
      const resClass = isMalicious ? "res-malicious" : "res-clean";

      listHtml += `
        <div class="st-vendor-row">
          <span class="st-vendor-name">${v.engine_name}</span>
          <span class="st-vendor-res ${resClass}">${resultText}</span>
        </div>
      `;
    });
  } else {
    listHtml += '<div class="st-empty">Tidak ada data detail.</div>';
  }
  listHtml += '</div>';

  ui.contentArea.innerHTML = listHtml;
  ui.btnGroup.innerHTML = "";

  const btnClose = document.createElement("button");
  btnClose.className = "st-btn btn-gray";
  btnClose.textContent = "Tutup";
  btnClose.style.width = "100%";
  btnClose.onclick = () => closePopup(wrapper);
  
  ui.btnGroup.appendChild(btnClose);
}

function isBad(res) {
  if(!res) return false;
  const r = res.toLowerCase();
  return r.includes("malicious") || r.includes("phishing") || r.includes("malware") || r.includes("suspicious");
}

function closePopup(element) {
  element.style.animation = "fadeOut 0.2s forwards";
  setTimeout(() => {
    const root = document.getElementById("sidiktaut-root");
    if (root) root.remove();
  }, 200);
}