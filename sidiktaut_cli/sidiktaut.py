#!/usr/bin/env python3
import os
import sys
import base64
import requests
import time
import argparse
import re
from dotenv import load_dotenv
from colorama import Fore, Style, init

init(autoreset=True)

# Agar .env bisa dipanggil dari mana aja
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, '.env')
load_dotenv(env_path)

API_KEY = os.getenv('VT_API_KEY')
BASE_URL = "https://www.virustotal.com/api/v3/urls/"
SCAN_URL = "https://www.virustotal.com/api/v3/urls"

HEADERS_UA = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def print_banner():
    banner = r"""
      _____ _    _ _ _   _______           _   
     / ____(_)  | (_) | |__   __|         | |  
    | (___  _ __| |_| | __ | | __ _ _   _| |_ _
     \___ \| |/ _` | | |/ / | |/ _` | | | | __|
     ____) | | (_| | |   <  | | (_| | |_| | |_ 
    |_____/|_|\__,_|_|_|\_\ |_|\__,_|\__,_|\__|
    """
    print(Fore.CYAN + banner)
    print(Fore.BLUE + "    Sidiktaut CLI v.0.4 (Full Report)")
    print(Fore.WHITE + "    Created by SidikTaut Team" + Style.RESET_ALL + "\n")

def is_valid_url(url):
    if len(url) > 2000: return False
    regex = r"^(http:\/\/|https:\/\/)?([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5})(:[0-9]{1,5})?(\/.*)?$"
    return re.match(regex, url, re.IGNORECASE) is not None

def get_url_id(url):
    try:
        return base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    except Exception as e:
        print(f"{Fore.RED}[!] Gagal encode URL: {e}")
        sys.exit(1)

def save_to_file(filename, content):
    try:
        safe_filename = os.path.basename(filename)
        target_path = os.path.join(os.getcwd(), safe_filename)

        if not safe_filename: return
        with open(target_path, "a", encoding="utf-8") as f:
            f.write(content + "\n" + "="*60 + "\n")
        print(f"{Fore.GREEN}[+] Log tersimpan di: {Fore.WHITE}{target_path}")
    except Exception as e:
        print(f"{Fore.RED}[!] Gagal menyimpan file: {e}")

def trace_redirects(url):
    print(f"{Fore.BLUE}[*] Mengecek jalur redirect...")
    hops = []
    current_url = url
    
    try:
        if not current_url.startswith(('http://', 'https://')):
            test_url = 'http://' + current_url
        else:
            test_url = current_url

        response = requests.head(test_url, allow_redirects=True, headers=HEADERS_UA, timeout=10)
        
        if response.history:
            for resp in response.history:
                hops.append(resp.url)
            final_url = response.url
            return final_url, hops
        else:
            return current_url, []
            
    except requests.exceptions.Timeout:
        print(f"{Fore.RED}[!] Koneksi timeout saat tracing redirect.")
        return url, []
    except Exception as e:
        print(f"{Fore.YELLOW}[!] Gagal trace redirect (Lanjut scan URL asli): {e}")
        return url, []

def print_detailed_report(results):
    print(f"\n{Fore.MAGENTA}[*] DETAIL VENDOR:")
    print(f"{Fore.WHITE}    {'VENDOR':<25} | {'STATUS':<15} | {'CATEGORY'}")
    print(f"{Fore.WHITE}    " + "-"*65)
    count = 0
    for vendor, data in results.items():
        cat = data.get('category'); res = data.get('result')
        if cat in ['malicious', 'suspicious'] or res in ['malicious', 'suspicious']:
            color = Fore.RED if cat == 'malicious' else Fore.YELLOW
            print(f"    {color}{vendor:<25} | {cat:<15} | {res}")
            count += 1
    if count == 0: print(f"    {Fore.GREEN} Tidak ada deteksi spesifik.")

