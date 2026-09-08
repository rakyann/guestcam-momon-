import React from 'react';
import { X, Heart, Download, Calendar, Share2 } from 'lucide-react';

export default function PhotoLightbox({ photo, onClose, onLikePhoto }) {
  if (!photo) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `tuaipandang_${photo.guestName.replace(/\s+/g, '_')}_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      // Fetch the image as a blob so we can share the actual file
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      const fileName = `tuaipandang_${(photo.guestName || 'foto').replace(/\s+/g, '_')}.${ext}`;
      const file = new File([blob], fileName, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // Share actual image file — works great on Android & iOS
        await navigator.share({
          files: [file],
          title: `📸 Foto dari Pernikahan Riztiana & Rizky`,
          text: `Momen spesial dari pernikahan Riztiana & Rizky – 15 Agustus 2026 💍\n\nLihat semua foto di: https://tuaipandang.vercel.app/e/riztiana-rizky`
        });
      } else if (navigator.share) {
        // Share via URL only (fallback)
        await navigator.share({
          title: `📸 Foto dari Pernikahan Riztiana & Rizky`,
          text: `Momen spesial dari pernikahan Riztiana & Rizky – 15 Agustus 2026 💍`,
          url: photo.imageUrl
        });
      } else {
        // Desktop fallback: copy URL to clipboard
        await navigator.clipboard.writeText(photo.imageUrl);
        alert('Link foto berhasil disalin! Tempel di IG, WA, atau aplikasi lain.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fallback: copy URL
        try {
          await navigator.clipboard.writeText(photo.imageUrl);
          alert('Link foto disalin ke clipboard!');
        } catch {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const presetLabels = {
    portra400: 'KODAK PORTRA 400',
    cinestill800t: 'CINESTILL 800T',
    fujisuperia: 'FUJI SUPERIA 400',
    bwmono: 'B&W VINTAGE NOIR',
    clean: 'CLEAN ORIGINAL'
  };

  return (
    <div className="modal-backdrop-editorial z-50">
      <div className="relative w-full max-w-3xl bg-[#faf6f0] border border-[#e5dcd0] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-scale-up text-[#2c2523]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full border border-[#d8cebe] bg-white/80 backdrop-blur-md flex items-center justify-center text-[#2c2523] hover:bg-[#2c2523] hover:text-[#faf6f0] transition-all cursor-pointer shadow-md"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Photo Image Viewport */}
        <div className="w-full md:w-3/5 bg-[#e8e0d2] flex items-center justify-center relative overflow-hidden p-2">
          <img
            src={photo.imageUrl}
            alt={photo.guestName}
            className="w-full h-full max-h-[75vh] object-contain rounded-lg shadow-sm"
          />

          {/* Preset Badge positioned at TOP-LEFT to avoid overlapping with bottom watermark */}
          <div className="absolute top-4 left-4 z-20 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-mono tracking-widest text-stone-200 border border-white/20 uppercase">
            {presetLabels[photo.presetId] || 'KODAK PORTRA 400'}
          </div>
        </div>

        {/* Content Side Column */}
        <div className="w-full md:w-2/5 p-6 md:p-8 bg-[#faf6f0] flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#e5dcd0]">
          <div>
            {/* Guest Info Tag */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full border border-[#d8cebe] bg-[#efe7db] text-[#2c2523] font-serif-luxury text-lg flex items-center justify-center font-bold">
                {photo.guestName ? photo.guestName.charAt(0).toUpperCase() : 'T'}
              </div>
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#2c2523]">
                  {photo.guestName || 'Tamu Acara'}
                </h4>
                <p className="text-[10px] uppercase tracking-widest text-[#786c65] flex items-center gap-1.5 mt-0.5 font-mono">
                  <Calendar className="w-3 h-3 text-[#786c65]" />
                  {new Date(photo.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Wish Message Frame */}
            {photo.wish && (
              <div className="p-5 bg-[#f5eedc] border-l-2 border-[#2c2523] border-y border-r border-[#e5dcd0] rounded-r-xl relative mb-6 shadow-inner">
                <p className="text-base text-[#2c2523] font-editorial italic leading-relaxed">
                  "{photo.wish}"
                </p>
              </div>
            )}
          </div>

          {/* Minimalist Editorial Action Buttons */}
          <div className="space-y-3 pt-6 border-t border-[#e5dcd0]">
            {/* Like button — full width */}
            <button
              onClick={() => onLikePhoto(photo.id)}
              className="w-full py-2.5 px-4 rounded-full border border-[#2c2523] text-[10px] uppercase tracking-widest font-semibold text-[#2c2523] hover:bg-[#2c2523] hover:text-[#faf6f0] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{photo.likes || 0} SUKA</span>
            </button>

            {/* Download + Share side by side */}
            <div className="flex items-center gap-2">
              {/* Download */}
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 px-3 rounded-full bg-[#2c2523] text-[#faf6f0] text-[10px] uppercase tracking-widest font-bold hover:bg-[#423936] transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>UNDUH</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 px-3 rounded-full bg-gradient-to-r from-amber-800 to-stone-800 text-white text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                title="Share ke IG, WA, dll"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>BAGIKAN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
