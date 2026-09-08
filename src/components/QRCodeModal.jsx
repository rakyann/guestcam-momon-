import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, Printer, QrCode as QrIcon } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRCodeModal({ isOpen, onClose, event }) {
  const [copied, setCopied] = useState(false);
  const [showPosterMode, setShowPosterMode] = useState(false);
  const canvasRef = useRef(null);

  const eventUrl = window.location.href;

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        eventUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#2c2523',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [isOpen, eventUrl, showPosterMode]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop-editorial z-50">
      <div className={`relative w-full ${showPosterMode ? 'max-w-xl' : 'max-w-md'} bg-[#faf6f0] border border-[#e5dcd0] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-up text-[#2c2523]`}>
        {/* Header */}
        <div className="px-6 py-4 bg-[#efe7dc] border-b border-[#e5dcd0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrIcon className="w-4 h-4 text-[#786c65]" />
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#2c2523] font-mono">
              {showPosterMode ? 'POSTER CETAK MEJA' : 'KODE QR EVENT'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#d8cebe] bg-[#faf6f0] hover:bg-[#2c2523] hover:text-[#faf6f0] flex items-center justify-center text-[#2c2523] transition-all cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!showPosterMode ? (
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            <p className="text-sm text-[#594d46] max-w-xs font-editorial italic leading-relaxed">
              Scan Kode QR di bawah untuk langsung mengakses Kamera Sekali Pakai & Galeri Acara <b>{event.title}</b>
            </p>

            {/* QR Code Canvas Frame */}
            <div className="p-4 bg-white rounded-2xl shadow-lg border border-[#e5dcd0]">
              <canvas ref={canvasRef} className="rounded" />
            </div>

            <p className="text-[9px] font-mono tracking-widest text-[#786c65] uppercase">
              TUAIPANDANG DIGITAL DISPOSABLE CAMERA
            </p>

            {/* Buttons */}
            <div className="w-full space-y-2.5 pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-6 rounded-full border border-[#d8cebe] bg-[#efe7dc] text-[#2c2523] text-xs uppercase tracking-widest font-semibold hover:bg-[#2c2523] hover:text-[#faf6f0] hover:border-[#2c2523] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan Event'}</span>
              </button>

              <button
                onClick={() => setShowPosterMode(true)}
                className="w-full py-3 px-6 rounded-full bg-[#2c2523] text-[#faf6f0] text-xs uppercase tracking-widest font-bold hover:bg-[#423936] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Desain Poster Cetak Meja</span>
              </button>
            </div>
          </div>
        ) : (
          /* Printable Poster Frame */
          <div className="p-8 bg-[#faf6f0] text-[#2c2523] flex flex-col items-center text-center border border-[#e5dcd0] m-4 rounded-xl shadow-inner">
            <span className="text-[10px] uppercase tracking-editorial font-semibold text-[#786c65] mb-1">
              DOCUMENTING OUR SPECIAL DAY
            </span>
            <h2 className="font-calligraphy text-5xl text-[#2c2523] font-normal mb-1">{event.hostName}</h2>
            <p className="text-xs uppercase tracking-widest text-[#786c65] mb-4">{event.date} {event.location ? `• ${event.location}` : ''}</p>

            <div className="p-4 bg-white rounded-2xl shadow-xl mb-4 border border-[#e5dcd0]">
              <canvas ref={canvasRef} />
            </div>

            <div className="bg-[#efe7dc] p-4 rounded-xl border border-[#d8cebe] text-xs text-[#594d46] max-w-sm mb-4">
              <p className="font-semibold uppercase tracking-wider text-[#2c2523]">📸 SCAN KODE QR INI</p>
              <p className="text-xs text-[#786c65] font-editorial italic mt-1 leading-relaxed">
                Bantu kami mengabadikan momen dari sudut pandang Anda menggunakan tuaipandang Digital Disposable Camera!
              </p>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => setShowPosterMode(false)}
                className="flex-1 py-2.5 px-4 rounded-full border border-[#d8cebe] bg-[#efe7dc] text-[#2c2523] text-xs uppercase tracking-widest font-semibold hover:bg-[#2c2523] hover:text-[#faf6f0] hover:border-[#2c2523] transition-all cursor-pointer shadow-sm"
              >
                KEMBALI
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#2c2523] text-[#faf6f0] text-xs uppercase tracking-widest font-bold hover:bg-[#423936] transition-all shadow-md cursor-pointer"
              >
                CETAK POSTER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