def submit_new_scan(target_url, headers, is_detailed, output_file=None, is_interactive=True):
    print(f"\n{Fore.YELLOW}[*] URL baru (belum ada di DataBase). Requesting scan...")
    payload = {"url": target_url}
    try:
        response = requests.post(SCAN_URL, headers=headers, data=payload, timeout=20)
        if response.status_code == 200:
            print(f"{Fore.GREEN}[+] Scan dimulai. Tunggu 15-30 detik...")
            while True:
                print(f"\n{Fore.CYAN}[MENU MENUNGGU]")
                print(f"1. {Fore.YELLOW}-r {Fore.CYAN} : Refresh/Cek Ulang")
                
                if is_interactive:
                    print(f"2. {Fore.MAGENTA}new{Fore.CYAN} : Cek Link Lain")
                    print(f"3. {Fore.RED}exit{Fore.CYAN}: Keluar Program")
                else:
                    print(f"2. {Fore.RED}exit{Fore.CYAN}: Keluar Program")
                
                p = input(f"{Fore.GREEN}[?] Perintah: {Fore.WHITE}").strip().lower()
                
                if p == '-r': 
                    scan_url(target_url, is_detailed, False, output_file, is_interactive=is_interactive)
                    break 
                elif p == 'new' and is_interactive: 
                    print(f"{Fore.BLUE}[*] Kembali ke menu utama...")
                    return
                elif p == 'exit': 
                    sys.exit()
        else:
            print(f"{Fore.RED}[!] Gagal submit: {response.status_code}")
    except Exception as e:
        print(f"{Fore.RED}[!] Error submit: {e}")

def scan_url(target_url, is_detailed=False, allow_submit=True, output_file=None, is_interactive=True):
    if not API_KEY:
        print(f"{Fore.RED}API KEY hilang! Coba cek file .env.")
        sys.exit(1)

    real_target = target_url
    redirect_info = ""
    redirect_hops = [] 
    
    if allow_submit: 
        final_url, hops = trace_redirects(target_url)
        redirect_hops = hops 
        if hops:
            print(f"{Fore.YELLOW}[!] DETEKSI REDIRECT!")
            print(f"    {Fore.WHITE}Original : {target_url}")
            for i, hop in enumerate(hops):
                print(f"    {Fore.WHITE}Step {i+1}   : {hop}")
            print(f"    {Fore.GREEN}Final Dest: {final_url}")
            real_target = final_url 
            redirect_info = f"Redirected from: {target_url} -> {final_url}\n"
            print(f"{Fore.BLUE}[*] Mengganti target scan ke URL Tujuan Akhir...")
        else:
            print(f"{Fore.GREEN}[OK] Tidak ada redirect. Ini URL Langsung.")

    print(f"{Fore.BLUE}[*] Menganalisis: {Fore.WHITE}{real_target}")
    
    url_id = get_url_id(real_target)
    headers = {"x-apikey": API_KEY, "accept": "application/json"}
    
    try:
        response = requests.get(f"{BASE_URL}{url_id}", headers=headers, timeout=20)

        if response.status_code == 200:
            data = response.json(); attr = data['data']['attributes']
            stats = attr['last_analysis_stats']
            
            print(f"\n{Fore.GREEN}[+] HASIL ANALISIS DITEMUKAN!")
            print(f"    {Fore.WHITE}Reputasi     : {attr.get('reputation', 0)}")
            print(f"    {Fore.RED}Malicious    : {stats['malicious']}")
            print(f"    {Fore.GREEN}Harmless     : {stats['harmless']}")
            print(f"    {Fore.WHITE}--------------------------------")

            # Fitur Laporan
            report = []
            report.append("="*60)
            report.append(f"SIDIKTAUT FORENSIC REPORT")
            report.append("="*60)
            report.append(f"Scan Date     : {time.ctime()}")
            report.append(f"Scan ID       : {data['data']['id']}")  # [RESTORED]
            report.append(f"Input URL     : {target_url}")           # [RESTORED]
            report.append(f"Final URL     : {real_target}")
            
            if redirect_hops:
                report.append("-" * 30)
                report.append("[REDIRECT TRACE]")
                for i, hop in enumerate(redirect_hops):
                    report.append(f"Step {i+1} -> {hop}")
                report.append(f"Final  -> {real_target}")

            # Detail web/data tentang web
            report.append("-" * 30)
            report.append("[WEBSITE METADATA]")
            report.append(f"Page Title    : {attr.get('title', 'N/A')}")
            
            categories = attr.get('categories', {})
            cat_str = ", ".join([f"{k}: {v}" for k,v in categories.items()])
            report.append(f"Categories    : {cat_str if cat_str else 'Uncategorized'}")
            
            report.append(f"Tags          : {', '.join(attr.get('tags', []))}")
            report.append(f"HTTP Response : {attr.get('last_http_response_code', 'Unknown')}")

            report.append("-" * 30)
            report.append("[THREAT ANALYSIS]")
            report.append(f"Reputation Score : {attr.get('reputation', 0)}")
            report.append(f"Malicious        : {stats['malicious']}")
            report.append(f"Suspicious       : {stats['suspicious']}") 
            report.append(f"Harmless (Safe)  : {stats['harmless']}")

            if is_detailed:
                res = attr.get('last_analysis_results', {})
                print_detailed_report(res)
                
                report.append("-" * 30)
                report.append("[DETAILED VENDOR DETECTION]")
                found_threat = False
                for v, r in res.items():
                    if r.get('category') in ['malicious', 'suspicious'] or r.get('result') in ['malicious', 'suspicious']:
                        report.append(f"(!) {v:<20} : {r['result']} ({r.get('category')})")
                        found_threat = True
                if not found_threat:
                    report.append("No specific threat details found by vendors.")

            report.append("="*60)
            if stats['malicious'] > 0:
                print(f"\n{Fore.RED}[!!!] KESIMPULAN: BERBAHAYA!")
                report.append("CONCLUSION: DANGEROUS / MALICIOUS")
            elif stats['suspicious'] > 0:
                print(f"\n{Fore.YELLOW}[!] KESIMPULAN: MENCURIGAKAN.")
                report.append("CONCLUSION: SUSPICIOUS")
            else:
                print(f"\n{Fore.GREEN}[OK] KESIMPULAN: AMAN.")
                report.append("CONCLUSION: CLEAN / SAFE")
            report.append("="*60 + "\n")
            
            final_report_content = "\n".join(report)
            
            if output_file: save_to_file(output_file, final_report_content)

            while True:
                print(f"\n{Fore.CYAN}[MENU SELESAI]")
                print(f"1. {Fore.YELLOW}-r {Fore.CYAN} : Scan Ulang Link Ini")
                
                if is_interactive:
                    print(f"2. {Fore.MAGENTA}new{Fore.CYAN} : Cek Link Lain")
                    print(f"3. {Fore.RED}exit{Fore.CYAN}: Keluar Program")
                else:
                    print(f"2. {Fore.RED}exit{Fore.CYAN}: Keluar Program")

                p = input(f"{Fore.GREEN}[?] Perintah: {Fore.WHITE}").strip().lower()

                if p == '-r':
                    scan_url(target_url, is_detailed, allow_submit, output_file, is_interactive)
                    return 
                elif p == 'new' and is_interactive:
                    print(f"{Fore.BLUE}[*] Kembali ke menu utama...")
                    return 
                elif p == 'exit':
                    sys.exit()
                else:
                    print(f"{Fore.RED}[!] Perintah tidak dikenal.")

        elif response.status_code == 404:
            if allow_submit: 
                submit_new_scan(real_target, headers, is_detailed, output_file, is_interactive)
            else: 
                print(f"{Fore.YELLOW}[!] Belum siap. Coba -r lagi.")
        
        elif response.status_code == 401: print(f"{Fore.RED}[!] API Key salah.")
        else: print(f"{Fore.RED}[!] Server Error: {response.status_code}")

    except requests.exceptions.Timeout:
        print(f"{Fore.RED}[!] Koneksi Time Out.")
    except Exception as e:
        print(f"{Fore.RED}[!] Error: {e}")

