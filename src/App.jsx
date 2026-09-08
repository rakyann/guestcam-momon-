import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Gallery from './components/Gallery';
import DisposableCameraModal from './components/DisposableCameraModal';
import UploadModal from './components/UploadModal';
import PhotoLightbox from './components/PhotoLightbox';
import QRCodeModal from './components/QRCodeModal';
import LiveSlideshow from './components/LiveSlideshow';

import {
  getStoredEvent,
  getStoredPhotos,
  saveStoredPhotos,
  getRemainingRolls,
  decrementRolls
} from './utils/storage';

import JSZip from 'jszip';

export default function App() {
  const [event, setEvent] = useState(getStoredEvent());
  const [photos, setPhotos] = useState([]);
  const [remainingRolls, setRemainingRolls] = useState(3);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);

  // Temporary holding data
  const [tempCapturedData, setTempCapturedData] = useState(null);

  // Lightbox
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const currentEvent = getStoredEvent();
    setEvent(currentEvent);
    const local = getStoredPhotos(currentEvent.id);
    setPhotos(local);
    setRemainingRolls(getRemainingRolls(currentEvent.id, currentEvent.maxShotsPerGuest));

    // Fetch shared photos from cloud server API
    fetchServerPhotos(currentEvent.id);

    // Sync polling every 3 seconds across all devices
    const syncInterval = setInterval(() => {
      fetchServerPhotos(currentEvent.id);
    }, 3000);

    const handlePopState = () => {
      const ev = getStoredEvent();
      setEvent(ev);
      const loc = getStoredPhotos(ev.id);
      setPhotos(loc);
      setRemainingRolls(getRemainingRolls(ev.id, ev.maxShotsPerGuest));
      fetchServerPhotos(ev.id);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const fetchServerPhotos = async (eventId) => {
    try {
      const res = await fetch(`/api/photos?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.photos)) {
          setPhotos(prev => {
            const photoMap = new Map();
            // First add server photos
            data.photos.forEach(p => {
              const key = p.driveFileId || p.id;
              photoMap.set(key, p);
            });
            // Merge with local state photos if any were captured locally
            prev.forEach(p => {
              const key = p.driveFileId || p.id;
              if (!photoMap.has(key)) {
                photoMap.set(key, p);
              }
            });
            const merged = Array.from(photoMap.values());
            saveStoredPhotos(merged, eventId);
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Cloud photo sync warning:", err.message);
    }
  };

  const handlePhotoCaptured = (processedUrl, presetId) => {
    setTempCapturedData({
      url: processedUrl,
      presetId: presetId
    });
    setIsUploadOpen(true);
  };

  const handleSubmitPhoto = async (newPhotoData) => {
    const newRolls = decrementRolls(event.id);
    setRemainingRolls(newRolls);

    const newPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId: event.id,
      guestName: newPhotoData.guestName,
      wish: newPhotoData.wish,
      imageUrl: newPhotoData.imageUrl,
      driveFileId: newPhotoData.driveFileId || null,
      presetId: newPhotoData.presetId,
      likes: 0,
      timestamp: new Date().toISOString()
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    saveStoredPhotos(updated, event.id);
    setTempCapturedData(null);

    // Sync to shared server API so other devices see this photo immediately
    try {
      await fetch(`/api/photos?eventId=${event.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto)
      });
    } catch (e) {}
  };

  const handleLikePhoto = (photoId) => {
    const updated = photos.map((p) => {
      if (p.id === photoId) {
        return { ...p, likes: (p.likes || 0) + 1 };
      }
      return p;
    });
    setPhotos(updated);
    saveStoredPhotos(updated, event.id);
    
    if (selectedPhoto && selectedPhoto.id === photoId) {
      setSelectedPhoto(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    }
  };

  const handleDownloadAll = async () => {
    if (photos.length === 0) {
      alert("Belum ada foto dalam album untuk diunduh!");
      return;
    }

    try {
      const zip = new JSZip();
      const folder = zip.folder(`tuaipandang_${event.title.replace(/\s+/g, '_')}`);

      photos.forEach((photo, idx) => {
        let base64Data = photo.imageUrl;
        if (base64Data.startsWith('data:image')) {
          base64Data = base64Data.split(',')[1];
        }
        const filename = `${idx + 1}_${photo.guestName.replace(/\s+/g, '_')}_${photo.id}.jpg`;
        folder.file(filename, base64Data, { base64: true });
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tuaipandang_Album_${event.title.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Zip error:", err);
      alert("Terjadi kesalahan saat mengompres album.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#ede5d8] text-[#2c2523] flex flex-col items-center">
      {/* Editorial Outer Container Shell */}
      <div className="editorial-container">
        {/* Header Banner */}
        <Header
          event={event}
          photoCount={photos.length}
          onOpenCamera={() => setIsCameraOpen(true)}
          onOpenQR={() => setIsQROpen(true)}
          onOpenSlideshow={() => setIsSlideshowOpen(true)}
          onDownloadAll={handleDownloadAll}
        />

        {/* Collective Photo Gallery */}
        <main className="flex-1">
          <Gallery
            photos={photos}
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
            onLikePhoto={handleLikePhoto}
          />
        </main>

        {/* Editorial Footer */}
        <footer className="p-8 text-center text-xs text-[#786c65] border-t border-[#e5dcd0] mt-8 space-y-2">
          <p className="font-calligraphy text-3xl text-[#2c2523]">
            {event.hostName}
          </p>
          <p className="text-[10px] uppercase tracking-editorial font-semibold text-[#786c65]">
            {event.title} • {event.date}
          </p>
          <p className="text-[9px] text-[#918379] tracking-widest uppercase">
            POWERED BY TUAIPANDANG DIGITAL DISPOSABLE CAMERA
          </p>
        </footer>
      </div>

      {/* Modals */}
      <DisposableCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        remainingRolls={remainingRolls}
        event={event}
        onPhotoCaptured={handlePhotoCaptured}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        photoUrl={tempCapturedData?.url}
        presetId={tempCapturedData?.presetId}
        eventId={event.id}
        onSubmitPhoto={handleSubmitPhoto}
      />

      <PhotoLightbox
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onLikePhoto={handleLikePhoto}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        event={event}
      />

      <LiveSlideshow
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        photos={photos}
        event={event}
      />
    </div>
  );
}
