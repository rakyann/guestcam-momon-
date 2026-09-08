import React, { useState } from 'react';
import { X, Send, User, MessageSquare, CheckCircle2, CloudUpload } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UploadModal({ photoUrl, presetId, eventId, isOpen, onClose, onSubmitPhoto }) {
  const [guestName, setGuestName] = useState('');
  const [wish, setWish] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  if (!isOpen || !photoUrl) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadStatus('Mengunggah ke Google Drive...');

    let finalImageUrl = photoUrl;
    let driveFileId = null;

    try {
      const blobRes = await fetch(photoUrl);
      const blob = await blobRes.blob();
      const file = new File([blob], `tuaipandang_${eventId}_${Date.now()}.jpg`, { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', eventId || 'default');
      formData.append('guestSessionId', guestName.trim() || 'Tamu Acara');
      formData.append('caption', wish.trim() || '');

      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          finalImageUrl = data.url;
          driveFileId = data.driveFileId;
          setUploadStatus('Berhasil diunggah ke Drive!');
        }
      } else {
        console.warn('API Upload warning: fallback to local snapshot storage.');
      }
    } catch (err) {
      console.warn('Google Drive Upload API network fallback:', err.message);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    onSubmitPhoto({
      guestName: guestName.trim() || 'Tamu Acara',
      wish: wish.trim() || 'Selamat & bahagia selalu!',
      imageUrl: finalImageUrl,
      driveFileId: driveFileId,
      presetId: presetId || 'portra400'
    });

    setIsSubmitting(false);
    setUploadStatus('');
    setGuestName('');
    setWish('');
    onClose();
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
      <div className="relative w-full max-w-md bg-[#121212] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scale-up text-white">
        {/* Header */}
        <div className="px-6 py-4 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs uppercase tracking-widest font-semibold text-white font-mono">
              FOTO BERHASIL DIABADIKAN
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#3f3f46] bg-[#27272a] hover:bg-white hover:text-black flex items-center justify-center text-white transition-all cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Photo Preview Card */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[#27272a] bg-[#18181b] shadow-md">
            <img
              src={photoUrl}
              alt="Hasil Foto Disposable"
              className="w-full h-full object-cover"
            />
            {/* Film Preset Badge */}
            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-mono tracking-widest text-stone-200 border border-white/20 uppercase">
              {presetLabels[presetId] || 'KODAK PORTRA 400'}
            </div>
          </div>

          {/* Guest Name Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-editorial font-semibold text-[#a1a1aa] flex items-center gap-1.5 font-mono">
              <User className="w-3.5 h-3.5 text-[#a1a1aa]" />
              NAMA ANDA / PASANGAN:
            </label>
            <input
              type="text"
              placeholder="Contoh: Budi & Ananda"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#71717a] font-editorial italic focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Wish Message Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-editorial font-semibold text-[#a1a1aa] flex items-center gap-1.5 font-mono">
              <MessageSquare className="w-3.5 h-3.5 text-[#a1a1aa]" />
              PESAN & UCAPAN SELAMAT:
            </label>
            <textarea
              rows={3}
              placeholder="Tulis ucapan & doa terbaik..."
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#71717a] font-editorial italic focus:outline-none focus:border-white transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Status Indicator */}
          {uploadStatus && (
            <p className="text-[10px] uppercase tracking-widest font-mono text-amber-400 text-center flex items-center justify-center gap-1.5 animate-pulse">
              <CloudUpload className="w-3.5 h-3.5" />
              {uploadStatus}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-[#e4e4e7] transition-all shadow-md flex items-center justify-center gap-2 mt-3 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'MENGIRIM MOMEN...' : 'UNGGAH KE ALBUM KOLEKTIF'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
