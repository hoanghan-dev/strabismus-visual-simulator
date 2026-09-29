# Strabismus Real-Time Webcam Visual Simulator — Product Analysis & Architecture Specification

## 1. Executive Summary & Purpose
This document provides the foundational engineering and medical visualization architecture for the **Real-Time Webcam Strabismus Visual Experience**.
The core concept is **The webcam is the primary visual input**: transforming the user's live video stream to provide an authentic, educational approximation of binocular vision mechanics, ocular misalignment, diplopia (double vision), and cortical suppression.

---

## 2. Medical Principles & Limitations

### 2.1 Medical Scope & Educational Disclaimer
- **Not a Diagnostic Tool**: This application does not diagnose, screen, or measure clinical strabismus, refractive errors, or amblyopia.
- **Educational Approximation**: Real human visual perception in strabismus is multifaceted. It depends heavily on:
  - Age of onset (congenital / infantile vs. acquired adult strabismus)
  - Type and direction of deviation (Esotropia / Exotropia / Hypertropia / Cyclotropia)
  - Constancy (intermittent vs. constant)
  - Sensory adaptation state (Suppression, Anomalous Retinal Correspondence / ARC, Amblyopia)
  - Motor fusion range and binocular summation
- **Clinical Distinction**:
  - In **acquired adult strabismus**, diplopia (double vision) and visual confusion are prominent because the mature visual cortex cannot suppress the deviating eye's image.
  - In **infantile / early-onset strabismus**, the highly plastic visual cortex actively suppresses the conflicting image from the deviating fovea/macula to eliminate diplopia, which frequently leads to amblyopia ("lazy eye") and deficient stereopsis (depth perception).

---

## 3. System Architecture & Data Flow

