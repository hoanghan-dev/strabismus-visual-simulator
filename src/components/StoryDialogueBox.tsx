import React, { useState, useRef, useEffect } from 'react';
import { StoryChapter } from '../types/story';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Scaling,
} from 'lucide-react';

interface StoryDialogueBoxProps {
  currentChapter: StoryChapter;
  isSpeaking: boolean;
  hasFinishedAudio: boolean;
  onNextChapter: () => void;
  onPrevChapter?: () => void;
  onReplayAudio: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  theme?: 'dark' | 'light';
}

export const StoryDialogueBox: React.FC<StoryDialogueBoxProps> = ({
  currentChapter,
  isSpeaking,
  hasFinishedAudio,
  onNextChapter,
  onPrevChapter,
  onReplayAudio,
  onToggleMute,
  isMuted,
  theme,
}) => {
  // Free resizable dimensions: default to exact screenshot proportions (width: 260px, height: 520px)
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 260,
    height: 520,
  });

  // Minimizable toggle: collapse/expand
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Theme detection with reactive DOM observer fallback
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>(() => {
    if (theme) return theme;
    if (typeof document !== 'undefined') {
      const docTheme = document.documentElement.getAttribute('data-theme');
      if (docTheme === 'light' || docTheme === 'dark') return docTheme;
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      const docTheme = document.documentElement.getAttribute('data-theme');
      if (docTheme === 'light' || docTheme === 'dark') {
        setCurrentTheme(docTheme);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => observer.disconnect();
  }, []);

  const isLight = currentTheme === 'light';

  // Resize handler for bottom-right corner and edges
  const handlePointerDown = (
    e: React.PointerEvent,
    direction: 'both' | 'horizontal' | 'vertical'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.width;
    const startH = size.height;

    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      setSize((prev) => {
        let newW = prev.width;
        let newH = prev.height;

        if (direction === 'both' || direction === 'horizontal') {
          const maxAllowedWidth = Math.min(window.innerWidth - 32, 850);
          newW = Math.max(250, Math.min(maxAllowedWidth, startW + deltaX));
        }

        if (direction === 'both' || direction === 'vertical') {
          const maxAllowedHeight = Math.min(window.innerHeight - 80, 750);
          newH = Math.max(190, Math.min(maxAllowedHeight, startH + deltaY));
        }

        return { width: Math.round(newW), height: Math.round(newH) };
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      style={{
        width: isMinimized ? 'auto' : `${size.width}px`,
        maxWidth: '92vw',
      }}
      className="pointer-events-auto select-none transition-[width] duration-75 relative"
    >
      <div
        style={{
          height: isMinimized ? 'auto' : `${size.height}px`,
        }}
        className={`backdrop-blur-xl border-2 rounded-3xl shadow-2xl relative flex flex-col justify-between overflow-hidden transition-[height] duration-75 ${
          isLight
            ? 'bg-white/95 border-[#00a896] text-slate-800 shadow-slate-300/40'
            : 'bg-[#051620]/95 border-[#00c4b4] text-slate-100 shadow-2xl'
        } ${
          isDragging
            ? isLight
              ? 'ring-2 ring-teal-500 select-none shadow-teal-500/30'
              : 'ring-2 ring-teal-300 select-none shadow-teal-500/30'
            : ''
        }`}
      >
        {/* Glowing Top Sci-Fi Energy Beam */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-[#00c4b4] to-emerald-400 shrink-0" />

        {/* MINIMIZED MODE: Compact badge */}
        {isMinimized ? (
          <div className="p-2.5 px-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">
                {currentChapter.speakerRole === 'commander' ? '🧠⚡' : '👁️✨'}
              </span>
              <div className="min-w-0">
                <span className={`text-xs font-black truncate block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currentChapter.dialogueSpeaker}
                </span>
                <span className={`text-[10px] truncate block ${isLight ? 'text-teal-700 font-bold' : 'text-teal-300'}`}>
                  {isSpeaking ? 'Đang truyền tin...' : 'Đã xong'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onNextChapter}
                className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#00a896] text-white cursor-pointer shadow-sm hover:brightness-105"
              >
                Tiếp ➔
              </button>

              <button
                onClick={() => setIsMinimized(false)}
                className={`p-1 rounded-lg border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
                    : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-300 hover:text-white border-[#11384b]'
                }`}
                title="Mở rộng khung truyện"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* RESIZABLE CARD: Header + Scrollable Dialogue Middle + Bottom Action Bar */
          <div className="p-3 sm:p-3.5 flex flex-col justify-between h-full min-h-0 overflow-hidden">
            {/* Top Row: Speaker Avatar + Information + Controls */}
            <div className={`flex items-start justify-between gap-2 pb-2 border-b shrink-0 ${
              isLight ? 'border-slate-200' : 'border-[#0e3546]'
            }`}>
              {/* Speaker with Avatar */}
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-9 h-9 rounded-2xl border p-1 flex items-center justify-center shrink-0 shadow-md ${
                  isLight
                    ? 'bg-gradient-to-br from-teal-50 to-slate-100 border-[#00a896]'
                    : 'bg-gradient-to-br from-[#0c2c3b] to-[#041219] border-[#00c4b4]'
                }`}>
                  <span className="text-lg">
                    {currentChapter.speakerRole === 'commander' ? '🧠' : '👁️'}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className={`text-xs sm:text-sm font-black tracking-wide truncate flex items-center gap-1 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <span className="truncate">{currentChapter.dialogueSpeaker}</span>
                  </div>
                  <div className={`text-[10px] font-bold truncate flex items-center gap-1 ${
                    isLight ? 'text-teal-700' : 'text-teal-300'
                  }`}>
                    {isSpeaking ? (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full animate-ping shrink-0 ${
                          isLight ? 'bg-teal-600' : 'bg-teal-400'
                        }`} />
                        <span>Đang truyền tin radio...</span>
                      </>
                    ) : (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isLight ? 'bg-emerald-600' : 'bg-emerald-400'
                        }`} />
                        <span className={isLight ? 'text-emerald-700 font-bold' : ''}>Đã truyền tin xong!</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                <button
                  onClick={onReplayAudio}
                  className={`p-1.5 rounded-lg border cursor-pointer transition-colors shadow-sm ${
                    isLight
                      ? 'text-teal-700 bg-slate-100 hover:bg-teal-50 border-slate-200 hover:border-teal-300'
                      : 'text-teal-200 bg-[#0a2736] hover:bg-[#0f3448] border-[#13445a]'
                  }`}
                  title="Nghe lại đàm thoại"
                >
                  <RotateCcw className={`w-3 h-3 ${isLight ? 'text-teal-700' : 'text-teal-300'}`} />
                </button>

                <button
                  onClick={onToggleMute}
                  className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                    isMuted
                      ? isLight
                        ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      : isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      : 'bg-[#0a2736] border-[#13445a] text-slate-300 hover:text-white'
                  }`}
                  title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className={`w-3.5 h-3.5 ${isLight ? 'text-[#00897b]' : 'text-[#00c4b4]'}`} />
                  )}
                </button>

                <button
                  onClick={() => setIsMinimized(true)}
                  className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                    isLight
                      ? 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
                      : 'text-slate-400 hover:text-white bg-[#0a202c] border-[#11384b]'
                  }`}
                  title="Thu gọn khung truyện"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Section: Scrollable Dialogue Bubble + Interactive Challenge */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar my-2 pr-1 space-y-2">
              <div className={`p-2.5 rounded-2xl border space-y-1.5 ${
                isLight
                  ? 'bg-slate-50 border-slate-200 shadow-sm'
                  : 'bg-[#031017]/90 border-[#0e3546] shadow-inner'
              }`}>
                <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                  isLight ? 'text-slate-800' : 'text-slate-100'
                }`}>
                  "{currentChapter.dialogueQuote}"
                </p>

                {currentChapter.interactiveChallenge && (
                  <div className={`p-2 rounded-xl border flex items-start gap-1.5 text-[11px] font-medium leading-snug ${
                    isLight
                      ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-xs'
                      : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                  }`}>
                    <span className="shrink-0">🎯</span>
                    <span>
                      {currentChapter.interactiveChallenge.promptText}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section: Guidance Beacon + Full Width Launch Button */}
            <div className={`pt-2 border-t space-y-1.5 shrink-0 ${
              isLight ? 'border-slate-200' : 'border-[#0e3546]'
            }`}>
              {/* Guidance Message */}
              <div className="text-[10px] sm:text-[11px] text-center min-h-[16px] truncate">
                {hasFinishedAudio ? (
                  <span className={`font-extrabold flex items-center justify-center gap-1 animate-pulse py-0.5 px-2 rounded-lg border truncate ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-400/40'
                  }`}>
                    <Sparkles className={`w-3 h-3 shrink-0 animate-spin ${
                      isLight ? 'text-amber-500' : 'text-yellow-300'
                    }`} />
                    <span className="truncate">Đã xong! Bấm nút để tiếp tục!</span>
                  </span>
                ) : isSpeaking ? (
                  <span className={`font-semibold truncate block ${
                    isLight ? 'text-teal-700' : 'text-teal-300'
                  }`}>
                    🎙️ Lắng nghe radio từ chiến hạm...
                  </span>
                ) : (
                  <span className={`font-medium truncate block ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Bấm nút bên dưới để tiếp tục.
                  </span>
                )}
              </div>

              {/* Launch & Back Buttons */}
              <div className="flex items-center gap-1.5">
                {currentChapter.prevChapterId && onPrevChapter && (
                  <button
                    onClick={onPrevChapter}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-0.5 shrink-0 ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
                        : 'bg-[#0a202c] hover:bg-[#0e2a3a] border-[#11384b] text-slate-300 hover:text-white'
                    }`}
                    title="Quay lại hồi trước"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Trước</span>
                  </button>
                )}

                <button
                  onClick={onNextChapter}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg min-w-0 ${
                    hasFinishedAudio
                      ? 'bg-gradient-to-r from-amber-400 via-[#00c4b4] to-emerald-400 text-slate-950 ring-2 ring-amber-300/80 shadow-teal-500/50 animate-pulse'
                      : 'bg-gradient-to-r from-[#00a896] to-[#00897b] hover:from-[#00b4a0] hover:to-[#009b8c] text-white'
                  }`}
                >
                  <span className="truncate">{currentChapter.buttonNextLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== RESIZE HANDLES ==================== */}
        {!isMinimized && (
          <>
            {/* Right edge resize strip */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'horizontal')}
              className={`absolute top-0 right-0 w-2.5 h-full cursor-ew-resize transition-colors z-20 touch-none ${
                isLight ? 'hover:bg-teal-500/20 active:bg-teal-500/30' : 'hover:bg-teal-400/20 active:bg-teal-400/30'
              }`}
              title="Kéo sang ngang để chỉnh độ rộng"
            />

            {/* Bottom edge resize strip */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'vertical')}
              className={`absolute bottom-0 left-0 w-full h-2.5 cursor-ns-resize transition-colors z-20 touch-none ${
                isLight ? 'hover:bg-teal-500/20 active:bg-teal-500/30' : 'hover:bg-teal-400/20 active:bg-teal-400/30'
              }`}
              title="Kéo xuống dưới để chỉnh chiều cao"
            />

            {/* Bottom-Right Corner Grab Handle (Diagonal Grip Dots) */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'both')}
              className={`absolute bottom-1 right-1 w-5 h-5 flex items-center justify-center cursor-nwse-resize transition-all z-30 touch-none select-none ${
                isLight
                  ? 'text-teal-600 hover:text-amber-600 hover:scale-110 active:text-amber-700'
                  : 'text-teal-400/70 hover:text-amber-300 hover:scale-110 active:text-amber-400'
              }`}
              title="Kéo góc này để tùy ý co giãn kích thước khung truyện"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" className="fill-current drop-shadow">
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="10" cy="6" r="1.5" />
                <circle cx="6" cy="10" r="1.5" />
                <circle cx="10" cy="2" r="1.5" />
                <circle cx="6" cy="6" r="1.5" />
                <circle cx="2" cy="10" r="1.5" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
