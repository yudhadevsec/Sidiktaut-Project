from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import requests
import whois
from datetime import datetime
import os
from dotenv import load_dotenv
import base64
import hashlib
import re
from urllib.parse import urljoin, urlparse
import urllib3
import socket
import ipaddress

# 1. Matikan Warning SSL (Penting untuk scanning situs malware)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load env variables
load_dotenv()

app = Flask(__name__)

# ==============================================================================
# CONFIG
# ==============================================================================
IS_PRODUCTION = os.getenv("FLASK_ENV") == "production"
ALLOWED_ORIGINS = ["https://sidiktaut.vercel.app"] if IS_PRODUCTION else "*"
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

VT_API_KEY = os.getenv("VT_API_KEY") 
VT_URL = "https://www.virustotal.com/api/v3/urls"

HEADERS_UA = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SidikTaut/1.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}

# ==============================================================================
# SECURITY LOGIC (SSRF PROTECTION)
# ==============================================================================

def is_safe_target(url):
    """
    Fungsi Satpam Galak: Cek apakah IP tujuan aman (Bukan Localhost/Private IP).
    """
    try:
        # 1. Bersihkan URL
        url = url.strip()
        
        # Ambil hostname
        parsed = urlparse(url)
        hostname = parsed.hostname

        # Fallback jika urlparse gagal
        if not hostname:
            if "://" not in url:
                temp_url = "http://" + url
                hostname = urlparse(temp_url).hostname
        
        if not hostname:
            return False 

        # 2. Blokir 'localhost' string
        if hostname.lower() == 'localhost':
            print(f"[SECURITY BLOCK] Domain Localhost terdeteksi.")
            return False

        # 3. Resolve ke IP Address
        try:
            ip_str = socket.gethostbyname(hostname)
        except:
            print(f"[SECURITY BLOCK] Gagal resolve DNS: {hostname}")
            return False

        # 4. Cek IP Private
        ip = ipaddress.ip_address(ip_str)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            print(f"[SECURITY BLOCK] IP Private terdeteksi: {hostname} -> {ip}")
            return False
            
        return True
    except Exception as e:
        print(f"[SECURITY ERROR] Validasi gagal total: {e}")
        return False

def is_safe_url(url):
    if len(url) > 2000: return False
    pattern = r"^[a-zA-Z0-9-._~:/?#[\]@!$&'*+,;=%]+$"
    if not re.match(pattern, url): return False
    return True

def resolve_protocol(raw_url):
    raw_url = raw_url.strip()
    if raw_url.startswith("http://") or raw_url.startswith("https://"):
        return raw_url
    return f"http://{raw_url}"

def trace_redirects(url):
    session = requests.Session()
    session.headers.update(HEADERS_UA)
    session.cookies.clear()
    chain = []
    current_url = url
    
    for _ in range(8):
        try:
            # CEK SECURITY TIAP LOMPATAN
            if not is_safe_target(current_url):
                chain.append({"status": 403, "url": "BLOCKED_LOCAL_IP_ACCESS"})
                break

            response = session.get(current_url, timeout=5, allow_redirects=False, verify=False)
            chain.append({"status": response.status_code, "url": current_url})
            
            next_url = None
            if 300 <= response.status_code < 400:
                next_url = response.headers.get('Location')
            else:
                # Cek meta refresh / JS redirect
                content_type = response.headers.get('Content-Type', '').lower()
                if 'text/html' in content_type:
                    content = response.text.lower()
                    if "just a moment" in content or "cloudflare" in content:
                        chain.append({"status": 403, "url": "BLOCKED_BY_CLOUDFLARE"})
                        break
                    meta = re.findall(r'content=["\']\d+;\s*url=([^"\']+)["\']', content)
                    if meta: next_url = meta[0]

            if next_url:
                if not next_url.startswith('http'): next_url = urljoin(current_url, next_url)
                if next_url == current_url: break
                current_url = next_url
                continue 
            break
        except Exception as e:
            break

    if not chain: chain.append({"status": 200, "url": url})
    final_dest = chain[-1]['url']
    if final_dest == "BLOCKED_LOCAL_IP_ACCESS" and len(chain) > 1: final_dest = chain[-2]['url']
    return final_dest, chain

