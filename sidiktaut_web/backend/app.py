from flask import Flask, request, jsonify
from flask_cors import CORS
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

# 1. Matikan Warning SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load env variables
load_dotenv()

app = Flask(__name__)

# 2. HYBRID CORS: Biarkan '*' biar Vercel & Localhost bisa akses tanpa pusing
CORS(app, resources={r"/*": {"origins": "*"}})

VT_API_KEY = os.getenv("VT_API_KEY") 
VT_URL = "https://www.virustotal.com/api/v3/urls"

HEADERS_UA = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}

def is_safe_url(url):
    if len(url) > 2000: return False
    pattern = r"^[a-zA-Z0-9-._~:/?#[\]@!$&'*+,;=%]+$"
    if not re.match(pattern, url): return False
    return True

def resolve_protocol(raw_url):
    raw_url = raw_url.strip()
    if raw_url.startswith("http://") or raw_url.startswith("https://"):
        return raw_url
    try:
        test_url = f"https://{raw_url}"
        response = requests.get(test_url, timeout=5, headers=HEADERS_UA, verify=False, stream=True)
        if response: 
            response.close()
            return test_url
    except:
        pass
    return f"http://{raw_url}"

def trace_redirects(url):
    session = requests.Session()
    session.headers.update(HEADERS_UA)
    session.cookies.clear()

    chain = []
    current_url = url
    
    for _ in range(8):
        try:
            response = session.get(current_url, timeout=10, allow_redirects=False, verify=False)
            
            chain.append({"status": response.status_code, "url": current_url})
            
            next_url = None

            if 300 <= response.status_code < 400:
                next_url = response.headers.get('Location')
            
            else:
                content_type = response.headers.get('Content-Type', '').lower()
                if 'text/html' in content_type:
                    content = response.text
                    lower_content = content.lower()
                    
                    if "just a moment" in lower_content or "cloudflare" in lower_content:
                        chain.append({"status": 403, "url": "BLOCKED_BY_CLOUDFLARE"})
                        break

                    meta = re.findall(r'content=["\']\d+;\s*url=([^"\']+)["\']', lower_content)
                    js_loc = re.findall(r'(?:window\.|self\.|top\.)?location(?:\.href)?\s*=\s*["\'](http[^"\']+)["\']', content)
                    candidates = js_loc + meta
                    
                    if candidates:
                        for link in candidates:
                            link = link.strip().replace('\\/', '/')
                            if link != current_url:
                                next_url = link
                                break
            
            if next_url:
                if not next_url.startswith('http'): next_url = urljoin(current_url, next_url)
                if next_url == current_url: break
                current_url = next_url
                continue 
            
            break
        except Exception as e:
            # Error handling khusus PythonAnywhere Free Tier (Block outbound)
            if "ProxyError" in str(e) or "Connection refused" in str(e):
                print(f"[PA Free Tier Limitation] Gagal trace {current_url}")
            break

    if not chain: chain.append({"status": 200, "url": url})
    final_dest = chain[-1]['url']
    if final_dest == "BLOCKED_BY_CLOUDFLARE" and len(chain) > 1: final_dest = chain[-2]['url']
    return final_dest, chain

@app.route('/scan', methods=['POST'])
def scan_url():
    data = request.json
    raw_input = data.get('url')

    if not raw_input: return jsonify({"error": "URL is required"}), 400
    if not is_safe_url(raw_input): return jsonify({"error": "Invalid URL format!"}), 400
    api_key = VT_API_KEY
    if not api_key: return jsonify({"error": "Server Configuration Error"}), 500

    try:
        initial_url = resolve_protocol(raw_input)
        final_dest, redirect_chain = trace_redirects(initial_url)
        target_url = initial_url 
        
        url_id_api = base64.urlsafe_b64encode(target_url.encode()).decode().strip("=")
        real_sha256 = hashlib.sha256(target_url.encode()).hexdigest()

        headers = {"x-apikey": api_key}
        try:
            vt_response = requests.get(f"{VT_URL}/{url_id_api}", headers=headers, timeout=15)
        except:
            return jsonify({"error": "Koneksi ke VirusTotal Gagal (Cek Internet/Limit)"}), 503

        if vt_response.status_code == 404:
            requests.post(VT_URL, data={"url": target_url}, headers=headers, timeout=15)
            return jsonify({"status": "pending", "message": "Analyzing...", "redirects": redirect_chain})
            
        if vt_response.status_code >= 400:
            return jsonify({"error": f"API Error: {vt_response.status_code}"}), vt_response.status_code

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

        whois_data = None
        try:
            domain = target_url.replace("https://", "").replace("http://", "").split('/')[0]
            w = whois.whois(domain)
            date = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
            age = (datetime.now() - date.replace(tzinfo=None)).days if date else None
            whois_data = {
                "age_days": age if age else "Unknown",
                "created_date": date.strftime('%Y-%m-%d') if date else "N/A",
                "registrar": str(w.registrar)
            }
        except:
            pass

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
            "whois": whois_data,
            "sha256": real_sha256,
            "details": [{"engine_name": k, "category": v.get('category'), "result": v.get('result')} for k, v in results.items()]
        })

    except Exception as e:
        print(f"[ERROR] {e}") 
        return jsonify({"error": "Internal Server Error"}), 500

# ===============================================================
# 🚀 HYBRID LAUNCHER
# Bagian ini CUMA jalan kalau di Localhost.
# PythonAnywhere mengabaikan ini (karena dia pakai WSGI).
# ===============================================================
if __name__ == '__main__':
    # Baca variabel FLASK_DEBUG dari .env (Default: False biar aman)
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    
    # Baca port dari .env (Default: 5000)
    port = int(os.getenv("PORT", 5000))

    print(f"🚀 Running in {'DEBUG' if debug_mode else 'PRODUCTION'} mode on port {port}")
    app.run(debug=debug_mode, port=port)