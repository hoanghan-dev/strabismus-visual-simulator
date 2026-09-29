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
  Brain,
  X,
} from 'lucide-react';
import { medicalAudio } from '../services/medicalAudioService';

interface RightSidebarProps {
  parameters: SimulationParameters;
  onUpdateParameters: (params: Partial<SimulationParameters>) => void;
  onSelectCondition: (conditionId: ConditionId) => void;
  onResetToNormal: () => void;
  onOpenMedicalModal: () => void;
  lang: 'vi' | 'en' | 'km';
  onSwitchToStoryMode?: () => void;
  onCloseSidebar?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  parameters,
  onUpdateParameters,
  onSelectCondition,
  onResetToNormal,
  onOpenMedicalModal,
  onSwitchToStoryMode,
  onCloseSidebar,
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

  return (
    <aside className="w-full lg:w-[400px] xl:w-[440px] shrink-0 bg-[#071922] border-t lg:border-t-0 lg:border-l border-[#0e3546] flex flex-col h-full overflow-y-auto custom-scrollbar select-none">
      {/* Top Action Bar with Switch Mode and Close Sidebar */}
      <div className="p-2 px-3 bg-[#05131b] border-b border-[#0e3546] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onSwitchToStoryMode && (
            <button
              onClick={onSwitchToStoryMode}
              className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold text-slate-950 bg-gradient-to-r from-[#00c4b4] to-emerald-400 hover:brightness-110 transition-all cursor-pointer shadow-sm flex items-center gap-1"
            >
              <span>👁️✨ Chơi Cốt Truyện</span>
            </button>
          )}
        </div>

        {onCloseSidebar && (
          <button
            onClick={onCloseSidebar}
            className="p-1.5 px-2 rounded-xl text-slate-300 hover:text-white bg-[#0a202c] hover:bg-[#0f2e3d] border border-[#11384b] transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Đóng bảng điều khiển"
          >
            <X className="w-4 h-4" />
            <span>Đóng bảng</span>
          </button>
        )}
      </div>

