# Architecture Specification Document (`arsitektur.md`)
## Digital Disposable Camera & Event Album ("SatuFoto")

---

## 1. System Architecture Overview

SatuFoto dibangun dengan arsitektur **Client-Side First & Event-Driven Web Application**, yang memanfaatkan kapabilitas perangkat keras browser modern (WebRTC Media Camera API, HTML5 Canvas GPU Acceleration, Web Audio API, serta Local Storage Synchronization).

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|                                                                                   |
|  +------------------------+  +------------------------+  +---------------------+  |
|  |   Camera Viewfinder    |  |   HTML5 Canvas Filter  |  |  Web Audio Shutter  |  |
|  | (MediaDevices Web API) |  |   & Frame Compositor   |  |   Sound Synthesizer |  |
|  +-----------+------------+  +-----------+------------+  +----------+----------+  |
|              |                           |                          |             |
|              +-------------------+-------+                          |             |
|                                  v                                  v             |
|                    +---------------------------+                                  |
|                    |   Guest Photo Upload Flow |                                  |
|                    +-------------+-------------+                                  |
|                                  |                                                |
|                                  v                                                |
|                    +---------------------------+                                  |
|                    | Central Event State Store |                                  |
|                    | (Reactive State / Storage)|                                  |
|                    +-------------+-------------+                                  |
|                                  |                                                |
|            +---------------------+---------------------+                          |
|            |                                           |                          |
|            v                                           v                          |
|  +-------------------+                       +-------------------+                |
|  |  Event Album Grid |                       |  Live Slideshow   |                |
|  |    \u0026 Lightbox    |                       | (Projector Screen)|                |
|  +-------------------+                       +-------------------+                |
+-----------------------------------------------------------------------------------+
```

---

## 2. Technology Stack

- **Core Framework**: React 18 / Vite / JavaScript (ESNext).
- **Styling & Theme**: Vanilla CSS Custom Properties (CSS Variables) with Dark Luxury Color Tokens (`#060606`, `#080808`, `#E2A07A`, `#111111`).
- **Hardware Integration**:
  - `navigator.mediaDevices.getUserMedia`: Mobile & desktop camera feed capture.
  - `HTMLCanvasElement`: Film preset filter processing & watermark frame compositing.
  - `AudioContext` / Web Audio API: Zero-latency shutter click sound generation.
- **Utilities**:
  - `qrcode`: Dynamic QR Code canvas/SVG generation for instant scan.
  - `JSZip` / `FileSaver`: Client-side bulk album downloading (.ZIP).
  - `Lucide React`: Premium vector iconography.

---

## 3. Core Component Modules

### 3.1 Camera Engine (`CameraEngine.js` / `DisposableCameraModal.jsx`)
- Stream Initialization: Acquires video stream with `{ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } }`.
- Camera Flip: Switches seamlessly between `'environment'` (rear camera) and `'user'` (front camera).
- Flash Simulation: Triggers hardware torch if supported, combined with a 150ms screen-flash white overlay animation.

### 3.2 Canvas Filter & Frame Compositor Engine (`FilterEngine.js`)
- Filter Processing Matrix:
  - **Kodak Portra 400**: Contrast (1.05), Sepia (0.15), Saturation (1.1), Warm Tint overlay `rgba(255, 220, 180, 0.08)`.
  - **CineStill 800T**: Cool Teal contrast, Blue Shift, Halation Highlight Glow `rgba(0, 200, 255, 0.06)`.
  - **Fuji Superia**: Emerald contrast boost, Saturation (1.2), Sharp Highlights.
  - **B&W Vintage Noir**: Grayscale (100%), High Contrast (1.3), Grain overlay texture.
- Frame Watermark Overlay: Draws custom SVG/PNG frame elements (e.g. event title date stamp) onto the final high-res 1:1 or 4:3 canvas buffer before outputting Base64 Data URL.

### 3.3 Audio Synthesizer Engine (`AudioEngine.js`)
- Generates realistic camera mechanical click & shutter sound using Web Audio API buffer/oscillator, eliminating external audio asset loading delays.

### 3.4 Event & Guest Session Management (`useEventStore.js`)
- **Roll Limit Tracker**: Tracks remaining shots per device via `localStorage.getItem('satufoto_roll_count_[eventId]')`.
- **Photo Store**: Manages list of captured photos, timestamps, guest names, wishes, likes, and reveal state.

---

## 4. Data Schemas

### 4.1 Event Schema (`Event`)
```json
{
  "id": "rakyan-wedding-2026",
  "title": "Rakyan's Wedding Day",
  "subtitle": "Kamera Sekali Pakai & Album Kenangan",
  "date": "2026-08-02",
  "location": "Jakarta, Indonesia",
  "coverImage": "https://images.unsplash.com/photo-1519741497674-611481863552",
  "maxShotsPerGuest": 10,
  "revealMode": "instant",
  "revealTimestamp": "2026-08-02T23:59:59Z",
  "hostName": "Rakyan & Partner",
  "frameText": "Rakyan's Wedding Day • 02.08.2026"
}
```

### 4.2 Photo Object Schema (`Photo`)
```json
{
  "id": "photo_1722600000000_abc123",
  "eventId": "rakyan-wedding-2026",
  "guestName": "Ananda & Budi",
  "wish": "Selamat ya Rakyan! Langgeng sampai maut memisahkan! 🎉",
  "imageUrl": "data:image/jpeg;base64,...",
  "presetId": "portra400",
  "likes": 12,
  "timestamp": "2026-08-02T18:30:00.000Z",
  "isRevealed": true
}
```

---

## 5. UI Layout & Component Breakdown

```
src/
├── assets/                  # Audio & static texture overlays
├── components/
│   ├── Header.jsx           # Cover banner, event info & primary action toolbar
│   ├── DisposableCamera.jsx # Camera viewfinder, shutter, roll counter, filter picker
│   ├── UploadModal.jsx      # Guest name & wish entry form with photo preview
│   ├── Gallery.jsx          # Responsive photo grid, filter tabs, & like interactions
│   ├── PhotoLightbox.jsx    # Fullscreen photo view with wish detail & download
│   ├── LiveSlideshow.jsx    # Fullscreen projector slideshow mode with QR overlay
│   ├── QRCodeModal.jsx      # QR code viewer & printable poster preview
│   └── HostControls.jsx     # Event configuration & bulk ZIP export button
├── utils/
│   ├── filterEngine.js      # Canvas film filter presets & frame compositor
│   ├── audioEngine.js       # Web Audio API shutter sound generator
│   └── storage.js           # Local storage event state persistence
├── App.jsx                  # Main application orchestrator & router
├── main.jsx                 # Entry point
└── index.css                # Global CSS variables, Dark Luxury theme, Glassmorphism
```

---

## 6. Performance & UX Optimizations

1. **Lazy Image Loading & Blur Placeholder**: Gallery photos utilize native `loading="lazy"` and CSS smooth fade-in to maintain 60 FPS scrolling performance.
2. **GPU Canvas Compositing**: Processing photo filters on off-screen HTML5 canvas ensures instant preview without freezing the UI.
3. **Responsive Viewport Support**: UI auto-adapts from narrow mobile screens (375px) up to ultra-wide displays (4K Projectors for Live Slideshow).
