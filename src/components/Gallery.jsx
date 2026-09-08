import React, { useState } from 'react';
import { Heart, Sparkles, Eye } from 'lucide-react';

export default function Gallery({ photos, onSelectPhoto, onLikePhoto }) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredPhotos = React.useMemo(() => {
    let result = [...photos];
    if (activeTab === 'wishes') {
      result = result.filter(p => p.wish && p.wish.trim().length > 0);
    } else if (activeTab === 'popular') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    return result;
  }, [photos, activeTab]);

  return (
    <section className="w-full px-6 py-4 border-t border-[#e5dcd0] bg-[#faf6f0]">
      {/* Editorial Gallery Header */}
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <h2 className="font-calligraphy text-4xl sm:text-5xl text-[#2c2523] font-normal">
          The Moment Gallery
        </h2>
        <p className="text-[10px] sm:text-xs uppercase tracking-editorial text-[#786c65] font-semibold">
          COLLECTIVE MOMENTS & GUEST WISHES
        </p>

        {/* Minimalist Pill Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-editorial font-semibold transition-all border cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#2c2523] text-[#faf6f0] border-[#2c2523] shadow-sm'
                : 'bg-[#efe7dc] text-[#786c65] border-[#d8cebe] hover:border-[#2c2523] hover:text-[#2c2523]'
            }`}
          >
            ALL ({photos.length})
          </button>

          <button
            onClick={() => setActiveTab('wishes')}
            className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-editorial font-semibold transition-all border cursor-pointer ${
              activeTab === 'wishes'
                ? 'bg-[#2c2523] text-[#faf6f0] border-[#2c2523] shadow-sm'
                : 'bg-[#efe7dc] text-[#786c65] border-[#d8cebe] hover:border-[#2c2523] hover:text-[#2c2523]'
            }`}
          >
            WISHES
          </button>

          <button
            onClick={() => setActiveTab('popular')}
            className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-editorial font-semibold transition-all border cursor-pointer ${
              activeTab === 'popular'
                ? 'bg-[#2c2523] text-[#faf6f0] border-[#2c2523] shadow-sm'
                : 'bg-[#efe7dc] text-[#786c65] border-[#d8cebe] hover:border-[#2c2523] hover:text-[#2c2523]'
            }`}
          >
            FAVORITES
          </button>
        </div>
      </div>

      {/* Grid Container */}
      {filteredPhotos.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-2 text-[#786c65] border border-[#e5dcd0] rounded-2xl bg-[#f5eedc]">
          <p className="text-xs uppercase tracking-editorial font-medium">BELUM ADA FOTO DALAM KATEGORI INI</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onSelectPhoto(photo)}
              className="group relative aspect-square bg-[#efe7db] overflow-hidden border border-[#e5dcd0] rounded-xl cursor-pointer transition-all duration-500 hover:border-[#2c2523] shadow-sm hover:shadow-lg"
            >
              {/* Photo Image */}
              <img
                src={photo.imageUrl}
                alt={`Momen oleh ${photo.guestName}`}
                className="w-full h-full object-cover contrast-105 transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Preset Badge */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono tracking-widest text-stone-200 border border-white/20 uppercase">
                {photo.presetId || 'PORTRA400'}
              </div>

              {/* Bottom Card Details Bar */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between text-white">
                <div className="truncate pr-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-100 truncate">
                    {photo.guestName || 'Tamu Acara'}
                  </p>
                  {photo.wish && (
                    <p className="text-[11px] text-stone-300 font-editorial italic truncate mt-0.5">
                      "{photo.wish}"
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikePhoto(photo.id);
                  }}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:scale-110 transition-transform bg-black/60 px-2 py-0.5 rounded-full border border-white/20 cursor-pointer"
                >
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span className="font-mono text-[10px] text-gray-200">{photo.likes || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
