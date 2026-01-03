document.addEventListener("DOMContentLoaded", async () => {
  // Element User Interface
  const ui = {
    scanBtn: document.getElementById("scanBtn"),
    urlInput: document.getElementById("urlInput"),
    askScan: document.getElementById("askScanToggle"),
    resultArea: document.getElementById("resultArea"),
    score: document.getElementById("scoreText"),
    verdict: document.getElementById("verdictText"),
    vendorList: document.getElementById("vendorList"),
    status: document.getElementById("statusBadge"),
    themeBtn: document.getElementById("themeBtn"),
    errorMsg: document.getElementById("errorMsg")
  };

  const iconSun = `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.29-1.29zm1.41-13.78c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.29-1.29zM7.28 17.28c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.29-1.29z"></path></svg>`;
  const iconMoon = `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path></svg>`;

  const settings = await chrome.storage.sync.get(["sidik_theme", "sidik_ask_scan"]);
  
  let currentTheme = settings.sidik_theme || "dark";
  applyTheme(currentTheme);
  
  ui.askScan.checked = settings.sidik_ask_scan !== false;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url && tab.url.startsWith("http")) ui.urlInput.value = tab.url;

  // Cek server (cek mesin hidup atau gak)
  checkServer();

  // --- AUTO DETECT CONNECTION ---
  window.addEventListener('online',  () => { checkServer(); });
  window.addEventListener('offline', () => { updateBadgeOffline(); });

  // Cek server setiap 3 detik
  setInterval(() => {
    if (navigator.onLine) {
       checkServer(true);
    }
  }, 3000);

  ui.themeBtn.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    chrome.storage.sync.set({ sidik_theme: currentTheme });
    applyTheme(currentTheme);
  });

  ui.askScan.addEventListener("change", () => {
    chrome.storage.sync.set({ sidik_ask_scan: ui.askScan.checked });
  });

  ui.scanBtn.addEventListener("click", async () => {
    const target = ui.urlInput.value.trim();
    if(!target) return;

    if (!navigator.onLine) {
      ui.errorMsg.innerText = "Tidak ada koneksi internet.";
      ui.errorMsg.classList.remove("hidden");
      updateBadgeOffline();
      return;
    }

    ui.scanBtn.disabled = true;
    ui.scanBtn.innerText = "Menganalisis...";
    ui.resultArea.classList.add("hidden");
    ui.errorMsg.classList.add("hidden");
    ui.vendorList.innerHTML = "";

    chrome.runtime.sendMessage({ action: "REQUEST_SCAN", url: target }, (response) => {
      ui.scanBtn.disabled = false;
      ui.scanBtn.innerText = "SCAN SEKARANG";

      if (chrome.runtime.lastError) {
         ui.errorMsg.innerText = "Komunikasi Error. Reload Ekstensi.";
         ui.errorMsg.classList.remove("hidden");
         return;
      }

      if (response && response.success) {
        showResults(response.data);
      } else {
        ui.errorMsg.innerText = "Gagal. Cek koneksi backend/API Key.";
        ui.errorMsg.classList.remove("hidden");
        checkServer(); // Server di cek lagi kalau scan gagal
      }
    });
  });

  function applyTheme(mode) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(mode);
    ui.themeBtn.innerHTML = mode === "dark" ? iconSun : iconMoon;
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showResults(data) {
    ui.resultArea.classList.remove("hidden");
    ui.score.innerText = data.malicious;
    
    const isSafe = data.malicious === 0;
    ui.verdict.innerText = isSafe 
      ? `✅ Aman (Score: ${data.reputation}/100)` 
      : `⚠️ BERBAHAYA (${data.malicious} Vendor)`;
    ui.verdict.style.color = isSafe ? "var(--success)" : "var(--danger)";

    if (data.details && data.details.length > 0) {
      ui.vendorList.innerHTML = data.details.map(v => {
        const res = (v.result || "unknown").toLowerCase();
        let statusClass = "v-clean";
        if (res.includes("malicious") || res.includes("phishing") || res.includes("malware") || res.includes("suspicious")) {
          statusClass = "v-malicious";
        }
        
        return `
          <div class="vendor-item">
            <span class="v-name">${escapeHtml(v.engine_name)}</span>
            <span class="v-status ${statusClass}">
              ${escapeHtml(v.result || "Unknown")}
            </span>
          </div>
        `;
      }).join("");
    } else {
      ui.vendorList.innerHTML = `<div class="vendor-item" style="justify-content:center; color:gray">Tidak ada detail vendor.</div>`;
    }
  }

  function updateBadgeOffline() {
    ui.status.textContent = "NO NET";
    ui.status.className = "badge offline";
  }

  // Fungsi cek server
  async function checkServer(silent = false) {
    if (!navigator.onLine) {
       updateBadgeOffline();
       return;
    }

    if (!silent) {
        ui.status.textContent = "CHECKING...";
        ui.status.className = "badge"; 
    }

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1000);
      
      await fetch("https://yudhadevsec.pythonanywhere.com/scan", { 
        method: "OPTIONS", 
        signal: controller.signal 
      });

      
      // Jika berhasil, maka
      ui.status.textContent = "ONLINE";
      ui.status.className = "badge online";

    } catch (e) {
      // Jika gagal connect backend
      ui.status.textContent = "OFFLINE"; 
      ui.status.className = "badge offline";
      ui.status.title = "Pastikan 'python app.py' berjalan";
    }
  }
});