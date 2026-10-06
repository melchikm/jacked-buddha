import React from "react";

interface VitaLifeLogoProps {
  className?: string;
  size?: number | string;
  withBackground?: boolean;
  withGlow?: boolean;
  variant?: "full" | "icon" | "badge";
}

export const VitaLifeLogo: React.FC<VitaLifeLogoProps> = ({
  className = "",
  size = 40,
  withBackground = true,
  withGlow = false,
  variant = "icon"
}) => {
  const pixelSize = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        withGlow ? "drop-shadow-[0_0_12px_rgba(255,213,92,0.35)]" : ""
      } ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        <defs>
          {/* Background Radial Gradient */}
          <radialGradient id="vlLogoBg" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#1f4b37" />
            <stop offset="60%" stopColor="#153627" />
            <stop offset="100%" stopColor="#0d2319" />
          </radialGradient>

          {/* Golden Peak Halo Filter */}
          <filter id="vlHaloGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Golden Summit Radial */}
          <radialGradient id="vlSunGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#fff9d2" stopOpacity="1" />
            <stop offset="30%" stopColor="#ffd55c" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#dfa435" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#dfa435" stopOpacity="0" />
          </radialGradient>

          {/* Golden Mountain Cap Gradient */}
          <linearGradient id="vlGoldPeak" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#fffbe0" />
            <stop offset="40%" stopColor="#ffde73" />
            <stop offset="100%" stopColor="#d69f3d" />
          </linearGradient>

          {/* Left Slope Gradient */}
          <linearGradient id="vlLeftSlope" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#557c5f" />
            <stop offset="100%" stopColor="#3c5c44" />
          </linearGradient>

          {/* Right Slope Gradient */}
          <linearGradient id="vlRightSlope" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1b412f" />
            <stop offset="100%" stopColor="#133123" />
          </linearGradient>

          {/* Path Ivory Gradient */}
          <linearGradient id="vlPathIvory" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fdfbf5" />
            <stop offset="100%" stopColor="#ece2cc" />
          </linearGradient>
        </defs>

        {/* 1. App Icon Rounded Background (when withBackground is true) */}
        {withBackground && (
          <rect
            x="8"
            y="8"
            width="496"
            height="496"
            rx="112"
            fill="url(#vlLogoBg)"
            stroke="#2a5a42"
            strokeWidth="5"
          />
        )}

        {/* 2. Golden Radiant Halo at Summit */}
        <circle cx="256" cy="192" r="95" fill="url(#vlSunGlow)" filter="url(#vlHaloGlow)" />
        <ellipse cx="256" cy="180" r="45" ry="35" fill="#fff4be" opacity="0.6" filter="url(#vlHaloGlow)" />

        {/* 3. Mountain Silhouette & Slopes */}
        <g id="mountainCore">
          {/* Main Triangle Silhouette */}
          <polygon points="256,158 132,352 380,352" fill="url(#vlRightSlope)" />

          {/* Left Shaded Slope Facet */}
          <polygon points="256,158 132,352 244,352 245,260 256,220" fill="url(#vlLeftSlope)" opacity="0.9" />

          {/* Golden Summit Cap */}
          <polygon points="256,158 232,228 280,228" fill="url(#vlGoldPeak)" />
          <circle cx="256" cy="164" r="8" fill="#fffbe8" />

          {/* Sage Green Mountain Framing Edges */}
          <line x1="256" y1="158" x2="132" y2="352" stroke="#608a68" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="256" y1="158" x2="380" y2="352" stroke="#608a68" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="190" y1="352" x2="380" y2="352" stroke="#608a68" strokeWidth="15" strokeLinecap="round" />
        </g>

        {/* 4. Path 3D Drop Shelf / Shadow */}
        <path
          d="M 124 358 
             L 182 344 
             L 204 316 
             L 220 316 
             L 226 278 
             L 240 278 
             L 262 244 
             L 278 244 
             L 288 260 
             L 274 266 
             L 256 266 
             L 242 296 
             L 226 296 
             L 218 332 
             L 196 332 
             L 168 358 Z"
          fill="#0a1d13"
          opacity="0.95"
        />

        {/* 5. Ascending Ivory Path to Summit */}
        <path
          d="M 124 354
             C 134 354, 158 344, 178 338
             L 188 316
             L 216 304
             L 222 272
             L 252 254
             L 258 242
             L 284 228
             L 286 256
             L 270 248
             L 248 266
             L 236 294
             L 208 306
             L 200 326
             L 170 338
             C 152 344, 134 350, 124 354 Z"
          fill="url(#vlPathIvory)"
        />

        {/* Arrowhead at Summit */}
        <polygon
          points="286,226 288,256 270,248 260,256 256,238 274,236"
          fill="url(#vlPathIvory)"
          stroke="#fffdf8"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Radiant Sparkle at Summit */}
        <circle cx="256" cy="162" r="5" fill="#ffffff" opacity="0.95" />
      </svg>
    </div>
  );
};
