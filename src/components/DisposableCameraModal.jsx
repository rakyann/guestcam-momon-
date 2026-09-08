import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Zap, ZapOff, RefreshCw, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { FILM_PRESETS, processImageWithFilterAndFrame } from '../utils/filterEngine';
import { playShutterSound } from '../utils/audioEngine';

export default function DisposableCameraModal({ isOpen, onClose, remainingRolls, event, onPhotoCaptured }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [flashMode, setFlashMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('clean');
  const [showFrame, setShowFrame] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      return;
    }
    startCameraStream();
    return () => stopCameraStream();
  }, [isOpen, facingMode]);

  // Handle hardware torch toggle on mobile devices
  useEffect(() => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          track.applyConstraints({
            advanced: [{ torch: flashMode }]
          }).catch(err => console.warn('Torch constraint warning:', err));
        }
      } catch (err) {
        console.warn('Torch capability check error:', err);
      }
    }
  }, [flashMode, stream]);

  const startCameraStream = async () => {
    stopCameraStream();
    setCameraError(null);
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.warn("Camera stream access failed:", err);
      setCameraError("Akses kamera tidak tersedia. Pilih foto dari galeri!");
    }
  };

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleCapture = async () => {
    if (remainingRolls <= 0) {
      alert("Kuota foto sekali pakai Anda untuk acara ini sudah habis!");
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    playShutterSound();

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 400);

    try {
      let rawDataUrl = null;

      if (videoRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1080;
        canvas.height = video.videoHeight || 1080;
        const ctx = canvas.getContext('2d');

        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      } else {
        rawDataUrl = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80";
      }

      const processedUrl = await processImageWithFilterAndFrame(
        rawDataUrl,
        selectedPreset,
        event.frameText,
        showFrame
      );

      onPhotoCaptured(processedUrl, selectedPreset);
      onClose();
    } catch (err) {
      console.error("Capture error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (remainingRolls <= 0) {
      alert("Kuota foto sekali pakai Anda untuk acara ini sudah habis!");
      return;
    }

    setIsProcessing(true);
    playShutterSound();

    const reader = new FileReader();
    reader.onload = async (eventData) => {
      try {
        const rawDataUrl = eventData.target.result;
        const processedUrl = await processImageWithFilterAndFrame(
          rawDataUrl,
          selectedPreset,
          event.frameText,
          showFrame
        );
        onPhotoCaptured(processedUrl, selectedPreset);
        onClose();
      } catch (err) {
        console.error("File process error:", err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const currentPresetObj = FILM_PRESETS.find(p => p.id === selectedPreset) || FILM_PRESETS[0];

  // Define live overlay styles for iOS Safari & Android mobile compatibility
  const livePresetOverlayStyles = {
    portra400: {
      backdropFilter: 'contrast(108%) saturate(115%) sepia(20%)',
      backgroundColor: 'rgba(255, 215, 170, 0.14)',
      mixBlendMode: 'color'
    },
    cinestill800t: {
      backdropFilter: 'contrast(115%) saturate(125%) hue-rotate(-15deg)',
      backgroundColor: 'rgba(0, 190, 225, 0.12)',
      mixBlendMode: 'overlay'
    },
    fujisuperia: {
      backdropFilter: 'contrast(112%) saturate(130%) hue-rotate(10deg)',
      backgroundColor: 'rgba(160, 245, 185, 0.10)',
      mixBlendMode: 'color'
    },
    bwmono: {
      backdropFilter: 'grayscale(100%) contrast(130%)',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      mixBlendMode: 'normal'
    },
    clean: {
      backdropFilter: 'none',
      backgroundColor: 'transparent',
      mixBlendMode: 'normal'
    }
  };

  const activeLiveStyle = livePresetOverlayStyles[selectedPreset] || livePresetOverlayStyles.portra400;

  return (
    <div className="modal-backdrop-editorial z-50">
      {/* Bright Screen Flash Overlay */}
      {isFlashing && <div className="screen-flash-overlay" />}

      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scale-up">
        {/* Camera Header Bar */}
        <div className="px-5 py-3.5 bg-[#121212] border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black px-3 py-1 rounded-full border border-red-500/40">
              <span className="text-[9px] text-red-500 font-mono tracking-widest uppercase">ROLL:</span>
              <span className="led-counter-screen text-xs">
                {String(remainingRolls).padStart(2, '0')} / {event.maxShotsPerGuest}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-white hover:text-black flex items-center justify-center text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Window */}
        <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-stone-400" />
              <p className="text-xs text-stone-300 max-w-xs">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-editorial-pill py-2.5 px-5 text-[10px] mt-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Foto dari Galeri</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-all ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                style={{ filter: currentPresetObj.cssFilter }}
              />

              {/* Real-time Live Filter Viewfinder Overlay Layer (Works 100% on Mobile Safari & Android) */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={{
                  backdropFilter: activeLiveStyle.backdropFilter,
                  WebkitBackdropFilter: activeLiveStyle.backdropFilter,
                  backgroundColor: activeLiveStyle.backgroundColor,
                  mixBlendMode: activeLiveStyle.mixBlendMode
                }}
              />
            </>
          )}

          {/* Viewfinder Grid Target */}
          <div className="absolute inset-0 pointer-events-none opacity-25 border border-white/20 flex items-center justify-center z-10">
            <div className="w-full h-[1px] bg-white/40" />
            <div className="h-full w-[1px] bg-white/40 absolute" />
            <div className="w-16 h-16 border border-white/60 rounded-full" />
          </div>

          {/* Optional Frame Preview Badge if enabled */}
          {showFrame && (
            <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex justify-between items-center text-[10px] text-stone-300 z-10">
              <span className="font-semibold truncate">{event.frameText}</span>
              <span className="font-mono text-[8px] uppercase tracking-widest text-stone-400">TUAIPANDANG FRAME</span>
            </div>
          )}
        </div>

        {/* Preset Film Bar */}
        <div className="p-4 bg-[#121212] border-t border-white/10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-400" />
              Preset Film Analog:
            </span>
            <button
              onClick={() => setShowFrame(!showFrame)}
              className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
                showFrame ? 'bg-white text-black border-white font-bold' : 'bg-white/5 text-stone-400 border-white/20'
              }`}
            >
              Watermark Frame: {showFrame ? 'ON' : 'OFF (Clean)'}
            </button>
          </div>

          {/* Presets List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FILM_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap transition-all border ${
                  selectedPreset === preset.id
                    ? 'bg-white text-black border-white font-bold shadow-md'
                    : 'bg-white/5 text-stone-300 border-white/20 hover:border-white/50 hover:text-white'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Shutter Bar */}
        <div className="p-5 bg-[#0a0a0a] flex items-center justify-around z-10">
          {/* Flash Toggle */}
          <button
            onClick={() => setFlashMode(!flashMode)}
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
              flashMode ? 'bg-white text-black border-white' : 'border-white/30 text-stone-300 hover:bg-white/10'
            }`}
            title="Toggle Flash"
          >
            {flashMode ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
          </button>

          {/* Shutter Button */}
          <button
            onClick={handleCapture}
            disabled={remainingRolls <= 0 || isProcessing}
            className="w-18 h-18 rounded-full border-2 border-white p-1 shadow-2xl active:scale-95 transition-transform flex items-center justify-center disabled:opacity-40"
            title="Ambil Foto"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <Camera className="w-7 h-7 text-black" />
            </div>
          </button>

          {/* Switch Camera */}
          <button
            onClick={handleSwitchCamera}
            className="w-11 h-11 rounded-full border border-white/30 text-stone-300 flex items-center justify-center hover:bg-white/10 transition-colors"
            title="Ganti Kamera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
}
