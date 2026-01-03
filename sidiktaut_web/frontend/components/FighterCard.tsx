import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface FighterCardProps {
  title: string;
  icon: LucideIcon;
  stats: string;
  pros: string[];
  cons?: string[];
  link: string;
  colorClass: string;
  onNavigate?: () => void;
}

export const FighterCard: React.FC<FighterCardProps> = ({ 
  title, icon: Icon, stats, pros, onNavigate
}) => {
  return (
    <div 
      onClick={onNavigate}
      className="group relative overflow-hidden rounded-[32px] p-8 cursor-pointer transition-all duration-300 glass-panel hover:scale-[1.02] hover:shadow-2xl hover:bg-white/80 dark:hover:bg-white/10"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
          <Icon size={32} />
        </div>
        <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">
          <ArrowUpRight size={20} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">{stats}</p>

      <div className="space-y-2">
        {pros.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};