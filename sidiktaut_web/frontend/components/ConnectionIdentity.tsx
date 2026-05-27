import { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

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
    if (ipData?.ip && ipData.ip !== 'Unavailable') {
      navigator.clipboard.writeText(ipData.ip);
      setIpCopied(true);
      setTimeout(() => setIpCopied(false), 2000);
    }
  };

  return (
    <div>
      <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-4 px-2">Identitas Koneksi Anda</h3>
      <div className="bg-transparent flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="flex-1 bg-white md:bg-gray-50/50 dark:bg-[#121214] md:dark:bg-[#0a0a0a] rounded-[24px] p-6 flex flex-col justify-center relative overflow-hidden group">

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest z-10">Public IP</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight break-all leading-tight z-10">{ipData?.ip || "Loading..."}</h2>
            <button onClick={copyIp} className="p-3 bg-gray-50 md:bg-white dark:bg-white/5 md:dark:bg-[#121214] rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white shrink-0 transition-all active:scale-95 z-10">
              {ipCopied ? <Check size={20} className="text-gray-900 dark:text-white" /> : <Copy size={20} />}
            </button>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="p-6 bg-white md:bg-gray-50/50 dark:bg-[#121214] md:dark:bg-[#0a0a0a] rounded-[24px] flex flex-col justify-center hover:bg-gray-50 transition-colors">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">ISP</div>
            <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{ipData?.org || "Mendeteksi..."}</p>
          </div>
          <div className="p-6 bg-white md:bg-gray-50/50 dark:bg-[#121214] md:dark:bg-[#0a0a0a] rounded-[24px] flex flex-col justify-center hover:bg-gray-50 transition-colors">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Lokasi</div>
            <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{ipData?.city ? `${ipData.city}, ${ipData.country_code}` : "Mencari..."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
