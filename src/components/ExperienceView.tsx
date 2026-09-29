import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ChevronLeft,
  Camera,
  CameraOff,
  FlipHorizontal,
  Maximize2,
  Minimize2,
  Scan,
  AlertTriangle,
  RefreshCw,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { SimulationParameters, ConditionId, CONDITIONS_REGISTRY } from '../types/simulation';
import { SimulationEngine } from '../engine/simulationEngine';
import { FaceDetectionResult } from '../engine/faceTracker';
import { RightSidebar } from './RightSidebar';
import { MedicalModal } from './MedicalModal';
import { medicalAudio, AudioScript } from '../services/medicalAudioService';
import { RemiCareLogo } from './RemiCareLogo';

interface ExperienceViewProps {
  onBackToLanding?: () => void;
}

const DEFAULT_PARAMS: SimulationParameters = {
  condition: 'normal',
  tab: 'stages',
  deviation: 0,
  diplopiaOffset: 0,
  suppression: 0,
  fusion: 100,
  direction: 'esotropia',
  deviatingEye: 'right',
  coverState: 'none',
  redCyanDisparityAid: false,
  showHirschbergOverlay: false,
  showFaceBox: false,
  mirrored: true,
  audioVoiceoverEnabled: true,
  simulatedDistanceCm: 39,
  autoDistance: true,
  imageSource: 'camera',
  blurAmount: 0,
};

