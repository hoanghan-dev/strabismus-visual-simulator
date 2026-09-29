import React, { useState, useEffect } from 'react';
import {
  ConditionId,
  SimulationParameters,
  CONDITIONS_REGISTRY,
  ConditionInfo,
} from '../types/simulation';
import {
  Camera,
  Image as ImageIcon,
  Eye,
  Glasses,
  RefreshCw,
  Volume2,
  Crosshair,
  ExternalLink,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { medicalAudio } from '../services/medicalAudioService';

interface RightSidebarProps {
  parameters: SimulationParameters;
  onUpdateParameters: (params: Partial<SimulationParameters>) => void;
  onSelectCondition: (conditionId: ConditionId) => void;
  onResetToNormal: () => void;
  onOpenMedicalModal: () => void;
  lang: 'vi' | 'en' | 'km';
  isDarkTheme?: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  parameters,
  onUpdateParameters,
  onSelectCondition,
  onResetToNormal,
  onOpenMedicalModal,
  isDarkTheme = true,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = medicalAudio.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  const currentCondition: ConditionInfo =
    CONDITIONS_REGISTRY[parameters.condition] || CONDITIONS_REGISTRY.normal;

  // Filter conditions by selected tab
  const tabConditions: ConditionInfo[] = Object.values(CONDITIONS_REGISTRY).filter(
    (c) => c.category === parameters.tab
  );

  const handleToggleAudio = () => {
    if (isSpeaking) {
      medicalAudio.stop();
    } else {
      medicalAudio.speakScript(parameters.condition);
    }
  };

  // Theme-aware classes
  const bg = isDarkTheme ? 'bg-[#071922]' : 'bg-white';
  const bgHeader = isDarkTheme ? 'bg-[#05131b]' : 'bg-slate-50';
  const border = isDarkTheme ? 'border-[#0e3546]' : 'border-slate-200';
  const bgCard = isDarkTheme ? 'bg-[#081e2a]' : 'bg-slate-50';
  const bgCard2 = isDarkTheme ? 'bg-[#0a202c]' : 'bg-slate-100';
  const bgCardHover = isDarkTheme ? 'hover:bg-[#0e2a3a]' : 'hover:bg-slate-200';
  const borderCard = isDarkTheme ? 'border-[#11384b]' : 'border-slate-200';
  const textSec = isDarkTheme ? 'text-slate-400' : 'text-slate-500';
  const textPri = isDarkTheme ? 'text-slate-300' : 'text-slate-700';
  const textHover = isDarkTheme ? 'hover:text-slate-200' : 'hover:text-slate-900';
  const bgInput = isDarkTheme ? 'bg-[#05131b]' : 'bg-slate-200';
  const bgFooter = isDarkTheme ? 'bg-[#06151e]' : 'bg-slate-100';

  return (
    <aside className={`w-full lg:w-[400px] xl:w-[440px] shrink-0 ${bg} border-t lg:border-t-0 lg:border-l ${border} flex flex-col h-full overflow-y-auto custom-scrollbar select-none transition-colors duration-300`}>
      {/* Category Tabs Header: RemiCare Clinical Navigation */}
      <div className={`grid grid-cols-3 border-b ${border} ${bgHeader} sticky top-0 z-20 shadow-md`}>
        {(
          [
            { id: 'stages', label: 'GIAI ĐOẠN TIẾN TRIỂN' },
            { id: 'directions', label: 'HƯẾNG LỆCH TRỤC' },
            { id: 'orthoptics', label: 'CHẨN ĐOÁN CHỈNH THỊ' },
          ] as const
        ).map((tab) => {
          const isActive = parameters.tab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onUpdateParameters({ tab: tab.id })}
              className={`py-3.5 px-2 text-[11px] font-bold tracking-wider transition-all border-b-2 text-center leading-tight cursor-pointer ${
                isActive
                  ? 'border-[#00c4b4] text-[#00c4b4] bg-[#00c4b4]/10 shadow-[inset_0_-2px_6px_rgba(0,196,180,0.15)]'
                  : `border-transparent ${textSec} ${textHover} ${isDarkTheme ? 'hover:bg-[#071b24]' : 'hover:bg-slate-100'}`
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 space-y-4">
        {/* Conditions Grid Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {tabConditions.map((cond) => {
            const isSelected = parameters.condition === cond.id;
            return (
              <button
                key={cond.id}
                onClick={() => onSelectCondition(cond.id)}
                className={`p-2.5 rounded-xl text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#00a896] to-[#00897b] text-white font-medium shadow-lg shadow-teal-950/60 ring-2 ring-[#00c4b4]'
                    : `${bgCard2} ${bgCardHover} ${textPri} border ${borderCard} ${isDarkTheme ? 'hover:border-[#1a4a61]' : 'hover:border-slate-300'}`
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  {cond.stageNumber && (
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isSelected ? 'text-teal-100' : 'text-teal-400/80'
                      }`}
                    >
                      {cond.stageNumber}
                    </span>
                  )}
                  {cond.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        isSelected
                          ? 'bg-teal-900/80 text-teal-100'
                          : 'bg-[#06151e] text-slate-400 border border-[#0f3445]'
                      }`}
                    >
                      {cond.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold leading-snug">{cond.name}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Condition Clinical Profile Card */}
        <div className={`bg-gradient-to-b ${isDarkTheme ? 'from-[#0a2330] to-[#081a24] border-[#113e52]' : 'from-teal-50 to-white border-teal-200'} border rounded-2xl p-4 space-y-2 shadow-lg`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00c4b4]" />
              <span>{currentCondition.medicalTitle}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00c4b4]/15 text-[#00c4b4] font-medium border border-[#00c4b4]/30">
              {currentCondition.badge}
            </span>
          </div>

          <p className={`text-xs ${textPri} leading-relaxed font-normal`}>
            {currentCondition.medicalDescription}
          </p>

          <div className={`pt-2 border-t ${border} flex items-center justify-between text-[11px]`}>
            <span className={textSec}>Tình trạng dung hợp:</span>
            <span
              className={`font-semibold ${
                currentCondition.id === 'normal'
                  ? 'text-emerald-400'
                  : currentCondition.id === 'early_strabismus'
                  ? 'text-teal-300'
                  : currentCondition.id === 'suppression'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {currentCondition.id === 'normal' && 'Dung hợp 100% (Stereopsis)'}
              {currentCondition.id === 'early_strabismus' && 'Vận nhãn bù trừ 100%'}
              {currentCondition.id === 'clear_strabismus' && 'Chớm mất bù (Decompensation)'}
              {currentCondition.id === 'diplopia' && 'Mất dung hợp (Song thị 50/50)'}
              {currentCondition.id === 'suppression' && 'Ức chế vỏ não triệt tiêu song thị'}
              {currentCondition.id === 'esotropia' && 'Song thị đồng danh (Uncrossed)'}
              {currentCondition.id === 'exotropia' && 'Song thị bắt chéo (Crossed)'}
              {currentCondition.id === 'hypertropia' && 'Song thị đứng (Ảnh thấp)'}
              {currentCondition.id === 'hypotropia' && 'Song thị đứng (Ảnh cao)'}
              {currentCondition.id === 'alternating' && 'Luân phiên 2 mắt'}
              {currentCondition.id === 'cover_test' && 'Khảo sát định thị'}
              {currentCondition.id === 'hirschberg' && 'Đo quang học 1mm ≈ 7° ≈ 15Δ'}
            </span>
          </div>
        </div>

        {/* KIẾN THỨC Y KHOA Card */}
        <div className={`${bgCard} border ${border} rounded-2xl p-4 space-y-2.5 shadow-md`}>
          <div className="text-[11px] font-bold text-teal-400 tracking-wider uppercase flex items-center justify-between">
            <span>KIẾN THỨC Y KHOA REMICARE</span>
            <button
              onClick={onOpenMedicalModal}
              className="text-[10px] text-teal-300 hover:text-teal-100 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Tài liệu AAO</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <p className={`text-xs ${textPri} leading-relaxed`}>
            {currentCondition.pathophysiology}
          </p>

          <div className="text-[11px] text-amber-300/95 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed flex items-start gap-1.5">
            <span className="text-amber-400 shrink-0 font-bold">💡</span>
            <span>{currentCondition.clinicalNote}</span>
          </div>

          {/* Audio Lecture Button in Sidebar */}
          <div className={`pt-2 border-t ${border}`}>
            <button
              onClick={handleToggleAudio}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isSpeaking
                  ? 'bg-rose-500/20 text-rose-200 border border-rose-500/50 animate-pulse'
                  : 'bg-[#00c4b4]/15 hover:bg-[#00c4b4]/25 text-[#00c4b4] border border-[#00c4b4]/40'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#00c4b4]" />
              <span>
                {isSpeaking
                  ? 'Đang phát thuyết minh (Bấm để Dừng)'
                  : 'Phát Thuyết Minh Giọng Nói Y Khoa'}
              </span>
            </button>
          </div>
        </div>

        {/* CÀI ĐẶT MÔ PHỎNG Card */}
        <div className={`${bgCard} border ${border} rounded-2xl p-4 space-y-3.5 shadow-md`}>
          <div className="text-[11px] font-bold text-teal-400 tracking-wider uppercase flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#00c4b4]" />
            <span>CÀI ĐẶT MÔ PHỎNG THỊ GIÁC</span>
          </div>

          {/* Display Mode: Live Camera vs Sample Scene */}
          <div className="space-y-1.5">
            <span className={`text-[11px] ${textPri} block font-semibold`}>
              Nguồn hình ảnh hiển thị:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateParameters({ imageSource: 'camera' })}
                className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  parameters.imageSource === 'camera'
                    ? 'bg-[#00a896] text-white shadow-md shadow-teal-950/60 font-semibold'
                    : `${bgCard2} ${bgCardHover} ${textSec} ${textHover} border ${borderCard}`
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera Của Bạn</span>
              </button>

              <button
                onClick={() => onUpdateParameters({ imageSource: 'sample_scene' })}
                className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  parameters.imageSource === 'sample_scene'
                    ? 'bg-[#00a896] text-white shadow-md shadow-teal-950/60 font-semibold'
                    : `${bgCard2} ${bgCardHover} ${textSec} ${textHover} border ${borderCard}`
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Ảnh Mẫu Phòng</span>
              </button>
            </div>
          </div>

          {/* Interactive Cover-Uncover Test Controls */}
          <div className={`space-y-2 pt-2 border-t ${border}`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`${textPri} font-semibold flex items-center gap-1.5`}>
                <Eye className="w-3.5 h-3.5 text-[#00c4b4]" />
                <span>Nghiệm pháp Che mắt (Cover Test):</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'none', label: 'Mở 2 mắt (None)' },
                  { id: 'cover_left', label: 'Che Mắt Trái (OS)' },
                  { id: 'cover_right', label: 'Che Mắt Phải (OD)' },
                  { id: 'alternate_cover', label: '🔄 Che Luân Phiên' },
                ] as const
              ).map((cov) => (
                <button
                  key={cov.id}
                  onClick={() => onUpdateParameters({ coverState: cov.id })}
                  className={`py-2 px-2 rounded-xl text-xs transition-all text-center cursor-pointer ${
                    parameters.coverState === cov.id
                      ? 'bg-[#00c4b4]/25 border border-[#00c4b4] text-teal-100 font-semibold shadow-sm'
                      : `${bgCard2} ${bgCardHover} ${textSec} border ${borderCard}`
                  }`}
                >
                  {cov.label}
                </button>
              ))}
            </div>
            <div className={`text-[10px] ${textSec} ${bgFooter} p-2 rounded-xl border ${border} leading-normal`}>
              {parameters.coverState === 'alternate_cover' ? (
                <span className="text-amber-300 font-medium">
                  🔄 Che luân phiên: Tấm che tự động hoán đổi giữa 2 mắt để phá vỡ hoàn toàn dung hợp nhị nhãn.
                </span>
              ) : parameters.coverState !== 'none' ? (
                <span className="text-teal-300 font-medium">
                  ● Đang đặt tấm che nhãn khoa: Quan sát chuyển động giật định thị (Refixation saccade) của mắt còn lại trên camera.
                </span>
              ) : (
                <span>Cả hai mắt cùng mở: Hệ thống dung hợp đang phối hợp tạo ảnh đơn.</span>
              )}
            </div>
          </div>

          {/* Phản xạ ánh sáng Giác mạc (Hirschberg Test) Toggle */}
          <div className={`pt-2 border-t ${border} space-y-1.5`}>
            <button
              onClick={() =>
                onUpdateParameters({
                  showHirschbergOverlay: !parameters.showHirschbergOverlay,
                })
              }
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                parameters.showHirschbergOverlay
                  ? 'bg-[#00c4b4]/20 text-teal-200 border border-[#00c4b4]/60'
                  : `${bgCard2} ${bgCardHover} ${textPri} border ${borderCard}`
              }`}
            >
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#00c4b4]" />
                <span>Thước đo Phản xạ Giác mạc (Hirschberg)</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  parameters.showHirschbergOverlay
                    ? 'bg-[#00c4b4]/30 text-teal-100'
                    : `${bgFooter} ${textSec}`
                }`}
              >
                {parameters.showHirschbergOverlay ? 'ĐANG BẬT' : 'TắT'}
              </span>
            </button>
            <div className={`text-[10px] ${textSec} px-1`}>
              Chiếu đèn đồng trục để định lượng: 1mm lệch ≈ 7° ≈ 15Δ Lăng kính.
            </div>
          </div>

          {/* Mắt lệch (Deviating Eye Selector) */}
          <div className={`space-y-1.5 pt-2 border-t ${border}`}>
            <span className={`text-[11px] ${textPri} block font-semibold`}>
              Mắt bị lệch trục (Deviating Eye):
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'right', label: 'Mắt Phải (OD)' },
                  { id: 'left', label: 'Mắt Trái (OS)' },
                  { id: 'alternating', label: 'Luân phiên' },
                ] as const
              ).map((eyeOpt) => (
                <button
                  key={eyeOpt.id}
                  onClick={() => onUpdateParameters({ deviatingEye: eyeOpt.id })}
                  className={`py-1.5 px-1 rounded-xl text-xs text-center transition-all cursor-pointer ${
                    parameters.deviatingEye === eyeOpt.id
                      ? 'bg-[#00c4b4]/25 border border-[#00c4b4] text-teal-100 font-semibold'
                      : `${bgCard2} ${bgCardHover} ${textSec} border ${borderCard}`
                  }`}
                >
                  {eyeOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Direction Selector */}
          <div className={`space-y-1.5 pt-2 border-t ${border}`}>
            <span className={`text-[11px] ${textPri} block font-semibold`}>
              Hướng lệch trục (Phân loại lâm sàng):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'esotropia', label: 'Lác trong (ET)', sub: 'Hội tụ · Song thị đồng danh' },
                  { id: 'exotropia', label: 'Lác ngoài (XT)', sub: 'Phân kỳ · Song thị chéo' },
                  { id: 'hypertropia', label: 'Lác đứng trên (HT)', sub: 'Lệch lên · Song thị dọc' },
                  { id: 'hypotropia', label: 'Lác đứng dưới (HoT)', sub: 'Lệch xuống · Song thị dọc' },
                ] as const
              ).map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => onUpdateParameters({ direction: dir.id })}
                  className={`p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                    parameters.direction === dir.id
                      ? 'bg-[#00c4b4]/25 border border-[#00c4b4] text-teal-100 font-semibold shadow-sm'
                      : `${bgCard2} ${bgCardHover} ${textSec} border ${borderCard}`
                  }`}
                >
                  <div className={`font-semibold ${isDarkTheme ? 'text-slate-200' : 'text-slate-700'}`}>{dir.label}</div>
                  <div className={`text-[10px] ${textSec} truncate`}>{dir.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fine Tuning Sliders */}
          <div className={`space-y-3 pt-2 border-t ${border}`}>
            {/* Deviation Angle */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={textPri}>Độ lệch trục nhãn cầu:</span>
                <span className="font-mono text-[#00c4b4] font-semibold">
                  {parameters.deviation}% (~{Math.round(parameters.deviation * 0.45)} Δ)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={parameters.deviation}
                onChange={(e) => onUpdateParameters({ deviation: Number(e.target.value) })}
                className={`w-full h-1.5 ${bgInput} rounded-lg appearance-none cursor-pointer accent-[#00c4b4]`}
              />
            </div>

            {/* Perceived Diplopia Offset */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className={`${textPri} font-medium`}>Khoảng cách tách đôi ảnh (Song thị):</span>
                <span className="font-mono text-rose-400 font-bold tabular-nums">
                  {parameters.diplopiaOffset}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={parameters.diplopiaOffset}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  let updatedCondition = parameters.condition;
                  if (parameters.condition === 'clear_strabismus' || parameters.condition === 'diplopia' || parameters.condition === 'normal') {
                    if (val === 0) {
                      updatedCondition = 'normal';
                    } else if (val <= 25) {
                      updatedCondition = 'clear_strabismus';
                    } else {
                      updatedCondition = 'diplopia';
                    }
                  }
                  onUpdateParameters({
                    diplopiaOffset: val,
                    condition: updatedCondition,
                  });
                }}
                className={`w-full h-2 ${bgInput} rounded-lg appearance-none cursor-pointer accent-rose-500`}
              />
              <div className={`flex justify-between text-[10px] ${textSec} font-mono`}>
                <span>0% (Đơn ảnh 👤)</span>
                <span>15% (Lệch rõ)</span>
                <span>32% (Song thị chuẩn)</span>
                <span>100% (Tách rộng)</span>
              </div>
            </div>

            {/* Cortical Suppression */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={textPri}>Mức độ ức chế vỏ não (Suppression):</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {parameters.suppression}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={parameters.suppression}
                onChange={(e) => onUpdateParameters({ suppression: Number(e.target.value) })}
                className={`w-full h-1.5 ${bgInput} rounded-lg appearance-none cursor-pointer accent-amber-500`}
              />
            </div>
          </div>

          {/* Orthoptic Tools Toggles */}
          <div className={`space-y-2 pt-2 border-t ${border}`}>
            <button
              onClick={() =>
                onUpdateParameters({ redCyanDisparityAid: !parameters.redCyanDisparityAid })
              }
              className={`w-full p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                parameters.redCyanDisparityAid
                  ? 'bg-rose-950/40 border border-rose-500/60 text-rose-200'
                  : `${bgCard2} ${bgCardHover} ${textPri} border ${borderCard}`
              }`}
            >
              <span className="flex items-center gap-2">
                <Glasses className="w-4 h-4 text-rose-400" />
                <span>Kính Đỏ/Xanh (Worth 4-Dot Filter)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded ${bgFooter} font-mono`}>
                {parameters.redCyanDisparityAid ? 'BẬT' : 'TắT'}
              </span>
            </button>

            <button
              onClick={() =>
                onUpdateParameters({ showHirschbergOverlay: !parameters.showHirschbergOverlay })
              }
              className={`w-full p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                parameters.showHirschbergOverlay
                  ? 'bg-[#00c4b4]/25 border border-[#00c4b4] text-teal-100'
                  : `${bgCard2} ${bgCardHover} ${textPri} border ${borderCard}`
              }`}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00c4b4]" />
                <span>Phản xạ Giác mạc (Hirschberg Guide)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded ${bgFooter} font-mono`}>
                {parameters.showHirschbergOverlay ? 'BẬT' : 'TắT'}
              </span>
            </button>
          </div>

          {/* Reset button */}
          <div className="pt-2">
            <button
              onClick={onResetToNormal}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-teal-100 hover:text-white bg-[#00a896]/20 hover:bg-[#00a896]/35 border border-[#00a896]/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#00c4b4]" />
              <span>Đặt lại về Chính thị (Bình thường)</span>
            </button>
          </div>
        </div>

        {/* Footer Credit & Medical Note */}
        <div className={`text-[11px] ${textSec} leading-relaxed px-1`}>
          Nền tảng RemiCare mô phỏng quang học thị giác và lác mắt dựa trên giáo trình BCSC của Hiệp hội Nhãn khoa Hoa Kỳ (AAO).
        </div>
      </div>
    </aside>
  );
};
