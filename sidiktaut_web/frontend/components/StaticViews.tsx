import { useState, memo } from 'react';
import { Terminal, Chrome, Github, Shield, Code, Server, Layout, Network, Cpu, Copy, ExternalLink, Zap, ChevronLeft, ArrowRight, Instagram, Linkedin, Mail, Check, AlertCircle, Play, FileText, Download, FileDown, ArrowLeft, ArrowRightCircle, ArrowRightIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SHARED COMPONENTS ---
function PrimaryBtn({ icon: Icon, label, onClick, className = "bg-white text-blue-700 hover:bg-gray-100" }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-3 md:px-8 md:py-4 rounded-full font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgb(0,0,0,0.05)] border border-transparent transition-all active:scale-95 text-sm md:text-base ${className}`}>
      {Icon && <Icon size={18} />} {label}
    </button>
  );
}

function SecondaryBtn({ icon: Icon, label, onClick, className = "bg-black/20 text-white hover:bg-black/30 border-white/20" }: any) {
  return (
    <button onClick={onClick} className={`px-5 py-3 md:px-6 md:py-4 rounded-full font-bold flex items-center justify-center gap-2 border transition-all text-sm md:text-base ${className}`}>
      {Icon && <Icon size={18} />} {label}
    </button>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-white dark:bg-[#121214] p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-500 transition-colors h-full">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800 shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="font-bold text-base md:text-lg text-gray-900 dark:text-white mb-2">{title}</h4>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

// --- BROWSER EXTENSION VIEW (OPTIMIZED) ---
// PERBAIKAN: Menggunakan div biasa (bukan motion.div) untuk menghindari animasi ganda penyebab lag
export const BrowserView = memo(function BrowserView() {
  const handleDownloadReadme = () => { const link = document.createElement('a'); link.href = '/README.md'; link.download = 'README.md'; link.click(); };
  const handleDownloadZip = () => { const link = document.createElement('a'); link.href = '/sidiktaut-ext.zip'; link.download = 'sidiktaut-ext.zip'; link.click(); };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* BANNER UTAMA */}
      <div className="bg-blue-700 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white shadow-[0_20px_50px_-10px_rgba(29,78,216,0.2)] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10">
        <div className="relative z-10 max-w-2xl w-full">
          <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
            <span className="px-3 py-1 md:px-4 md:py-1.5 bg-blue-800 rounded-full text-[10px] md:text-xs font-bold border border-blue-600 flex items-center gap-2"><Chrome size={14} /> Versi 0.1</span>
            <span className="px-3 py-1 md:px-4 md:py-1.5 bg-green-900/40 text-green-200 rounded-full text-[10px] md:text-xs font-bold border border-green-800">Manifest V3</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 md:mb-6 leading-tight">SidikTaut <span className="text-blue-200">Extension</span></h1>
          <p className="text-blue-100 text-sm md:text-lg leading-relaxed max-w-xl">
            Ekstensi ringan untuk Chrome atau browser favoritmu. Analisis Satset tanpa Ribet.
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          <PrimaryBtn icon={Download} label="Download .ZIP" onClick={handleDownloadZip} />
          <SecondaryBtn icon={FileText} label="README.md" onClick={handleDownloadReadme} />
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 md:-right-12 md:-bottom-12 md:w-80 md:h-80 rotate-12 pointer-events-none z-0">
            <motion.img src="/chrome.png" alt="Chrome Background" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="w-full h-full object-contain grayscale brightness-200" />
        </div>
      </div>

      {/* GRID FITUR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <FeatureCard icon={Zap} title="Scan Satset" desc="Analisis link kamu secara otomatis gak sampai 2 detik!" />
        <FeatureCard icon={Shield} title="Perlindungan Real-time" desc="Otomatis mencegah kamu dari ancaman link berbahaya!" />
        <FeatureCard icon={Cpu} title="Sangat Ringan" desc="Didesain untuk kamu yang gak cuma pengen satset, tapi juga gak lelet" />
      </div>

      {/* SECTION CARA INSTALL & SPECS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pt-2 md:pt-4">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full"><FileText size={18} md:size={20} /></div> Cara Menginstall</h3>
          <div className="w-full aspect-video bg-black/5 rounded-[15px] overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 relative group">
            <iframe className="w-full h-full" src="https://www.youtube.com/embed/EKdWnPgZkxY" title="Tutorial Install Extension" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"></iframe>
          </div>
          <div className="bg-white dark:bg-[#121214] rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 md:space-y-8">
            <StepItem number="1" title="Download & Ekstrak">Unduh file <code>sidiktaut-ext.zip</code> dari tombol di atas, lalu ekstrak ke folder komputer kamu.</StepItem>
            <StepItem number="2" title="Buka menu extension">Buka browser, ketik <code>chrome://extensions</code> di address bar, atau buka menu <b>Manage Extensions</b>.</StepItem>
            <StepItem number="3" title="Enable Developer Mode">Aktifkan opsi <b>Developer Mode</b> di pojok kanan atas halaman ekstensi.</StepItem>
            <StepItem number="4" title="Load Unpacked">Klik tombol <b>Load Unpacked</b>, pilih folder hasil ekstrak. SidikTaut siap untuk digunakan!</StepItem>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3"><div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full"><Code size={20} /></div> Persyaratan Sistem</h3>
          <div className="bg-gray-50 dark:bg-[#121214] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 h-fit shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <ul className="space-y-4">
              <SpecItem label="Browser Support" value="Chrome, Edge, Brave, Opera, Safari" />
              <SpecItem label="OS Support" value="Windows, macOS, Linux" />
              <SpecItem label="Koneksi" value="Wajib Online (Internet)" />
              <SpecItem label="Versi Minimal" value="Chrome v88+" />
            </ul>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl text-xs text-blue-700 dark:text-blue-300 leading-relaxed border border-blue-100 dark:border-blue-900/20">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p><b>Note:</b> Jangan lupa jalankan backend (app.py) agar ekstensi bisa berkomunikasi dengan server.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- CLI TOOL VIEW (OPTIMIZED) ---
export const CliView = memo(function CliView() {
  const [installCopied, setInstallCopied] = useState(false); 
  const LOGO_CONFIG = {
    tux: { mobile: "absolute bottom-[290px] right-[10px] w-[130px] h-[110px] rotate-[5deg]", desktop: "md:absolute md:top-[130px] md:-translate-y-[40px] md:right-[330px] md:w-56 md:h-56 md:rotate-[6deg]" },
    python: { mobile: "absolute bottom-[-21px] right-[-30px] w-[270px] h-[270px] rotate-[5deg]", desktop: "md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-10 md:w-[400px] md:h-[400px] md:rotate-[5deg]" }
  };
  const handleDownloadReadme = () => { const link = document.createElement('a'); link.href = '/README.md'; link.download = 'README.md'; link.click(); };
  const handleDownloadCli = () => { const link = document.createElement('a'); link.href = '/sidiktaut-cli.zip'; link.download = 'sidiktaut-cli.zip'; link.click(); };
  const copyInstall = () => { navigator.clipboard.writeText('python sidiktaut.py'); setInstallCopied(true); setTimeout(() => setInstallCopied(false), 2000); }

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="bg-[#1a1a1a] dark:bg-black rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-center gap-8 md:gap-10 border border-gray-800 relative overflow-hidden min-h-[400px] md:min-h-[auto]">
         <div className={`${LOGO_CONFIG.tux.mobile} ${LOGO_CONFIG.tux.desktop} pointer-events-none select-none z-0`}><motion.img src="/tux.png" alt="Tux Linux" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.15, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 0.4 }} className="w-full h-full object-contain brightness-200 contrast-50" /></div>
         <div className={`${LOGO_CONFIG.python.mobile} ${LOGO_CONFIG.python.desktop} pointer-events-none select-none z-0`}><motion.img src="/python.png" alt="Python" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.15, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="w-full h-full object-contain grayscale brightness-200 contrast-50" /></div>
         <div className="flex-1 relative z-10 w-full">
            <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
               <span className="px-3 py-1 bg-amber-900/20 text-amber-400 rounded-full text-[10px] md:text-xs font-bold border border-amber-800 flex items-center gap-2"><Terminal size={12}/> Versi 0.1</span>
               <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-[10px] md:text-xs font-bold border border-gray-700">Python 3.9+</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 md:mb-6 leading-tight">SidikTaut <span className="text-amber-500 font-mono">CLI</span></h1>
            <p className="text-gray-400 text-sm md:text-lg leading-relaxed max-w-xl mb-6 md:mb-8">Tools forensik URL via terminal. Dilengkapi fitur <b>Trace Redirect</b> dan <b>Auto Logging</b> untuk analisis mendalam.</p>
            <div className="flex flex-wrap gap-3">
                <PrimaryBtn icon={Download} label="Download .ZIP" onClick={handleDownloadCli} className="bg-amber-600 text-white hover:bg-amber-700 border-none shadow-[0_4px_14px_0_rgba(245,158,11,0.2)]" />
                <SecondaryBtn icon={FileDown} label="README.md" onClick={handleDownloadReadme} className="border-gray-700 hover:bg-gray-800"/>
            </div>
         </div>
         <div className="relative z-10 w-full md:w-auto md:min-w-[320px] mt-8 md:mt-0">
            <p className="text-[10px] font-bold text-gray-500 mb-2 md:mb-3 uppercase tracking-wider ml-1">Run Program</p>
            <div className="bg-black rounded-2xl md:rounded-[1.5rem] border border-gray-800 p-4 md:p-5 flex items-center justify-between group shadow-lg hover:border-amber-600 transition-colors w-full relative z-20">
               <code className="text-amber-400 font-mono text-xs md:text-sm truncate mr-2">$ python sidiktaut.py</code>
               <div onClick={copyInstall} className="p-2 hover:bg-gray-800 rounded-lg md:rounded-full cursor-pointer transition-colors shrink-0">{installCopied ? <Check size={16} className="text-amber-500"/> : <Copy size={16} className="text-gray-600 group-hover:text-white"/>}</div>
            </div>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <FeatureCard icon={Network} title="Trace Redirects" desc="Otomatis melacak jalur redirect link sebelum sampai ke tujuan akhir." />
        <FeatureCard icon={FileText} title="Deep Analysis" desc="Menampilkan detail deteksi dari setiap vendor antivirus (Mode -d)." />
        <FeatureCard icon={Download} title="Auto Logging" desc="Simpan hasil analisis forensik ke file text secara otomatis (Mode -o)." />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pt-2 md:pt-4">
         <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3"><div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full"><Play size={18} md:size={20}/></div> Contoh penggunaan</h3>
            <div className="w-full aspect-video bg-black/5 rounded-[15px] overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 relative group">
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/EKdWnPgZkxY" title="Tutorial Penggunaan CLI" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"></iframe>
            </div>
            <div className="space-y-3 md:space-y-4">
               <CodeBlock title="Standard Scan" cmd="python sidiktaut.py -u google.com" />
               <CodeBlock title="Deep Scan & Save Log" cmd="python sidiktaut.py -u target.com -d -o report.txt" />
               <CodeBlock title="Interactive Mode" cmd="python sidiktaut.py" />
            </div>
         </div>
         <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3"><div className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-full"><FileText size={18} md:size={20}/></div> Arguments</h3>
            <div className="bg-white dark:bg-[#121214] rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-bold uppercase text-[10px] md:text-xs">
                        <tr><th className="px-4 py-3 md:px-6 md:py-4">Flag</th><th className="px-4 py-3 md:px-6 md:py-4">Description</th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        <ArgRow flag="-u, --url" desc="URL target scan" />
                        <ArgRow flag="-d, --detail" desc="Tampilkan report vendor lengkap" />
                        <ArgRow flag="-o, --output" desc="Simpan log ke file (.txt)" />
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
});

// --- TEAM VIEW (ANIMATED) ---
export const TeamView = memo(function TeamView() {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const teamMembers = [
    { name: 'Yudha Pratama', role: 'Lead Developer', image: '/yudha.png', short_desc: 'Cyber Security Student & Ethical Hacker.', full_desc: 'Sebagai Lead Developer, Saya bertanggung jawab atas keamanan sistem, integrasi API KEY, dan memastikan seluruh kode dan program memenuhi standar keamanan OWASP.', skills: ['Python', 'Security Code', 'Linux', 'Backend'], color: 'red' },
    { name: 'Gyelgha Chonda', role: 'Extension Specialist', image: '/chonda.jpg', short_desc: 'Browser Extension Architecture & Security.', full_desc: 'Spesialis dalam pengembangan Ekstensi Browser. Chonda merancang mekanisme "Right-Click Scan" dan memastikan ekstensi berjalan ringan (<5MB) tanpa membebani browser pengguna. Fokus pada efisiensi JavaScript dan Manifest V3.', skills: ['JavaScript', 'Chrome API', 'React', 'Optimization'], color: 'yellow' },
    { name: 'Bram Lumozato M.', role: 'Front End Developer', image: '/bram.jpg', short_desc: 'UI/UX Design & Responsive Layouts.', full_desc: 'Bertanggung jawab mengubah kode menjadi visual yang menawan. Bram memastikan antarmuka SidikTaut responsif di Mobile & Desktop, serta merancang pengalaman pengguna (UX) yang intuitif dan modern.', skills: ['React', 'Tailwind CSS', 'Figma', 'UI/UX'], color: 'green' }
  ];
  const transitionSettings = { duration: 0.3, ease: "easeInOut" };
  const detailVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };
  const gridVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };

  return (
    <AnimatePresence mode="wait">
      {selectedMember ? (
        <motion.div key="detail" variants={detailVariants} initial="hidden" animate="visible" exit="exit" transition={transitionSettings}>
          <button onClick={() => setSelectedMember(null)} className="mb-4 md:mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors ml-2 group">
            <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors"><ChevronLeft size={18} /></div> Back to Team
          </button>
          <div className="bg-white dark:bg-[#121214] rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-start">
            <div className={`w-32 h-32 md:w-64 md:h-64 shrink-0 rounded-full p-2 border-[3px] border-${selectedMember.color}-100 dark:border-${selectedMember.color}-900`}><img src={selectedMember.image} alt={selectedMember.name} className="w-full h-full object-cover rounded-full bg-gray-100" loading="lazy" /></div>
            <div className="flex-1 text-center md:text-left">
              <span className={`inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 md:mb-4 bg-${selectedMember.color}-100 text-${selectedMember.color}-700 dark:bg-${selectedMember.color}-900/30 dark:text-${selectedMember.color}-400`}>{selectedMember.role}</span>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 md:mb-6 tracking-tight">{selectedMember.name}</h1>
              <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 md:mb-8">{selectedMember.full_desc}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mb-6 md:mb-8">{selectedMember.skills.map((skill: string) => (<span key={skill} className="px-4 py-2 md:px-5 md:py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-700 rounded-full text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{skill}</span>))}</div>
              <div className="flex justify-center md:justify-start gap-3 md:gap-4"><SocialBtn icon={Github} label="GitHub" /><SocialBtn icon={Linkedin} label="LinkedIn" /></div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div key="grid" variants={gridVariants} initial="hidden" animate="visible" exit="exit" transition={transitionSettings} className="space-y-6 md:space-y-8">
          <div className="text-center mb-6 md:mb-8"><h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">Meet our <span className="text-blue-600">Team</span></h1><p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Tim dibalik pengembangan SidikTaut.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <motion.div key={member.name} layoutId={member.name} onClick={() => setSelectedMember(member)} className="group cursor-pointer bg-white dark:bg-[#121214] rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-8 border border-gray-100 dark:border-gray-800 hover:border-blue-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col items-center text-center relative overflow-hidden" whileHover={{ y: -5 }}>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1.5 mb-4 md:mb-6 relative z-10 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-700"><img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full" loading="lazy" /></div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white relative z-10 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 md:mb-4 relative z-10 text-${member.color}-600 bg-${member.color}-50 dark:bg-white/5 px-3 py-1 rounded-full mt-2`}>{member.role}</p>
                <div className="mt-auto px-5 py-2 md:px-6 md:py-3 bg-gray-50 dark:bg-black/20 rounded-full text-[10px] md:text-xs font-bold text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors relative z-10 flex items-center gap-2">View Profile <ArrowRight size={14} /></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// --- HELPER COMPONENTS ---