export const ExperienceView: React.FC<ExperienceViewProps> = ({ onBackToLanding }) => {
  const [params, setParams] = useState<SimulationParameters>(DEFAULT_PARAMS);
  const [lang, setLang] = useState<'vi' | 'en' | 'km'>('vi');
  const [fps, setFps] = useState<number>(60);
  const [faceResult, setFaceResult] = useState<FaceDetectionResult>({
    detected: false,
    estimatedDistanceCm: 39,
    distanceLabel: 'Xa',
  });
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentScript, setCurrentScript] = useState<AudioScript | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const cameraViewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<SimulationEngine | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastReportedFaceRef = useRef<{ detected: boolean; dist: number; time: number }>({
    detected: false,
    dist: 39,
    time: 0,
  });

  // Subscribe to Medical Audio narration events
  useEffect(() => {
    const unsubscribe = medicalAudio.subscribe((speaking) => {
      setIsSpeaking(speaking);
      setCurrentScript(medicalAudio.getCurrentScript());
    });
    return () => {
      unsubscribe();
      medicalAudio.stop();
    };
  }, []);

  // Initialize & update simulation engine
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!engineRef.current) {
      engineRef.current = new SimulationEngine(canvasRef.current, params, {
        onFpsUpdate: (newFps) => {
          setFps((prev) => (Math.abs(prev - newFps) >= 2 ? newFps : prev));
        },
        onFaceDetectionUpdate: (res) => {
          const last = lastReportedFaceRef.current;
          const now = performance.now();
          const detectedChanged = last.detected !== res.detected;
          const distDiff = Math.abs(last.dist - res.estimatedDistanceCm);
          const timeElapsed = now - last.time;

          // Only trigger React state update if detection status flipped,
          // or if distance shifted by at least 2cm AND at least 250ms have elapsed.
          // This eliminates micro-fluctuations and continuous navbar re-rendering.
          if (detectedChanged || (distDiff >= 2 && timeElapsed >= 250)) {
            lastReportedFaceRef.current = {
              detected: res.detected,
              dist: res.estimatedDistanceCm,
              time: now,
            };
            setFaceResult(res);
          }
        },
      });
    } else {
      engineRef.current.updateParameters(params);
    }
  }, [params]);

  // Handle High-DPI canvas resizing
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !cameraViewportRef.current) return;
    const rect = cameraViewportRef.current.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);

    if (canvasRef.current.width !== targetW || canvasRef.current.height !== targetH) {
      canvasRef.current.width = targetW;
      canvasRef.current.height = targetH;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(() => resizeCanvas());
    if (cameraViewportRef.current) {
      ro.observe(cameraViewportRef.current);
    }
    return () => ro.disconnect();
  }, [resizeCanvas]);

  // Start webcam automatically on mount
  const startCamera = async () => {
    setCameraState('requesting');
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ Camera API');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if (engineRef.current) {
          engineRef.current.setVideoSource(videoRef.current);
        }
      }
      setCameraState('active');
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraState('denied');
      setErrorMessage('Không thể mở camera. Đang chuyển sang ảnh mẫu phòng cảnh.');
      setParams((prev) => ({ ...prev, imageSource: 'sample_scene' }));
      if (engineRef.current) {
        engineRef.current.setVideoSource(null);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (engineRef.current) {
      engineRef.current.setVideoSource(null);
    }
    setCameraState('idle');
    setParams((prev) => ({ ...prev, imageSource: 'sample_scene' }));
  };

  // Attempt camera start on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Update parameters handler
  const handleUpdateParameters = (newParams: Partial<SimulationParameters>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  // Select condition preset
  const handleSelectCondition = (conditionId: ConditionId) => {
    const config = CONDITIONS_REGISTRY[conditionId];
    if (!config) return;

    setParams((prev) => ({
      ...prev,
      condition: conditionId,
      tab: config.category,
      ...config.defaultParams,
    }));

    if (params.audioVoiceoverEnabled) {
      medicalAudio.speakScript(conditionId);
    }
  };

  const toggleAudioVoiceover = () => {
    const isMuted = medicalAudio.toggleMute();
    setParams((prev) => ({ ...prev, audioVoiceoverEnabled: !isMuted }));
    if (!isMuted) {
      medicalAudio.speakScript(params.condition);
    }
  };

  const handleStopAudio = () => {
    medicalAudio.stop();
  };

  // Reset to normal
  const handleResetToNormal = () => {
    const normalConfig = CONDITIONS_REGISTRY.normal;
    setParams((prev) => ({
      ...DEFAULT_PARAMS,
      tab: prev.tab,
      imageSource: prev.imageSource,
      mirrored: prev.mirrored,
      autoDistance: prev.autoDistance,
      simulatedDistanceCm: prev.simulatedDistanceCm,
      ...normalConfig.defaultParams,
    }));
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const activeConditionInfo = CONDITIONS_REGISTRY[params.condition] || CONDITIONS_REGISTRY.normal;

  // Theme CSS variables
  const themeClass = isDarkTheme
    ? 'bg-[#05131a] text-slate-100'
    : 'bg-slate-100 text-slate-900';
  const headerClass = isDarkTheme
    ? 'bg-[#061822] border-[#0e3546]'
    : 'bg-white border-slate-200 shadow-sm';

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen ${themeClass} flex flex-col overflow-hidden font-sans select-none transition-colors duration-300`}
    >
      {/* Hidden Video Feed for Canvas Sampling */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="hidden pointer-events-none"
      />

      {/* ==================== REMICARE TOP CLINICAL HEADER BAR ==================== */}
      <header className={`h-16 shrink-0 ${headerClass} border-b px-3 sm:px-5 flex items-center justify-between gap-3 z-30 shadow-md transition-colors duration-300`}>
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0c2635] transition-colors cursor-pointer"
              title="Về trang chủ"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Official RemiCare Logo Component */}
          <RemiCareLogo size={34} textClassName="text-base sm:text-lg" />

          {/* Vertical Divider */}
          <div className="hidden sm:block h-5 w-px bg-[#0e3546]" />

          {/* Reset to Normal (Chính thị) Button */}
          <button
            onClick={handleResetToNormal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-teal-200 bg-[#0a2736] hover:bg-[#0f3448] border border-[#13445a] transition-colors cursor-pointer shadow-sm shrink-0"
            title="Đặt lại thị giác về chính thị"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00c4b4]" />
            <span>Chính thị</span>
          </button>
        </div>

        {/* Center: Active Condition Status Banner (Only on very wide screens, in normal flex flow with truncate to NEVER overlap) */}
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a202c] border border-[#11384b] min-w-0 max-w-xs shrink truncate select-none shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#00c4b4] animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">
            {activeConditionInfo.name}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00c4b4]/15 text-[#00c4b4] font-medium shrink-0">
            {activeConditionInfo.badge}
          </span>
        </div>

        {/* Right: Audio Lecture, AAO Docs, Language & Status Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkTheme((prev) => !prev)}
            title={isDarkTheme ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isDarkTheme
                ? 'bg-[#0a202c] border-[#11384b] text-amber-300 hover:bg-[#0e2a3a]'
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            title={isSidebarOpen ? 'Ẩn bảng điều khiển' : 'Hiện bảng điều khiển'}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isDarkTheme
                ? 'bg-[#0a202c] border-[#11384b] text-slate-300 hover:bg-[#0e2a3a]'
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
          {/* Medical Audio Voiceover Toggle Button */}
          <button
            onClick={toggleAudioVoiceover}
            title={params.audioVoiceoverEnabled ? 'Tắt Thuyết Minh Giọng Nói' : 'Bật Thuyết Minh Giọng Nói'}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              params.audioVoiceoverEnabled
                ? isSpeaking
                  ? 'bg-teal-500/25 border-[#00c4b4] text-teal-100 ring-2 ring-[#00c4b4]/40 shadow-teal-500/20'
                  : 'bg-[#00c4b4]/15 border-[#00c4b4]/50 text-teal-200 hover:bg-[#00c4b4]/25'
                : 'bg-[#0a202c] border-[#11384b] text-slate-400 hover:text-slate-200'
            }`}
          >
            {params.audioVoiceoverEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#00c4b4] shrink-0" />
                <span className="hidden sm:inline">Giọng nói Y khoa</span>
                {isSpeaking && (
                  <span className="flex items-center gap-0.5 ml-0.5">
                    <span className="w-1 h-2.5 bg-[#00c4b4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-4 bg-[#00c4b4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-[#00c4b4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden sm:inline">Âm thanh: Tắt</span>
              </>
            )}
          </button>

          {/* Medical AAO Reference Modal Trigger */}
          <button
            onClick={() => setIsMedicalModalOpen(true)}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-[#0a202c] hover:bg-[#0e2a3a] border border-[#11384b] transition-colors cursor-pointer"
            title="Xem cơ sở y học & tài liệu lâm sàng AAO"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>Tài liệu AAO</span>
          </button>

          {/* Language Switcher */}
          <div className="bg-[#0a202c] p-0.5 rounded-full border border-[#11384b] flex items-center shadow-sm">
            {(['vi', 'en', 'km'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  lang === l
                    ? 'bg-[#00a896] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* AI Face Detection Badge - STABLE WIDTH & TABULAR NUMS */}
          {params.imageSource === 'camera' && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border min-w-[110px] justify-center transition-colors duration-200 ${
                faceResult.detected
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  faceResult.detected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-mono tabular-nums whitespace-nowrap">
                {faceResult.detected ? `Mặt: ${faceResult.estimatedDistanceCm}cm` : 'Tìm mặt...'}
              </span>
            </div>
          )}

          {/* FPS Badge - STABLE WIDTH & TABULAR NUMS */}
          <div className="bg-[#05131b] text-slate-400 font-mono text-[11px] px-2 py-1 rounded-lg border border-[#0e3546] shadow-inner w-[62px] text-center tabular-nums shrink-0">
            FPS: {fps}
          </div>
        </div>
      </header>

      {/* ==================== WORKSPACE (CAMERA VIEWPORT + SIDEBAR) ==================== */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT AREA: HUGE IMMERSIVE FIRST-PERSON CAMERA VIEWPORT */}
        <main
          ref={cameraViewportRef}
          className="relative flex-1 h-[60vh] lg:h-full bg-[#030d12] overflow-hidden flex items-center justify-center"
        >
          {/* Optical Viewfinder Corner Reticles */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00c4b4]/40 pointer-events-none z-10" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00c4b4]/40 pointer-events-none z-10" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00c4b4]/40 pointer-events-none z-10" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00c4b4]/40 pointer-events-none z-10" />

          {/* Real-time Rendered Visual Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full block object-cover select-none"
          />

          {/* CLINICAL STATUS OVERLAY: CORTICAL SUPPRESSION ACTIVE (POSITIONED SAFELY) */}
          {params.condition === 'suppression' && params.suppression >= 80 && (
            <div className="absolute top-5 left-5 z-20 pointer-events-none animate-fade-in max-w-[90vw] md:max-w-sm">
              <div className="bg-[#081e2a]/95 border border-amber-500/60 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0 mt-1" />
                <div>
                  <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                    Ức chế vỏ não đang hoạt động
                  </div>
                  <div className="text-[11px] text-slate-300 leading-snug">
                    Song thị đã bị triệt tiêu · Đã ngắt tín hiệu từ{' '}
                    <span className="font-semibold text-white">
                      {params.deviatingEye === 'right' ? 'Mắt Phải (OD)' : 'Mắt Trái (OS)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM-LEFT: FLOATING DISTANCE CARD */}
          <div className="absolute bottom-5 left-5 z-20 pointer-events-auto hidden md:block">
            <div className="bg-[#071922]/90 backdrop-blur-md border border-[#0e3546] px-4 py-2.5 rounded-2xl shadow-xl space-y-0.5">
              <div className="text-[10px] font-bold tracking-wider text-teal-400 uppercase">
                KHOẢNG CÁCH NHẬN DIỆN
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00c4b4]" />
                <span className="tabular-nums font-mono">
                  Camera: {faceResult.estimatedDistanceCm}cm ({faceResult.distanceLabel})
                </span>
              </div>
            </div>
          </div>

          {/* SYNCHRONIZED MEDICAL NARRATION SUBTITLE CARD */}
          {isSpeaking && currentScript && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[92vw] md:max-w-[580px] w-full animate-fade-in">
              <div className="bg-[#061822]/95 border border-[#00c4b4]/60 p-4 rounded-3xl shadow-2xl backdrop-blur-md flex items-start gap-3">
                <div className="p-2 rounded-2xl bg-[#00c4b4]/20 text-[#00c4b4] shrink-0 mt-0.5 animate-pulse">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00c4b4]" />
                      <span>{currentScript.title}</span>
                    </span>
                    <button
                      onClick={handleStopAudio}
                      className="text-[10px] text-slate-400 hover:text-white bg-[#0a202c] hover:bg-[#0e2a3a] px-2.5 py-0.5 rounded-md cursor-pointer transition-colors border border-[#11384b]"
                    >
                      Dừng đọc
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {currentScript.text}
                  </p>
                  <div className="text-[10px] text-amber-300 font-semibold pt-1 border-t border-[#0e3546]">
                    💡 Điểm cốt lõi: {currentScript.keyTakeaway}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM-CENTER: INTERACTIVE STAGE TIMELINE (01 -> 02 -> 03 -> 04 -> 05) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[92vw] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 bg-[#061822]/95 backdrop-blur-md border border-[#0e3546] p-1.5 rounded-2xl shadow-2xl">
              {(
                [
                  { id: 'normal', num: '01', label: 'Bình thường' },
                  { id: 'early_strabismus', num: '02', label: 'Lệch nhẹ' },
                  { id: 'clear_strabismus', num: '03', label: 'Lệch rõ' },
                  { id: 'diplopia', num: '04', label: 'Song thị' },
                  { id: 'suppression', num: '05', label: 'Não thích nghi' },
                ] as const
              ).map((st) => {
                const isActive = params.condition === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectCondition(st.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md shadow-teal-950/60 ring-1 ring-[#00c4b4]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] px-1 rounded ${
                        isActive ? 'bg-teal-900 text-teal-100' : 'bg-[#05131b] text-teal-400/80 border border-[#0e3546]'
                      }`}
                    >
                      {st.num}
                    </span>
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTTOM-RIGHT: FLOATING QUICK CONTROLS OVER CAMERA */}
          <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1.5 pointer-events-auto bg-[#071922]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#0e3546] shadow-xl">
            {/* Mirror Flip */}
            <button
              onClick={() => handleUpdateParameters({ mirrored: !params.mirrored })}
              title={params.mirrored ? 'Gương hình ảnh: BẬT' : 'Gương hình ảnh: TẮT'}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                params.mirrored ? 'bg-[#00c4b4]/25 text-[#00c4b4]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
              }`}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            {/* Face Detection Bounding Box Toggle */}
            <button
              onClick={() => handleUpdateParameters({ showFaceBox: !params.showFaceBox })}
              title="Bật/Tắt khung AI nhận diện khuôn mặt"
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                params.showFaceBox ? 'bg-[#00c4b4]/25 text-[#00c4b4]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
              }`}
            >
              <Scan className="w-4 h-4" />
            </button>

            {/* Camera ON/OFF */}
            {cameraState === 'active' ? (
              <button
                onClick={stopCamera}
                title="Tắt Camera"
                className="p-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <CameraOff className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={startCamera}
                title="Bật Camera"
                className="p-2 rounded-xl text-xs text-teal-400 hover:bg-[#00c4b4]/20 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              className="p-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-[#0a202c] transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Camera Permission Gate / Fallback Alert Banner */}
          {cameraState === 'denied' && (
            <div className="absolute inset-x-6 bottom-20 z-30 flex items-center justify-between p-3.5 bg-[#061822]/95 border border-amber-500/40 rounded-2xl backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-2.5 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {errorMessage || 'Camera chưa được cấp quyền. Đang hiển thị ảnh mẫu phòng thị lực.'}
                </span>
              </div>
              <button
                onClick={startCamera}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#00a896] hover:bg-[#009688] rounded-xl transition-colors shrink-0 ml-3 cursor-pointer shadow-md"
              >
                Thử lại Camera
              </button>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR: TABS, CONDITIONS, MEDICAL INFO, AND SETTINGS */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSidebarOpen ? 'w-full lg:w-[400px] xl:w-[440px]' : 'w-0'
          } shrink-0`}
        >
          {isSidebarOpen && (
            <RightSidebar
              parameters={params}
              onUpdateParameters={handleUpdateParameters}
              onSelectCondition={handleSelectCondition}
              onResetToNormal={handleResetToNormal}
              onOpenMedicalModal={() => setIsMedicalModalOpen(true)}
              lang={lang}
              isDarkTheme={isDarkTheme}
            />
          )}
        </div>

        {/* Floating Sidebar Toggle Button (inside viewport when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            title="Hiện bảng điều khiển"
            className="absolute top-4 right-4 z-30 p-2.5 rounded-xl bg-[#071922]/90 backdrop-blur-md border border-[#0e3546] text-slate-300 hover:text-white hover:bg-[#0e2a3a] transition-colors cursor-pointer shadow-xl"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* MEDICAL DETAILS & CLINICAL CITATIONS MODAL */}
      <MedicalModal
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
      />
    </div>
  );
};
