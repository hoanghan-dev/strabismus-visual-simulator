/**
 * Real-Time Visual Experience Engine for Strabismus & Binocular Vision
 * 
 * Medically grounded in AAO (American Academy of Ophthalmology) BCSC and von Noorden & Campos.
 * 
 * Key Clinical Rules:
 * 1. Stage 01 (Bình thường): Single unified 3D vision, 0% separation.
 * 2. Stage 02 (Lệch nhẹ / Lác ẩn - Phoria): Fusional vergence actively COMPENSATES.
 *    ABSOLUTELY NO DIPLOPIA (Single image preserved, subtle asthenopia / micro-vergence effort).
 * 3. Stage 03 (Lệch rõ / Clear Misalignment): Motor fusion fails, two visual channels visibly
 *    separate symmetrically (-d/2 and +d/2) in the same camera scene (~45% separation).
 * 4. Stage 04 (Song thị hoàn toàn - Diplopia): Full manifest double vision. Equal visual weight
 *    (50% Left Eye + 50% Right Eye), wide distinct separation (0% to 100% slider).
 * 5. Stage 05 (Ức chế vỏ não - Suppression): Brain actively suppresses deviating macula,
 *    DIPLOPIA COMPLETELY DISAPPEARS! User sees single image, but stereopsis is lost.
 * 6. Stage 06 (Nhược thị - Amblyopia): Chronic suppression causes loss of contrast sensitivity and spatial resolution.
 */

import { SimulationParameters, ConditionId, CoverState } from '../types/simulation';
import { RealtimeFaceTracker, FaceDetectionResult } from './faceTracker';

interface EngineCallbacks {
  onFpsUpdate?: (fps: number) => void;
  onFaceDetectionUpdate?: (result: FaceDetectionResult) => void;
}

