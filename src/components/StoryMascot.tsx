import React from 'react';
import { Volume2, Sparkles, Zap, Shield, Rocket } from 'lucide-react';

interface StoryMascotProps {
  mood: 'happy' | 'wandering' | 'curious' | 'surprised' | 'heroic' | 'caring' | 'celebrating';
  speaker: string;
  isSpeaking: boolean;
  onToggleSpeech?: () => void;
  chapterId: string;
}

export const StoryMascot: React.FC<StoryMascotProps> = ({
  mood,
  speaker,
  isSpeaking,
  onToggleSpeech,
}) => {
  const isBrain = mood === 'heroic' || mood === 'caring' || speaker.includes('Não');
  const isPilotLémLỉnh = mood === 'wandering' || speaker.includes('Lém Lỉnh');

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Mascot Avatar Container */}
      <div
        className="relative group cursor-pointer"
        onClick={onToggleSpeech}
        title="Bấm để nghe lại giọng đọc"
      >
        {/* Pulsing Energy Ring when speaking */}
        {isSpeaking && (
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-300 opacity-80 blur-md animate-pulse" />
        )}

        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#0c2c3b] via-[#09222e] to-[#041219] border-2 border-[#00c4b4] p-1 flex items-center justify-center shadow-xl overflow-hidden">
          {/* Character SVG Render */}
          {isBrain ? (
            /* TỔNG CHỈ HUY BÁC NÃO 🧠⚡ (Super Commander with Cool Visor) */
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Electric Aura */}
              <circle cx="50" cy="50" r="46" fill="#be185d" opacity="0.2" className="animate-ping" />
              {/* Red Superhero Cape */}
              <path
                d="M18 55 C 8 75, 10 92, 22 94 C 32 96, 30 75, 34 60 Z"
                fill="#f43f5e"
                className="animate-pulse"
              />
              <path
                d="M82 55 C 92 75, 90 92, 78 94 C 68 96, 70 75, 66 60 Z"
                fill="#e11d48"
                className="animate-pulse"
              />
              {/* Brain Lobes */}
              <path
                d="M50 20 C 36 18, 22 26, 20 42 C 18 55, 26 66, 36 70 C 42 72, 48 70, 50 65 C 52 70, 58 72, 64 70 C 74 66, 82 55, 80 42 C 78 26, 64 18, 50 20 Z"
                fill="#ec4899"
              />
              {/* Brain Wrinkles */}
              <path
                d="M30 35 C 34 40, 40 36, 42 45 M58 45 C 60 36, 66 40, 70 35 M50 22 V 60"
                stroke="#9d174d"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Cool Pilot Cyber Visor */}
              <path
                d="M26 44 Q 50 40, 74 44 Q 72 56, 50 56 Q 28 56, 26 44 Z"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              {/* Visor Glint */}
              <line x1="32" y1="46" x2="44" y2="52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              {/* Confident Smile */}
              <path
                d="M44 63 Q 50 67, 56 63"
                stroke="#831843"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Energy Spark Crown */}
              <polygon points="50,6 53,16 63,16 55,22 58,32 50,26 42,32 45,22 37,16 47,16" fill="#facc15" />
            </svg>
          ) : isPilotLémLỉnh ? (
            /* CƠ PHÓ LÉM LỈNH 🚀 (Mischievous Pilot with Goggles & Winking Eye) */
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Body */}
              <ellipse cx="50" cy="52" rx="42" ry="34" fill="#064e3b" />
              {/* Goggle Strap */}
              <rect x="8" y="44" width="84" height="6" fill="#047857" rx="3" />
              {/* Left Eye (Straight) */}
              <ellipse cx="33" cy="50" rx="14" ry="17" fill="#ffffff" />
              <circle cx="34" cy="50" r="7" fill="#10b981" />
              <circle cx="36" cy="48" r="2.5" fill="#ffffff" />

              {/* Right Eye (Wandering off chasing butterfly!) */}
              <ellipse cx="67" cy="50" rx="14" ry="17" fill="#ffffff" />
              <circle cx="75" cy="56" r="7" fill="#10b981" />
              <circle cx="77" cy="54" r="2.5" fill="#ffffff" />

              {/* Goggle Frames */}
              <ellipse cx="33" cy="50" rx="16" ry="19" fill="none" stroke="#f59e0b" strokeWidth="3" />
              <ellipse cx="67" cy="50" rx="16" ry="19" fill="none" stroke="#f59e0b" strokeWidth="3" />

              {/* Cheeky Smirk */}
              <path
                d="M44 70 Q 52 74, 58 68"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          ) : (
            /* THUYỀN TRƯỞNG CHỚP CHỚP 👁️✨ (Heroic Captain Eye) */
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Body */}
              <ellipse cx="50" cy="52" rx="42" ry="34" fill="#0c4a6e" />
              {/* Space Helmet Dome */}
              <ellipse cx="50" cy="50" rx="46" ry="38" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 2" />

              {/* Left Eye Sclera */}
              <ellipse cx="33" cy="50" rx="14" ry="17" fill="#ffffff" />
              {/* Right Eye Sclera */}
              <ellipse cx="67" cy="50" rx="14" ry="17" fill="#ffffff" />

              {/* Pupils */}
              {mood === 'surprised' ? (
                /* Shocked eyes */
                <>
                  <circle cx="33" cy="48" r="9" fill="#0284c7" />
                  <circle cx="33" cy="48" r="4" fill="#0f172a" />
                  <circle cx="67" cy="48" r="9" fill="#0284c7" />
                  <circle cx="67" cy="48" r="4" fill="#0f172a" />
                  <circle cx="35" cy="45" r="2.5" fill="#ffffff" />
                  <circle cx="69" cy="45" r="2.5" fill="#ffffff" />
                </>
              ) : (
                /* Focused Captain Look */
                <>
                  <circle cx="33" cy="50" r="7" fill="#0284c7" />
                  <circle cx="35" cy="48" r="2.5" fill="#ffffff" />
                  <circle cx="67" cy="50" r="7" fill="#0284c7" />
                  <circle cx="69" cy="48" r="2.5" fill="#ffffff" />
                </>
              )}

              {/* Cheeks */}
              <circle cx="18" cy="62" r="5" fill="#f43f5e" opacity="0.6" />
              <circle cx="82" cy="62" r="5" fill="#f43f5e" opacity="0.6" />

              {/* Mouth */}
              {mood === 'surprised' ? (
                <ellipse cx="50" cy="72" rx="5" ry="6" fill="#0f172a" />
              ) : (
                <path
                  d="M44 68 Q 50 74, 56 68"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          )}

          {/* Sound wave icon when active */}
          {isSpeaking && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-teal-400 text-slate-950 p-1 rounded-full shadow-md animate-bounce">
              <Volume2 className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Speaker Name & Dynamic Status */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide flex items-center gap-1">
            {speaker}
          </span>
          {isSpeaking && (
            <span className="flex items-center gap-0.5 ml-1">
              <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold text-teal-300">
          {isSpeaking ? '🎙️ Đang truyền tin radio... Hãy lắng nghe' : '✅ Đã truyền tin xong · Sẵn sàng tiến quân!'}
        </span>
      </div>
    </div>
  );
};