function StepItem({ number, title, children }: any) { return (<div className="flex gap-4 md:gap-5"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs md:text-sm shrink-0 border border-blue-100 dark:border-blue-800">{number}</div><div><h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base mb-1">{title}</h4><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{children}</p></div></div>) }
function SpecItem({ label, value }: any) { return (<li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 border-b border-gray-200 dark:border-gray-700/50 pb-3 last:border-0 last:pb-0"><span className="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wide sm:normal-case sm:tracking-normal">{label}</span><span className="font-bold text-gray-900 dark:text-white text-sm sm:text-right">{value}</span></li>) }
function CodeBlock({ title, cmd }: any) { const [isCopied, setIsCopied] = useState(false); const handleCopy = () => { navigator.clipboard.writeText(cmd); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }; return (<div className="group"><p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2 ml-2 uppercase tracking-wider">{title}</p><div className="bg-[#0a0a0a] rounded-2xl md:rounded-[1.5rem] border border-gray-800 p-4 md:p-5 font-mono text-xs md:text-sm text-amber-400 flex justify-between items-center hover:border-gray-600 transition-colors shadow-inner"><span className="break-all mr-2">{cmd}</span><div onClick={handleCopy} className="p-2 cursor-pointer transition-colors hover:text-white shrink-0">{isCopied ? <Check size={16} className="text-amber-500" /> : <Copy size={16} className="text-gray-600 group-hover:text-white" />}</div></div></div>) }
function ArgRow({ flag, desc }: any) { return (<tr className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"><td className="px-4 py-3 md:px-6 md:py-4 font-mono text-[10px] md:text-xs text-gray-700 dark:text-gray-300 font-bold whitespace-nowrap">{flag}</td><td className="px-4 py-3 md:px-6 md:py-4 text-gray-600 dark:text-gray-400 text-xs md:text-sm">{desc}</td></tr>) }
function SocialBtn({ icon: Icon, label }: any) { return (<button className="flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-full font-bold text-xs md:text-sm hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm active:scale-95 border border-transparent"><Icon size={18} /> {label}</button>) }