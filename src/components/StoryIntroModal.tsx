import React from 'react';
import { RemiCareLogo } from './RemiCareLogo';
import { Sparkles, ArrowRight, Rocket, Shield, Zap, Compass, Eye } from 'lucide-react';

interface StoryIntroModalProps {
  isOpen: boolean;
  onStartAdventure: () => void;
  onSkipToClinical: () => void;
  theme?: 'dark' | 'light';
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({
  isOpen,
  onStartAdventure,
  onSkipToClinical,
  theme,
}) => {
  if (!isOpen) return null;

  const isLight =
    theme === 'light' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'light');

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md animate-fade-in select-none ${
      isLight ? 'bg-slate-900/40' : 'bg-black/85'
    }`}>
      <div className={`relative w-full max-w-xl border-2 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-center space-y-5 ${
        isLight
          ? 'bg-white border-[#00a896] text-slate-800 shadow-slate-400/30'
          : 'bg-gradient-to-b from-[#0a2838] via-[#061822] to-[#041117] border-[#00c4b4] text-slate-100 shadow-2xl'
      }`}>
        {/* Futuristic Laser Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#00c4b4] to-emerald-400" />

        {/* Brand Header */}
        <div className="flex justify-center">
          <RemiCareLogo size={44} textClassName="text-xl" />
        </div>

        {/* Astronaut Mascot Eye Badge */}
        <div className="flex justify-center">
          <div className={`relative p-3.5 rounded-3xl border-2 shadow-xl animate-bounce ${
            isLight
              ? 'bg-gradient-to-br from-teal-50 to-slate-100 border-teal-400 shadow-teal-500/10'
              : 'bg-gradient-to-br from-[#0c3649] to-[#061e2b] border-teal-300 shadow-2xl'
          }`}>
            <span className="text-5xl">🚀👁️⚡👁️🧠</span>
          </div>
        </div>

        {/* Cinematic Briefing Text */}
        <div className="space-y-2.5">
          <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider border ${
            isLight
              ? 'bg-teal-50 text-teal-800 border-teal-300'
              : 'bg-teal-500/20 text-teal-300 border-teal-400/40'
          }`}>
            NHIỆM VỤ ĐẶC BIỆT DÀNH CHO BẠN
          </div>

          <h1 className={`text-lg sm:text-2xl font-black tracking-wide uppercase ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            CHIẾN HẠM THỊ GIÁC: BÍ MẬT HAI ĐÔI MẮT
          </h1>

          <div className="space-y-1.5 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
            <p className={`italic ${isLight ? 'text-teal-800 font-semibold' : 'text-teal-200'}`}>
              "Bạn có muốn thử một chuyến du hành đặc biệt không?"
            </p>
            <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
              Chuyến du hành này không đưa bạn ra ngoài không gian xa xôi...
            </p>
            <p className={`font-extrabold text-sm sm:text-base ${
              isLight ? 'text-amber-700' : 'text-amber-300'
            }`}>
              Nó đưa bạn vào bên trong cách đôi mắt và não bộ của bạn nhìn thế giới!
            </p>
          </div>
        </div>

        {/* 6 Epic Missions Preview */}
        <div className={`border p-3 rounded-2xl grid grid-cols-3 gap-2 text-[10px] sm:text-[11px] font-bold ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-[#041219]/90 border-[#0e3546] text-slate-200'
        }`}>
          <div className={`p-2 rounded-xl border space-y-0.5 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#071d28] border-[#11384b]'
          }`}>
            <span className={`block font-black ${isLight ? 'text-teal-700' : 'text-teal-400'}`}>HỒI 1 & 2</span>
            <span>Phép màu 3D & Mắt lang thang</span>
          </div>
          <div className={`p-2 rounded-xl border space-y-0.5 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#071d28] border-[#11384b]'
          }`}>
            <span className={`block font-black ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>HỒI 3 & 4</span>
            <span>Đứt dây cương & Hố đen Song thị</span>
          </div>
          <div className={`p-2 rounded-xl border space-y-0.5 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#071d28] border-[#11384b]'
          }`}>
            <span className={`block font-black ${isLight ? 'text-pink-600' : 'text-pink-400'}`}>HỒI 5 & 6</span>
            <span>Bác Não cứu nguy & Nhược thị</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onStartAdventure}
            className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-[#00c4b4] to-emerald-400 hover:brightness-110 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl shadow-teal-950/40 ring-4 ring-[#00c4b4]/40 scale-102"
          >
            <span>🚀 BẮT ĐẦU CHUYẾN PHIÊU LƯU VŨ TRỤ</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSkipToClinical}
            className={`text-xs py-1 transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-teal-700' : 'text-slate-400 hover:text-teal-300'
            }`}
          >
            Hoặc chuyển trực tiếp sang Chế độ Phòng Khám Lâm Sàng (Clinical Lab)
          </button>
        </div>
      </div>
    </div>
  );
};
