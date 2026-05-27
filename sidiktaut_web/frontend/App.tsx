import { useState, useEffect, Suspense, lazy } from 'react';
import { LayoutDashboard, Globe, Terminal, Users, Menu, X, Sun, Moon, Loader2, Info } from 'lucide-react';
import Scanner from './components/Scanner';
import ConnectionIdentity from './components/ConnectionIdentity';

// LAZY LOADING KOMPONEN HALAMAN
const BrowserView = lazy(() => import('./components/StaticViews').then(m => ({ default: m.BrowserView })));
const CliView = lazy(() => import('./components/StaticViews').then(m => ({ default: m.CliView })));
const TeamView = lazy(() => import('./components/StaticViews').then(m => ({ default: m.TeamView })));
const AboutView = lazy(() => import('./components/StaticViews').then(m => ({ default: m.AboutView })));

export default function App() {
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [activeView, setActiveView] = useState('dashboard');

   // State untuk animasi Navbar Slide Up
   const [hideMobileNav, setHideMobileNav] = useState(false);

   // Logika DARK MODE
   const [darkMode, setDarkMode] = useState(() => {
      if (typeof window !== 'undefined') {
         const savedTheme = localStorage.getItem('theme');
         if (savedTheme) return savedTheme === 'dark';
         return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
   });

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

   const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'browser', label: 'Extension', icon: Globe },
      { id: 'cli', label: 'CLI Tool', icon: Terminal },
      { id: 'team', label: 'Tim Kami', icon: Users },
      { id: 'about', label: 'Tentang', icon: Info },
   ];

   const handleNavClick = (viewId: string) => {
      setActiveView(viewId);
      setMobileMenuOpen(false);
      window.scrollTo(0, 0);
   };

   return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">

         {/* MOBILE HEADER - PURE CSS ANIMATION (Tanpa Javascript) */}
         <div
            className={`md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#121214]/95 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-4 z-50 shadow-sm transition-transform duration-300 ${hideMobileNav ? '-translate-y-full' : 'translate-y-0'}`}
         >
            <div className="flex items-center gap-3">
               <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
               <div className="flex flex-col justify-center">
                  <span className="font-bold text-lg leading-none">SidikTaut</span>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Link Analyzer</span>
               </div>
            </div>
            <button onClick={() => setMobileMenuOpen(true)} className="p-2"><Menu size={24} /></button>
         </div>

         {/* MOBILE DRAWER - PURE CSS */}
         {/* OVERLAY BACKGROUND */}
         <div
            className={`fixed inset-0 z-[60] bg-black/60 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setMobileMenuOpen(false)}
         />

         {/* SIDEBAR PANEL */}
         <div
            className={`fixed top-0 right-0 z-[70] w-64 h-full bg-white dark:bg-[#121214] border-l border-gray-100 dark:border-gray-800 flex flex-col md:hidden shadow-2xl transition-transform duration-300 will-change-transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
         >
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
               <span className="font-bold text-lg text-gray-900 dark:text-white">Menu</span>
               <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 active:scale-90 transition-transform"><X size={20} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
               {menuItems.map(item => (
                  <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-bold transition-all active:scale-95 border-l-2 ${activeView === item.id ? 'bg-gray-100 text-gray-900 border-gray-900 dark:bg-white/10 dark:text-white dark:border-white' : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                     <item.icon size={18} /> {item.label}
                  </button>
               ))}
            </nav>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0A0A0C]">
               <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-sm text-sm font-bold bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white active:scale-95 transition-transform">
                  {darkMode ? <Sun size={18} className="text-gray-400" /> : <Moon size={18} className="text-gray-500" />} {darkMode ? 'Light Mode' : 'Dark Mode'}
               </button>
            </div>
         </div>

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
               <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-sm"><Menu size={24} /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
               {menuItems.map(item => (
                  <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors border-l-2 ${activeView === item.id ? 'bg-gray-100 text-gray-900 border-gray-900 dark:bg-white/10 dark:text-white dark:border-white' : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'} ${sidebarCollapsed ? 'justify-center border-l-0' : ''}`}>
                     <item.icon size={22} />{!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
               ))}
            </nav>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
               <button onClick={() => setDarkMode(!darkMode)} className={`w-full flex items-center gap-2 p-3 rounded-sm hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
                  {darkMode ? <Sun size={20} className="shrink-0 text-gray-400" /> : <Moon size={20} className="shrink-0" />}
                  {!sidebarCollapsed && <span className="min-w-[80px] text-left">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
               </button>
            </div>
         </aside>

         {/* MAIN CONTENT */}
         <main className="flex-1 overflow-y-auto pt-20 md:pt-8 px-4 md:px-8 pb-12 relative z-0">
            <div className="absolute inset-0 bg-transparent pointer-events-none -z-10" />
            <div className="max-w-5xl mx-auto min-h-[90vh] flex flex-col relative z-10">
               <div className="flex-1">
                  <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-500" size={32} /></div>}>
                     {activeView === 'dashboard' && (
                        <div className="space-y-6">
                           <Scanner onModalChange={setHideMobileNav} />
                           <ConnectionIdentity />
                        </div>
                     )}
                     {activeView === 'browser' && <BrowserView />}
                     {activeView === 'cli' && <CliView />}
                     {activeView === 'team' && <TeamView />}
                     {activeView === 'about' && <AboutView />}
                  </Suspense>
               </div>
               
               {/* Minimalist Footer */}
               <footer className="mt-12 mb-4 text-center">
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                     &copy; {new Date().getFullYear()} SidikTaut. Project Based Learning.
                  </p>
               </footer>
            </div>
         </main>
      </div>
   );
}