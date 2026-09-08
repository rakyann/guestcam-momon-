// LocalStorage & Dynamic Event Routing State Management

// Bump this version to auto-clear all localStorage photo caches on next visit
const CACHE_VERSION = 'v6-reset-alfiano-monita-cream';

function checkAndClearOldCache() {
  const stored = localStorage.getItem('tuaipandang_cache_version');
  if (stored !== CACHE_VERSION) {
    // Clear all tuaipandang keys
    Object.keys(localStorage)
      .filter(k => k.startsWith('tuaipandang_'))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem('tuaipandang_cache_version', CACHE_VERSION);
  }
}

// Run immediately on module load
checkAndClearOldCache();

export function getEventFromUrl() {
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);

  let slug = "alfiano-monita";
  if (parts.length >= 2 && (parts[0] === 'e' || parts[0] === 'events')) {
    slug = parts[1];
  } else if (parts.length === 1 && parts[0] !== '') {
    slug = parts[0];
  }

  let formattedTitle = "Alfiano & Monita's Wedding Day";
  let hostName = "Alfiano & Monita";

  return {
    id: slug,
    title: formattedTitle,
    subtitle: `Lihat & abadikan momen spontan di ${formattedTitle} dengan tuaipandang, kamera sekali pakai digital.`,
    date: "13 September 2026",
    location: "",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    maxShotsPerGuest: 3,
    hostName: hostName,
    frameText: `${formattedTitle} • 13.09.2026`,
    groom: {
      nickname: "Alfiano",
      fullname: "Alfiano",
      father: "-",
      mother: "-",
      address: "-",
      instagram: "@alfiano"
    },
    bride: {
      nickname: "Monita",
      fullname: "Monita",
      father: "-",
      mother: "-",
      address: "-"
    }
  };
}

export const INITIAL_PHOTOS = [];

const STORAGE_KEYS = {
  EVENT: "tuaipandang_event_data_",
  PHOTOS: "tuaipandang_photos_list_",
  ROLL_COUNT: "tuaipandang_roll_count_"
};

export function getStoredEvent() {
  return getEventFromUrl();
}

export function getStoredPhotos(eventId = "default") {
  const data = localStorage.getItem(STORAGE_KEYS.PHOTOS + eventId);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveStoredPhotos(photosArray, eventId = "default") {
  localStorage.setItem(STORAGE_KEYS.PHOTOS + eventId, JSON.stringify(photosArray));
}

export function clearAllPhotos(eventId = "default") {
  localStorage.removeItem(STORAGE_KEYS.PHOTOS + eventId);
}

export function getRemainingRolls(eventId = "default", maxShots = 3) {
  const key = STORAGE_KEYS.ROLL_COUNT + eventId;
  const val = localStorage.getItem(key);
  if (val === null) {
    localStorage.setItem(key, maxShots.toString());
    return maxShots;
  }
  return parseInt(val, 10);
}

export function decrementRolls(eventId = "default") {
  const current = getRemainingRolls(eventId);
  const next = Math.max(0, current - 1);
  localStorage.setItem(STORAGE_KEYS.ROLL_COUNT + eventId, next.toString());
  return next;
}
