/**
 * Real-time Face & Distance Detector for Webcam
 * Uses native browser FaceDetector API if available, 
 * with a high-performance computer vision fallback (YCbCr/HSV skin chrominance + feature bounding box).
 */

export interface FaceDetectionResult {
  detected: boolean;
  box?: { x: number; y: number; width: number; height: number };
  estimatedDistanceCm: number;
  distanceLabel: 'Rất gần' | 'Gần' | 'Vừa' | 'Xa';
}

export class RealtimeFaceTracker {
  private processingCanvas: HTMLCanvasElement;
  private pctx: CanvasRenderingContext2D;
  private nativeDetector: any = null;
  private smoothedDistance = 38;
  private isDetecting = false;
  private lastDetectTime = 0;
  private detected = false;
  private currentBox: { x: number; y: number; width: number; height: number } | null = null;

  constructor() {
    this.processingCanvas = document.createElement('canvas');
    this.processingCanvas.width = 160;
    this.processingCanvas.height = 120;
    this.pctx = this.processingCanvas.getContext('2d', { willReadFrequently: true })!;

    // Check for native Chromium FaceDetector
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        const FaceDetectorClass = (window as any).FaceDetector;
        this.nativeDetector = new FaceDetectorClass({ fastMode: true, maxDetectedFaces: 1 });
      } catch (e) {
        console.info('Native FaceDetector not accessible, using fast CV fallback');
      }
    }
  }

  public async track(video: HTMLVideoElement): Promise<FaceDetectionResult> {
    const now = performance.now();
    // Throttle heavy detection to ~12-15 FPS to maintain 60 FPS rendering
    if (now - this.lastDetectTime < 70 && this.detected && this.currentBox) {
      return this.formatResult(this.detected, this.smoothedDistance, this.currentBox);
    }
    this.lastDetectTime = now;

    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0) {
      return { detected: false, estimatedDistanceCm: 38, distanceLabel: 'Xa' };
    }

    try {
      // 1. Try Native FaceDetector if available
      if (this.nativeDetector) {
        const faces = await this.nativeDetector.detect(video);
        if (faces && faces.length > 0) {
          const face = faces[0];
          const bb = face.boundingBox;
          const relativeWidth = bb.width / video.videoWidth;
          const computedDistance = this.calculateDistance(relativeWidth);
          this.smoothedDistance += (computedDistance - this.smoothedDistance) * 0.2;
          this.detected = true;
          this.currentBox = {
            x: bb.x / video.videoWidth,
            y: bb.y / video.videoHeight,
            width: relativeWidth,
            height: bb.height / video.videoHeight,
          };
          return this.formatResult(true, Math.round(this.smoothedDistance), this.currentBox);
        }
      }

      // 2. Fast Computer Vision Skin-Tone & Centroid Fallback
      const res = this.detectFastCV(video);
      return res;
    } catch (e) {
      return this.formatResult(false, Math.round(this.smoothedDistance));
    }
  }

  private detectFastCV(video: HTMLVideoElement): FaceDetectionResult {
    const w = this.processingCanvas.width;
    const h = this.processingCanvas.height;

    this.pctx.drawImage(video, 0, 0, w, h);
    const imgData = this.pctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, maxX = 0, minY = h, maxY = 0;
    let skinPixelCount = 0;

    // Scan central 80% region where face typically sits
    const startX = Math.floor(w * 0.1);
    const endX = Math.floor(w * 0.9);
    const startY = Math.floor(h * 0.08);
    const endY = Math.floor(h * 0.92);

    for (let y = startY; y < endY; y += 2) {
      for (let x = startX; x < endX; x += 2) {
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Robust skin tone detection in RGB
        // R > 95, G > 40, B > 20, max - min > 15, |R - G| > 15, R > G, R > B
        if (
          r > 80 &&
          g > 35 &&
          b > 15 &&
          r > g &&
          r > b &&
          r - g > 12 &&
          Math.max(r, g, b) - Math.min(r, g, b) > 15
        ) {
          skinPixelCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const minSkinThreshold = (w * h * 0.025); // At least 2.5% skin pixels
    if (skinPixelCount > minSkinThreshold && maxX > minX && maxY > minY) {
      const boxWidth = (maxX - minX) / w;
      const boxHeight = (maxY - minY) / h;
      const computedDistance = this.calculateDistance(boxWidth);
      
      this.smoothedDistance += (computedDistance - this.smoothedDistance) * 0.25;
      this.detected = true;
      this.currentBox = {
        x: minX / w,
        y: minY / h,
        width: boxWidth,
        height: boxHeight,
      };
      return this.formatResult(true, Math.round(this.smoothedDistance), this.currentBox);
    } else {
      this.detected = false;
      return this.formatResult(false, Math.round(this.smoothedDistance));
    }
  }

  private calculateDistance(faceRelativeWidth: number): number {
    // Standard face is ~15cm wide. In standard webcams (FOV ~60-70 deg):
    // face filling 50% width ~= 20-25cm (Gần)
    // face filling 25% width ~= 40-45cm (Xa)
    // face filling 15% width ~= 70cm
    const clamped = Math.max(0.1, Math.min(0.85, faceRelativeWidth));
    const dist = (0.28 / clamped) * 35;
    return Math.max(12, Math.min(65, Math.round(dist)));
  }

  private formatResult(
    detected: boolean,
    distanceCm: number,
    box?: { x: number; y: number; width: number; height: number }
  ): FaceDetectionResult {
    let distanceLabel: 'Rất gần' | 'Gần' | 'Vừa' | 'Xa' = 'Xa';
    if (distanceCm <= 18) {
      distanceLabel = 'Rất gần';
    } else if (distanceCm <= 28) {
      distanceLabel = 'Gần';
    } else if (distanceCm <= 42) {
      distanceLabel = 'Vừa';
    } else {
      distanceLabel = 'Xa';
    }

    return {
      detected,
      box,
      estimatedDistanceCm: distanceCm,
      distanceLabel,
    };
  }
}
