import { useState, useEffect } from 'react';
import { LayoutDashboard, Globe, Terminal, Users, Menu, X, Sun, Moon, Shield, Copy, MapPin, Zap, Wifi, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Scanner from './components/Scanner';
import { BrowserView, CliView, TeamView } from './components/StaticViews';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  
  // [TAMBAHAN] State untuk animasi Navbar Slide Up
  const [hideMobileNav, setHideMobileNav] = useState(false);

  // --- DARK MODE LOGIC ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [ipData, setIpData] = useState<any>(null);
  const [ipCopied, setIpCopied] = useState(false);

  // --- APPLY DARK MODE ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // --- SMART IP FETCH (Anti-Limit) ---
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
        // Fallback ke ipwho.is jika limit
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard},
    { id: 'browser', label: 'Extension', icon: Globe },
    { id: 'cli', label: 'CLI Tool', icon: Terminal },
    { id: 'team', label: 'Tim Kami', icon: Users },
  ];

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo(0,0);
  };

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.15, ease: "easeOut" }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-300 ease-in-out">
      
      {/* MOBILE HEADER - [UBAH] Jadi motion.div agar bisa animasi tarik ke atas */}
      <motion.div 
         animate={{ y: hideMobileNav ? "-100%" : "0%" }}
         transition={{ duration: 0.3, ease: "easeInOut" }}
         className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-4 z-50"
      >
         <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col justify-center">
                <span className="font-bold text-lg leading-none">SidikTaut</span>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Link Analyzer</span>
            </div>
         </div>
         <button onClick={() => setMobileMenuOpen(true)} className="p-2"><Menu size={24}/></button>
      </motion.div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <>
        <div className="fixed inset-0 z-[60] bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} 
            className="fixed top-0 right-0 z-[70] w-64 h-full bg-white dark:bg-[#121214] border-l border-gray-100 dark:border-gray-800 flex flex-col md:hidden"
        >
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
                <span className="font-bold text-lg text-gray-900 dark:text-white">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400"><X size={20}/></button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map(item => (
                <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${activeView === item.id ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    <item.icon size={18} /> {item.label}
                </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0A0A0C]">
                <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                {darkMode ? <Sun size={18} className="text-amber-500"/> : <Moon size={18} className="text-blue-500"/>} {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>
        </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* SIDEBAR DESKTOP */}
      <aside className={`hidden md:flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121214] transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
         <div className={`h-20 flex items-center border-b border-gray-50 dark:border-gray-800/50 ${sidebarCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className="shrink-0"><img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" /></div>
                 <div className="flex flex-col justify-center">
                    <span className="font-black text-xl tracking-tight whitespace-nowrap text-gray-900 dark:text-white leading-none">SidikTaut</span>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mt-0.5">Link Analyzer</span>
                 </div>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl"><Menu size={24} /></button>
         </div>
         <nav className="flex-1 p-4 space-y-1">
            {menuItems.map(item => (
               <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeView === item.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'} ${sidebarCollapsed ? 'justify-center' : ''}`}>
                 <item.icon size={22} />{!sidebarCollapsed && <span>{item.label}</span>}
               </button>
            ))}
         </nav>
         <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => setDarkMode(!darkMode)} className={`w-full flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
               {darkMode ? <Sun size={20} className="shrink-0"/> : <Moon size={20} className="shrink-0"/>} 
               {!sidebarCollapsed && <span className="min-w-[80px] text-left">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 px-4 md:px-8 pb-12 relative z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 pointer-events-none -z-10" />
         <div className="max-w-6xl mx-auto min-h-[90vh] flex flex-col relative z-10">
            <div className="flex-1">
               <AnimatePresence mode="wait">
                   {activeView === 'dashboard' && (
                     <motion.div key="dashboard" {...pageTransition} className="space-y-8">
                       {/* [TAMBAHAN] Kirim props 'setHideMobileNav' ke Scanner */}
                       <Scanner onModalChange={setHideMobileNav} />
                       
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
                     </motion.div>
                   )}
                   {activeView === 'browser' && <motion.div key="browser" {...pageTransition}><BrowserView /></motion.div>}
                   {activeView === 'cli' && <motion.div key="cli" {...pageTransition}><CliView /></motion.div>}
                   {activeView === 'team' && <motion.div key="team" {...pageTransition}><TeamView /></motion.div>}
               </AnimatePresence>
            </div>
         </div>
      </main>
    </div>
  );
}