```text
┌────────────────────────────────────────────────────────┐
│                   Browser Environment                  │
│                                                        │
│  [navigator.mediaDevices.getUserMedia]                 │
│         │                                              │
│         ▼                                              │
│  [HTMLVideoElement] (Hidden, autoPlay, playsInline)    │
│         │                                              │
│         ▼                                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Render Loop (requestAnimationFrame @ 60 FPS)      │  │
│  │                                                  │  │
│  │  1. Ingest frame dimensions & aspect ratio       │  │
│  │  2. Read Simulation Parameters (from Ref)        │  │
│  │  3. Interpolate stage transitions (Smooth Lerp)  │  │
│  │  4. Split into Left & Right Visual Channels      │  │
│  │  5. Apply Angular Displacement (Prism / Offset)  │  │
│  │  6. Apply Suppression / Opacity / Contrast Atten │  │
│  │  7. Composite to High-DPI Output Canvas          │  │
│  │  8. Optional Visual Guides (Hirschberg / Axis)   │  │
│  └──────────────────────────────────────────────────┘  │
│         │                                              │
│         ▼                                              │
│  [HTMLCanvasElement (Cover mode, mirrored)]            │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ React UI Layer (Decoupled from Render Loop)      │  │
│  │  - Stage Selector (Normal -> Misaligned ->       │  │
│  │                     Diplopia -> Suppression)     │  │
│  │  - Fine-grained Deviation & Separation Sliders   │  │
│  │  - Eye Selection (Left vs. Right Deviating)      │  │
│  │  - Educational Callouts & Disclaimers            │  │
│  │  - Camera Permissions & Fallback Selector        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 4. Visual Transformation & Simulation Engine

### 4.1 Parameter Specification
The engine is driven by a normalized configuration model:

```typescript
export interface SimulationConfig {
  stage: 'normal' | 'early_deviation' | 'clear_deviation' | 'diplopia' | 'suppression';
  deviationAngle: number;       // 0 to 100% (angular deviation in prism diopters equivalent)
  direction: 'esotropia' | 'exotropia' | 'hypertropia'; // Inward, Outward, Upward
  deviatingEye: 'left' | 'right' | 'alternating';
  diplopiaSeparation: number;  // Pixel / disparity factor
  fusionLevel: number;         // 1.0 (perfect motor/sensory fusion) -> 0.0 (complete breakdown)
  suppressionDepth: number;    // 0.0 (no cortical suppression) -> 1.0 (dominant eye suppression)
  suppressionContrast: number; // Secondary channel contrast attenuation
  viewMode: 'binocular' | 'fixating_only' | 'deviating_only' | 'split_comparison';
  tintDisparity: boolean;      // Orthoptic red/cyan pedagogical disambiguation toggle
  mirrored: boolean;           // Mirror webcam feed (natural user orientation)
}
```

### 4.2 Stage Matrix
1. **Stage 1 — Normal Binocular Vision (Bình thường)**:
   - Deviation: 0% | Fusion: 1.0 | Suppression: 0.0
   - Both visual axes align on fixation point. Single coherent image.
2. **Stage 2 — Intermittent / Early Misalignment (Lệch nhẹ)**:
   - Deviation: 5% - 25% | Fusion: 0.8 -> 0.5
   - Subtle instability / slight micro-shift on deviating channel, showing the effort required to maintain fusion.
3. **Stage 3 — Clear Misalignment (Lệch rõ)**:
   - Deviation: 30% - 60% | Fusion: 0.2
   - Evident retinal disparity between foveal image and peripheral image of the two eyes.
4. **Stage 4 — Diplopia / Double Vision (Song thị)**:
   - Deviation: 60% - 100% | Fusion: 0.0 | Suppression: 0.0
   - Unsuppressed simultaneous perception: False image separated horizontally (uncrossed for esotropia, crossed for exotropia) or vertically (hypertropia).
5. **Stage 5 — Cortical Suppression / Adaptation (Não thích nghi)**:
   - Deviation: 70% | Fusion: 0.0 | Suppression: 0.85
   - The deviating eye's image does NOT become a black hole. Instead, cortical inhibition progressively dampens its luminance contribution and salience, resolving diplopia while sacrificing stereoscopic depth.

---

## 5. Technology Evaluation: Canvas 2D vs. WebGL

| Metric | Canvas 2D Context | WebGL / Three.js |
| :--- | :--- | :--- |
| **Startup Latency** | Instant (0ms) | 200–800ms shader compile |
| **Device Compatibility** | 100% of browsers | Vulnerable to WebGL context loss |
| **Performance for 2-channel Compositing** | Rock-solid 60 FPS | 60 FPS |
| **Code Complexity & Footprint** | Lightweight, zero extra deps | Heavy, shader boilerplate |
| **Verdict** | **Recommended Standard** | Optional future enhancement |

Canvas 2D with `drawImage`, `globalAlpha`, `filter`, and coordinate transformations delivers exceptional frame rates, zero memory leaks, and native resilience across both high-end desktop and mobile webcams.

---

## 6. Face & Eye Tracking Assessment
- Heavy libraries (e.g. MediaPipe / TF.js) add ~15MB bundle overhead and can fail in dim lighting or non-standard orientations.
- In strabismus, what the patient experiences is a double/misaligned view of the *entire visual world*, not a local facial filter.
- Therefore, the visual transformation engine processes the full camera scene with optical disparity.
- A built-in, lightweight focal point guide and interactive Hirschberg corneal light reflection simulation can be provided cleanly on Canvas without external multi-megabyte neural network dependencies.

---

## 7. Technical Risks & Mitigation Strategies
1. **Camera Permission Denied or Unavailable**:
   - *Mitigation*: Graceful permission gate with friendly prompt; automatic fallback to a high-fidelity synthetic interactive animated optical scene and sample video loop.
2. **Aspect Ratio Distortion**:
   - *Mitigation*: Implement letterboxed/cover canvas rendering math (`contain` or `cover`) preserving intrinsic camera aspect ratio.
3. **Frame-Rate Stutters in React**:
   - *Mitigation*: Strictly decouple state changes from frame drawing. The render loop reads from an unmanaged JavaScript ref, updating sliders without React re-render penalties.

---

## 8. Implementation Phases
- **Phase 0**: Project Inspection & Architectural Analysis (Completed).
- **Phase 1**: Real-Time Camera Stream, Canvas Ingestion & Solid 60FPS Baseline.
- **Phase 2**: Dual-Channel Visual Transformation Engine with Gradual Displacement.
- **Phase 3**: Diplopia (Double Vision) Mechanics with Crossed/Uncrossed Disparity Controls.
- **Phase 4**: Cortical Suppression Simulation & Monocular Dominance Adaptation.
- **Phase 5**: Interactive Visual Guides (Hirschberg Test mode, Orthoptic Disparity Tint, Channel Comparison).
- **Phase 6**: UI Polish, Accessibility, Responsive Layout, Medical Disclaimers & Reference Citations.