def main():
    parser = argparse.ArgumentParser(
        description=f"{Fore.CYAN}Sidiktaut: Link Analyzer{Style.RESET_ALL}",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("-u", "--url", help="Target URL")
    parser.add_argument("-d", "--detail", action="store_true", help="Mode Detail")
    parser.add_argument("-o", "--output", help="Simpan Log")
    args = parser.parse_args()

    print_banner()
    
    if args.url:
        if is_valid_url(args.url):
            scan_url(args.url, args.detail, True, args.output, is_interactive=False)
        else:
            print(f"{Fore.RED}[X] URL tidak valid.")
        return 

    while True:
        try:
            target = input(f"{Fore.GREEN}[?] Masukkan URL (atau 'exit'): {Fore.WHITE}").strip()
            
            if target.lower() in ['exit', 'quit']:
                print(f"{Fore.RED}[!] Sampai Jumpaa!")
                break
            
            if not target: continue

            if is_valid_url(target):
                scan_url(target, args.detail, True, args.output, is_interactive=True)
            else:
                print(f"{Fore.RED}[X] URL tidak valid.")
            
            print("\n" + Fore.BLUE + "-"*30 + "\n") 
            
        except KeyboardInterrupt:
            print("\n[!] Force Exit.")
            sys.exit()

if __name__ == "__main__":
    main()