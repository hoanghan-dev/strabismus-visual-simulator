import React from 'react';
import { StoryChapterId, STORY_CHAPTERS } from '../types/story';
import {
  Sparkles,
  Camera,
  CheckCircle,
  Play,
  Sliders,
  Radio,
  Zap,
  X,
} from 'lucide-react';
import { SimulationParameters } from '../types/simulation';

interface StorySidebarProps {
  currentChapterId: StoryChapterId;
  onSelectChapter: (id: StoryChapterId) => void;
  onSwitchToClinicalMode: () => void;
  parameters: SimulationParameters;
  onUpdateParameters: (params: Partial<SimulationParameters>) => void;
  onCloseSidebar?: () => void;
  theme?: 'dark' | 'light';
}

export const StorySidebar: React.FC<StorySidebarProps> = ({
  currentChapterId,
  onSelectChapter,
  onSwitchToClinicalMode,
  parameters,
  onUpdateParameters,
  onCloseSidebar,
  theme,
}) => {
  const chaptersList = Object.values(STORY_CHAPTERS);
  const currentChapter = STORY_CHAPTERS[currentChapterId];

  const isLight =
    theme === 'light' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'light');

  return (
    <aside
      className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l flex flex-col h-full overflow-y-auto custom-scrollbar select-none ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#071922] border-[#0e3546] text-slate-100'
      }`}
    >
      {/* Top Banner: Story Adventure Mode */}
      <div
        className={`p-3.5 border-b flex items-center justify-between ${
          isLight
            ? 'bg-gradient-to-r from-teal-500/15 via-teal-400/10 to-white border-slate-200'
            : 'bg-gradient-to-r from-[#00897b]/30 via-[#00c4b4]/20 to-[#071922] border-[#0e3546]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl animate-pulse ${
            isLight ? 'bg-teal-50 text-teal-700' : 'bg-[#00c4b4]/20 text-[#00c4b4]'
          }`}>
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span>CHIẾN HẠM THỊ GIÁC</span>
              <span className={`text-[10px] px-1.5 rounded font-mono ${
                isLight ? 'bg-teal-100 text-teal-800 font-bold' : 'bg-teal-500/20 text-teal-300'
              }`}>
                REMICARE
              </span>
            </div>
            <div className={`text-[10px] font-semibold ${
              isLight ? 'text-teal-700' : 'text-teal-300'
            }`}>
              Hành trình phiêu lưu 6 hồi kịch tính
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Switch to Clinical Lab Button */}
          <button
            onClick={onSwitchToClinicalMode}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-teal-800 border-slate-300'
                : 'text-teal-200 bg-[#0a202c] hover:bg-[#0f2e3d] border-[#11384b] hover:border-[#00c4b4]/60'
            }`}
            title="Chuyển sang chế độ khảo sát lâm sàng đầy đủ"
          >
            <Sliders className={`w-3.5 h-3.5 ${isLight ? 'text-teal-700' : 'text-[#00c4b4]'}`} />
            <span className="hidden sm:inline">Bản Lâm Sàng</span>
          </button>

          {/* Close Sidebar Toggle Button */}
          {onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300'
                  : 'text-slate-400 hover:text-white bg-[#0a202c] hover:bg-[#0f2e3d] border-[#11384b]'
              }`}
              title="Đóng bảng điều khiển"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Missions Progress Tracker */}
        <div className="space-y-1.5">
          <div className={`text-[11px] font-black uppercase tracking-wider mb-2 flex items-center justify-between ${
            isLight ? 'text-teal-800' : 'text-teal-400'
          }`}>
            <span>NHẬT KÝ HÀNH TRÌNH KHÔNG GIAN</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              isLight
                ? 'text-amber-800 bg-amber-50 border-amber-200 font-bold'
                : 'text-amber-300 bg-amber-500/15 border-amber-500/30'
            }`}>
              Hồi {currentChapter.order} / 7
            </span>
          </div>

          <div className="space-y-1.5">
            {chaptersList.map((chap) => {
              const isCurrent = chap.id === currentChapterId;
              const isPast = chap.order < currentChapter.order;

              return (
                <button
                  key={chap.id}
                  onClick={() => onSelectChapter(chap.id)}
                  className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white font-bold shadow-lg shadow-teal-950/60 ring-2 ring-[#00c4b4] scale-101'
                      : isLight
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs'
                      : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-300 border border-[#11384b]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-mono font-black shrink-0 ${
                        isCurrent
                          ? 'bg-white text-teal-950 shadow-sm'
                          : isPast
                          ? isLight
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isLight
                          ? 'bg-slate-100 text-slate-500 border border-slate-300'
                          : 'bg-[#05131b] text-slate-400 border border-[#0e3546]'
                      }`}
                    >
                      {chap.chapterNumber || (chap.id === 'intro' ? '🚀' : '🏆')}
                    </span>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate leading-tight ${
                        isCurrent ? 'text-white' : isLight ? 'text-slate-900' : 'text-slate-100'
                      }`}>
                        {chap.title}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isCurrent
                            ? 'text-teal-100'
                            : isLight
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {chap.medicalCode}
                      </div>
                    </div>
                  </div>

                  {/* Indicator Icon */}
                  {isCurrent ? (
                    <Play className="w-3.5 h-3.5 text-white shrink-0 fill-current animate-pulse" />
                  ) : isPast ? (
                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Mission Intelligence Card */}
        <div className={`border-2 rounded-2xl p-4 space-y-2.5 shadow-xl ${
          isLight
            ? 'bg-slate-50 border-teal-500/30 text-slate-800 shadow-slate-200/50'
            : 'bg-[#081e2a] border-[#00c4b4]/40 text-slate-100 shadow-xl'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-amber-700' : 'text-amber-300'
            }`}>
              <Zap className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`} />
              <span>{currentChapter.badge}</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              isLight
                ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold'
                : 'bg-[#00c4b4]/15 text-[#00c4b4] border-[#00c4b4]/30'
            }`}>
              {currentChapter.medicalCode}
            </span>
          </div>

          {currentChapter.visualSchematic && (
            <div className={`p-2.5 rounded-xl border font-mono text-[11px] font-bold text-center tracking-wide ${
              isLight
                ? 'bg-white border-slate-200 text-amber-800 shadow-xs'
                : 'bg-[#041117] border-[#0e3546] text-amber-300'
            }`}>
              {currentChapter.visualSchematic}
            </div>
          )}

          <div className={`p-2.5 rounded-xl border space-y-1 ${
            isLight
              ? 'bg-white border-slate-200 shadow-xs'
              : 'bg-[#051620] border-[#0e3546]'
          }`}>
            <div className={`text-[10px] font-bold uppercase ${
              isLight ? 'text-teal-700' : 'text-teal-300'
            }`}>
              Lời thoại từ {currentChapter.dialogueSpeaker}:
            </div>
            <p className={`text-xs leading-relaxed font-medium italic ${
              isLight ? 'text-slate-800' : 'text-slate-200'
            }`}>
              "{currentChapter.dialogueQuote}"
            </p>
          </div>

          {currentChapter.interactiveChallenge?.actionHint && (
            <div className={`text-[11px] p-2.5 rounded-xl border leading-relaxed flex items-start gap-2 ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <span className={`font-bold shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>💡</span>
              <span className="font-medium">{currentChapter.interactiveChallenge.actionHint}</span>
            </div>
          )}
        </div>

        {/* Mission Footer */}
        <div className={`text-[11px] leading-relaxed px-1 text-center font-medium ${
          isLight ? 'text-slate-500' : 'text-slate-400'
        }`}>
          🚀 Chiến Hạm Thị Giác RemiCare — Mô phỏng giáo dục tương tác lâm sàng nhãn khoa qua Camera trực tiếp.
        </div>
      </div>
    </aside>
  );
};
