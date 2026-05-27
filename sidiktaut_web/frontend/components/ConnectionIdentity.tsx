import { useState, useEffect } from 'react';
import { Globe, MapPin, Zap, Wifi, Check, Copy } from 'lucide-react';

interface IpData {
  ip: string;
  city: string;
  country_code: string;
  org: string;
}

export default function ConnectionIdentity() {
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [ipCopied, setIpCopied] = useState(false);

  useEffect(() => {
    const fetchIpSmart = async () => {
      const cached = sessionStorage.getItem('sidiktaut_ip_cache');
      if (cached) {
        setIpData(JSON.parse(cached));
        return;
      }

      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error("Limit");
        const data = await res.json();
        const cleanData = {
            ip: data.ip, city: data.city, country_code: data.country_code, org: data.org
        };
        setIpData(cleanData);
        sessionStorage.setItem('sidiktaut_ip_cache', JSON.stringify(cleanData));
      } catch (e) {
        try {
            const resBackup = await fetch('https://ipwho.is/');
            if (!resBackup.ok) throw new Error("Backup Limit");
            const dataBackup = await resBackup.json();
            const cleanDataBackup = {
                ip: dataBackup.ip, city: dataBackup.city, country_code: dataBackup.country_code, 
                org: dataBackup.connection?.isp || dataBackup.isp
            };
            setIpData(cleanDataBackup);
            sessionStorage.setItem('sidiktaut_ip_cache', JSON.stringify(cleanDataBackup));
        } catch (finalError) {
            setIpData({ ip: "Unavailable", city: "-", country_code: "-", org: "Connection Offline" });
        }
      }
    };
    fetchIpSmart();
  }, []);

  const copyIp = () => {
    if(ipData?.ip && ipData.ip !== 'Unavailable') {
        navigator.clipboard.writeText(ipData.ip);
        setIpCopied(true);
        setTimeout(() => setIpCopied(false), 2000);
    }
  };

  return (
    <div>
      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider mb-4 px-1"><Wifi size={18} className="text-blue-500"/> Identitas Koneksi Anda</h3>
      <div className="bg-white dark:bg-[#121214] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-gray-800/50 flex flex-col justify-center">
             <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Globe size={14}/> Public IP</span>
                {ipData?.ip !== 'Unavailable' && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400">ONLINE</span>
                  </div>
                )}
             </div>
             <div className="flex items-center justify-between gap-2">
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight break-all">{ipData?.ip || "Loading..."}</h2>
                <button onClick={copyIp} className="p-3 bg-white dark:bg-black/20 rounded-xl text-gray-400 hover:text-blue-600 border border-gray-50 dark:border-gray-800 shrink-0">
                        {ipCopied ? <Check size={20} className="text-green-500"/> : <Copy size={20}/>}
                </button>
             </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2"><Zap size={18}/> <span className="text-xs font-black uppercase tracking-wider">ISP</span></div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{ipData?.org || "Mendeteksi..."}</p>
              </div>
              <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-900/20">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2"><MapPin size={18}/> <span className="text-xs font-black uppercase tracking-wider">Lokasi</span></div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{ipData?.city ? `${ipData.city}, ${ipData.country_code}` : "Mencari..."}</p>
              </div>
          </div>
      </div>
    </div>
  );
}