export class SimulationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement | null = null;
  private animFrameId: number | null = null;
  private params: SimulationParameters;
  private callbacks: EngineCallbacks;
  private isDestroyed = false;

  // Face tracker instance
  private faceTracker: RealtimeFaceTracker;
  private lastFaceResult: FaceDetectionResult = {
    detected: false,
    estimatedDistanceCm: 39,
    distanceLabel: 'Xa',
  };

  // Overscan offscreen rendering layer (avoids any black edge clipping during disparity translation)
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private redFilterCanvas: HTMLCanvasElement;
  private redFilterCtx: CanvasRenderingContext2D;

  // Interpolated smooth visual parameters
  private currentDeviation = 0;
  private currentDiplopiaOffset = 0;
  private currentSuppression = 0;
  private currentFusion = 100;
  private currentBlur = 0;

  // Neuromuscular asthenopia micro-pulse phase
  private microPulsePhase = 0;

  // FPS tracking
  private frameCount = 0;
  private lastFpsTime = performance.now();

  // Face tracker interval throttling & concurrency lock
  private isTrackingFace = false;
  private lastFaceTrackTime = 0;

  constructor(
    canvas: HTMLCanvasElement,
    initialParams: SimulationParameters,
    callbacks: EngineCallbacks = {}
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2D context not available');
    this.ctx = ctx;
    this.params = { ...initialParams };
    this.callbacks = callbacks;

    this.faceTracker = new RealtimeFaceTracker();

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;

    this.redFilterCanvas = document.createElement('canvas');
    this.redFilterCtx = this.redFilterCanvas.getContext('2d')!;

    this.currentDeviation = initialParams.deviation;
    this.currentDiplopiaOffset = initialParams.diplopiaOffset;
    this.currentSuppression = initialParams.suppression;
    this.currentFusion = initialParams.fusion;
    this.currentBlur = initialParams.blurAmount;

    this.startLoop();
  }

  public setVideoSource(video: HTMLVideoElement | null) {
    this.video = video;
  }

  public updateParameters(newParams: Partial<SimulationParameters>) {
    this.params = { ...this.params, ...newParams };
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private startLoop() {
    const loop = (timestamp: number) => {
      if (this.isDestroyed) return;
      this.render(timestamp);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private render(timestamp: number) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    if (cw === 0 || ch === 0) return;

    // Track FPS
    this.frameCount++;
    if (timestamp - this.lastFpsTime >= 500) {
      const fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = timestamp;
      if (this.callbacks.onFpsUpdate) {
        this.callbacks.onFpsUpdate(fps);
      }
    }

    // Overscan margins: 16% horizontal, 12% vertical
    // Allows shifting channels by up to ±14% without exposing black borders!
    const marginX = Math.round(cw * 0.16);
    const marginY = Math.round(ch * 0.12);
    const offscreenW = cw + marginX * 2;
    const offscreenH = ch + marginY * 2;

    if (this.offscreenCanvas.width !== offscreenW || this.offscreenCanvas.height !== offscreenH) {
      this.offscreenCanvas.width = offscreenW;
      this.offscreenCanvas.height = offscreenH;
      this.redFilterCanvas.width = cw;
      this.redFilterCanvas.height = ch;
    }

    // Parameter Lerp smoothing
    const lerp = 0.14;
    this.currentDeviation += (this.params.deviation - this.currentDeviation) * lerp;
    this.currentDiplopiaOffset += (this.params.diplopiaOffset - this.currentDiplopiaOffset) * lerp;
    this.currentSuppression += (this.params.suppression - this.currentSuppression) * lerp;
    this.currentFusion += (this.params.fusion - this.currentFusion) * lerp;
    this.currentBlur += (this.params.blurAmount - this.currentBlur) * lerp;

    this.microPulsePhase += 0.035;

    const hasLiveVideo =
      this.params.imageSource === 'camera' &&
      this.video &&
      this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      !this.video.paused &&
      this.video.videoWidth > 0;

    // Run Face Tracker if live video is active (throttled to ~8 FPS with concurrency guard)
    const now = performance.now();
    if (
      hasLiveVideo &&
      this.video &&
      !this.isTrackingFace &&
      now - this.lastFaceTrackTime >= 125
    ) {
      this.isTrackingFace = true;
      this.lastFaceTrackTime = now;
      this.faceTracker
        .track(this.video)
        .then((result) => {
          this.lastFaceResult = result;
          if (this.callbacks.onFaceDetectionUpdate) {
            this.callbacks.onFaceDetectionUpdate(result);
          }
        })
        .finally(() => {
          this.isTrackingFace = false;
        });
    }

    // Draw base scene into overscan offscreen canvas
    const octx = this.offscreenCtx;
    octx.save();
    octx.clearRect(0, 0, offscreenW, offscreenH);

    if (hasLiveVideo && this.video) {
      this.drawVideoToCanvas(octx, this.video, offscreenW, offscreenH, this.params.mirrored);
    } else {
      this.drawSampleScene(octx, offscreenW, offscreenH);
    }
    octx.restore();

    // Composite Stage 1-6 onto main canvas with true symmetrical binocular disparity
    ctx.save();
    ctx.clearRect(0, 0, cw, ch);
    this.compositeSimulation(ctx, cw, ch, marginX, marginY, timestamp);
    ctx.restore();

    // Optional Hirschberg corneal reflex guide
    if (this.params.showHirschbergOverlay || this.params.condition === 'hirschberg') {
      this.drawHirschbergOverlay(ctx, cw, ch);
    }

    // Draw face detection bounding box if enabled & detected
    if (hasLiveVideo && this.params.showFaceBox && this.lastFaceResult.detected && this.lastFaceResult.box) {
      this.drawFaceBoxOverlay(ctx, cw, ch, this.lastFaceResult.box, this.params.mirrored);
    }
  }

  /**
   * Cover math & optional horizontal mirror for live webcam into overscan canvas
   */
  private drawVideoToCanvas(
    targetCtx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    targetW: number,
    targetH: number,
    mirrored: boolean
  ) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const videoRatio = vw / vh;
    const targetRatio = targetW / targetH;

    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (targetRatio > videoRatio) {
      sh = vw / targetRatio;
      sy = (vh - sh) / 2;
    } else {
      sw = vh * targetRatio;
      sx = (vw - sw) / 2;
    }

    targetCtx.save();
    if (mirrored) {
      targetCtx.translate(targetW, 0);
      targetCtx.scale(-1, 1);
    }
    targetCtx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);
    targetCtx.restore();
  }

  /**
   * High-Resolution Photorealistic Clinical Sample Scene
   */
  private drawSampleScene(
    targetCtx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) {
    const bgGrad = targetCtx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0a101f');
    bgGrad.addColorStop(1, '#152138');
    targetCtx.fillStyle = bgGrad;
    targetCtx.fillRect(0, 0, w, h);

    // Architectural Window with city skyline
    const winX = w * 0.55;
    const winY = h * 0.08;
    const winW = w * 0.38;
    const winH = h * 0.52;

    targetCtx.fillStyle = '#0284c7';
    targetCtx.fillRect(winX, winY, winW, winH);
    targetCtx.strokeStyle = '#38bdf8';
    targetCtx.lineWidth = 4;
    targetCtx.strokeRect(winX, winY, winW, winH);

    // Cross panes
    targetCtx.beginPath();
    targetCtx.moveTo(winX + winW / 2, winY);
    targetCtx.lineTo(winX + winW / 2, winY + winH);
    targetCtx.moveTo(winX, winY + winH / 2);
    targetCtx.lineTo(winX + winW, winY + winH / 2);
    targetCtx.stroke();

    // Wall Snellen Eye Chart (Left wall)
    const chartX = w * 0.08;
    const chartY = h * 0.12;
    const chartW = w * 0.28;
    const chartH = h * 0.58;

    targetCtx.fillStyle = '#f8fafc';
    targetCtx.fillRect(chartX, chartY, chartW, chartH);
    targetCtx.strokeStyle = '#94a3b8';
    targetCtx.lineWidth = 2;
    targetCtx.strokeRect(chartX, chartY, chartW, chartH);

    // Chart header
    targetCtx.fillStyle = '#0f172a';
    targetCtx.font = 'bold 13px sans-serif';
    targetCtx.textAlign = 'center';
    targetCtx.fillText('BẢNG THỊ LỰC SNELLEN', chartX + chartW / 2, chartY + 26);

    // Letters
    targetCtx.font = 'bold 38px serif';
    targetCtx.fillText('E', chartX + chartW / 2, chartY + 70);

    targetCtx.font = 'bold 26px sans-serif';
    targetCtx.fillText('F  P', chartX + chartW / 2, chartY + 108);

    targetCtx.font = 'bold 20px sans-serif';
    targetCtx.fillText('T  O  Z', chartX + chartW / 2, chartY + 140);

    targetCtx.font = 'bold 15px sans-serif';
    targetCtx.fillText('L  P  E  D', chartX + chartW / 2, chartY + 168);

    targetCtx.font = 'bold 12px sans-serif';
    targetCtx.fillText('P  E  C  F  D', chartX + chartW / 2, chartY + 192);

    // Red & Green lines for Worth 4-dot / Chromatic check
    targetCtx.fillStyle = '#ef4444';
    targetCtx.fillRect(chartX + 20, chartY + 208, chartW - 40, 3);
    targetCtx.fillStyle = '#22c55e';
    targetCtx.fillRect(chartX + 20, chartY + 216, chartW - 40, 3);

    // Desk Surface
    const deskY = h * 0.68;
    targetCtx.fillStyle = '#1e293b';
    targetCtx.fillRect(0, deskY, w, h - deskY);

    // Laptop & Test target
    targetCtx.fillStyle = '#334155';
    targetCtx.beginPath();
    targetCtx.roundRect(w * 0.42, deskY - 60, w * 0.22, 60, 6);
    targetCtx.fill();

    targetCtx.fillStyle = '#00897b';
    targetCtx.beginPath();
    targetCtx.roundRect(w * 0.43, deskY - 55, w * 0.2, 50, 4);
    targetCtx.fill();

    targetCtx.fillStyle = '#ffffff';
    targetCtx.font = 'bold 10px monospace';
    targetCtx.textAlign = 'center';
    targetCtx.fillText('REMICARE STRABISMUS LAB', w * 0.53, deskY - 26);

    // Reading distance guide
    targetCtx.fillStyle = '#00c4b4';
    targetCtx.font = '11px sans-serif';
    targetCtx.textAlign = 'left';
    targetCtx.fillText('● Tiêu điểm quan sát cố định (RemiCare Phòng khám Thị giác)', 24, h - 20);
  }

  /**
   * Symmetrical Dual-Channel Visual Compositor
   * Implements true binocular disparity mechanics for Stage 3 (Clear Misalignment) and Stage 4 (Diplopia)
   */
  private compositeSimulation(
    ctx: CanvasRenderingContext2D,
    cw: number,
    ch: number,
    marginX: number,
    marginY: number,
    timestamp: number
  ) {
    const effectiveDistance = this.params.autoDistance
      ? this.lastFaceResult.estimatedDistanceCm
      : this.params.simulatedDistanceCm;

    // Convergence demand factor: looking closer increases the perceived disparity angle
    const distanceFactor = Math.max(0.7, Math.min(1.3, 40 / effectiveDistance));

    // Separation ratio from Diplopia Slider (0 to 100%)
    const offsetRatio = (this.currentDiplopiaOffset / 100);
    const totalSeparation = offsetRatio * distanceFactor;

    // Medically calibrated displacement:
    // Max horizontal displacement at 100% slider is capped to ~70px (or cw * 0.055).
    // At Stage 4 ("Song thị", slider at 32%), total displacement dx is ~24px (intimate clinical overlap "chỉ lệch như này thôi").
    // At Stage 3 ("Lệch rõ", slider at 15%), total displacement dx is ~11px (early decompensation ghosting contour).
    const maxDisplacementX = Math.min(75, Math.max(50, cw * 0.055));
    const maxDisplacementY = Math.min(45, Math.max(30, ch * 0.035));

    // Resolve alternating deviating eye
    const altEyeCycle = Math.floor(timestamp / 3200) % 2 === 0;
    const effectiveDeviatingEye =
      this.params.deviatingEye === 'alternating'
        ? (altEyeCycle ? 'right' : 'left')
        : this.params.deviatingEye;
    const eyeSign = effectiveDeviatingEye === 'right' ? 1 : -1;

    // Resolve alternate cover test (dissociating binocular fusion every 1.5s)
    const isAlternateCover = this.params.coverState === 'alternate_cover';
    const altCoverCycle = Math.floor(timestamp / 1400) % 2 === 0;
    const effectiveCoverState = isAlternateCover
      ? (altCoverCycle ? 'cover_left' : 'cover_right')
      : this.params.coverState;

    let dx = 0;
    let dy = 0;

    // Calculate disparity displacement vector
    if (this.params.direction === 'esotropia') {
      // Lác trong: Song thị đồng danh (Uncrossed Diplopia)
      // Parallel horizontal offset matching clinical ophthalmology
      dx = eyeSign * maxDisplacementX * totalSeparation;
      dy = 0;
    } else if (this.params.direction === 'exotropia') {
      // Lác ngoài: Song thị chéo (Crossed Diplopia)
      // Parallel horizontal offset matching clinical ophthalmology
      dx = -eyeSign * maxDisplacementX * totalSeparation;
      dy = 0;
    } else if (this.params.direction === 'hypertropia') {
      // Lác đứng trên: Vertical diplopia (ảnh mắt lệch thấp hơn)
      dx = eyeSign * (maxDisplacementX * 0.15) * totalSeparation;
      dy = -maxDisplacementY * totalSeparation;
    } else {
      // Lác đứng dưới (Hypotropia): Vertical diplopia (ảnh mắt lệch cao hơn)
      dx = eyeSign * (maxDisplacementX * 0.15) * totalSeparation;
      dy = maxDisplacementY * totalSeparation;
    }

    // Crucial declaration: halfShift for symmetrical dual-channel offset
    const halfShiftX = dx * 0.5;
    const halfShiftY = dy * 0.5;

    // ==================== ORTHOPTIC COVER TEST (ACTIVE OCCLUSION) ====================
    if (effectiveCoverState !== 'none') {
      const effectiveCoverSide: 'cover_left' | 'cover_right' =
        effectiveCoverState === 'cover_left' ? 'cover_left' : 'cover_right';

      // Determine if the fixating eye is the one under the paddle
      const isFixatingCovered =
        (effectiveCoverSide === 'cover_left' && effectiveDeviatingEye === 'right') ||
        (effectiveCoverSide === 'cover_right' && effectiveDeviatingEye === 'left');

      // Refixation Saccade: When the fixating eye is covered, the deviating eye must rotate
      // into position to take up fixation. This shifts the open eye's view by the deviation vector!
      const saccadeShiftX = isFixatingCovered ? dx * 0.75 : 0;
      const saccadeShiftY = isFixatingCovered ? dy * 0.75 : 0;

      ctx.save();
      // 1. Draw the live camera feed through the remaining open eye (NO BLACK SCREEN!)
      ctx.drawImage(
        this.offscreenCanvas,
        marginX + saccadeShiftX,
        marginY + saccadeShiftY,
        cw,
        ch,
        0,
        0,
        cw,
        ch
      );

      // 2. Draw the realistic Orthoptic Paddle Occluder on the covered eye side
      this.drawPaddleOccluder(
        ctx,
        cw,
        ch,
        effectiveCoverSide,
        isFixatingCovered,
        isAlternateCover
      );
      ctx.restore();
      return;
    }

    // ==================== STAGE 2: EARLY STRABISMUS / PHORIA (KHÔNG SONG THỊ) ====================
    if (this.params.condition === 'early_strabismus') {
      // In early strabismus (heterophoria), motor fusion is actively compensating.
      // Symmetrical shift is strictly 0! Single unified image!
      ctx.save();
      const pulse = Math.sin(this.microPulsePhase) * 0.003;
      ctx.translate(cw * 0.5, ch * 0.5);
      ctx.scale(1 + pulse, 1 + pulse);
      ctx.translate(-cw * 0.5, -ch * 0.5);
      ctx.drawImage(this.offscreenCanvas, marginX, marginY, cw, ch, 0, 0, cw, ch);
      ctx.restore();
      return;
    }

    // ==================== STAGE 5: CORTICAL SUPPRESSION (TRIỆT TIÊU SONG THỊ) ====================
    if (this.params.condition === 'suppression' && this.currentSuppression >= 85) {
      // In cortical suppression, the brain actively shuts down the secondary channel.
      // Diplopia is completely extinguished! Only the fixating eye channel is seen.
      ctx.save();
      ctx.drawImage(this.offscreenCanvas, marginX, marginY, cw, ch, 0, 0, cw, ch);
      ctx.restore();
      return;
    }

    // ==================== STAGE 6: AMBLYOPIA (NHƯỢC THỊ DO LÁC) ====================
    if (this.params.condition === 'amblyopia') {
      ctx.save();
      ctx.drawImage(this.offscreenCanvas, marginX, marginY, cw, ch, 0, 0, cw, ch);
      if (this.currentBlur > 0.5) {
        ctx.filter = `blur(${this.currentBlur.toFixed(1)}px) contrast(75%)`;
        ctx.globalAlpha = 0.45;
        ctx.drawImage(this.offscreenCanvas, marginX, marginY, cw, ch, 0, 0, cw, ch);
      }
      ctx.restore();
      return;
    }

    // ==================== STAGES 1, 3, 4: NORMAL, CLEAR MISALIGNMENT & TRUE DIPLOPIA ====================
    // If totalSeparation === 0 (e.g. Stage 1 Normal):
    if (totalSeparation <= 0.008) {
      ctx.save();
      ctx.drawImage(this.offscreenCanvas, marginX, marginY, cw, ch, 0, 0, cw, ch);
      ctx.restore();
      return;
    }

    // TRUE SYMMETRICAL BINOCULAR DISPARITY (Stage 3 & Stage 4):
    // Channel 1 (Fixating Visual Channel) shifts by (+halfShiftX, +halfShiftY)
    // Channel 2 (Deviating Visual Channel) shifts by (-halfShiftX, -halfShiftY)
    // Total distance between images = dx.
    // In Stage 3 (Lệch rõ): Secondary image is a softer ghost contour (alpha ~0.30)
    // In Stage 4 (Song thị hoàn toàn): Secondary image is 50/50 equal balance (alpha 0.50)
    const suppressionFactor = Math.max(0, 1 - this.currentSuppression / 100);
    const isStage3 = this.params.condition === 'clear_strabismus';
    const baseSecondaryAlpha = isStage3 ? 0.32 : 0.50;
    const secondaryAlpha = baseSecondaryAlpha * suppressionFactor;

    // 1. Render Channel 1 (Fixating Eye Stream)
    ctx.save();
    const src1X = marginX + halfShiftX;
    const src1Y = marginY + halfShiftY;

    if (this.params.redCyanDisparityAid) {
      // Orthoptic Cyan tint for Channel 1
      ctx.drawImage(this.offscreenCanvas, src1X, src1Y, cw, ch, 0, 0, cw, ch);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.fillRect(0, 0, cw, ch);
    } else {
      ctx.drawImage(this.offscreenCanvas, src1X, src1Y, cw, ch, 0, 0, cw, ch);
    }
    ctx.restore();

    // 2. Render Channel 2 (Deviating Eye Stream)
    if (secondaryAlpha > 0.01) {
      ctx.save();
      const src2X = marginX - halfShiftX;
      const src2Y = marginY - halfShiftY;

      if (this.params.redCyanDisparityAid) {
        // Orthoptic Red tint for Channel 2
        this.redFilterCtx.clearRect(0, 0, cw, ch);
        this.redFilterCtx.drawImage(this.offscreenCanvas, src2X, src2Y, cw, ch, 0, 0, cw, ch);
        this.redFilterCtx.globalCompositeOperation = 'multiply';
        this.redFilterCtx.fillStyle = 'rgba(255, 30, 80, 0.7)';
        this.redFilterCtx.fillRect(0, 0, cw, ch);

        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.85 * suppressionFactor;
        ctx.drawImage(this.redFilterCanvas, 0, 0);
      } else {
        // Natural transparent double vision:
        // 50% opacity blend over Channel 1 gives equal perceptual weight to both images!
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = secondaryAlpha;
        ctx.drawImage(this.offscreenCanvas, src2X, src2Y, cw, ch, 0, 0, cw, ch);
      }
      ctx.restore();
    }
  }

  /**
   * Realistic Clinical Orthoptic Paddle Occluder
   * Simulates the physical occluder paddle used in Cover/Uncover Test
   */
  private drawPaddleOccluder(
    ctx: CanvasRenderingContext2D,
    cw: number,
    ch: number,
    coverSide: 'cover_left' | 'cover_right',
    isFixatingCovered: boolean,
    isAlternate: boolean
  ) {
    ctx.save();
    const isLeft = coverSide === 'cover_left';
    const paddleW = cw * 0.46;
    const paddleX = isLeft ? 0 : cw - paddleW;

    // Dark semi-matte occluding paddle body
    const grad = ctx.createLinearGradient(paddleX, 0, paddleX + paddleW, ch);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#090d16');
    grad.addColorStop(1, '#020617');

    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetX = isLeft ? 12 : -12;

    ctx.beginPath();
    if (isLeft) {
      ctx.roundRect(0, 0, paddleW, ch, [0, 48, 48, 0]);
    } else {
      ctx.roundRect(paddleX, 0, paddleW, ch, [48, 0, 0, 48]);
    }
    ctx.fill();

    // Matte textured border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Occluder handle graphic
    const handleW = 16;
    const handleH = ch * 0.42;
    const handleX = isLeft ? paddleW - 32 : paddleX + 16;
    const handleY = ch - handleH;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(handleX, handleY, handleW, handleH, 8);
    ctx.fill();

    // Diagnostic text inside paddle
    const textCenterX = isLeft ? paddleW * 0.5 : paddleX + paddleW * 0.5;
    const textCenterY = ch * 0.46;

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isLeft ? 'TẤM CHE MẮT TRÁI (OS OCCLUDER)' : 'TẤM CHE MẮT PHẢI (OD OCCLUDER)',
      textCenterX,
      textCenterY - 24
    );

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Nghiệm pháp Che mắt lâm sàng (Cover Test)', textCenterX, textCenterY - 4);

    // Clinical Saccadic Response Banner
    const bannerColor = isFixatingCovered ? '#f43f5e' : '#10b981';
    const bannerBg = isFixatingCovered ? 'rgba(244, 63, 94, 0.16)' : 'rgba(16, 185, 129, 0.16)';
    const bannerBorder = isFixatingCovered ? 'rgba(244, 63, 94, 0.45)' : 'rgba(16, 185, 129, 0.45)';

    ctx.fillStyle = bannerBg;
    ctx.strokeStyle = bannerBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(textCenterX - 160, textCenterY + 16, 320, 52, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = bannerColor;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(
      isFixatingCovered
        ? '● CHE MẮT LÀNH: MẮT LỆCH GIẬT ĐỊNH THỊ'
        : '● CHE MẮT LỆCH: MẮT LÀNH ĐỨNG YÊN',
      textCenterX,
      textCenterY + 34
    );

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px sans-serif';
    ctx.fillText(
      isFixatingCovered
        ? 'Refixation Saccade: Mắt lệch xoay lại để lấy tiêu điểm'
        : 'No Movement: Mắt lành đã cố định tiêu điểm từ trước',
      textCenterX,
      textCenterY + 52
    );

    if (isAlternate) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('🔄 Đang che luân phiên (Phá vỡ hoàn toàn dung hợp)', textCenterX, textCenterY + 84);
    }

    ctx.restore();
  }

  /**
   * High-Precision Clinical Hirschberg Corneal Light Reflex Visual Guide Overlay
   * Displays anatomical dual-cornea inspection loupe with Purkinje reflection I glints
   */
  private drawHirschbergOverlay(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
    const cardW = Math.min(580, cw - 32);
    const cardH = 175;
    const cardX = (cw - cardW) / 2;
    const cardY = 76; // Placed below top header bar to prevent UI overlap

    ctx.save();
    // Glassmorphic dark card
    ctx.fillStyle = 'rgba(8, 14, 26, 0.94)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    // Header title
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ĐO ĐỘ LỆCH BẰNG PHẢN XẠ GIÁC MẠC (HIRSCHBERG CORNEAL REFLEX TEST)', cardX + cardW / 2, cardY + 22);

    const devRatio = this.currentDeviation / 100;
    const reflexMm = devRatio * 4.0; // 0.0mm to 4.0mm
    const reflexDegrees = (reflexMm * 7.0).toFixed(1);
    const reflexPrism = Math.round(reflexMm * 15.0);

    const eyeCenterY = cardY + 76;
    const eyeSpacing = cardW * 0.28;
    const leftEyeX = cardX + cardW * 0.5 - eyeSpacing;
    const rightEyeX = cardX + cardW * 0.5 + eyeSpacing;
    const irisR = 28;
    const pupilR = 12;

    // Draw Left Eye (OS)
    this.drawCornealEye(ctx, leftEyeX, eyeCenterY, irisR, pupilR, 'Mắt Trái (OS)', 0, 0, false);

    // Draw Right Eye (OD - Deviating)
    let glintOffsetX = 0;
    let glintOffsetY = 0;
    const mmToPixel = (pupilR * 2) / 4; // 4mm pupil diameter corresponds to pupilR*2

    if (this.params.direction === 'esotropia') {
      // Lác trong: Phản xạ dời ra THÁI DƯƠNG (Temporal = sang phải trên mắt phải)
      glintOffsetX = reflexMm * mmToPixel;
      glintOffsetY = 0;
    } else if (this.params.direction === 'exotropia') {
      // Lác ngoài: Phản xạ dời vào MŨI (Nasal = sang trái trên mắt phải)
      glintOffsetX = -reflexMm * mmToPixel;
      glintOffsetY = 0;
    } else if (this.params.direction === 'hypertropia') {
      // Lác đứng trên: Phản xạ dời XUỐNG DƯỚI (Inferior)
      glintOffsetX = 0;
      glintOffsetY = reflexMm * mmToPixel;
    } else {
      // Lác đứng dưới (Hypotropia): Phản xạ dời LÊN TRÊN (Superior)
      glintOffsetX = 0;
      glintOffsetY = -reflexMm * mmToPixel;
    }

    const dirLabel =
      this.params.direction === 'esotropia'
        ? 'Lệch Thái Dương'
        : this.params.direction === 'exotropia'
        ? 'Lệch Mũi'
        : this.params.direction === 'hypertropia'
        ? 'Lệch Dưới'
        : 'Lệch Trên';

    this.drawCornealEye(
      ctx,
      rightEyeX,
      eyeCenterY,
      irisR,
      pupilR,
      'Mắt Phải (OD)',
      glintOffsetX,
      glintOffsetY,
      reflexMm > 0.1,
      `${dirLabel}: ${reflexMm.toFixed(1)}mm`
    );

    // Center Penlight Coaxial Beam indicator
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🔦 Đèn Pin Khám Đồng Trục', cardX + cardW / 2, eyeCenterY - 12);
    ctx.fillText('Coaxial Light Beam', cardX + cardW / 2, eyeCenterY + 2);

    // Bottom diagnostic formula bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(cardX + 16, cardY + cardH - 36, cardW - 32, 26, 6);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Quy tắc Hirschberg: 1mm lệch ≈ 7° góc lệch ≈ 15Δ Lăng kính  |  Đang đo: ${reflexMm.toFixed(1)}mm ≈ ${reflexDegrees}° (${reflexPrism}Δ)`,
      cardX + cardW / 2,
      cardY + cardH - 19
    );

    ctx.restore();
  }

  private drawCornealEye(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    irisR: number,
    pupilR: number,
    label: string,
    glintX: number,
    glintY: number,
    hasDisplacement: boolean,
    deviationDetail?: string
  ) {
    // Sclera circle
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(cx, cy, irisR + 5, 0, Math.PI * 2);
    ctx.fill();

    // Iris (Deep oceanic blue with limbal ring)
    const irisGrad = ctx.createRadialGradient(cx, cy, pupilR, cx, cy, irisR);
    irisGrad.addColorStop(0, '#0284c7');
    irisGrad.addColorStop(0.8, '#0369a1');
    irisGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#050811';
    ctx.beginPath();
    ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // Millimeter crosshairs (fine cyan ticks)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx - irisR, cy);
    ctx.lineTo(cx + irisR, cy);
    ctx.moveTo(cx, cy - irisR);
    ctx.lineTo(cx, cy + irisR);
    ctx.stroke();

    // Ticks at 2mm (pupil margin) and 4mm (limbus)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
    ctx.stroke();

    // If displaced, draw red dashed indicator line from pupil center
    if (hasDisplacement) {
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + glintX, cy + glintY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Corneal Specular Glint (Purkinje Image I)
    const px = cx + glintX;
    const py = cy + glintY;

    // Specular flare
    const flareGrad = ctx.createRadialGradient(px, py, 1, px, py, 6);
    flareGrad.addColorStop(0, '#ffffff');
    flareGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.9)');
    flareGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    // Intense center pinpoint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + irisR + 15);

    if (deviationDetail) {
      ctx.fillStyle = '#f43f5e';
      ctx.font = '9px monospace';
      ctx.fillText(deviationDetail, cx, cy + irisR + 27);
    } else {
      ctx.fillStyle = '#10b981';
      ctx.font = '9px monospace';
      ctx.fillText('Tâm: 0.0mm (0°)', cx, cy + irisR + 27);
    }
  }

  /**
   * Sleek minimal corner-bracket face detection box
   */
  private drawFaceBoxOverlay(
    ctx: CanvasRenderingContext2D,
    cw: number,
    ch: number,
    box: { x: number; y: number; width: number; height: number },
    mirrored: boolean
  ) {
    let bx = box.x * cw;
    const by = box.y * ch;
    const bw = box.width * cw;
    const bh = box.height * ch;

    if (mirrored) {
      bx = cw - (bx + bw);
    }

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    const cornerSize = Math.min(24, bw * 0.2);

    // Top-Left corner
    ctx.beginPath();
    ctx.moveTo(bx, by + cornerSize);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + cornerSize, by);
    ctx.stroke();

    // Top-Right corner
    ctx.beginPath();
    ctx.moveTo(bx + bw - cornerSize, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + cornerSize);
    ctx.stroke();

    // Bottom-Left corner
    ctx.beginPath();
    ctx.moveTo(bx, by + bh - cornerSize);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + cornerSize, by + bh);
    ctx.stroke();

    // Bottom-Right corner
    ctx.beginPath();
    ctx.moveTo(bx + bw - cornerSize, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by + bh - cornerSize);
    ctx.stroke();

    ctx.restore();
  }
}
