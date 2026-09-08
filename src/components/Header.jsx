import React from 'react';
import { Camera, QrCode, Tv, Download } from 'lucide-react';

export default function Header({ event, photoCount, onOpenCamera, onOpenQR, onOpenSlideshow, onDownloadAll }) {
  return (
    <header className="relative w-full text-center">
      {/* Top Banner Marquee */}
      <div className="marquee-bar bg-[#121212] text-[#a1a1aa] border-b border-[#27272a]">
        <div className="inline-block animate-pulse">
          {event.title.toUpperCase()} &nbsp;•&nbsp; {event.date.toUpperCase()} &nbsp;•&nbsp; DIGITAL DISPOSABLE CAMERA &nbsp;•&nbsp; {photoCount} MOMENTS CAPTURED
        </div>
      </div>

      {/* Main Hero B&W Cinematic Canvas */}
      <div className="relative w-full h-[50vh] min-h-[340px] max-h-[500px] bg-[#121212] overflow-hidden flex items-center justify-center">
        {/* Cover Image with B&W / Moody Contrast */}
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover grayscale contrast-125 brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#0a0a0a]" />

        {/* Large Sweeping Calligraphy Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <h1 className="font-calligraphy text-6xl sm:text-8xl md:text-9xl text-white font-normal leading-none drop-shadow-2xl select-none">
            {event.hostName}
          </h1>

          <div className="flex items-center gap-3 mt-3 text-[11px] sm:text-xs text-stone-300 uppercase tracking-editorial font-medium drop-shadow">
            <span>SABTU, {event.date.toUpperCase()}</span>
            {event.location ? (
              <>
                <span>•</span>
                <span>{event.location}</span>
              </>
            ) : null}
          </div>

          <p className="text-[10px] uppercase tracking-editorial text-stone-400 mt-1 font-mono drop-shadow">
            {event.title}
          </p>
        </div>
      </div>

      {/* Minimalist Editorial Action Bar */}
      <div className="px-6 py-4 bg-[#0a0a0a] border-b border-[#27272a] flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase tracking-editorial text-[#a1a1aa] font-semibold">
        <button
          onClick={onOpenCamera}
          className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-[#71717a]" />
          <span>Ambil Foto</span>
        </button>

        <button
          onClick={onOpenQR}
          className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5 text-[#71717a]" />
          <span>Kode QR</span>
        </button>

        <button
          onClick={onOpenSlideshow}
          className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Tv className="w-3.5 h-3.5 text-[#71717a]" />
          <span>Live Slideshow</span>
        </button>

        <button
          onClick={onDownloadAll}
          className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#71717a]" />
          <span>Unduh Album</span>
        </button>
      </div>

      {/* Editorial Quote & Clean Actions */}
      <div className="px-6 py-8 flex flex-col items-center text-center bg-[#0a0a0a]">
        <div className="editorial-line-v" />

        <h2 className="font-calligraphy text-4xl sm:text-6xl text-white font-normal">
          Through the eyes of lovers
        </h2>

        <p className="text-[10px] sm:text-xs uppercase tracking-editorial text-[#a1a1aa] font-semibold mt-2">
          DOCUMENTING OUR WEDDING STORY
        </p>

        <p className="text-xs sm:text-sm text-[#d4d4d8] max-w-lg mt-4 font-editorial italic leading-relaxed">
          Foto-foto dari sudut pandang para tamu tercinta. Momen spontan, tawa hangat, dan kenangan tak terlupakan yang diabadikan melalui Kamera Sekali Pakai Digital.
        </p>

        {/* 3 Editorial Quick Action Cards */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-6">
          <button
            onClick={onOpenQR}
            className="p-3.5 bg-[#141416] border border-[#27272a] rounded-2xl flex flex-col items-center gap-1.5 text-white shadow-sm hover:shadow-md hover:bg-white hover:text-black hover:border-white transition-all duration-300 group cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#a1a1aa] group-hover:text-black transition-colors" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">KODE QR</span>
          </button>

          <button
            onClick={onOpenSlideshow}
            className="p-3.5 bg-[#141416] border border-[#27272a] rounded-2xl flex flex-col items-center gap-1.5 text-white shadow-sm hover:shadow-md hover:bg-white hover:text-black hover:border-white transition-all duration-300 group cursor-pointer"
          >
            <Tv className="w-4 h-4 text-[#a1a1aa] group-hover:text-black transition-colors" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">SLIDESHOW</span>
          </button>

          <button
            onClick={onDownloadAll}
            className="p-3.5 bg-[#141416] border border-[#27272a] rounded-2xl flex flex-col items-center gap-1.5 text-white shadow-sm hover:shadow-md hover:bg-white hover:text-black hover:border-white transition-all duration-300 group cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#a1a1aa] group-hover:text-black transition-colors" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">UNDUH ZIP</span>
          </button>
        </div>

        {/* Full-width Large Card CTA Button - Dark Dashed Style */}
        <button
          onClick={onOpenCamera}
          className="mt-6 w-full py-10 sm:py-12 px-6 rounded-2xl sm:rounded-3xl border-2 border-dashed border-[#3f3f46] bg-[#141416] text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-3.5 text-sm sm:text-base font-black tracking-editorial group"
        >
          <Camera className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform text-[#a1a1aa] group-hover:text-black" />
          <span>AMBIL FOTO (DISPOSABLE CAMERA)</span>
        </button>

        <div className="editorial-line-v" />
      </div>
    </header>
  );
}