      {/* Category Tabs Header: RemiCare Clinical Navigation */}
      <div className="grid grid-cols-3 border-b border-[#0e3546] bg-[#05131b] sticky top-0 z-20 shadow-md">
        {(
          [
            { id: 'stages', label: 'GIAI ĐOẠN TIẾN TRIỂN' },
            { id: 'directions', label: 'HƯỚNG LỆCH TRỤC' },
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
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#071b24]'
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
                    : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-300 border border-[#11384b] hover:border-[#1a4a61]'
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
        <div className="bg-gradient-to-b from-[#0a2330] to-[#081a24] border border-[#113e52] rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00c4b4]" />
              <span>{currentCondition.medicalTitle}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00c4b4]/15 text-[#00c4b4] font-medium border border-[#00c4b4]/30">
              {currentCondition.badge}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {currentCondition.medicalDescription}
          </p>

          <div className="pt-2 border-t border-[#0e3546] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Tình trạng dung hợp:</span>
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
              {currentCondition.id === 'amblyopia' && 'Mất thị giác 3D · Mắt khỏe bù trừ'}
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
        <div className="bg-[#081e2a] border border-[#0e3546] rounded-2xl p-4 space-y-2.5 shadow-md">
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

          {currentCondition.id === 'amblyopia' ? (
            <div className="space-y-2.5 pt-1 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-[#05131b] border border-[#0e3546] space-y-1">
                <div className="font-bold text-amber-300 text-[11px] flex items-center gap-1.5">
                  <span>👓 Mờ nhòe không thể bù trừ hoàn toàn bằng kính</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Người bệnh nhìn vật thể bị thiếu chi tiết, đường nét không sắc gọn. Đeo kính cận/loạn đúng độ chỉ giúp ảnh hội tụ đúng võng mạc, nhưng vùng não tiếp nhận không phân giải được hình ảnh chi tiết.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#05131b] border border-[#0e3546] space-y-1.5">
                <div className="font-bold text-teal-300 text-[11px] flex items-center gap-1.5">
                  <span>📐 Mất hoặc suy giảm cảm nhận chiều sâu (Stereopsis / Thị giác 3D)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Do hai mắt không phối hợp nhịp nhàng để tạo nên thị giác hai mắt đồng thời, não không thể căn chỉnh khoảng cách chuẩn xác. Người bệnh gặp khó khăn khi:
                </p>
                <ul className="text-[10px] text-slate-400 space-y-1 pl-3 list-disc">
                  <li>Bắt bóng, đánh cầu lông hoặc bóng bàn.</li>
                  <li>Bước xuống bậc thang hoặc bước qua chướng ngại vật (dễ bước hụt).</li>
                  <li>Rót nước vào miệng ly, đỗ xe hoặc luồn kim.</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-[#05131b] border border-[#0e3546] space-y-1">
                <div className="font-bold text-sky-300 text-[11px] flex items-center gap-1.5">
                  <span>🔤 Hiện tượng chen chúc (Crowding Phenomenon)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Đặc trưng kinh điển của nhược thị: Người bệnh có thể đọc được một chữ cái đứng đơn độc trên bảng đo, nhưng khi chữ cái đó nằm trong một từ hoặc một hàng ngang dày đặc chữ, các ký tự sẽ bị rối, dính chùm vào nhau và không thể nhận diện được.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#05131b] border border-[#0e3546] space-y-1">
                <div className="font-bold text-rose-300 text-[11px] flex items-center gap-1.5">
                  <span>🌓 Giảm độ nhạy tương phản (Contrast Sensitivity)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Hình ảnh qua mắt nhược thị thường bị nhạt màu, phẳng (flat), giảm sự tách bạch giữa các mảng sáng - tối. Người bệnh nhìn kém rõ rệt khi trời chập choạng tối, trong điều kiện sương mù hoặc ánh sáng chói.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/30 space-y-1.5">
                <div className="font-bold text-teal-300 text-[11px]">
                  👁️‍🗨️ Sự khác biệt khi nhìn một mắt và hai mắt
                </div>
                <div className="text-[10px] text-slate-300 space-y-1 leading-relaxed">
                  <p>
                    <strong className="text-white">● Khi mở cả hai mắt:</strong> Não tự động ưu tiên lấy dữ liệu từ mắt khỏe, nên người bệnh sinh hoạt gần như bình thường và nhiều khi không nhận ra một mắt của mình đang nhìn rất kém.
                  </p>
                  <p>
                    <strong className="text-amber-300">● Khi che mắt lành lại:</strong> Mắt nhược thị buộc phải làm việc độc lập. Lúc này người bệnh sẽ thấy hình ảnh rung nhẹ, mờ đục, định vị vật thể chậm và cảm giác không gian xung quanh thiếu tính ổn định.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentCondition.pathophysiology}
              </p>

              <div className="text-[11px] text-amber-300/95 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed flex items-start gap-1.5">
                <span className="text-amber-400 shrink-0 font-bold">💡</span>
                <span>{currentCondition.clinicalNote}</span>
              </div>
            </>
          )}

          {/* Audio Lecture Button in Sidebar */}
          <div className="pt-2 border-t border-[#0e3546]">
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

        {/* MÔ PHỎNG THỊ GIÁC HAI MẮT (BINOCULAR VISION) Card */}
        <div className="bg-[#081e2a] border border-[#0e3546] rounded-2xl p-4 space-y-3 shadow-md">
          <div className="text-[11px] font-bold text-teal-400 tracking-wider uppercase flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#00c4b4]" />
              <span>MÔ PHỎNG THỊ GIÁC HAI MẮT</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
              Góc nhìn thứ nhất
            </span>
          </div>

          {/* Eye Occlusion Mode: Both Eyes vs Cover Left vs Cover Right */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-300 block font-semibold">
              Trạng thái Mắt quan sát:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onUpdateParameters({ eyeOcclusionMode: 'both' })}
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                  parameters.eyeOcclusionMode === 'both'
                    ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md ring-1 ring-teal-300'
                    : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 border border-[#11384b]'
                }`}
              >
                <span>👀 Cả 2 mắt</span>
              </button>

              <button
                onClick={() => onUpdateParameters({ eyeOcclusionMode: 'left_covered' })}
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                  parameters.eyeOcclusionMode === 'left_covered'
                    ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md ring-1 ring-teal-300'
                    : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 border border-[#11384b]'
                }`}
              >
                <span>👁️❌ Che trái</span>
              </button>

              <button
                onClick={() => onUpdateParameters({ eyeOcclusionMode: 'right_covered' })}
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                  parameters.eyeOcclusionMode === 'right_covered'
                    ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md ring-1 ring-teal-300'
                    : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 border border-[#11384b]'
                }`}
              >
                <span>👁️❌ Che phải</span>
              </button>
            </div>
          </div>

          {/* Brain Response Mode - Enabled when condition has potential visual misalignment */}
          {parameters.condition !== 'normal' && parameters.condition !== 'early_strabismus' ? (
            <div className="space-y-1.5 pt-2 border-t border-[#0e3546]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-amber-300" />
                  <span>Phản ứng của Não (Brain Response):</span>
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono">
                  {(parameters.brainResponseMode ?? (parameters.condition === 'suppression' || parameters.condition === 'amblyopia' ? 'suppression' : 'diplopia')) === 'diplopia'
                    ? 'Nhìn đôi'
                    : 'Não ức chế'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onUpdateParameters({ brainResponseMode: 'diplopia' })}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                    (parameters.brainResponseMode ?? (parameters.condition === 'suppression' || parameters.condition === 'amblyopia' ? 'suppression' : 'diplopia')) === 'diplopia'
                      ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-sm ring-1 ring-amber-400/60'
                      : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 border border-[#11384b]'
                  }`}
                >
                  👤👤 Nhìn đôi (Song thị)
                </button>
                <button
                  onClick={() => onUpdateParameters({ brainResponseMode: 'suppression' })}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                    (parameters.brainResponseMode ?? (parameters.condition === 'suppression' || parameters.condition === 'amblyopia' ? 'suppression' : 'diplopia')) === 'suppression'
                      ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-200 shadow-sm ring-1 ring-emerald-400/60'
                      : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 border border-[#11384b]'
                  }`}
                >
                  🧠👤 Não thích nghi (Ức chế)
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 bg-[#05131b]/60 px-2.5 py-1.5 rounded-xl border border-[#0e3546]">
              ℹ️ Ở giai đoạn {parameters.condition === 'normal' ? 'Chính thị' : 'Lác ẩn (Phoria)'}, hệ thống thị giác dung hợp hoàn chỉnh nên luôn duy trì 1 ảnh đơn.
            </div>
          )}

          {/* Educational Explanation Box */}
          <div className="text-[10px] text-slate-300 bg-[#05131b] p-2.5 rounded-xl border border-[#0e3546] leading-relaxed space-y-1">
            <p>
              💬 Khi hai mắt gửi hình ảnh không khớp nhau, một số người có thể cảm nhận hình ảnh đôi. Trong một số trường hợp, não có thể thích nghi bằng cách giảm hoặc bỏ qua tín hiệu từ một mắt.
            </p>
            {parameters.eyeOcclusionMode !== 'both' && (
              <p className="text-emerald-300 font-semibold pt-1 border-t border-[#0e3546]">
                ✓ Khi che một mắt: Xung đột hình ảnh hai mắt hoàn toàn biến mất, chỉ còn 1 ảnh đơn từ mắt đang mở.
              </p>
            )}
          </div>

          {/* Educational Disclaimer */}
          <div className="text-[10px] text-slate-400 italic text-center pt-1 border-t border-[#0e3546]/60">
            Mô phỏng trực quan nhằm mục đích giáo dục, không phải công cụ chẩn đoán thị lực hoặc lác.
          </div>
        </div>

        {/* EVIDENCE-BASED SCIENTIFIC TESTS CARD (Section 8, 9, 11 of Research Paper) */}
        <div className="bg-[#081e2a] border border-[#0e3546] rounded-2xl p-4 space-y-3 shadow-md">
          <div className="text-[11px] font-bold text-teal-400 tracking-wider uppercase flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00c4b4]" />
              <span>KHẢO SÁT CHUYÊN SÂU THEO NGHIÊN CỨU</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
              Bằng chứng Y khoa
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* 1. Visual Confusion Toggle (Stage 4 / Diplopia) */}
            <div className="p-2.5 rounded-xl bg-[#05131b] border border-[#0e3546] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-300 text-[11px]">
                  ⚡ Nhầm lẫn Thị giác (Visual Confusion)
                </span>
                <button
                  onClick={() =>
                    onUpdateParameters({
                      visualConfusionEnabled: !parameters.visualConfusionEnabled,
                    })
                  }
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    parameters.visualConfusionEnabled
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'bg-[#0a202c] text-slate-400 border border-[#11384b]'
                  }`}
                >
                  {parameters.visualConfusionEnabled ? 'ĐANG BẬT' : 'BẬT THỬ'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Kích thích 2 fovea: Vật A (mắt thẳng) và Vật B (mắt lệch) bị chiếu đè lên cùng 1 điểm trung tâm (Peli & Satgunam 2014).
              </p>
            </div>

            {/* 2. Cortical Suppression Scotoma Toggle (Stage 5 / Suppression) */}
            <div className="p-2.5 rounded-xl bg-[#05131b] border border-[#0e3546] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-300 text-[11px]">
                  🧠 Ám điểm Ức chế GABAergic V1
                </span>
                <button
                  onClick={() =>
                    onUpdateParameters({
                      showSuppressionScotoma: !parameters.showSuppressionScotoma,
                    })
                  }
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    parameters.showSuppressionScotoma
                      ? 'bg-[#00c4b4] text-slate-950 font-black shadow-sm'
                      : 'bg-[#0a202c] text-slate-400 border border-[#11384b]'
                  }`}
                >
                  {parameters.showSuppressionScotoma ? 'ĐANG BẬT' : 'BẬT XEM'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Trực quan hóa ám điểm dập tắt song thị mà không làm mù mắt: Thị giác chuyển động (MT/V5) vẫn đạt 31.2% - 100% (Mansouri & Hess 2021).
              </p>
            </div>

            {/* 3. Crowding Phenomenon Test Toggle (Stage 6 / Amblyopia) */}
            <div className="p-2.5 rounded-xl bg-[#05131b] border border-[#0e3546] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sky-300 text-[11px]">
                  🔤 Thử nghiệm Hiện tượng Chen chúc
                </span>
                <button
                  onClick={() =>
                    onUpdateParameters({
                      showCrowdingTest: !parameters.showCrowdingTest,
                    })
                  }
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    parameters.showCrowdingTest
                      ? 'bg-sky-400 text-slate-950 font-black shadow-sm'
                      : 'bg-[#0a202c] text-slate-400 border border-[#11384b]'
                  }`}
                >
                  {parameters.showCrowdingTest ? 'ĐANG BẬT' : 'BẬT BẢNG'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Đặc trưng nhược thị: Chữ đơn lẻ đọc rõ, nhưng chữ trong hàng dài bị dính chùm, méo mó. Bật bảng kiểm tra để so sánh trực quan.
              </p>
            </div>
          </div>
        </div>

        {/* CÀI ĐẶT MÔ PHỎNG Card */}
        <div className="bg-[#081e2a] border border-[#0e3546] rounded-2xl p-4 space-y-3.5 shadow-md">
          <div className="text-[11px] font-bold text-teal-400 tracking-wider uppercase flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#00c4b4]" />
            <span>CÀI ĐẶT MÔ PHỎNG THỊ GIÁC</span>
          </div>

          {/* Display Mode: Live Camera vs Sample Scene */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-300 block font-semibold">
              Nguồn hình ảnh hiển thị:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateParameters({ imageSource: 'camera' })}
                className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  parameters.imageSource === 'camera'
                    ? 'bg-[#00a896] text-white shadow-md shadow-teal-950/60 font-semibold'
                    : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 hover:text-slate-200 border border-[#11384b]'
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
                    : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 hover:text-slate-200 border border-[#11384b]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Ảnh Mẫu Phòng</span>
              </button>
            </div>
          </div>

          {/* Interactive Cover-Uncover Test Controls */}
          <div className="space-y-2 pt-2 border-t border-[#0e3546]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
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
                      : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 border border-[#11384b]'
                  }`}
                >
                  {cov.label}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-400 bg-[#05131b] p-2 rounded-xl border border-[#0e3546] leading-normal">
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
          <div className="pt-2 border-t border-[#0e3546] space-y-1.5">
            <button
              onClick={() =>
                onUpdateParameters({
                  showHirschbergOverlay: !parameters.showHirschbergOverlay,
                })
              }
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                parameters.showHirschbergOverlay
                  ? 'bg-[#00c4b4]/20 text-teal-200 border border-[#00c4b4]/60'
                  : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-300 border border-[#11384b]'
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
                    : 'bg-[#06151e] text-slate-400'
                }`}
              >
                {parameters.showHirschbergOverlay ? 'ĐANG BẬT' : 'TẮT'}
              </span>
            </button>
            <div className="text-[10px] text-slate-400 px-1">
              Chiếu đèn đồng trục để định lượng: 1mm lệch ≈ 7° ≈ 15Δ Lăng kính.
            </div>
          </div>

          {/* Mắt lệch (Deviating Eye Selector) */}
          <div className="space-y-1.5 pt-2 border-t border-[#0e3546]">
            <span className="text-[11px] text-slate-300 block font-semibold">
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
                      : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 border border-[#11384b]'
                  }`}
                >
                  {eyeOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Direction Selector */}
          <div className="space-y-1.5 pt-2 border-t border-[#0e3546]">
            <span className="text-[11px] text-slate-300 block font-semibold">
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
                      : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-400 border border-[#11384b]'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{dir.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{dir.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fine Tuning Sliders */}
          <div className="space-y-3 pt-2 border-t border-[#0e3546]">
            {/* Deviation Angle */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Độ lệch trục nhãn cầu:</span>
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
                className="w-full h-1.5 bg-[#05131b] rounded-lg appearance-none cursor-pointer accent-[#00c4b4]"
              />
            </div>

            {/* Perceived Diplopia Offset */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Khoảng cách tách đôi ảnh (Song thị):</span>
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
                className="w-full h-2 bg-[#05131b] rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Đơn ảnh 👤)</span>
                <span>15% (Lệch rõ)</span>
                <span>32% (Song thị chuẩn)</span>
                <span>100% (Tách rộng)</span>
              </div>
            </div>

            {/* Cortical Suppression */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Mức độ ức chế vỏ não (Suppression):</span>
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
                className="w-full h-1.5 bg-[#05131b] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Orthoptic Tools Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#0e3546]">
            <button
              onClick={() =>
                onUpdateParameters({ redCyanDisparityAid: !parameters.redCyanDisparityAid })
              }
              className={`w-full p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                parameters.redCyanDisparityAid
                  ? 'bg-rose-950/40 border border-rose-500/60 text-rose-200'
                  : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-300 border border-[#11384b]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Glasses className="w-4 h-4 text-rose-400" />
                <span>Kính Đỏ/Xanh (Worth 4-Dot Filter)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#06151e] font-mono">
                {parameters.redCyanDisparityAid ? 'BẬT' : 'TẮT'}
              </span>
            </button>

            <button
              onClick={() =>
                onUpdateParameters({ showHirschbergOverlay: !parameters.showHirschbergOverlay })
              }
              className={`w-full p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                parameters.showHirschbergOverlay
                  ? 'bg-[#00c4b4]/25 border border-[#00c4b4] text-teal-100'
                  : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-slate-300 border border-[#11384b]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00c4b4]" />
                <span>Phản xạ Giác mạc (Hirschberg Guide)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#06151e] font-mono">
                {parameters.showHirschbergOverlay ? 'BẬT' : 'TẮT'}
              </span>
            </button>
          </div>

          {/* Reset button */}
          <div className="pt-2">
            <button
              onClick={onResetToNormal}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-teal-100 hover:text-white bg-[#00a896]/20 hover:bg-[#00a896]/35 border border-[#00a896]/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#00c4b4]" />
              <span>Đặt lại về Chính thị (Bình thường)</span>
            </button>
          </div>
        </div>

        {/* Footer Credit & Medical Note */}
        <div className="text-[11px] text-slate-400 leading-relaxed px-1">
          Nền tảng RemiCare mô phỏng quang học thị giác và lác mắt dựa trên giáo trình BCSC của Hiệp hội Nhãn khoa Hoa Kỳ (AAO).
        </div>
      </div>
    </aside>
  );
};
