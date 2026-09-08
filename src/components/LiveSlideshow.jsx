import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, QrCode as QrIcon } from 'lucide-react';

export default function LiveSlideshow({ photos, event, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isOpen || !isPlaying || photos.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between overflow-hidden select-none animate-scale-up">
      {/* Background Ambient Radial Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black" />

      {/* Top Header Bar */}
      <div className="relative z-20 px-8 py-6 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <div>
            <h3 className="font-calligraphy text-3xl md:text-4xl text-white font-normal leading-none">
              {event.hostName}
            </h3>
            <p className="text-[9px] uppercase tracking-editorial text-stone-400 font-mono mt-1">
              LIVE PROJECTOR STREAM • {photos.length} MOMENTS CAPTURED
            </p>
          </div>
        </div>

        {/* Minimalist Top Control Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full border border-white/30 bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            title={isPlaying ? 'Jeda Slideshow' : 'Mulai Slideshow'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/30 bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
            title="Tutup Slideshow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Slideshow Area */}
      <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 z-10">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-6 z-20 w-12 h-12 rounded-full border border-white/30 bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-6 z-20 w-12 h-12 rounded-full border border-white/30 bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Main Photo Display Card */}
        <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center">
          <img
            key={currentPhoto.id}
            src={currentPhoto.imageUrl}
            alt={currentPhoto.guestName}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/20 animate-fade-in"
          />

          {/* Editorial Floating Caption Card Overlay */}
          <div className="absolute bottom-6 left-6 right-6 md:left-12 md:right-12 p-6 bg-black/85 backdrop-blur-xl border border-white/20 max-w-2xl mx-auto rounded-2xl text-center shadow-2xl animate-fade-in">
            <p className="text-[10px] uppercase tracking-editorial text-stone-400 font-semibold mb-1 font-mono">
              CAPTURED BY: {currentPhoto.guestName || 'TAMU ACARA'}
            </p>
            {currentPhoto.wish && (
              <p className="text-xl md:text-3xl text-white font-editorial italic leading-relaxed">
                "{currentPhoto.wish}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Screen Bar */}
      <div className="relative z-20 px-8 py-5 bg-gradient-to-t from-black/95 to-transparent flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-editorial text-stone-400 font-mono">
          TUAIPANDANG DIGITAL DISPOSABLE STREAM
        </div>

        <div className="glass-pill px-4 py-1.5 flex items-center gap-2 text-[10px] font-mono tracking-widest text-stone-200 border border-white/20 uppercase">
          <QrIcon className="w-3.5 h-3.5" />
          <span>SCAN QR CODE ON TABLE TO ADD PHOTOS</span>
        </div>
      </div>
    </div>
  );
}
