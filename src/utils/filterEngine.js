// Canvas Film Presets Engine (100% Cross-Browser Pixel Shaders)

export const FILM_PRESETS = [
  {
    id: 'clean',
    name: 'Clean Original',
    description: 'Natural uncompressed color',
    badge: 'Natural',
    tint: 'rgba(0, 0, 0, 0)',
    cssFilter: 'none'
  },
  {
    id: 'portra400',
    name: 'Kodak Portra 400',
    description: 'Warm golden skin tones & soft highlights',
    badge: 'Popular',
    tint: 'rgba(255, 215, 170, 0.12)',
    cssFilter: 'contrast(108%) saturate(115%) sepia(18%)'
  },
  {
    id: 'cinestill800t',
    name: 'CineStill 800T',
    description: 'Tungsten cool cyan glow & vivid contrast',
    badge: 'Night',
    tint: 'rgba(0, 190, 225, 0.10)',
    cssFilter: 'contrast(115%) saturate(125%) hue-rotate(-12deg)'
  },
  {
    id: 'fujisuperia',
    name: 'Fuji Superia 400',
    description: 'Vivid emerald green tones & crisp detail',
    badge: 'Vivid',
    tint: 'rgba(160, 245, 185, 0.08)',
    cssFilter: 'contrast(112%) saturate(130%) hue-rotate(8deg)'
  },
  {
    id: 'bwmono',
    name: 'B&W Vintage Noir',
    description: 'Classic high contrast monochrome',
    badge: 'Retro',
    tint: 'rgba(0, 0, 0, 0)',
    cssFilter: 'grayscale(100%) contrast(130%)'
  }
];

export async function processImageWithFilterAndFrame(sourceImgUrl, presetId = 'portra400', frameText = "", showFrame = false) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = img.naturalWidth || img.width || 1200;
      const height = img.naturalHeight || img.height || 1200;

      canvas.width = width;
      canvas.height = height;

      // 1. Draw Original Image
      ctx.drawImage(img, 0, 0, width, height);

      // 2. Apply CSS Filter if supported by browser context
      const preset = FILM_PRESETS.find(p => p.id === presetId) || FILM_PRESETS[0];

      try {
        if (preset.cssFilter !== 'none') {
          ctx.filter = preset.cssFilter;
          ctx.drawImage(img, 0, 0, width, height);
          ctx.filter = 'none';
        }
      } catch (e) {
        // Fallback for browsers that don't support ctx.filter
      }

      // 3. Fallback / Direct Pixel Shader Processing (Guarantees ALL filters work on ALL browsers)
      if (presetId === 'bwmono') {
        applyGrayscaleNoir(ctx, width, height);
      } else if (presetId === 'portra400') {
        applyPortraWarmth(ctx, width, height);
      } else if (presetId === 'cinestill800t') {
        applyCineStillCool(ctx, width, height);
      } else if (presetId === 'fujisuperia') {
        applyFujiGreen(ctx, width, height);
      }

      // 4. Draw Color Tint Overlay if defined
      if (preset.tint && preset.tint !== 'rgba(0, 0, 0, 0)') {
        ctx.fillStyle = preset.tint;
        ctx.fillRect(0, 0, width, height);
      }

      // 5. Add analog film grain texture
      addFilmGrain(ctx, width, height, 0.03);

      // 6. Draw Frame Overlay & Watermark ONLY IF explicitly enabled
      if (showFrame && frameText) {
        const barHeight = Math.max(38, Math.floor(height * 0.06));
        
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height - barHeight, width, barHeight);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = Math.max(1, Math.floor(height * 0.0015));
        ctx.beginPath();
        ctx.moveTo(0, height - barHeight);
        ctx.lineTo(width, height - barHeight);
        ctx.stroke();

        const paddingHorizontal = Math.max(16, Math.floor(width * 0.03));
        const availableWidth = width - (paddingHorizontal * 2);

        let fontSize = Math.max(12, Math.floor(barHeight * 0.38));
        ctx.font = `600 ${fontSize}px "Inter", sans-serif`;

        while (ctx.measureText(frameText).width > availableWidth * 0.65 && fontSize > 9) {
          fontSize -= 1;
          ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
        }

        ctx.fillStyle = '#E2A07A';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(frameText, paddingHorizontal, height - (barHeight / 2));

        ctx.font = `600 ${Math.max(9, Math.floor(fontSize * 0.85))}px "Share Tech Mono", monospace`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'right';
        ctx.fillText("TUAIPANDANG FILM", width - paddingHorizontal, height - (barHeight / 2));

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = (err) => reject(err);
    img.src = sourceImgUrl;
  });
}

// ----------------------------------------------------
// DIRECT PIXEL SHADER FUNCTIONS (100% Cross-Browser)
// ----------------------------------------------------

function applyGrayscaleNoir(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    // High contrast curve
    const contrast = 1.25;
    const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
    const val = factor * (avg - 128) + 128;
    const clamped = Math.min(255, Math.max(0, val));
    data[i] = clamped;
    data[i + 1] = clamped;
    data[i + 2] = clamped;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyPortraWarmth(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 1.08 + 8);       // Warm Red
    data[i + 1] = Math.min(255, data[i + 1] * 1.03);    // Soft Green
    data[i + 2] = Math.max(0, data[i + 2] * 0.94 - 5);   // Muted Blue
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyCineStillCool(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, data[i] * 0.95);             // Lower Red
    data[i + 1] = Math.min(255, data[i + 1] * 1.06 + 5); // Boost Cyan Green
    data[i + 2] = Math.min(255, data[i + 2] * 1.12 + 12); // Boost Tungsten Blue
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyFujiGreen(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 1.02);
    data[i + 1] = Math.min(255, data[i + 1] * 1.14 + 10); // Emerald Green Boost
    data[i + 2] = Math.min(255, data[i + 2] * 1.04);
  }
  ctx.putImageData(imageData, 0, 0);
}

function addFilmGrain(ctx, width, height, intensity = 0.03) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const factor = intensity * 255;

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * factor;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }

  ctx.putImageData(imageData, 0, 0);
}
