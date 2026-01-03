import React from 'react';

// Kotak loading abu-abu yang smooth
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-white/5 rounded-3xl ${className}`} />
);

export const ScannerSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      {/* Kartu Utama Besar */}
      <div className="h-64 rounded-[32px] bg-gray-100 dark:bg-white/5 animate-pulse w-full" />
      
      {/* Grid Kecil di bawah */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
};