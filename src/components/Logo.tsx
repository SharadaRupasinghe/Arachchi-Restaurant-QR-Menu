import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const sizeClasses = {
    sm: 'h-11 w-11',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
    xl: 'h-28 w-28',
  };

  const textClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Brand Signboard Container with Backlit Halo Glow */}
      <div
        className={`${sizeClasses[size]} relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#1c120c] via-[#120a06] to-[#0a0503] p-1 shadow-2xl shadow-amber-950/80 border border-amber-500/50 overflow-hidden group shrink-0`}
      >
        {/* Warm Ambient Wall Backlight Halo */}
        <div className="absolute inset-0 bg-radial from-amber-500/35 via-amber-600/15 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-amber-500/15 to-transparent pointer-events-none" />

        {/* High-Fidelity Vector Replica of the Real Wooden Backlit Arachchi Signboard */}
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full relative z-10 drop-shadow-[0_2px_12px_rgba(251,191,36,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich Neon Yellow-Gold Backlit Glow */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Warm Teak Wood Grain Simulation */}
            <linearGradient id="teakPlanks" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#452714" />
              <stop offset="35%" stopColor="#311a0c" />
              <stop offset="70%" stopColor="#241308" />
              <stop offset="100%" stopColor="#1a0d05" />
            </linearGradient>

            {/* Radiant Golden Font Gradient */}
            <linearGradient id="goldFont" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Outer Halo Bracket Gradient */}
            <linearGradient id="haloGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          {/* 1. Outer Backlit Glowing Wings (Open Circular Arc Ring) */}
          <path
            d="M 54 44 A 95 95 0 1 0 186 44"
            stroke="url(#haloGold)"
            strokeWidth="11"
            strokeLinecap="round"
            filter="url(#neonGlow)"
            strokeOpacity="0.95"
          />

          {/* 2. Main Carved Wooden Signboard Silhouette */}
          {/* Symmetrical temple gabled roof and stepped wings */}
          <path
            d="M 120 45 
               L 142 66 L 160 59 L 176 86 
               L 188 86 L 188 132 L 180 132 L 180 155 
               L 120 165 
               L 60 155 L 60 132 L 52 132 L 52 86 L 64 86 
               L 80 59 L 98 66 Z"
            fill="url(#teakPlanks)"
            stroke="#1a0d05"
            strokeWidth="2.5"
          />

          {/* Wooden vertical slat texture accents */}
          <path
            d="M 75 80 L 75 152 M 95 68 L 95 158 M 120 54 L 120 162 M 145 68 L 145 158 M 165 80 L 165 152"
            stroke="#160a04"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />

          {/* 3. Golden Temple Roof Ridge / Arch Motifs */}
          {/* Outer Gabled Roof Line */}
          <path
            d="M 77 84 L 92 63 L 120 45 L 148 63 L 163 84"
            stroke="#fbbf24"
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />

          {/* Inner Sacred Archway & Triple Mountain Peaks */}
          <path
            d="M 82 86 Q 96 74 104 86 L 120 62 L 136 86 Q 144 74 158 86"
            stroke="#fbbf24"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />

          {/* 4. Sinhala Calligraphy "ආරච්චි" (Exact Signature Letterforms) */}
          <g filter="url(#neonGlow)">
            {/* 'ආ' with signature wavy mustache crown ornament */}
            {/* Top mustache accent above ආ */}
            <path
              d="M 85 93 Q 95 89 104 93"
              stroke="url(#goldFont)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sinhala text "ආරච්චි" */}
            <text
              x="120"
              y="117"
              textAnchor="middle"
              fill="url(#goldFont)"
              fontSize="28"
              fontWeight="bold"
              fontFamily="'Noto Serif Sinhala', 'Iskoola Pota', system-ui, serif"
              letterSpacing="2.5"
            >
              ආරච්චි
            </text>
          </g>

          {/* 5. English Wordmark "A R A C H C H I" */}
          <text
            x="120"
            y="126"
            textAnchor="middle"
            fill="#fef08a"
            fontSize="6.8"
            fontWeight="700"
            letterSpacing="3.5"
            fontFamily="'Cinzel', serif"
          >
            ARACHCHI
          </text>

          {/* 6. Gold Horizontal Divider Bar */}
          <line
            x1="64"
            y1="131"
            x2="176"
            y2="131"
            stroke="#f59e0b"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />

          {/* 7. "RESTAURANT" */}
          <text
            x="120"
            y="144"
            textAnchor="middle"
            fill="#fde047"
            fontSize="12.5"
            fontWeight="900"
            letterSpacing="2"
            fontFamily="'Cinzel', 'Plus Jakarta Sans', sans-serif"
            filter="url(#neonGlow)"
          >
            RESTAURANT
          </text>

          {/* 8. "ANURADHAPURA" */}
          <text
            x="120"
            y="155"
            textAnchor="middle"
            fill="#fbbf24"
            fontSize="7"
            fontWeight="700"
            letterSpacing="2.8"
            fontFamily="'Cinzel', serif"
          >
            ANURADHAPURA
          </text>
        </svg>
      </div>

      {/* Accompanying Typography Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-serif tracking-wide text-amber-100 font-bold ${textClasses[size]}`}>
            ARACHCHI
          </span>
          <span className="text-amber-400 font-bold text-xs sm:text-sm tracking-widest font-['Noto_Serif_Sinhala']">
            ආරච්චි
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] sm:text-xs tracking-widest text-amber-400/80 font-medium uppercase">
            Restaurant • Anuradhapura
          </span>
        )}
      </div>
    </div>
  );
};
