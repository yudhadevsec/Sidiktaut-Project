// FILE: src/types/types.ts

export interface ScanResponse {
  status?: string;
  url?: string;         // URL Akhir (Final Destination)
  original_url?: string; // Tambahan: URL Awal yang diinput user
  
  // Tambahan: Data Jalur Redirect (Trace)
  redirects?: Array<{
    status: number | string;
    url: string;
  }>;

  malicious: number;
  harmless: number;
  suspicious: number;
  undetected: number;
  total_scans: number;
  reputation: number;
  sha256?: string;
  
  error?: string;
  
  // Info Whois
  // Update: age_days bisa string "Unknown" jika gagal parsing
  whois?: {
    age_days: number | string; 
    created_date: string;
    registrar: string;
  } | null;

  // Detail tiap engine antivirus
  details?: Array<{
    engine_name: string;
    category: string;
    result: string;
  }>;
}

export interface NavItem {
  id: string;
  label: string;
  icon: any; 
  group?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
}