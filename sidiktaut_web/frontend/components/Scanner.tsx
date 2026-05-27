import { useState, useMemo, useEffect, memo } from 'react';
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

// Terima props onModalChange dari App.tsx
function ScannerComponent({ onModalChange }: any) {
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

  // STATE CAROUSEL INDEX
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [showTrace, setShowTrace] = useState(false);
  const [result, setResult] = useState<ScanResponse | any>(null);

  // Logika: Kirim sinyal ke App saat modal dibuka/tutup
  useEffect(() => {
    if (onModalChange) {
      onModalChange(showModal);
    }
  }, [showModal, onModalChange]);

  // MEMBUAT LIST GAMBAR DARI REDIRECTS
  const previewList = useMemo(() => {
    if (!result) return [];
    // Jika ada redirects, gunakan list itu. kalau kosong, gunakan URL utama aja.
    if (result.redirects && result.redirects.length > 0) {
      return result.redirects;
    }
    return [{ url: result.url, status: 'Final' }];
  }, [result]);

  // RESET INDEX SAAT HASIL BARU MUNCUL
  useEffect(() => {
    if (result) setCurrentImageIndex(0);
  }, [result]);
  // Fungsi scan url, cek link kosong atau ada karakter aneh (regex) , Validasi format url
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
    setCurrentImageIndex(0);

    try {
      const data = await scanUrl(url);

      if (data.status === 'pending') {
        setError('Link baru terdeteksi. Silakan klik "Mulai Scan" lagi dalam 5 detik.');
      } else {
        setResult(data);
        if (data.url) setUrl(data.url);
        const initialTab = data.total_scans === 0 ? 'undetected' : (data.malicious > 0 ? 'malicious' : 'harmless');
        setActiveFilter(initialTab);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'GAGAL TERSAMBUNG (Cek Backend)');
    } finally {
      setLoading(false);
    }
  };

  // Hash 256 copy
  const handleCopyHash = () => {
    if (result?.sha256) {
      navigator.clipboard.writeText(result.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  // Penjelasan berdasarkan kategori
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

  const threatScore = useMemo(() => {
    if (!result || result.total_scans === 0) return 0;
    // Asumsi: setiap malicious flag bernilai 15 poin bahaya, suspicious bernilai 5 poin
    const score = (result.malicious * 15) + (result.suspicious * 5);
    return Math.min(score, 100);
  }, [result]);

  const getStatusColor = (score: number, totalScans: number) => {
    return 'text-gray-900 bg-gray-100 border-gray-200 dark:bg-white/10 dark:text-white dark:border-gray-700';
  };

  const getRiskLabel = (threat: number, totalScans: number) => {
    if (totalScans === 0) return 'UNVERIFIED / UNKNOWN';
    if (threat === 0) return 'PERFECTLY SAFE';
    if (threat < 30) return 'SUSPICIOUS';
    return 'CRITICAL THREAT';
  };

  const getRowStyle = (category: string) => {
    return "bg-white dark:bg-transparent border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white";
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

  // Navslid (Navigation Slide)
  const nextImage = (e: any) => {
    e.stopPropagation();
    if (currentImageIndex < previewList.length - 1) {
      setPreviewLoading(true); // Tampilkan loader (loading) saat ganti
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = (e: any) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setPreviewLoading(true); // Tampilkan loader (loading) saat ganti
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="w-full relative">
      {/* INPUT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className={`bg-transparent pt-4 pb-4 md:pt-6 md:pb-8 ${result ? 'mb-8' : 'mb-0'}`}
      >
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Sidik Scan </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">Mini Project Based Learning by our team</p>
          </div>
          {!result && !loading && (<div className="hidden md:block bg-gray-50 dark:bg-[#0a0a0a] p-4 rounded-3xl text-gray-900 dark:text-white"><Shield size={36} /></div>)}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><Search size={22} /></div>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste link kamu disini..."
              className="w-full h-14 md:h-16 pl-14 pr-6 bg-white dark:bg-[#0a0a0a] rounded-full text-gray-900 dark:text-white font-mono focus:bg-white dark:focus:bg-[#0a0a0a] border-none focus:outline-none text-lg transition-all shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
              onKeyDown={(e) => e.key === 'Enter' && handleScan()} />
          </div>
          <button onClick={handleScan} disabled={loading || !url}
            className="h-14 md:h-16 px-8 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-full font-bold tracking-wider active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shrink-0 shadow-none border-none transition-all text-lg">
            <Search size={22} /> SCAN
          </button>
        </div>

        <AnimatePresence>
          {(loading || error) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-8 flex justify-center overflow-hidden">
              {loading && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <Loader2 className="animate-spin text-gray-900 dark:text-white" size={48} />
                  <span className="font-bold text-gray-900 dark:text-white tracking-[0.2em] text-xs uppercase">Tunggu sebentar ya</span>
                  <span className="text-[10px] text-gray-400">Mendeteksi protokol & scanning ancaman</span>
                </div>
              )}
              {error && (
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-gray-800 flex items-center gap-3 text-gray-900 dark:text-white shadow-sm">
                  <XCircle size={24} /> <span className="font-bold">{error}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bagian Hasil cek link*/}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">

              {/* Kolom Kiri */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Skor link (contoh 90/100) */}
                <div className="bg-gray-50 md:bg-gray-50/80 dark:bg-[#121214] md:dark:bg-[#0a0a0a] rounded-[32px] p-6 md:p-8 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-sm border-l-2 border-gray-200 dark:border-gray-700">Tingkat Bahaya (Threat Level)</span>
                    <div className="mt-6 flex items-baseline gap-3">
                      <h2 className={`text-7xl md:text-9xl font-mono font-bold tracking-tighter leading-none ${result.total_scans === 0 ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {threatScore}
                      </h2>
                      <div className="flex flex-col">
                        <span className="text-2xl md:text-4xl text-gray-300 dark:text-gray-600 font-mono font-bold">/100</span>
                        <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">THREAT SCORE</span>
                      </div>
                    </div>
                    <div className={`mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm md:text-base text-gray-900 bg-gray-100 border-gray-200 dark:bg-white/10 dark:text-white dark:border-gray-700`}>
                      {result.total_scans === 0 ? <HelpCircle size={20} /> : (threatScore > 0 ? <AlertTriangle size={20} /> : <CheckCircle size={20} />)}
                      <span>{getRiskLabel(threatScore, result.total_scans)}</span>
                    </div>
                  </div>

                  {/* Slider Preview gambar dari link*/}
                  <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800/50">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visual Forensics (Jalur Redirect)</p>
                      {/* Indikator Angka */}
                      {showPreview && previewList.length > 1 && (
                        <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-sm text-gray-500 font-mono">
                          {currentImageIndex + 1} / {previewList.length}
                        </span>
                      )}
                    </div>

                    {!showPreview ? (
                      <button onClick={handleLoadPreview} className="w-full h-24 md:h-32 bg-white dark:bg-[#0a0a0a] rounded-[24px] flex flex-col items-center justify-center gap-3 hover:bg-gray-100 dark:hover:bg-[#1c1c1e] transition-colors">
                        <Eye size={24} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500">Klik untuk Load Preview (Hemat Data)</span>
                      </button>
                    ) : (
                      <div
                        className={`relative w-full h-56 md:h-72 bg-white dark:bg-[#0a0a0a] rounded-[24px] overflow-hidden flex items-center justify-center group ${!previewLoading && !previewError ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                        onClick={() => !previewLoading && !previewError && setZoomImage(true)}
                      >
                        {/* Tombol nav kiri */}
                        {previewList.length > 1 && (
                          <button
                            onClick={prevImage}
                            disabled={currentImageIndex === 0}
                            className="absolute left-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-sm disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-none transition-all border border-gray-700"
                          >
                            <ChevronLeft size={20} />
                          </button>
                        )}

                        {/* Tombol nav kanan */}
                        {previewList.length > 1 && (
                          <button
                            onClick={nextImage}
                            disabled={currentImageIndex === previewList.length - 1}
                            className="absolute right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-sm disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-none transition-all border border-gray-700"
                          >
                            <ChevronRight size={20} />
                          </button>
                        )}

                        {previewLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] z-10">
                            <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                            <span className="text-[10px] font-bold text-gray-400">LOADING STEP {currentImageIndex + 1}...</span>
                          </div>
                        )}
                        {previewError ? (
                          <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                            <ImageOff size={48} className="mb-3 opacity-50" />
                            <span className="text-xs font-bold">PREVIEW TIDAK TERSEDIA</span>
                            <span className="text-[10px] mt-1 opacity-70">Server memblokir bot screenshot.</span>
                          </div>
                        ) : (
                          <>
                            <img
                              key={currentImageIndex} // Key agar react re-render saat index berubah
                              src={getPreviewUrl(previewList[currentImageIndex].url)}
                              alt={`Preview Step ${currentImageIndex + 1}`}
                              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 will-change-transform"
                              onLoad={() => setPreviewLoading(false)}
                              onError={() => { setPreviewLoading(false); setPreviewError(true); }}
                              loading="lazy"
                            />

                            {/* Caption penjelasan di gambar preview (BAGIAN BAWAH) */}
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
                              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white"><Maximize2 size={24} /></div>
                            </div>
                          </>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setShowPreview(false); }} className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-sm backdrop-blur-none transition-colors border border-gray-700"><X size={18} /></button>
                      </div>
                    )}
                  </div>
                </div>

                {/* List Hop (dari trace redirect link) */}
                {result.redirects && result.redirects.length > 1 && (
                  <div className="bg-gray-50 md:bg-gray-50/80 dark:bg-[#121214] md:dark:bg-[#0a0a0a] rounded-[32px] p-6 md:p-8">
                    <button
                      onClick={() => setShowTrace(!showTrace)}
                      className="w-full flex items-center justify-between group"
                    >
                      <h3 className="font-bold text-sm flex items-center gap-2 text-gray-900 dark:text-white">
                        <GitBranch className="text-gray-900 dark:text-white" size={18} /> Detail List Redirect
                        <span className="bg-gray-100 dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded-sm text-gray-500 font-mono">{result.redirects.length} Hops</span>
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
                                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border shadow-sm bg-gray-100 text-gray-900 border-gray-200 dark:bg-white/10 dark:text-white dark:border-white/20">
                                  {hop.status}
                                </div>
                                <div className="flex-1 min-w-0 pt-1.5 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => { setCurrentImageIndex(idx); setShowPreview(true); }}>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate font-mono" title={hop.url}>{hop.url}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {idx === 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold">INPUT</span>}
                                    {idx === result.redirects.length - 1 && <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white font-bold">FINAL DESTINATION</span>}
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

              {/* Kolom Kanan */}
              {/* Berisi Kotak hitam analisis ancaman dan detail dari link */}
              <div className="flex flex-col gap-5">
                <div className="bg-[#121214] dark:bg-[#0a0a0a] rounded-[32px] p-6 md:p-8 text-white">
                  <h3 className="font-bold text-sm mb-6 flex items-center gap-2"><Shield className="text-white" size={18} /> Analisis Ancaman</h3>
                  <div className="space-y-3 mb-8">
                    <StatRow label="Malicious" value={result.malicious || 0} color="text-white" bg="bg-white/10" icon={AlertTriangle} />
                    <StatRow label="Suspicious" value={result.suspicious || 0} color="text-white" bg="bg-white/10" icon={AlertTriangle} />
                    <StatRow label="Clean" value={result.harmless || 0} color="text-white" bg="bg-white/10" icon={CheckCircle} />
                  </div>
                  <button onClick={() => setShowModal(true)} className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xs flex items-center justify-center gap-3 transition-colors active:scale-95">
                    <Eye size={16} /> Lihat Detail
                  </button>
                </div>

                {/* Bagian tentang Domain (whois) dan Hash SHA-256*/}
                <div className="bg-gray-50 md:bg-gray-50/80 dark:bg-[#121214] md:dark:bg-[#0a0a0a] rounded-[32px] p-6 md:p-8">
                  <h3 className="font-bold text-sm mb-6 flex items-center gap-2 text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
                    <Briefcase className="text-gray-900 dark:text-white" size={18} /> Tentang Domain ini
                  </h3>
                  {result.whois ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50/80 dark:bg-black/20 rounded-2xl border border-gray-100/50 dark:border-white/5">
                        <div className="p-2 rounded-xl bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"><Clock size={20} /></div>
                        <div><p className="font-black text-gray-900 dark:text-white text-lg">{result.whois.age_days} Hari</p><p className="text-xs font-bold text-gray-500">Umur</p></div>
                      </div>

                      <div className="bg-gray-50/80 dark:bg-black/20 p-4 rounded-2xl border border-gray-100/50 dark:border-white/5 flex items-center gap-3 justify-between group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Fingerprint size={16} className="text-gray-400 shrink-0" />
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">SHA-256</span>
                            <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400 truncate leading-tight" title={result.sha256}>
                              {result.sha256 || 'N/A'}
                            </code>
                          </div>
                        </div>
                        <button
                          onClick={handleCopyHash}
                          className="p-2 bg-white dark:bg-[#2c2c2e] rounded-xl border border-gray-100 dark:border-white/5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-white transition-all shadow-sm active:scale-95"
                          title="Copy Hash"
                        >
                          {copiedHash ? <Check size={14} className="text-gray-900 dark:text-white" /> : <Copy size={14} />}
                        </button>
                      </div>

                    </div>
                  ) : <div className="text-center py-4 text-gray-400 text-sm font-bold bg-gray-50 dark:bg-white/5 rounded-sm border border-dashed border-gray-200 dark:border-gray-800">Whois Hidden</div>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bagian dalam Lihat Detail */}
      <AnimatePresence>
        {showModal && result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white dark:bg-[#1c1c1e] w-full max-w-xl rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgb(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-white/5">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 shrink-0 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 className="font-black text-xl dark:text-white flex items-center gap-2"><Shield size={20} className="text-gray-900 dark:text-white" /> Detail Analisis</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full"><X size={24} className="text-gray-500" /></button>
              </div>

              {!selectedDetail && (
                <div className="px-6 pt-4 shrink-0">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-[#0a0a0a] rounded-sm border-2 border-gray-100 dark:border-gray-800">
                    {(['malicious', 'harmless', 'undetected'] as const).map((tab) => (
                      <button key={tab} onClick={() => setActiveFilter(tab)} className={`py-2 rounded-sm text-[10px] md:text-xs font-bold capitalize transition-all flex flex-col md:flex-row items-center justify-center gap-1 ${activeFilter === tab ? 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white shadow-none' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        {tab} <span className={`px-1.5 py-0.5 rounded-none text-[10px] leading-none ${activeFilter === tab ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'bg-gray-200 dark:bg-white/5 text-gray-500 dark:border-gray-400'}`}>{result[tab] || 0}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {selectedDetail ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <button onClick={() => setSelectedDetail(null)} className="mb-6 text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-colors"><ChevronLeft size={18} /> Back to list</button>
                    <div className="p-8 rounded-sm text-center border-2 bg-gray-50 border-gray-100 dark:bg-white/5 dark:border-gray-800 shadow-none">
                      <h4 className="font-black text-2xl uppercase mb-2 tracking-tight dark:text-white">{selectedDetail.result}</h4>
                      <p className="text-sm font-bold opacity-75 tracking-wider mb-6 dark:text-gray-400 font-mono">{selectedDetail.engine_name}</p>
                      <div className="p-5 bg-white dark:bg-black/20 rounded-sm text-sm leading-relaxed font-medium border-2 border-gray-100 dark:border-gray-800 dark:text-gray-300">
                        {getExplanation(selectedDetail.result, selectedDetail.category)}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {filteredDetails.length > 0 ? filteredDetails.map((item: any, idx: number) => (
                      <button key={idx} onClick={() => setSelectedDetail(item)} className={`w-full p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-left flex justify-between items-center transition-all hover:bg-gray-50 dark:hover:bg-black/20 group shadow-sm hover:shadow-md ${getRowStyle(item.category)}`}>
                        <span className="font-bold text-sm flex items-center gap-3 text-gray-900 dark:text-white">
                          <CheckCircle size={16} className={`text-gray-400 ${item.category === 'malicious' ? 'text-red-500' : (item.category === 'harmless' ? 'text-green-500' : 'text-gray-400')}`} /> {item.engine_name}
                        </span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white">{item.result}</span>
                      </button>
                    )) : <div className="text-center text-gray-400 py-4 font-bold">Tidak ada data</div>}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom gambar preview*/}
      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setZoomImage(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img src={getPreviewUrl(previewList[currentImageIndex].url)} alt="Full Preview" className="w-auto h-auto max-w-full max-h-[85vh] rounded-sm shadow-2xl border-2 border-white/10" />
              <button onClick={() => setZoomImage(false)} className="absolute -top-12 right-0 md:-right-12 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"><X size={24} /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function StatRow({ label, value, color, bg, icon: Icon }: any) {
  return (<div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 shadow-sm"><div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${bg} ${color}`}><Icon size={18} /></div><span className="text-sm font-bold text-gray-300 font-mono">{label}</span></div><span className={`text-xl font-mono font-black ${color}`}>{value}</span></div>)
}
export default memo(ScannerComponent);