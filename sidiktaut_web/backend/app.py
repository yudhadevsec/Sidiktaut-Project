from flask import Flask, request, jsonify
from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": "*"}})
import requests
import whois
from datetime import datetime
import os
from dotenv import load_dotenv
import base64
import hashlib
import re
from urllib.parse import urljoin, urlparse

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

VT_API_KEY = os.getenv("VT_API_KEY") 
VT_URL = "https://www.virustotal.com/api/v3/urls"

# User-Agent Global (Penting untuk menembus proteksi bot sederhana)
HEADERS_UA = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.google.com/'
}

# --- HELPER FUNCTIONS ---
def is_safe_url(url):
    if len(url) > 2000: return False
    pattern = r"^[a-zA-Z0-9-._~:/?#[\]@!$&'*+,;=%]+$"
    if not re.match(pattern, url): return False
    return True

def resolve_protocol(raw_url):
    # Bersihkan spasi
    raw_url = raw_url.strip()
    if raw_url.startswith("http://") or raw_url.startswith("https://"):
        return raw_url
    try:
        # Coba tebak HTTPS dulu dengan User-Agent (PENTING!)
        test_url = f"https://{raw_url}"
        response = requests.head(test_url, timeout=5, allow_redirects=True, headers=HEADERS_UA)
        if response.status_code < 400: return test_url
    except:
        pass
    
    # Fallback ke HTTP jika HTTPS gagal total
    return f"http://{raw_url}"

def trace_redirects(url):
    """
    TRACE LEVEL: SMART FILTER
    """
    session = requests.Session()
    session.headers.update(HEADERS_UA)

    IGNORE_DOMAINS = [
        "google.com", "facebook.com", "twitter.com", "instagram.com", "tiktok.com", 
        "googleapis.com", "gstatic.com", "googletagmanager.com", "cdnjs.cloudflare.com", 
        "code.jquery.com", "doubleclick.net", "google-analytics.com", "onesignal.com"
    ]
    IGNORE_EXTENSIONS = ('.js', '.css', '.json', '.xml', '.png', '.jpg', '.svg', '.woff', '.woff2', '.ttf', '.ico')

    chain = []
    current_url = url
    
    for _ in range(8):
        try:
            response = session.get(current_url, timeout=10, allow_redirects=True)
            
            if response.history:
                for resp in response.history:
                    chain.append({"status": resp.status_code, "url": resp.url})
            
            chain.append({"status": response.status_code, "url": response.url})
            
            if response.status_code >= 400: break

            content_type = response.headers.get('Content-Type', '').lower()
            if any(t in content_type for t in ['javascript', 'json', 'css', 'image', 'font']):
                if len(chain) > 1: chain.pop()
                break
            if 'text/html' not in content_type: break

            content = response.text
            lower_content = content.lower()
            next_url = None

            meta = re.findall(r'content=["\']\d+;\s*url=([^"\']+)["\']', lower_content)
            js_loc = re.findall(r'location(?:\.href)?\s*=\s*["\'](http[^"\']+)["\']', content)
            
            candidates = js_loc + meta
            if not candidates:
                 raw_links = re.findall(r'<a[^>]+href=["\'](http[^"\']+)["\']', content)
                 candidates.extend(raw_links[:3])

            found_next = False
            for link in candidates:
                link = link.strip().replace('\\/', '/')
                link_lower = link.lower()
                clean_path = link_lower.split('?')[0].split('#')[0]

                if clean_path.endswith(IGNORE_EXTENSIONS): continue
                if any(ignored in link_lower for ignored in IGNORE_DOMAINS): continue
                if link == current_url or link == response.url: continue

                next_url = link
                found_next = True
                
                if len(url.split('/')) > 2 and len(link.split('/')) > 2:
                    if url.split('/')[2] not in link: break 
            
            if not found_next: break

            if next_url:
                if not next_url.startswith('http'): next_url = urljoin(response.url, next_url)
                if next_url == current_url: break
                current_url = next_url
                continue 
            break
        except:
            break

    final_url = chain[-1]['url'] if chain else url
    return final_url, chain

@app.route('/scan', methods=['POST'])
def scan_url():
    data = request.json
    raw_input = data.get('url')

    if not raw_input: return jsonify({"error": "URL is required"}), 400
    if not is_safe_url(raw_input): return jsonify({"error": "Invalid URL format!"}), 400
    api_key = VT_API_KEY
    if not api_key: return jsonify({"error": "Server Configuration Error"}), 500

    try:
        # 1. Resolve Protocol (Fix: Sekarang pakai Header, jadi klikbca/game3rb akan terdeteksi HTTPS)
        initial_url = resolve_protocol(raw_input)
        
        # 2. Trace Redirect (Hanya ambil datanya)
        final_dest, redirect_chain = trace_redirects(initial_url)
        
        # 3. KUNCI SCAN ke Initial URL
        target_url = initial_url 
        
        url_id_api = base64.urlsafe_b64encode(target_url.encode()).decode().strip("=")
        real_sha256 = hashlib.sha256(target_url.encode()).hexdigest()

        headers = {"x-apikey": api_key}
        try:
            vt_response = requests.get(f"{VT_URL}/{url_id_api}", headers=headers, timeout=15)
        except:
            return jsonify({"error": "Koneksi server bermasalah"}), 503

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
            "url": target_url,          # URL yang dikembalikan sudah HTTPS (jika server support)
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)