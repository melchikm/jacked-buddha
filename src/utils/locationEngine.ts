// Location and Metadata Engine for Vita Personal Operating System

export interface LocationMetadata {
  date: string;       // e.g. "2026-08-09"
  time: string;       // e.g. "03:15 PM"
  timestamp: string;  // ISO string
  location: string;   // e.g. "Da Nang, Vietnam (16.0544° N, 108.2022° E)" or "Da Nang & Sri Lanka Coastal Zone"
  city?: string;
  coords?: { lat: number; lng: number };
}

let cachedLocation = "Da Nang & Sri Lanka Coastal Zone";
let cachedCoords: { lat: number; lng: number } | null = null;

// Initialize browser geolocation if available
if (typeof window !== "undefined" && "geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(4);
      const lng = position.coords.longitude.toFixed(4);
      cachedCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
      cachedLocation = `GPS Node (${lat}°, ${lng}°) • Da Nang & Sri Lanka Zone`;
    },
    (err) => {
      console.log("Geolocation permission fallback applied:", err.message);
    },
    { timeout: 8000, maximumAge: 60000 }
  );
}

export function getLocationMetadata(customDate?: string): LocationMetadata {
  const now = new Date();
  const dateStr = customDate || now.toISOString().split("T")[0];
  
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return {
    date: dateStr,
    time: timeStr,
    timestamp: now.toISOString(),
    location: cachedLocation,
    coords: cachedCoords || undefined
  };
}

export function formatMetadataString(meta: Partial<LocationMetadata>): string {
  const parts: string[] = [];
  if (meta.date) parts.push(`📅 ${meta.date}`);
  if (meta.time) parts.push(`⏰ ${meta.time}`);
  if (meta.location) parts.push(`📍 ${meta.location}`);
  return parts.join(" • ");
}
