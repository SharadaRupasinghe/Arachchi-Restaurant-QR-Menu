import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const sizeClasses = {
    sm: 'h-9 w-9',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const textClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className={`${sizeClasses[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-b from-[#2b1d12] via-[#1a120b] to-[#0d0906] p-1.5 shadow-lg shadow-amber-950/40 border border-amber-500/30 overflow-hidden group`}
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-radial from-amber-500/20 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* SVG Recreation of Arachchi Wooden Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(245,158,11,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Temple / Mountain crests */}
          <path
            d="M50 12 L66 32 L50 27 L34 32 Z"
            fill="#f59e0b"
            stroke="#d97706"
            strokeWidth="2"
          />
          <path
            d="M50 20 L58 31 L50 28 L42 31 Z"
            fill="#fbbf24"
          />
          <path
            d="M26 34 L36 30 L40 40 L22 40 Z"
            fill="#d97706"
          />
          <path
            d="M74 34 L64 30 L60 40 L78 40 Z"
            fill="#d97706"
          />

          {/* Golden Badge Plate */}
          <rect
            x="14"
            y="38"
            width="72"
            height="46"
            rx="4"
            fill="#23170f"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />

          {/* Sinhala text "ආරච්චි" decorative representation */}
          <path
            d="M 24 54 Q 28 47 34 52 Q 38 56 34 62 Q 28 62 25 57"
            stroke="#fbbf24"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Mustache style 'ර' */}
          <path
            d="M 40 48 Q 50 43 56 50 Q 60 55 52 64"
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 46 47 Q 50 49 54 47"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* 'ච්චි' */}
          <path
            d="M 62 50 Q 68 47 74 53 Q 78 58 72 63 Q 66 63 64 57"
            stroke="#fbbf24"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Divider line */}
          <line x1="20" y1="67" x2="80" y2="67" stroke="#f59e0b" strokeWidth="1.2" strokeOpacity="0.6" />

          {/* English Wordmark */}
          <text
            x="50"
            y="76"
            textAnchor="middle"
            fill="#fbbf24"
            fontSize="7.5"
            fontWeight="700"
            letterSpacing="1.8"
            fontFamily="Cinzel, serif"
          >
            ARACHCHI
          </text>
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-serif tracking-wide text-amber-100 font-bold ${textClasses[size]}`}>
            ARACHCHI
          </span>
          <span className="text-amber-400 font-light text-xs sm:text-sm tracking-widest uppercase">
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
