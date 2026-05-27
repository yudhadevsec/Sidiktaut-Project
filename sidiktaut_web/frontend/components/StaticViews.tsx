import { useState, memo } from 'react';
import { Terminal, Chrome, Github, Shield, Code, Server, Layout, Network, Cpu, Copy, ExternalLink, Zap, ChevronLeft, ArrowRight, Instagram, Linkedin, Mail, Check, AlertCircle, Play, FileText, Download, FileDown, ArrowLeft, ArrowRightCircle, ArrowRightIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Kalau mau ganti warna tombol biar Download.zip / Readme.md semua konsisten
function PrimaryBtn({ icon: Icon, label, onClick, className = "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-80" }: any) {
  return (
    <button onClick={onClick} className={`px-6 py-3 md:px-8 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgb(0,0,0,0.05)] border border-transparent transition-all active:scale-95 text-sm md:text-base ${className}`}>
      {Icon && <Icon size={18} />} {label}
    </button>
  );
}

function SecondaryBtn({ icon: Icon, label, onClick, className = "bg-black/20 text-white hover:bg-black/30 border-white/20" }: any) {
  return (
    <button onClick={onClick} className={`px-5 py-3 md:px-6 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all text-sm md:text-base ${className}`}>
      {Icon && <Icon size={18} />} {label}
    </button>
  );
}

// Fungsi Kotak kayak di Scan Satset , Perlindungan Real-time dkk
function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex flex-col gap-3 h-full py-2">
      <div className="text-gray-900 dark:text-white">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div>
        <h4 className="font-bold text-base md:text-lg text-gray-900 dark:text-white mb-1 tracking-tight">{title}</h4>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

// Bagian tampilan Sidiktaut Extension
export const BrowserView = memo(function BrowserView() {
  const handleDownloadZip = () => { const link = document.createElement('a'); link.href = '/Sidiktaut-Extension.zip'; link.download = 'Sidiktaut-Extension.zip'; link.click(); };

  return (
    <div className="space-y-8 md:space-y-10 pb-8">
      {/* Hero Section */}
      <div className="bg-transparent pt-4 pb-4 md:pt-6 md:pb-8 text-gray-900 dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            SidikTaut <span className="text-gray-400 dark:text-gray-600">Extension</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mb-6">
            Analisis satset tanpa ribet. Ekstensi ringan berbasis Manifest V3 untuk Chrome dan browser favoritmu yang memberikan perlindungan seketika tanpa jeda loading yang lama.
          </p>
          <PrimaryBtn icon={Download} label="Download .ZIP" onClick={handleDownloadZip} />
        </div>
      </div>

      {/* Feature Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-y border-gray-100 dark:border-gray-800/50 py-8">
        <FeatureCard icon={Zap} title="Scan Satset" desc="Analisis tautan seketika dalam hitungan kurang dari 2 detik." />
        <FeatureCard icon={Shield} title="Perlindungan Real-time" desc="Memblokir akses ke situs phising atau malware secara otomatis." />
        <FeatureCard icon={Cpu} title="Super Ringan" desc="Berjalan di latar belakang tanpa menghabiskan memori browser." />
      </div>

      {/* Installation Section */}
      <div className="max-w-3xl">
        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6">Cara Install (Developer Mode)</h3>
        <div className="space-y-4">
          <StepItem number="1" title="Download & Ekstrak">Unduh file ZIP dari tombol di atas, lalu ekstrak ke dalam sebuah folder.</StepItem>
          <StepItem number="2" title="Buka menu Extension">Ketik <code className="text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-white/10 px-1 rounded">chrome://extensions</code> di browser Anda.</StepItem>
          <StepItem number="3" title="Aktifkan Developer Mode">Nyalakan toggle <b>Developer mode</b> di pojok kanan atas halaman.</StepItem>
          <StepItem number="4" title="Load Unpacked">Klik tombol <b>Load unpacked</b> dan pilih folder ekstensi yang sudah diekstrak.</StepItem>
        </div>
      </div>
    </div>
  );
});

// Bagian Tampilan SidikTaut CLI
export const CliView = memo(function CliView() {
  const [installCopied, setInstallCopied] = useState(false);
  const handleDownloadCli = () => { const link = document.createElement('a'); link.href = '/Sidiktaut-Cli.zip'; link.download = 'Sidiktaut-Cli.zip'; link.click(); };
  const copyInstall = () => { navigator.clipboard.writeText('python sidiktaut.py'); setInstallCopied(true); setTimeout(() => setInstallCopied(false), 2000); }

  return (
    <div className="space-y-8 md:space-y-10 pb-8">
      {/* Hero Section */}
      <div className="bg-transparent pt-4 pb-4 md:pt-6 md:pb-8 text-gray-900 dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            SidikTaut <span className="text-gray-400 dark:text-gray-600 font-mono">CLI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mb-6">
            Tools forensik URL via terminal. Dilengkapi fitur Trace Redirect dan Auto Logging untuk analisis mendalam tanpa batas antarmuka grafis.
          </p>
          <PrimaryBtn icon={Download} label="Download .ZIP" onClick={handleDownloadCli} />
        </div>
        
        {/* Run Program Snippet */}
        <div className="w-full md:w-auto md:min-w-[320px]">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Run Program</p>
          <div className="bg-gray-50 dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between group">
            <code className="text-gray-900 dark:text-white font-mono text-sm mr-2">$ python sidiktaut.py</code>
            <div onClick={copyInstall} className="p-2.5 bg-white dark:bg-[#2c2c2e] hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl cursor-pointer transition-colors shadow-sm">
              {installCopied ? <Check size={16} className="text-gray-900 dark:text-white" /> : <Copy size={16} className="text-gray-400 hover:text-gray-900 dark:hover:text-white" />}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-y border-gray-100 dark:border-gray-800/50 py-8">
        <FeatureCard icon={Network} title="Trace Redirects" desc="Melacak jalur redirect otomatis sebelum sampai ke tujuan akhir." />
        <FeatureCard icon={FileText} title="Deep Analysis" desc="Menampilkan detail deteksi dari vendor antivirus." />
        <FeatureCard icon={Download} title="Auto Logging" desc="Simpan hasil forensik ke file txt secara otomatis." />
      </div>

      {/* Usage & Arguments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 pt-2">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6">Contoh Penggunaan</h3>
          <div className="space-y-4">
            <CodeBlock title="Scan Standar" cmd="python sidiktaut.py -u google.com" />
            <CodeBlock title="Scan & Simpan Log" cmd="python sidiktaut.py -u target.com -d -o report.txt" />
            <CodeBlock title="Mode Interaktif" cmd="python sidiktaut.py" />
          </div>
        </div>
        
        <div>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6">Kamus Argumen</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800/50 pb-4">
              <code className="text-gray-900 dark:text-white font-mono font-bold text-sm">-u, --url</code>
              <span className="text-gray-500 dark:text-gray-400 text-sm">URL target yang akan discan</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800/50 pb-4">
              <code className="text-gray-900 dark:text-white font-mono font-bold text-sm">-d, --detail</code>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Tampilkan report vendor secara lengkap</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800/50 pb-4">
              <code className="text-gray-900 dark:text-white font-mono font-bold text-sm">-o, --output</code>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Simpan log ke dalam file text</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Bagian Tampilan Meet Our Team / Tim Kami
export const TeamView = memo(function TeamView() {
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // DATA MEMBER TIM
  const teamMembers = [
    {
      name: 'Yudha Pratama',
      role: 'Lead Full Stack & DevSecOps',
      image: '/yudha.png',
      short_desc: 'End-to-end System Architect: From UI/UX to Deployment & Security',
      full_desc: 'Arsitek utama di balik seluruh ekosistem SidikTaut. Merancang dan membangun sistem secara End-to-End, mulai dari logika forensik pada CLI (Python), keamanan API Backend, hingga antarmuka Web Modern.',
      skills: ['Full Stack', 'Python', 'React', 'Cyber Security', 'Whitebox Testing'],
      color: 'red',
      // Isi link kamu disini:
      github: 'https://github.com/yudhadevsec',
      linkedin: 'https://linkedin.com/in/yudhadev-sec',
      instagram: 'https://instagram.com/farazlogic'
    },
    {
      name: 'Gyelgha Chonda',
      role: 'Extension Specialist & Quality Assurance',
      image: '/chonda.jpeg',
      short_desc: 'Extension Testing & Bug Hunting.',
      full_desc: 'Bertanggung jawab melakukan pengujian fungsionalitas (Black Box Testing) pada ekstensi browser. Memastikan setiap fitur berjalan stabil, melaporkan bug, dan memverifikasi perbaikan untuk menjamin pengalaman pengguna yang bebas error.',
      skills: ['Manual Testing', 'Bug Reporting', 'User Skenario', 'BlackBox Testing'],
      color: 'yellow',
      github: 'https://github.com/chondhayam',
      linkedin: '',
      instagram: 'https://instagram.com/chondha_'
    },
    {
      name: 'Bram Lumozato M.',
      role: 'Web Quality Assurance',
      image: '/bram.jpg',
      short_desc: 'Web Interface & Responsive Testing.',
      full_desc: 'Bertanggung jawab melakukan pengujian tampilan (UI Testing) pada berbagai ukuran layar. Memastikan website berjalan responsif (Mobile-Friendly) dan melaporkan bug visual kepada Lead Developer.',
      skills: ['Responsive Testing', 'Visual QC', 'Cross-Browser Check', 'BlackBox Testing'],
      color: 'green',
      github: 'https://github.com/brrm438',
      linkedin: 'https://linkedin.com/in/bram-lumozato-manao-9616a231b',
      instagram: 'https://instagram.com/brammanaoo'
    }
  ];

  const transitionSettings = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };
  const detailVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };
  const gridVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };

  return (
    <AnimatePresence mode="wait">
      {selectedMember ? (
        <motion.div key="detail" variants={detailVariants} initial="hidden" animate="visible" exit="exit" transition={transitionSettings} className="py-2 md:py-4 max-w-4xl">
          <button onClick={() => setSelectedMember(null)} className="mb-6 md:mb-8 flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" /> Kembali
          </button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 overflow-hidden rounded-full">
              <img src={selectedMember.image} alt={selectedMember.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="flex-1 mt-2 md:mt-4">
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{selectedMember.role}</p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{selectedMember.name}</h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{selectedMember.full_desc}</p>

              <div className="mb-8">
                <p className="text-[10px] md:text-xs font-bold text-gray-900 dark:text-white leading-relaxed">
                  {selectedMember.skills.join(' • ')}
                </p>
              </div>

              {/* SOCIAL MEDIA RAW ICONS */}
              <div className="flex gap-5">
                {selectedMember.github && <a href={selectedMember.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Github size={20} /></a>}
                {selectedMember.linkedin && <a href={selectedMember.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Linkedin size={20} /></a>}
                {selectedMember.instagram && <a href={selectedMember.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Instagram size={20} /></a>}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div key="grid" variants={gridVariants} initial="hidden" animate="visible" exit="exit" transition={transitionSettings} className="space-y-6 md:space-y-8 pb-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Meet the Team</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tim di balik pengembangan ekosistem SidikTaut.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {teamMembers.map((member) => (
              <motion.div key={member.name} layoutId={member.name} onClick={() => setSelectedMember(member)} className="group cursor-pointer flex flex-row items-center gap-4 relative p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors">
                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden rounded-full relative z-10">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-all duration-500 ease-out transform group-hover:scale-110" loading="lazy" />
                </div>
                <div className="flex-1 relative z-10">
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-400">{member.role}</p>
                  <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white tracking-tight mb-1">{member.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Lihat detail <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Ikon pembantu dan komponen kecil lainnya (contoh bulatan angka step by step 1,2,3 dll)
function StepItem({ number, title, children }: any) { return (<div className="flex gap-4 md:gap-5"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center font-black text-xs md:text-sm shrink-0 border border-gray-200 dark:border-gray-800">{number}</div><div><h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base mb-1">{title}</h4><p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{children}</p></div></div>) }
function SpecItem({ label, value }: any) { return (<li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 border-b border-gray-200 dark:border-gray-700/50 pb-3 last:border-0 last:pb-0"><span className="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wide sm:normal-case sm:tracking-normal">{label}</span><span className="font-bold text-gray-900 dark:text-white text-sm sm:text-right">{value}</span></li>) }
function CodeBlock({ title, cmd }: any) { const [isCopied, setIsCopied] = useState(false); const handleCopy = () => { navigator.clipboard.writeText(cmd); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }; return (<div className="group"><p className="text-[10px] md:text-xs font-bold text-gray-400 mb-2 ml-2 uppercase tracking-wider">{title}</p><div className="bg-gray-50 dark:bg-[#121214] rounded-[1.5rem] md:rounded-[2rem] border border-gray-100/50 dark:border-gray-800 p-4 md:p-6 font-mono text-xs md:text-sm text-gray-900 dark:text-white flex justify-between items-center transition-colors shadow-sm"><span className="break-all mr-2">{cmd}</span><div onClick={handleCopy} className="p-2.5 bg-white dark:bg-[#2c2c2e] rounded-xl cursor-pointer transition-colors shrink-0 shadow-sm">{isCopied ? <Check size={16} className="text-gray-900 dark:text-white" /> : <Copy size={16} className="text-gray-400 hover:text-gray-900 dark:hover:text-white" />}</div></div></div>) }
function ArgRow({ flag, desc }: any) { return (<tr className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"><td className="px-4 py-3 md:px-6 md:py-4 font-mono text-[10px] md:text-xs text-gray-700 dark:text-gray-300 font-bold whitespace-nowrap">{flag}</td><td className="px-4 py-3 md:px-6 md:py-4 text-gray-600 dark:text-gray-400 text-xs md:text-sm">{desc}</td></tr>) }
function SocialBtn({ icon: Icon, label, href }: any) {
  return (
    <button
      onClick={() => href && window.open(href, '_blank')}
      className="flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-full font-bold text-xs md:text-sm hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm active:scale-95 border border-transparent cursor-pointer"
    >
      {Icon && <Icon size={18} />} {label}
    </button>
  )
}

export const AboutView = memo(function AboutView() {
  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="pt-2">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4">Tentang SidikTaut</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          SidikTaut adalah proyek berbasis pembelajaran (Mini Project Based Learning) yang dirancang untuk menganalisis dan mendeteksi tautan berbahaya. Dibuat dengan tujuan untuk meningkatkan keamanan pengguna internet saat berselancar, menghindari phising, malware, dan ancaman siber lainnya.
        </p>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Fitur Utama</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400 mb-6">
          <li><strong>Web Scanner:</strong> Memindai tautan langsung melalui website secara cepat.</li>
          <li><strong>Browser Extension:</strong> Ekstensi untuk mengecek keamanan tautan tanpa meninggalkan halaman yang sedang dibuka.</li>
          <li><strong>CLI Tool:</strong> Perangkat baris perintah (Command Line Interface) bagi developer untuk memindai dari terminal.</li>
        </ul>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Latar Belakang</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Proyek ini awalnya dibangun sebagai tugas perkuliahan semester 1. Fokus utamanya adalah memahami dasar-dasar pengembangan web, interaksi API keamanan, dan bagaimana mengemas layanan agar bermanfaat bagi publik.
        </p>
      </div>

      {/* Minimalist Footer inside About */}
      <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800/50 text-center opacity-50 hover:opacity-100 transition-opacity duration-300">
        <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} SidikTaut. Built by Yudha & Team.
        </p>
      </footer>
    </div>
  );
});
