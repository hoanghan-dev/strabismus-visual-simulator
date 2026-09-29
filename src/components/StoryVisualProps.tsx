import React, { useState } from 'react';
import { StoryChapterId } from '../types/story';
import {
  Sparkles,
  Star,
  Hand,
  CheckCircle2,
  Zap,
  ShieldAlert,
  Trophy,
} from 'lucide-react';

interface StoryVisualPropsProps {
  chapterId: StoryChapterId;
  isSpeaking: boolean;
  onInteract?: (type: string) => void;
}

export const StoryVisualProps: React.FC<StoryVisualPropsProps> = ({
  chapterId,
  onInteract,
}) => {
  const [gemCountAnswer, setGemCountAnswer] = useState<number | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [brainZapActive, setBrainZapActive] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden p-3 select-none">
      {/* ==================== CHAPTER 1: SLEEK TOP-RIGHT 3D GEM HUD ⭐ ==================== */}
      {chapterId === 'ch1' && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-6 flex flex-col items-end pointer-events-auto max-w-[94vw]">
          <div className="bg-[#061822]/95 backdrop-blur-md border border-[#00c4b4] px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2.5">
            {/* Mini 3D Gem Avatar */}
            <div className="relative p-1 bg-amber-400/20 border border-amber-300 rounded-full flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-amber-300 text-yellow-100 animate-pulse" />
            </div>

            <span className="text-xs font-bold text-slate-100 hidden sm:inline">
              Khóa mục tiêu:
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setGemCountAnswer(1);
                  onInteract?.('gem_1');
                }}
                className={`px-2.5 py-0.5 text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md ${
                  gemCountAnswer === 1
                    ? 'bg-gradient-to-r from-[#00c4b4] to-emerald-400 text-slate-950 ring-2 ring-white scale-105'
                    : 'bg-[#0a202c] text-teal-200 hover:bg-[#0e2a3a] border border-[#11384b]'
                }`}
              >
                👉 Đúng 1 Viên (3D)
              </button>
              <button
                onClick={() => {
                  setGemCountAnswer(2);
                  onInteract?.('gem_2');
                }}
                className={`px-2 py-0.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                  gemCountAnswer === 2
                    ? 'bg-rose-500 text-white'
                    : 'bg-[#0a202c] text-slate-400 hover:bg-[#0e2a3a] border border-[#11384b]'
                }`}
              >
                2 Viên
              </button>
            </div>
          </div>

          {gemCountAnswer === 1 && (
            <div className="mt-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/90 px-3 py-0.5 rounded-full border border-emerald-400 shadow-md flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chính xác 100%! Hai mắt hội tụ hoàn hảo tạo chiều sâu 3D!</span>
            </div>
          )}
        </div>
      )}

      {/* ==================== CHAPTER 2: TOP-RIGHT NEON BUTTERFLY 🦋 ==================== */}
      {chapterId === 'ch2' && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-6 pointer-events-auto">
          <div className="p-2 px-3 rounded-2xl bg-[#071922]/90 border border-teal-400/70 shadow-xl backdrop-blur-md flex items-center gap-2 animate-pulse">
            <span className="text-2xl animate-bounce">🦋✨</span>
            <div className="text-left">
              <div className="text-[11px] font-extrabold text-amber-300">Bướm Thiên Hà xuất hiện!</div>
              <div className="text-[10px] text-teal-200">
                Mắt phải liếc nhẹ · Cơ nhãn cầu giật lại giữ 1 ảnh đơn!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CHAPTER 3: TOP-RIGHT SLIM RED ALERT RADAR ⚠️ ==================== */}
      {chapterId === 'ch3' && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-6 pointer-events-auto max-w-xs">
          <div className="bg-[#1f0a10]/95 border border-rose-500/80 px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md text-center flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px] uppercase tracking-wide truncate">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">CẢNH BÁO: LỆCH TRỤC!</span>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
              Chớm mất bù
            </span>
          </div>
        </div>
      )}

      {/* ==================== CHAPTER 4: BOTTOM-CENTER DIPLOPIA BANNER 👤👤 & HAND PROMPT ✋ ==================== */}
      {chapterId === 'ch4' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto space-y-1.5 z-20 max-w-[92vw]">
          <div className="bg-gradient-to-r from-rose-600/90 via-amber-500/90 to-rose-600/90 text-white font-extrabold text-[11px] sm:text-xs px-4 py-1 rounded-full shadow-xl tracking-wider uppercase border border-white/40 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>🚨 HỐ ĐEN SONG THỊ: MỘT VẬT — HAI HÌNH ẢNH! 🚨</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          </div>

          <div className="bg-[#071922]/95 border border-amber-400/80 px-3.5 py-1.5 rounded-full shadow-xl backdrop-blur-md flex items-center gap-2.5">
            <Hand className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
            <span className="text-[11px] text-slate-100">
              Hãy giơ bàn tay lên trước camera! Bạn thấy <strong className="text-amber-300">2 bàn tay (✋  ✋)</strong> cùng lúc!
            </span>
            <button
              onClick={() => setHandRaised(!handRaised)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                handRaised ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950'
              }`}
            >
              {handRaised ? '✓ Thấy 2 tay' : 'Thử ngay'}
            </button>
          </div>
        </div>
      )}

      {/* ==================== CHAPTER 5: BOTTOM-CENTER BRAIN ZAP HUD 🧠⚡ ==================== */}
      {chapterId === 'ch5' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto max-w-lg w-full px-3 z-20">
          <div className="bg-[#071922]/95 border border-emerald-400 px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">🧠⚡</span>
              <span className="text-[11px] font-bold text-emerald-300 truncate">
                Bác Não dập tắt ảnh phụ: 👤 👤 ➔ 👤 (Hồi phục 1 ảnh đơn!)
              </span>
            </div>
            <button
              onClick={() => {
                setBrainZapActive(true);
                setTimeout(() => setBrainZapActive(false), 2000);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all shrink-0 ${
                brainZapActive ? 'bg-amber-400 text-slate-950 scale-105' : 'bg-emerald-600 text-white'
              }`}
            >
              <Zap className="w-3 h-3 inline mr-1" />
              <span>{brainZapActive ? 'Đã dập tắt!' : 'Cắt cầu dao'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== CHAPTER 6: BOTTOM-CENTER AMBLYOPIA WINDOW COMPARISON 🪟 ==================== */}
      {chapterId === 'ch6' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto max-w-lg w-full px-3 z-20">
          <div className="bg-[#071922]/95 border border-[#00c4b4] px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-300 font-bold">🪟 Tàu A (Mắt lành): 4K Siêu Nét 🌳</span>
            </div>
            <span className="text-slate-400">vs</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-300 font-bold">🪟 Tàu B (Nhược thị): Mờ Sương 🌫️</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ENDING: BOTTOM-CENTER CELEBRATION TROPHY 🏆 ==================== */}
      {chapterId === 'ending' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto max-w-md w-full px-3 z-20">
          <div className="bg-gradient-to-r from-[#092f42] via-[#061e2b] to-[#041117] border border-yellow-400 px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center justify-center gap-2 text-xs font-bold text-yellow-300 animate-bounce">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>HUÂN CHƯƠNG CHIẾN HẠM: HAI MẮT — MỘT THẾ GIỚI 🌎</span>
          </div>
        </div>
      )}
    </div>
  );
};
