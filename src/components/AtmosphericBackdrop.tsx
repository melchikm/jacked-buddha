import React from "react";

interface AtmosphericBackdropProps {
  theme: "bright" | "dark";
}

export default function AtmosphericBackdrop({ theme }: AtmosphericBackdropProps) {
  if (theme === "bright") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#FAF8F5]">
        {/* Soft morning sky glow */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-amber-100/30 to-rose-100/10 blur-[120px] opacity-80" />
        <div className="absolute bottom-0 left-10 w-[40vw] h-[40vw] rounded-full bg-indigo-50/20 blur-[100px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,26,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,26,0.025)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        {/* Abstract organic horizon shapes instead of dark mountains */}
        <div className="absolute bottom-0 inset-x-0 h-[20vh] opacity-10 bg-gradient-to-t from-amber-200/40 via-amber-100/20 to-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-gradient-to-tr from-[#130f1d] via-[#15101a] to-[#2b170f] transition-all duration-1000">
      
      {/* 1. Large Glowing Sun/Moon Ambient Aura in Middle-Right */}
      <div 
        className="absolute top-[22%] right-[10%] md:right-[20%] w-[200px] h-[200px] md:w-[320px] md:h-[320px] rounded-full bg-gradient-to-br from-[#FFE59E] via-[#FF8F51] to-[#FF453A] opacity-35 blur-[50px] md:blur-[85px] mix-blend-screen animate-pulse" 
        style={{ animationDuration: "12s" }}
      />
      <div 
        className="absolute top-[28%] right-[13%] md:right-[23%] w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-full bg-[#FFF1D0] opacity-80 blur-[10px] md:blur-[14px] mix-blend-screen"
      />

      {/* 2. Ambient Cloud / Fog Dust Layers */}
      <div className="absolute top-[40%] left-[-10%] w-[60%] h-[20vh] rounded-full bg-[#1b122b]/40 blur-[90px] transform rotate-12" />
      <div className="absolute bottom-[15%] right-[-10%] w-[70%] h-[25vh] rounded-full bg-[#3d190f]/30 blur-[110px] transform -rotate-6" />

      {/* 3. Layered Responsive SVG Mountains (Overlapping Silhouettes) */}
      <svg 
        className="absolute bottom-0 left-0 w-full h-[55vh] min-h-[300px]" 
        viewBox="0 0 1440 600" 
        preserveAspectRatio="none"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Back Mountain Ridge - Golden Amber / Indigo Bleed */}
          <linearGradient id="backMountainGrad" x1="720" y1="200" x2="720" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#25162a" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#1e122b" />
            <stop offset="100%" stopColor="#0c0715" />
          </linearGradient>

          {/* Mid Mountain Ridge - Dark Indigo / Twilight Mist */}
          <linearGradient id="midMountainGrad" x1="720" y1="320" x2="720" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a1122" />
            <stop offset="50%" stopColor="#120b18" />
            <stop offset="100%" stopColor="#08040d" />
          </linearGradient>

          {/* Front Mountain Ridge - Solid Shadow */}
          <linearGradient id="frontMountainGrad" x1="720" y1="420" x2="720" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f0714" />
            <stop offset="100%" stopColor="#030105" />
          </linearGradient>
        </defs>

        {/* Far Mountain Range */}
        <path 
          d="M0 380 L180 280 L420 340 L700 220 L960 310 L1220 250 L1440 350 L1440 600 L0 600 Z" 
          fill="url(#backMountainGrad)" 
          className="opacity-95"
        />

        {/* Middle Mountain Range */}
        <path 
          d="M0 450 L280 340 L580 410 L890 320 L1180 390 L1440 310 L1440 600 L0 600 Z" 
          fill="url(#midMountainGrad)"
        />

        {/* Closest Mountain Range */}
        <path 
          d="M0 510 L380 420 L760 480 L1120 390 L1440 460 L1440 600 L0 600 Z" 
          fill="url(#frontMountainGrad)"
        />
      </svg>

      {/* Subtle Star field / Particle Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] opacity-60" />

      {/* Grid structure overlay with custom opacity to retain tech-minimal feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40" />
    </div>
  );
}
