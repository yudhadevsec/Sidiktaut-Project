import { useState, useMemo, useEffect, memo } from 'react'; // 1. Tambah 'memo' disini
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Search, Loader2, XCircle, CheckCircle, Eye, X, ChevronLeft, Briefcase, Clock, Fingerprint, HelpCircle, ImageOff, Maximize2, Copy, Check, GitBranch, ChevronDown, ChevronUp, ChevronRight, Map } from 'lucide-react';
import { scanUrl } from '../services/api'; 
import { ScanResponse } from '../types';

const THREAT_MAP: Record<string, string> = {
  'phishing': 'BAHAYA: Situs ini menyamar menjadi website resmi.',
  'malware': 'VIRUS: Mengandung malware berbahaya.',
  'trojan': 'TROJAN: Program jahat tersembunyi.',
  'clean': '✅ AMAN: Dinyatakan bersih.',
  'safe': '✅ AMAN: Terverifikasi aman.',
  'harmless': '✅ AMAN: Tidak ada ancaman.',
  'undetected': '❓ TIDAK DIKETAHUI: Belum ada data spesifik.',
  'default_bad': '⚠️ BAHAYA: Terdeteksi mencurigakan.',
};

// 2. Ubah nama fungsi jadi internal (hapus export default di depan)
function ScannerComponent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'malicious' | 'harmless' | 'undetected'>('malicious');
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  
  // STATE PREVIEW & SLIDER
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [zoomImage, setZoomImage] = useState(false); 
  const [copiedHash, setCopiedHash] = useState(false);
  
  // STATE BARU: CAROUSEL INDEX
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [showTrace, setShowTrace] = useState(false);
  const [result, setResult] = useState<ScanResponse | any>(null);

  // MEMBUAT LIST GAMBAR DARI REDIRECTS
  const previewList = useMemo(() => {
      if (!result) return [];
      // Jika ada redirects, gunakan list itu. Jika kosong, gunakan URL utama saja.
      if (result.redirects && result.redirects.length > 0) {
          return result.redirects;
      }
      return [{ url: result.url, status: 'Final' }];
  }, [result]);

  // RESET INDEX SAAT HASIL BARU MUNCUL
  useEffect(() => {
      if (result) setCurrentImageIndex(0);
  }, [result]);

  const handleScan = async () => {
    if (!url) return;

    const urlPattern = /^[a-zA-Z0-9-._~:/?#[\]@!$&'*+,;=%]+$/;
    if (!urlPattern.test(url)) {
        setError("Input mengandung karakter berbahaya atau tidak valid!");
        return;
    }

    setLoading(true); setError(''); setResult(null); setShowModal(false); 
    setSelectedDetail(null); setShowTrace(false); 
    setShowPreview(false); setPreviewLoading(false); setPreviewError(false); setZoomImage(false); setCopiedHash(false);
    setCurrentImageIndex(0); // Reset Slider

    try {
      const data = await scanUrl(url);
      
      if (data.status === 'pending') {
          setError('Link baru terdeteksi. Silakan klik ANALYZE lagi dalam 5 detik.');
      } else { 
          setResult(data); 
          if(data.url) setUrl(data.url);
          const initialTab = data.total_scans === 0 ? 'undetected' : (data.malicious > 0 ? 'malicious' : 'harmless');
          setActiveFilter(initialTab); 
      }
    } catch (e: any) { 
        console.error(e);
        setError(e.message || 'GAGAL KONEK (Cek Backend)'); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleCopyHash = () => {
      if (result?.sha256) {
          navigator.clipboard.writeText(result.sha256);
          setCopiedHash(true);
          setTimeout(() => setCopiedHash(false), 2000);
      }
  };

  const getExplanation = (resultText: string, category: string) => {
    const text = resultText ? resultText.toLowerCase() : '';
    if (category === 'harmless') return THREAT_MAP['clean'];
    if (text.includes('phish')) return THREAT_MAP['phishing'];
    if (text.includes('malware')) return THREAT_MAP['malware'];
    return THREAT_MAP['default_bad'];
  };

  const filteredDetails = useMemo(() => {
    if (!result?.details) return [];
    return result.details.filter((item: any) => {
      if (activeFilter === 'malicious') return ['malicious', 'suspicious'].includes(item.category);
      return item.category === activeFilter;
    });
  }, [result, activeFilter]);

  const getStatusColor = (score: number, totalScans: number) => {
    if (totalScans === 0) return 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-gray-700'; 
    if (score === 100) return 'text-green-600 bg-green-50 border-green-100 dark:border-green-900/30';
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:border-emerald-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-100 dark:border-yellow-900/30';
    return 'text-red-600 bg-red-50 border-red-100 dark:border-red-900/30';
  };

  const getRiskLabel = (score: number, totalScans: number) => {
    if (totalScans === 0) return 'UNVERIFIED / UNKNOWN';
    if (score === 100) return 'PERFECTLY SAFE';
    if (score >= 80) return 'MOSTLY SAFE';
    if (score >= 60) return 'SUSPICIOUS';
    return 'CRITICAL THREAT';
  };

  const getRowStyle = (category: string) => {
    if (category === 'malicious') return "bg-red-50/80 dark:bg-red-900/20 border-red-100 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/30";
    if (category === 'harmless') return "bg-green-50/80 dark:bg-green-900/20 border-green-100 dark:border-green-800/30 hover:bg-green-100 dark:hover:bg-green-900/30";
    if (category === 'suspicious') return "bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/30";
    if (category === 'undetected') return "bg-gray-50/80 dark:bg-gray-800/20 border-gray-100 dark:border-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-800/40";
    return "bg-white dark:bg-transparent border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5";
  };

  const getPreviewUrl = (targetUrl: string) => {
      let finalUrl = targetUrl;
      if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
      return `https://api.microlink.io/?url=${encodeURIComponent(finalUrl)}&screenshot=true&meta=false&embed=screenshot.url&screenshot.type=jpeg&screenshot.quality=80&viewport.width=1280&viewport.height=720`;
  };

  const handleLoadPreview = () => { 
      setShowPreview(true); 
      setPreviewLoading(true); 
      setPreviewError(false);
  };

  // --- NAVIGASI SLIDER ---
  const nextImage = (e: any) => {
      e.stopPropagation();
      if (currentImageIndex < previewList.length - 1) {
          setPreviewLoading(true); // Tampilkan loader saat ganti
          setCurrentImageIndex(prev => prev + 1);
      }
  };

  const prevImage = (e: any) => {
      e.stopPropagation();
      if (currentImageIndex > 0) {
          setPreviewLoading(true); // Tampilkan loader saat ganti
          setCurrentImageIndex(prev => prev - 1);
      }
  };

  return (
    <div className="w-full relative">
      {/* INPUT CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className={`bg-white dark:bg-[#121214] rounded-[2rem] p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${result ? 'mb-8' : 'mb-0'}`}
      >
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
           <div>
             <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Scan disini </h1>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">Mini Project Based Learning by our mini PBL team</p>
           </div>
           {!result && !loading && (<div className="hidden md:block bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-blue-600"><Shield size={36} /></div>)}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
           <div className="flex-1 relative group">
             <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><Search size={22} /></div>
             <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste link kamu disini..." 
               className="w-full h-14 md:h-16 pl-14 pr-6 bg-gray-50 dark:bg-[#0a0a0a] rounded-2xl text-gray-900 dark:text-white font-bold focus:bg-white dark:focus:bg-[#121214] border border-gray-200 dark:border-gray-800 focus:border-blue-500 outline-none text-lg transition-colors shadow-sm" 
               onKeyDown={(e) => e.key === 'Enter' && handleScan()} />
           </div>
           <button onClick={handleScan} disabled={loading || !url} 
             className="h-14 md:h-16 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black tracking-wider active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shrink-0 shadow-[0_4px_14px_0_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all text-lg">
             <Search size={22} /> Mulai Scan
           </button>
        </div>
        
        <AnimatePresence>
        {(loading || error) && (
           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-8 flex justify-center overflow-hidden">
             {loading && (
               <div className="flex flex-col items-center gap-4 py-4">
                 <Loader2 className="animate-spin text-blue-600" size={48} />
                 <span className="font-bold text-blue-600 dark:text-blue-400 tracking-[0.2em] text-xs uppercase">Tunggu sebentar ya :D</span>
                 <span className="text-[10px] text-gray-400">Mendeteksi protokol & scanning ancaman</span>
               </div>
             )}
             {error && (
               <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-600 shadow-sm">
                 <XCircle size={24}/> <span className="font-bold">{error}</span>
               </div>
             )}
           </motion.div>
        )}
        </AnimatePresence>
      </motion.div>

      {/* RESULTS SECTION */}
      <AnimatePresence>
      {result && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="space-y-6"
        >
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
             
             {/* LEFT COLUMN */}
             <div className="lg:col-span-2 flex flex-col gap-6">
                {/* 1. SCORE CARD */}
                <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[350px]">
                    <div>
                       <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800">Risk Score</span>
                       <div className="mt-6 flex items-baseline gap-3">
                          <h2 className={`text-7xl md:text-9xl font-black tracking-tighter leading-none ${result.total_scans === 0 ? 'text-gray-400' : (result.reputation >= 80 ? 'text-green-600' : 'text-red-600')}`}>
                              {result.reputation}
                          </h2>
                          <div className="flex flex-col">
                           <span className="text-2xl md:text-4xl text-gray-300 font-black">/100</span>
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trust Level</span>
                          </div>
                       </div>
                       <div className={`mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-bold border text-sm md:text-base shadow-sm ${getStatusColor(result.reputation, result.total_scans)}`}>
                          {result.total_scans === 0 ? <HelpCircle size={20} /> : (result.reputation < 80 ? <AlertTriangle size={20} /> : <CheckCircle size={20} />)}
                          <span>{getRiskLabel(result.reputation, result.total_scans)}</span>
                       </div>
                    </div>
                    
                    {/* VISUAL FORENSICS SLIDER */}
                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800/50">
                       <div className="flex justify-between items-center mb-4">
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visual Forensics (Jalur Redirect)</p>
                           {/* Indikator Angka */}
                           {showPreview && previewList.length > 1 && (
                               <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-500">
                                   {currentImageIndex + 1} / {previewList.length}
                               </span>
                           )}
                       </div>

                       {!showPreview ? (
                           <button onClick={handleLoadPreview} className="w-full h-24 md:h-32 bg-gray-50 dark:bg-[#0a0a0a] border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-blue-50 transition-colors shadow-inner">
                               <Eye size={24} className="text-gray-400"/>
                               <span className="text-xs font-bold text-gray-500">Klik untuk Load Preview (Hemat Data)</span>
                           </button>
                       ) : (
                           <div 
                               className={`relative w-full h-56 md:h-72 bg-gray-100 dark:bg-black/50 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center group ${!previewLoading && !previewError ? 'cursor-pointer hover:border-blue-500 transition-colors' : ''}`}
                               onClick={() => !previewLoading && !previewError && setZoomImage(true)} 
                           >
                               {/* TOMBOL NAVIGASI KIRI */}
                               {previewList.length > 1 && (
                                   <button 
                                           onClick={prevImage}
                                           disabled={currentImageIndex === 0}
                                           className="absolute left-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm transition-all"
                                   >
                                           <ChevronLeft size={20} />
                                   </button>
                               )}

                               {/* TOMBOL NAVIGASI KANAN */}
                               {previewList.length > 1 && (
                                   <button 
                                           onClick={nextImage}
                                           disabled={currentImageIndex === previewList.length - 1}
                                           className="absolute right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm transition-all"
                                   >
                                           <ChevronRight size={20} />
                                   </button>
                               )}

                               {previewLoading && (
                                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] z-10">
                                            <Loader2 className="animate-spin text-blue-500 mb-2" size={32}/>
                                            <span className="text-[10px] font-bold text-gray-400">LOADING STEP {currentImageIndex + 1}...</span>
                                   </div>
                               )}
                               {previewError ? (
                                   <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                            <ImageOff size={48} className="mb-3 opacity-50"/>
                                            <span className="text-xs font-bold">PREVIEW TIDAK TERSEDIA</span>
                                            <span className="text-[10px] mt-1 opacity-70">Server memblokir bot screenshot.</span>
                                   </div>
                               ) : (
                                   <>
                                           <img 
                                               key={currentImageIndex} // Key penting agar react re-render saat index berubah
                                               src={getPreviewUrl(previewList[currentImageIndex].url)} 
                                               alt={`Preview Step ${currentImageIndex + 1}`} 
                                               className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                                               onLoad={() => setPreviewLoading(false)} 
                                               onError={() => { setPreviewLoading(false); setPreviewError(true); }} 
                                           />
                                           
                                           {/* CAPTION PENJELASAN DI DALAM GAMBAR (BAGIAN BAWAH) */}
                                           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-10 text-white">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${currentImageIndex === 0 ? 'bg-blue-500' : (currentImageIndex === previewList.length - 1 ? 'bg-purple-500' : 'bg-gray-600')}`}>
                                                            Step {currentImageIndex + 1}
                                                        </span>
                                                        <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider">
                                                            {currentImageIndex === 0 ? 'Initial Input' : (currentImageIndex === previewList.length - 1 ? 'Final Destination' : 'Redirect Hop')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-mono truncate opacity-90" title={previewList[currentImageIndex].url}>
                                                        {previewList[currentImageIndex].url}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">Status Code: {previewList[currentImageIndex].status}</p>
                                           </div>

                                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white"><Maximize2 size={24}/></div>
                                           </div>
                                   </>
                               )}
                               <button onClick={(e) => { e.stopPropagation(); setShowPreview(false); }} className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors"><X size={18}/></button>
                           </div>
                       )}
                    </div>
                </div>

                {/* 2. REDIRECT TRACE (LIST) */}
                {result.redirects && result.redirects.length > 1 && (
                    <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <button 
                            onClick={() => setShowTrace(!showTrace)}
                            className="w-full flex items-center justify-between group"
                        >
                            <h3 className="font-bold text-sm flex items-center gap-2 text-gray-900 dark:text-white">
                                <GitBranch className="text-purple-500" size={18} /> Detail List Redirect
                                <span className="bg-gray-100 dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-full text-gray-500">{result.redirects.length} Hops</span>
                            </h3>
                            <div className="p-2 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 group-hover:text-blue-600 transition-colors">
                                {showTrace ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>

                        <AnimatePresence>
                        {showTrace && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: "auto", opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }} 
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-4 relative pt-6">
                                    <div className="absolute left-[15px] top-6 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800" />
                                    {result.redirects.map((hop: any, idx: number) => (
                                        <div key={idx} className="relative z-10 flex items-start gap-4">
                                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border shadow-sm ${hop.status >= 300 && hop.status < 400 ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900/30' : (hop.status >= 400 ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-900/30')}`}>
                                                {hop.status}
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1.5 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => { setCurrentImageIndex(idx); setShowPreview(true); }}>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate font-mono" title={hop.url}>{hop.url}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {idx === 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold">INPUT</span>}
                                                    {idx === result.redirects.length - 1 && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 font-bold">FINAL DESTINATION</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                )}
             </div>

             {/* RIGHT COLUMN */}
             <div className="flex flex-col gap-5">
                 <div className="bg-[#111827] dark:bg-black rounded-[2rem] p-8 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800">
                    <h3 className="font-bold text-sm mb-6 flex items-center gap-2"><Shield className="text-blue-500" size={18} /> Threat Analysis</h3>
                    <div className="space-y-3 mb-8">
                       <StatRow label="Malicious" value={result.malicious || 0} color="text-red-400" bg="bg-red-400/10" icon={AlertTriangle} />
                       <StatRow label="Suspicious" value={result.suspicious || 0} color="text-yellow-400" bg="bg-yellow-400/10" icon={AlertTriangle} />
                       <StatRow label="Clean" value={result.harmless || 0} color="text-green-400" bg="bg-green-400/10" icon={CheckCircle} />
                    </div>
                    <button onClick={() => setShowModal(true)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-colors shadow-[0_4px_14px_0_rgba(37,99,235,0.2)]">
                       <Eye size={16} /> VIEW DETAILS
                   </button>
                 </div>

                 <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="font-bold text-sm mb-6 flex items-center gap-2 text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
                       <Briefcase className="text-orange-500" size={18} /> Tentang Domain ini
                    </h3>
                    {result.whois ? (
                       <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
                               <div className={`p-2 rounded-xl ${result.whois.age_days < 30 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}><Clock size={20} /></div>
                               <div><p className="font-black text-gray-900 dark:text-white text-lg">{result.whois.age_days} Hari</p><p className="text-xs font-bold text-gray-500">Umur</p></div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 justify-between group">
                             <div className="flex items-center gap-3 overflow-hidden">
                               <Fingerprint size={16} className="text-gray-400 shrink-0"/>
                               <div className="flex flex-col overflow-hidden">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase">SHA-256</span>
                                   <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400 truncate leading-tight" title={result.sha256}>
                                       {result.sha256 || 'N/A'}
                                   </code>
                               </div>
                             </div>
                             <button 
                               onClick={handleCopyHash}
                               className="p-2 bg-white dark:bg-black/20 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-gray-100 dark:border-gray-700 shadow-sm"
                               title="Copy Hash"
                             >
                               {copiedHash ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
                             </button>
                          </div>

                       </div>
                    ) : <div className="text-center py-4 text-gray-400 text-sm font-bold bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">Whois Hidden</div>}
                 </div>
             </div>
           </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* MODAL DETAIL */}
      <AnimatePresence>
      {showModal && result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white dark:bg-[#121214] w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-gray-800">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 shrink-0 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                 <h3 className="font-black text-xl dark:text-white flex items-center gap-2"><Shield size={20} className="text-blue-500"/> Scan Details</h3>
                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full"><X size={24} className="text-gray-500"/></button>
              </div>
              
              {!selectedDetail && (
                <div className="px-6 pt-4 shrink-0">
                  {/* Container Tab Abu-abu */}
                  <div className="flex p-1 bg-gray-100 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800">
                    {(['malicious', 'harmless', 'undetected'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`
                          flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1.5
                          ${activeFilter === tab
                            ? 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                          }
                        `}
                      >
                        {/* Label Kategori */}
                        {tab}

                        {/* Badge Angka (Counter) */}
                        <span className={`
                          px-1.5 py-0.5 rounded-[5px] text-[10px] leading-none
                          ${activeFilter === tab
                            ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                            : 'bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                          }
                        `}>
                          {result[tab] || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                   {selectedDetail ? (
                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                       <button onClick={() => setSelectedDetail(null)} className="mb-6 text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-colors"><ChevronLeft size={18}/> Back to list</button>
                       <div className="p-8 rounded-[2.5rem] text-center border bg-gray-50 border-gray-100 dark:bg-white/5 dark:border-gray-800 shadow-sm">
                         <h4 className="font-black text-2xl uppercase mb-2 tracking-tight dark:text-white">{selectedDetail.result}</h4>
                         <p className="text-sm font-bold opacity-75 tracking-wider mb-6 dark:text-gray-400">{selectedDetail.engine_name}</p>
                         <div className="p-5 bg-white dark:bg-black/20 rounded-2xl text-sm leading-relaxed font-medium border border-gray-100 dark:border-gray-800 dark:text-gray-300">
                          {getExplanation(selectedDetail.result, selectedDetail.category)}
                         </div>
                       </div>
                     </motion.div>
                   ) : (
                     <div className="space-y-3">
                        {filteredDetails.length > 0 ? filteredDetails.map((item: any, idx: number) => (
                             <button 
                                key={idx} 
                                onClick={() => setSelectedDetail(item)} 
                                className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-colors group shadow-[0_2px_8px_rgb(0,0,0,0.02)] ${getRowStyle(item.category)}`}
                             >
                                <span className="font-bold text-sm flex items-center gap-3 text-gray-900 dark:text-white">
                                    <CheckCircle size={16} className={`text-gray-400 ${item.category === 'malicious' ? 'text-red-500' : (item.category === 'harmless' ? 'text-green-500' : 'text-gray-400')}`}/> 
                                    {item.engine_name}
                                </span>
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white">{item.result}</span>
                             </button>
                        )) : <div className="text-center text-gray-400 py-4 font-bold">No engines data available</div>}
                     </div>
                   )}
              </div>
           </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* --- IMAGE ZOOM MODAL (Updated: Uses current index for zooming) --- */}
      <AnimatePresence>
        {zoomImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setZoomImage(false)}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <img src={getPreviewUrl(previewList[currentImageIndex].url)} alt="Full Preview" className="w-auto h-auto max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/10" />
                    <button onClick={() => setZoomImage(false)} className="absolute -top-12 right-0 md:-right-12 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"><X size={24} /></button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function StatRow({ label, value, color, bg, icon: Icon }: any) {
  return (<div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"><div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${bg} ${color}`}><Icon size={18}/></div><span className="text-sm font-bold text-gray-300">{label}</span></div><span className={`text-xl font-black ${color}`}>{value}</span></div>)
}

// 3. Export menggunakan memo agar component ini tidak di-render ulang jika props/parent berubah
export default memo(ScannerComponent);