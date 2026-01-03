import { useState, useEffect } from 'react';
import { LayoutDashboard, Globe, Terminal, Users, Menu, X, Sun, Moon, Shield, Copy, MapPin, Zap, Wifi, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Scanner from './components/Scanner';
import { BrowserView, CliView, TeamView } from './components/StaticViews';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State khusus mobile menu
  const [activeView, setActiveView] = useState('dashboard');
  
  // --- DARK MODE LOGIC (Tetap sama) ---
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

  // Fetch IP (Tetap sama)
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error("Limit");
        const data = await res.json();
        setIpData(data);
      } catch (e) {
        setIpData({ ip: "Unavailable", city: "-", country_code: "-", org: "Connection Limit" });
      }
    };
    fetchIp();
  }, []);

  const handleCopyIp = () => {
     if(ipData?.ip) {
        navigator.clipboard.writeText(ipData.ip);
        setIpCopied(true);
        setTimeout(() => setIpCopied(false), 2000);
     }
  }

  const navItems = [
    { id: 'dashboard', label: 'Scanner', icon: Shield },
    { id: 'browser', label: 'Extension', icon: Globe },
    { id: 'cli', label: 'CLI Tool', icon: Terminal },
    { id: 'team', label: 'Tim Kami', icon: Users },
  ];

  // Animation variants
  const pageTransition = {
     initial: { opacity: 0, y: 10 },
     animate: { opacity: 1, y: 0 },
     exit: { opacity: 0, y: -10 },
     transition: { duration: 0.2 }
  };

  return (
    // PERBAIKAN: Gunakan min-h-screen-ios dan text-rendering optimizeLegibility
    <div className="flex min-h-screen-ios bg-[#F2F2F7] dark:bg-black transition-colors duration-300 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* --- MOBILE OVERLAY (Backdrop) --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" // High Z-index
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
            fixed lg:sticky top-0 h-screen-ios z-50 
            bg-white/80 dark:bg-[#1C1C1E]/80 
            backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 
            border-r border-gray-200 dark:border-white/10
            transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
            ${sidebarCollapsed ? 'w-20' : 'w-72'}
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-safe pb-safe /* PERBAIKAN: Padding aman untuk notch */
        `}
      >
        <div className="h-full flex flex-col justify-between p-4 md:p-6 overflow-y-auto no-scrollbar">
            {/* Logo Area */}
            <div>
                <div className={`flex items-center gap-3 mb-10 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                        <Shield className="text-white" size={20} />
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">SidikTaut</h1>
                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Cyber Intelligence</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id);
                                setMobileMenuOpen(false); // Tutup menu pas klik di mobile
                            }}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group
                                ${activeView === item.id 
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                }
                                ${sidebarCollapsed ? 'justify-center px-0' : ''}
                            `}
                        >
                            <item.icon size={22} className={activeView === item.id ? 'animate-pulse' : ''} />
                            {!sidebarCollapsed && <span className="font-medium text-[15px]">{item.label}</span>}
                            
                            {/* Tooltip for Collapsed Mode */}
                            {sidebarCollapsed && (
                                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4">
                 {/* Dark Mode Toggle */}
                 <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                 >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    {!sidebarCollapsed && <span className="font-medium text-sm">Mode {darkMode ? 'Terang' : 'Gelap'}</span>}
                 </button>

                 {/* Collapse Toggle (Desktop Only) */}
                 <button 
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:flex w-full items-center justify-center p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                 >
                    <div className="w-1 h-8 rounded-full bg-gray-200 dark:bg-white/10 group-hover:bg-blue-500 transition-colors" />
                 </button>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative w-full h-screen-ios overflow-y-auto overflow-x-hidden pt-safe pb-safe">
         
         {/* Navbar Mobile (Sticky Top) */}
         <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between pt-safe">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <Shield className="text-white" size={16} />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">SidikTaut</span>
            </div>
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600 dark:text-white">
                <Menu size={24} />
            </button>
         </div>

         {/* Content Wrapper */}
         <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12 pb-24 md:pb-12">
            
            {/* Header Section (Dynamic) */}
            <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                   <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                      {activeView === 'dashboard' && 'Security Scanner'}
                      {activeView === 'browser' && 'Browser Protection'}
                      {activeView === 'cli' && 'Terminal Intelligence'}
                      {activeView === 'team' && 'Core Team'}
                   </h2>
                   <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                      {activeView === 'dashboard' && 'Analisis link berbahaya menggunakan AI & Threat Intelligence.'}
                      {activeView === 'browser' && 'Ekstensi browser untuk keamanan realtime saat berselancar.'}
                      {activeView === 'cli' && 'Tools command line untuk SysAdmin dan Developer.'}
                      {activeView === 'team' && 'Para pengembang dibalik Project SidikTaut.'}
                   </p>
                </div>
            </header>

            {/* Dynamic View Content */}
            <div className="min-h-[60vh]">
               <AnimatePresence mode="wait">
                   {activeView === 'dashboard' && (
                     <motion.div key="scanner" {...pageTransition}>
                       <Scanner />
                       
                       {/* IP Address Widget (Dashboard Only) */}
                       <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/5">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Device Intelligence</h4>
                          <div className="glass-panel rounded-[32px] p-1 shadow-sm"> {/* PERBAIKAN: Pakai class glass-panel */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                                  {/* IP Card */}
                                  <div className="relative group p-5 bg-blue-50 dark:bg-blue-900/10 rounded-[28px] border border-blue-100 dark:border-blue-900/20 overflow-hidden">
                                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2"><Wifi size={18}/> <span className="text-xs font-black uppercase tracking-wider">Public IP</span></div>
                                      <div className="flex items-center gap-3">
                                        <p className="font-mono font-bold text-xl md:text-2xl text-gray-900 dark:text-white tracking-tight">
                                            {ipData?.ip || "Loading..."}
                                        </p>
                                        <button onClick={handleCopyIp} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                            {ipCopied ? <Check size={16} className="text-green-500"/> : <Copy size={16} className="text-gray-400"/>}
                                        </button>
                                      </div>
                                  </div>
                                  <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                                      <div className="flex items-center gap-2 text-gray-500 mb-2"><Zap size={18}/> <span className="text-xs font-black uppercase tracking-wider">ISP / Organization</span></div>
                                      <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                                        {ipData?.org || "Mendeteksi..."}
                                      </p>
                                  </div>
                                  <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-900/20">
                                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2"><MapPin size={18}/> <span className="text-xs font-black uppercase tracking-wider">Lokasi</span></div>
                                      <p className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                                        {ipData?.city ? `${ipData.city}, ${ipData.country_code}` : "Mencari..."}
                                      </p>
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