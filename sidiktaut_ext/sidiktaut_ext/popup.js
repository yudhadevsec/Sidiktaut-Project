document.addEventListener("DOMContentLoaded", async () => {
  // =================================================================
  // 🔧 KONFIGURASI HYBRID (SINKRONISASI)
  // Ubah IS_DEV menjadi:
  // true  = Mode Development (Pakai Localhost di laptop kamu)
  // false = Mode Production (Pakai Server PythonAnywhere)
  // =================================================================
  
  const IS_DEV = true; // <--- SAKLAR UTAMA (Ganti true/false disini)

  const API_BASE_URL = IS_DEV 
    ? "http://127.0.0.1:5000" 
    : "https://yudhadevsec.pythonanywhere.com";

  console.log(`[Popup] Mode: ${IS_DEV ? 'DEVELOPMENT (Local)' : 'PRODUCTION (Server)'}`);
  
  // =================================================================

  // Referensi Element UI
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

  // Icon SVG untuk Tema
  const iconSun = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.29-1.29zm1.41-13.78c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.29-1.29zM7.28 17.28c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.29 1.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.29-1.29z"></path></svg>`;
  const iconMoon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path></svg>`;

  // 1. Load Settings Awal
  const settings = await chrome.storage.sync.get(["sidik_theme", "sidik_ask_scan"]);
  
  let currentTheme = settings.sidik_theme || "dark";
  applyTheme(currentTheme);
  
  ui.askScan.checked = settings.sidik_ask_scan !== false;

  // 2. Ambil URL dari Tab Aktif
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url && tab.url.startsWith("http")) ui.urlInput.value = tab.url;

  // 3. Cek Status Server (Health Check)
  checkServer();

  // Listener Online/Offline
  window.addEventListener('online',  () => { checkServer(); });
  window.addEventListener('offline', () => { updateBadgeOffline(); });

  // Auto-Check setiap 5 detik
  setInterval(() => {
    if (navigator.onLine) {
       checkServer(true); // silent mode
    }
  }, 5000);

  // 4. Listener Tombol Tema
  ui.themeBtn.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    chrome.storage.sync.set({ sidik_theme: currentTheme });
    applyTheme(currentTheme);
  });

  // 5. Listener Checkbox Setting
  ui.askScan.addEventListener("change", () => {
    chrome.storage.sync.set({ sidik_ask_scan: ui.askScan.checked });
  });

  // 6. Listener Tombol SCAN (LOGIKA UTAMA)
  ui.scanBtn.addEventListener("click", async () => {
    const target = ui.urlInput.value.trim();
    if(!target) return;

    // Cek Internet Browser
    if (!navigator.onLine) {
      showError("Tidak ada koneksi internet.");
      updateBadgeOffline();
      return;
    }

    // UI State: Loading
    ui.scanBtn.disabled = true;
    ui.scanBtn.innerText = "Menganalisis...";
    ui.resultArea.classList.add("hidden");
    ui.errorMsg.classList.add("hidden");
    ui.vendorList.innerHTML = "";

    try {
      // --- FETCH LANGSUNG DARI POPUP (Biar Sinkron dengan IS_DEV diatas) ---
      const response = await fetch(`${API_BASE_URL}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target })
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Simpan ke storage (opsional, biar background tau kalau perlu)
      const resultId = `res-${Date.now()}`;
      await chrome.storage.local.set({ [`data_${resultId}`]: data });

      // Tampilkan Hasil
      showResults(data);

    } catch (err) {
      console.error(err);
      let msg = "Gagal terhubung ke Backend.";
      
      // Pesan Error Spesifik
      if (err.message.includes("Failed to fetch")) {
        msg = IS_DEV 
          ? "Gagal connect ke Localhost. Pastikan 'python app.py' jalan."
          : "Gagal connect ke Server. Cek internet/server down.";
      }
      
      showError(msg);
      checkServer(); // Cek ulang status server
    } finally {
      // Reset Tombol
      ui.scanBtn.disabled = false;
      ui.scanBtn.innerText = "SCAN SEKARANG";
    }
  });

  // --- HELPER FUNCTIONS ---

  function applyTheme(mode) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(mode);
    ui.themeBtn.innerHTML = mode === "dark" ? iconSun : iconMoon;
  }

  function showError(msg) {
    ui.errorMsg.innerText = msg;
    ui.errorMsg.classList.remove("hidden");
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

  // ✅ Fungsi Cek Server (Menggunakan API_BASE_URL dinamis)
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
      const id = setTimeout(() => controller.abort(), 2000); // 2 Detik Timeout
      
      // Request OPTIONS ringan ke endpoint
      await fetch(`${API_BASE_URL}/scan`, { 
        method: "OPTIONS", 
        signal: controller.signal 
      });
      clearTimeout(id);

      ui.status.textContent = IS_DEV ? "LOCAL" : "ONLINE"; // Teks lebih informatif
      ui.status.className = "badge online";
      ui.status.title = `Terhubung ke: ${API_BASE_URL}`;

      // Visual Feedback jika Localhost
      if (IS_DEV && !silent) {
         console.log("🔧 Connected to Localhost Backend");
      }

    } catch (e) {
      ui.status.textContent = "OFFLINE"; 
      ui.status.className = "badge offline";
      ui.status.title = `Gagal terhubung ke: ${API_BASE_URL}`;
    }
  }
});