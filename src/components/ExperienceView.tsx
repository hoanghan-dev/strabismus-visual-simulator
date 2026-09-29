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
  Sliders,
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

// Story mode imports
import { StoryChapterId, STORY_CHAPTERS } from '../types/story';
import { StoryDialogueBox } from './StoryDialogueBox';
import { StoryVisualProps } from './StoryVisualProps';
import { StorySidebar } from './StorySidebar';
import { StoryIntroModal } from './StoryIntroModal';

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
  eyeOcclusionMode: 'both',
  brainResponseMode: undefined,
  coverState: 'none',
  redCyanDisparityAid: false,
  visualConfusionEnabled: false,
  showCrowdingTest: false,
  showSuppressionScotoma: false,
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

  // ==================== THEME SYSTEM (LIGHT / DARK) ====================
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('remicare_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
      localStorage.setItem('remicare_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ==================== STORY JOURNEY STATES ====================
  const [appMode, setAppMode] = useState<'story' | 'clinical'>('story');
  const [storyChapterId, setStoryChapterId] = useState<StoryChapterId>('intro');
  const [showIntroModal, setShowIntroModal] = useState<boolean>(true);
  const [hasFinishedAudio, setHasFinishedAudio] = useState<boolean>(false);

  const hasStoryBottomProp = appMode === 'story' && ['ch4', 'ch5', 'ch6', 'ending'].includes(storyChapterId);

  // ==================== TOGGLE SIDEBAR STATE (DEFAULT CLOSED) ====================
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

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

  // Select condition preset in Clinical Mode
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
      if (appMode === 'story') {
        const chap = STORY_CHAPTERS[storyChapterId];
        if (chap) {
          medicalAudio.speakScript(chap.audioScriptId, () => {
            setHasFinishedAudio(true);
          });
        }
      } else {
        medicalAudio.speakScript(params.condition);
      }
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

  // ==================== STORYLINE CHAPTER ENGINE ====================
  const handleSelectStoryChapter = (chapterId: StoryChapterId) => {
    if (chapterId === 'intro') {
      setShowIntroModal(true);
      setStoryChapterId('intro');
      return;
    }

    setShowIntroModal(false);
    setStoryChapterId(chapterId);
  };

  const handleNextStoryChapter = () => {
    const currentChap = STORY_CHAPTERS[storyChapterId];
    if (currentChap.nextChapterId) {
      handleSelectStoryChapter(currentChap.nextChapterId);
    } else if (currentChap.id === 'ending') {
      handleSelectStoryChapter('ch1');
    }
  };

  const handlePrevStoryChapter = () => {
    const currentChap = STORY_CHAPTERS[storyChapterId];
    if (currentChap.prevChapterId && currentChap.prevChapterId !== 'intro') {
      handleSelectStoryChapter(currentChap.prevChapterId);
    }
  };

  const handleReplayStoryAudio = () => {
    const chap = STORY_CHAPTERS[storyChapterId];
    if (!chap) return;
    setHasFinishedAudio(false);
    medicalAudio.speakScript(chap.audioScriptId, () => {
      setHasFinishedAudio(true);
    });
  };

  // Sync simulation parameters & trigger story audio automatically when chapter changes
  useEffect(() => {
    if (appMode !== 'story') return;

    if (showIntroModal && storyChapterId === 'intro') {
      setHasFinishedAudio(false);
      medicalAudio.speakScript('story_intro', () => {
        setHasFinishedAudio(true);
      });
      return;
    }

    if (storyChapterId === 'intro') return;

    const chap = STORY_CHAPTERS[storyChapterId];
    if (!chap) return;

    // Apply simulation preset according to story chapter
    const config = CONDITIONS_REGISTRY[chap.conditionId];
    if (config) {
      setParams((prev) => ({
        ...prev,
        imageSource: 'camera',
        condition: chap.conditionId,
        tab: config.category,
        ...config.defaultParams,
      }));
    }

    setHasFinishedAudio(false);
    medicalAudio.speakScript(chap.audioScriptId, () => {
      setHasFinishedAudio(true);
    });

    return () => {
      medicalAudio.stop();
    };
  }, [storyChapterId, appMode, showIntroModal]);

  const activeConditionInfo = CONDITIONS_REGISTRY[params.condition] || CONDITIONS_REGISTRY.normal;
  const currentChapter = STORY_CHAPTERS[storyChapterId];

  return (
    <div
      ref={containerRef}
      data-theme={theme}
      className={`w-full h-screen flex flex-col overflow-hidden font-sans select-none transition-colors duration-200 ${theme === 'light' ? 'bg-[#f1f6f9] text-slate-900' : 'bg-[#05131a] text-slate-100'
        }`}
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
      <header className="h-16 shrink-0 bg-[#061822] border-b border-[#0e3546] px-3 sm:px-5 flex items-center justify-between gap-3 z-30 shadow-md">
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

          {/* Mode Switcher Toggle: Story Adventure vs Clinical Lab */}
          <div className="flex items-center p-0.5 bg-[#05131b] border border-[#0e3546] rounded-full shadow-inner">
            <button
              onClick={() => {
                setAppMode('story');
                if (storyChapterId === 'intro') {
                  setShowIntroModal(true);
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${appMode === 'story'
                ? 'bg-gradient-to-r from-[#00c4b4] to-[#00a896] text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <span>📖 Cốt Truyện</span>
            </button>
            <button
              onClick={() => {
                setAppMode('clinical');
                setShowIntroModal(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${appMode === 'clinical'
                ? 'bg-[#00a896] text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <span>🔬 Bản Lâm Sàng</span>
            </button>
          </div>
        </div>

        {/* Center: Active Condition / Chapter Status Banner */}
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a202c] border border-[#11384b] min-w-0 max-w-xs shrink truncate select-none shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#00c4b4] animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">
            {appMode === 'story'
              ? `${currentChapter.badge}: ${currentChapter.title}`
              : activeConditionInfo.name}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00c4b4]/15 text-[#00c4b4] font-medium shrink-0">
            {appMode === 'story' ? currentChapter.medicalCode : activeConditionInfo.badge}
          </span>
        </div>

        {/* Right: Audio Lecture, AAO Docs, Language & Status Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Audio Voiceover Toggle Button */}
          <button
            onClick={toggleAudioVoiceover}
            title={params.audioVoiceoverEnabled ? 'Tắt Thuyết Minh Giọng Nói' : 'Bật Thuyết Minh Giọng Nói'}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-md flex items-center gap-1.5 transition-colors cursor-pointer ${params.audioVoiceoverEnabled
              ? isSpeaking
                ? 'bg-teal-500/25 border-[#00c4b4] text-teal-100 ring-2 ring-[#00c4b4]/40 shadow-teal-500/20'
                : 'bg-[#00c4b4]/15 border-[#00c4b4]/50 text-teal-200 hover:bg-[#00c4b4]/25'
              : 'bg-[#0a202c] border-[#11384b] text-slate-400 hover:text-slate-200'
              }`}
          >
            {params.audioVoiceoverEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#00c4b4] shrink-0" />
                <span className="hidden sm:inline">Giọng nói</span>
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

          {/* Reset to Normal (Chính thị) Button */}
          <button
            onClick={handleResetToNormal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-teal-200 bg-[#0a2736] hover:bg-[#0f3448] border border-[#13445a] transition-colors cursor-pointer shadow-sm shrink-0"
            title="Đặt lại thị giác về chính thị"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00c4b4]" />
            <span>Chính thị</span>
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
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${lang === l
                  ? 'bg-[#00a896] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Light / Dark Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border ${theme === 'light'
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
              : 'bg-[#0a202c] hover:bg-[#0e2a3a] text-amber-300 border-[#11384b]'
              }`}
            title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng (Light Theme)' : 'Chuyển sang Giao diện Tối (Dark Theme)'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden xl:inline text-[11px] text-amber-200 font-medium">Sáng</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span className="hidden xl:inline text-[11px] text-slate-700 font-medium">Tối</span>
              </>
            )}
          </button>

          {/* AI Face Detection Badge - STABLE WIDTH & TABULAR NUMS */}
          {params.imageSource === 'camera' && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border min-w-[110px] justify-center transition-colors duration-200 ${faceResult.detected
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${faceResult.detected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
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

          {/* ==================== TOGGLE SIDEBAR BUTTON (DEFAULT CLOSED) ==================== */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${isSidebarOpen
              ? 'bg-[#00c4b4] text-slate-950 border-[#00c4b4] shadow-teal-500/20'
              : 'bg-[#0a202c] border-[#11384b] text-teal-300 hover:text-white hover:bg-[#0f2e3d]'
              }`}
            title={isSidebarOpen ? 'Đóng bảng điều khiển bên phải' : 'Mở bảng điều khiển bên phải'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSidebarOpen ? 'Đóng Bảng' : appMode === 'story' ? 'Nhật Ký' : 'Bảng Điều Khiển'}
            </span>
          </button>
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

          {/* ==================== STORY MODE INTERACTIVE PROPS ==================== */}
          {appMode === 'story' && !showIntroModal && (
            <StoryVisualProps
              chapterId={storyChapterId}
              isSpeaking={isSpeaking}
            />
          )}

          {/* CLINICAL STATUS OVERLAY: CORTICAL SUPPRESSION ACTIVE (POSITIONED SAFELY IN CLINICAL MODE) */}
          {appMode === 'clinical' && params.condition === 'suppression' && params.suppression >= 80 && (
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
          <div className="absolute bottom-4 left-4 z-20 pointer-events-auto hidden md:block">
            <div className="bg-[#071922]/90 backdrop-blur-md border border-[#0e3546] px-3.5 py-2 rounded-2xl shadow-xl space-y-0.5">
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

          {/* ==================== STORY MODE QUICK EYE-OCCLUSION HUD ==================== */}
          {appMode === 'story' && !showIntroModal && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 z-25 pointer-events-auto transition-all duration-300 max-w-[92vw] ${hasStoryBottomProp ? 'bottom-24 sm:bottom-25' : 'bottom-4'
                }`}
            >
              <div className="bg-[#061822]/95 backdrop-blur-md border border-[#00c4b4]/60 p-1 rounded-2xl shadow-2xl flex items-center gap-1">
                <button
                  onClick={() => handleUpdateParameters({ eyeOcclusionMode: 'both' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${params.eyeOcclusionMode === 'both'
                    ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
                    }`}
                  title="Cả hai mắt cùng mở (Mặc định)"
                >
                  <span>👀 Cả 2 mắt</span>
                </button>

                <button
                  onClick={() => handleUpdateParameters({ eyeOcclusionMode: 'left_covered' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${params.eyeOcclusionMode === 'left_covered'
                    ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
                    }`}
                  title="Che mắt trái — Chỉ nhận tín hiệu Mắt Phải"
                >
                  <span>👁️❌ Che trái</span>
                </button>

                <button
                  onClick={() => handleUpdateParameters({ eyeOcclusionMode: 'right_covered' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${params.eyeOcclusionMode === 'right_covered'
                    ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
                    }`}
                  title="Che mắt phải — Chỉ nhận tín hiệu Mắt Trái"
                >
                  <span>👁️❌ Che phải</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== STORY MODE DIALOGUE & GUIDANCE BOX (TOP-LEFT: FREELY RESIZABLE) ==================== */}
          {appMode === 'story' && !showIntroModal && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-25 pointer-events-none">
              <StoryDialogueBox
                currentChapter={STORY_CHAPTERS[storyChapterId]}
                isSpeaking={isSpeaking}
                hasFinishedAudio={hasFinishedAudio}
                onNextChapter={handleNextStoryChapter}
                onPrevChapter={storyChapterId !== 'ch1' ? handlePrevStoryChapter : undefined}
                onReplayAudio={handleReplayStoryAudio}
                onToggleMute={toggleAudioVoiceover}
                isMuted={medicalAudio.getIsMuted()}
                theme={theme}
              />
            </div>
          )}

          {/* ==================== CLINICAL MODE BOTTOM CONTROLS & TIMELINE ==================== */}
          {appMode === 'clinical' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-2 max-w-[95vw]">
              {/* Row 1: Quick Eye-Occlusion Shortcut HUD */}
              <div className="bg-[#061822]/95 backdrop-blur-md border border-[#0e3546] p-1 rounded-2xl shadow-2xl flex items-center gap-1">
                <button
                  onClick={() => handleUpdateParameters({ eyeOcclusionMode: 'both' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${params.eyeOcclusionMode === 'both'
                    ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
                    }`}
                  title="Cả hai mắt cùng mở (Mặc định)"
                >
                  <span>👀 Cả 2 mắt</span>
                </button>

                <button
                  onClick={() => handleUpdateParameters({ eyeOcclusionMode: 'left_covered' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${params.eyeOcclusionMode === 'left_covered'
                    ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
                    }`}
                  title="Che mắt trái — Chỉ nhận tín hiệu Mắt Phải"
                >
                  <span>👁️❌ Che trái</span>
                </button>

                <button
                  onClick={() => handleUpdateParameters({ eyeOcclusionMode: 'right_covered' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${params.eyeOcclusionMode === 'right_covered'
                    ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
                    }`}
                  title="Che mắt phải — Chỉ nhận tín hiệu Mắt Trái"
                >
                  <span>👁️❌ Che phải</span>
                </button>
              </div>

              {/* Row 2: Bottom Clinical Stage Timeline */}
              <div className="max-w-[92vw] overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 bg-[#061822]/95 backdrop-blur-md border border-[#0e3546] p-1.5 rounded-2xl shadow-2xl">
                  {(
                    [
                      { id: 'normal', num: '01', label: 'Bình thường' },
                      { id: 'early_strabismus', num: '02', label: 'Lệch nhẹ' },
                      { id: 'clear_strabismus', num: '03', label: 'Lệch rõ' },
                      { id: 'diplopia', num: '04', label: 'Song thị' },
                      { id: 'suppression', num: '05', label: 'Não thích nghi' },
                      { id: 'amblyopia', num: '06', label: 'Nhược thị' },
                    ] as const
                  ).map((st) => {
                    const isActive = params.condition === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => handleSelectCondition(st.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${isActive
                          ? 'bg-gradient-to-r from-[#00a896] to-[#00897b] text-white shadow-md shadow-teal-950/60 ring-1 ring-[#00c4b4]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
                          }`}
                      >
                        <span
                          className={`font-mono text-[10px] px-1 rounded ${isActive ? 'bg-teal-900 text-teal-100' : 'bg-[#05131b] text-teal-400/80 border border-[#0e3546]'
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
            </div>
          )}

          {/* FLOATING QUICK OPEN TAB FOR SIDEBAR (WHEN SIDEBAR IS CLOSED) */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`absolute top-16 right-0 z-20 border-y border-l-2 border-r-0 pl-2.5 pr-3 py-2 rounded-l-2xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group animate-fade-in ${
                theme === 'light'
                  ? 'bg-white/95 border-[#00a896] text-teal-800 hover:bg-teal-50 shadow-slate-300/40'
                  : 'bg-[#071922]/95 border-[#00c4b4] text-teal-300 hover:text-white hover:bg-[#0c2f42]'
              }`}
              title="Mở Bảng Điều Khiển / Nhật Ký"
            >
              <ChevronLeft className={`w-4 h-4 group-hover:-translate-x-0.5 transition-transform ${
                theme === 'light' ? 'text-teal-600' : 'text-teal-400'
              }`} />
              <span className="font-mono text-[11px]">
                {appMode === 'story' ? '📖 Nhật Ký' : '🔬 Cài Đặt'}
              </span>
            </button>
          )}

          {/* BOTTOM-RIGHT: FLOATING QUICK CONTROLS OVER CAMERA */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 pointer-events-auto bg-[#071922]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#0e3546] shadow-xl">
            {/* Mirror Flip */}
            <button
              onClick={() => handleUpdateParameters({ mirrored: !params.mirrored })}
              title={params.mirrored ? 'Gương hình ảnh: BẬT' : 'Gương hình ảnh: TẮT'}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${params.mirrored ? 'bg-[#00c4b4]/25 text-[#00c4b4]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
                }`}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            {/* Face Detection Bounding Box Toggle */}
            <button
              onClick={() => handleUpdateParameters({ showFaceBox: !params.showFaceBox })}
              title="Bật/Tắt khung AI nhận diện khuôn mặt"
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${params.showFaceBox ? 'bg-[#00c4b4]/25 text-[#00c4b4]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a202c]'
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
            <div className="absolute inset-x-6 bottom-24 z-30 flex items-center justify-between p-3.5 bg-[#061822]/95 border border-amber-500/40 rounded-2xl backdrop-blur-md shadow-2xl">
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

        {/* RIGHT SIDEBAR: DEFAULT CLOSED (TOGGLEABLE) */}
        {isSidebarOpen && (
          <div className="relative h-full flex flex-col z-30 animate-fade-in shrink-0">
            {appMode === 'story' ? (
              <StorySidebar
                currentChapterId={storyChapterId}
                onSelectChapter={handleSelectStoryChapter}
                onSwitchToClinicalMode={() => setAppMode('clinical')}
                parameters={params}
                onUpdateParameters={handleUpdateParameters}
                onCloseSidebar={() => setIsSidebarOpen(false)}
                theme={theme}
              />
            ) : (
              <RightSidebar
                parameters={params}
                onUpdateParameters={handleUpdateParameters}
                onSelectCondition={handleSelectCondition}
                onResetToNormal={handleResetToNormal}
                onOpenMedicalModal={() => setIsMedicalModalOpen(true)}
                onSwitchToStoryMode={() => setAppMode('story')}
                lang={lang}
                onCloseSidebar={() => setIsSidebarOpen(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* STORY INTRO MODAL */}
      <StoryIntroModal
        isOpen={showIntroModal && appMode === 'story'}
        onStartAdventure={() => {
          setShowIntroModal(false);
          setStoryChapterId('ch1');
        }}
        onSkipToClinical={() => {
          setShowIntroModal(false);
          setAppMode('clinical');
        }}
        theme={theme}
      />

      {/* MEDICAL DETAILS & CLINICAL CITATIONS MODAL */}
      <MedicalModal
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
      />
    </div>
  );
};