@app.route('/scan', methods=['POST'])
@limiter.limit("20 per minute")
def scan_url():
    data = request.json
    raw_input = data.get('url')

    if not raw_input: return jsonify({"error": "URL is required"}), 400
    if not is_safe_url(raw_input): return jsonify({"error": "Invalid URL format!"}), 400
    
    target_url = resolve_protocol(raw_input)

    # CEK SECURITY SSRF (CRITICAL)
    if not is_safe_target(target_url):
        print(f"[BLOCKED] Percobaan scan dilarang ke: {target_url}")
        return jsonify({"error": "Access Denied: Scanning Local/Private IP is forbidden."}), 403

    # VIRUSTOTAL API
    api_key = VT_API_KEY
    if not api_key: return jsonify({"error": "Server Configuration Error"}), 500

    try:
        final_dest, redirect_chain = trace_redirects(target_url)
        
        # Encoding URL untuk VT
        url_id_api = base64.urlsafe_b64encode(target_url.encode()).decode().strip("=")
        headers = {"x-apikey": api_key}
        
        try:
            vt_response = requests.get(f"{VT_URL}/{url_id_api}", headers=headers, timeout=10)
        except:
            return jsonify({"error": "Koneksi ke VirusTotal Gagal"}), 503

        if vt_response.status_code == 404:
            requests.post(VT_URL, data={"url": target_url}, headers=headers, timeout=10)
            return jsonify({"status": "pending", "message": "Analyzing...", "redirects": redirect_chain})
            
        if vt_response.status_code >= 400:
            return jsonify({"error": f"API Error: {vt_response.status_code}"}), vt_response.status_code

        # Parsing Data Response
        data = vt_response.json().get('data', {}).get('attributes', {})
        stats = data.get('last_analysis_stats', {})
        results = data.get('last_analysis_results', {})

        total = sum(stats.values())
        malicious = stats.get('malicious', 0)
        suspicious = stats.get('suspicious', 0)
        harmless = stats.get('harmless', 0)
        undetected = stats.get('undetected', 0)
        
        trust_score = 100 - (malicious * 20) - (suspicious * 10) if total > 0 else 0
        if trust_score < 0: trust_score = 0

        # Whois Lookup
        whois_data = None
        try:
            domain = target_url.replace("https://", "").replace("http://", "").split('/')[0]
            w = whois.whois(domain)
            date = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
            whois_data = {
                "age_days": (datetime.now() - date.replace(tzinfo=None)).days if date else "Unknown",
                "created_date": date.strftime('%Y-%m-%d') if date else "N/A",
                "registrar": str(w.registrar)
            }
        except: pass

        return jsonify({
            "url": target_url,
            "final_dest": final_dest,
            "redirects": redirect_chain,
            "malicious": malicious,
            "harmless": harmless,
            "suspicious": suspicious,
            "undetected": undetected,
            "total_scans": total,
            "reputation": trust_score,
            # --- FIX: Mengirim SHA256 agar Frontend tidak N/A ---
            "sha256": data.get("last_http_response_content_sha256"), 
            # ----------------------------------------------------
            "whois": whois_data,
            "details": [{"engine_name": k, "category": v.get('category'), "result": v.get('result')} for k, v in results.items()]
        })

    except Exception as e:
        print(f"[ERROR SYSTEM] {e}") 
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    port = int(os.getenv("PORT", 5000))
    print(f"🚀 Running in {'DEBUG' if debug_mode else 'PRODUCTION'} mode on port {port}")
    app.run(debug=debug_mode, port=port)