import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';

interface CatFlareLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  allowUpload?: boolean;
}

export const CatFlareLogo: React.FC<CatFlareLogoProps> = ({
  size = 'md',
  className = '',
  allowUpload = true,
}) => {
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('catflare_custom_logo');
      if (saved) {
        setCustomLogo(saved);
      }
    } catch (_) {}
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCustomLogo(result);
        try {
          localStorage.setItem('catflare_custom_logo', result);
        } catch (_) {}
      };
      reader.readAsDataURL(file);
    }
  };

  const dimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';

  return (
    <div 
      className={`relative group rounded-xl overflow-hidden border border-orange-500/40 shadow-md shadow-orange-500/10 cursor-pointer flex-shrink-0 ${dimensions} ${className}`}
      onClick={() => allowUpload && fileInputRef.current?.click()}
      title={allowUpload ? "CatFlare Logo (Click to upload/change image)" : "CatFlare Logo"}
    >
      {customLogo ? (
        <img
          src={customLogo}
          alt="CatFlare Logo"
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        /* Highly detailed Ninja Sharingan Cat SVG Icon */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full bg-zinc-950"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="catEyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff0033" />
              <stop offset="70%" stopColor="#b3001e" />
              <stop offset="100%" stopColor="#4a000d" />
            </radialGradient>
            <linearGradient id="headbandPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a1a1aa" />
              <stop offset="50%" stopColor="#52525b" />
              <stop offset="100%" stopColor="#27272a" />
            </linearGradient>
            <linearGradient id="ninjaCloak" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <filter id="sharinganGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Background night aura */}
          <circle cx="50" cy="50" r="50" fill="#0d1117" />
          <circle cx="50" cy="50" r="46" fill="#161b22" />

          {/* Cat Ears */}
          <polygon points="20,44 14,14 42,28" fill="#654321" stroke="#3d2814" strokeWidth="1.5" />
          <polygon points="22,40 18,18 38,28" fill="#d97706" />
          <polygon points="80,44 86,14 58,28" fill="#654321" stroke="#3d2814" strokeWidth="1.5" />
          <polygon points="78,40 82,18 62,28" fill="#d97706" />

          {/* Hair strands / bangs */}
          <path d="M 28 20 Q 34 32 32 46" stroke="#18181b" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 72 20 Q 66 32 68 46" stroke="#18181b" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 44 24 Q 48 34 46 44" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 54 24 Q 52 34 54 44" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Cat Head Base */}
          <ellipse cx="50" cy="56" rx="34" ry="30" fill="#784d28" stroke="#3d2814" strokeWidth="1.5" />
          <ellipse cx="50" cy="62" rx="26" ry="22" fill="#9a6233" />

          {/* Konoha Headband Band (Dark) */}
          <path d="M 24 38 Q 50 32 76 38" stroke="#09090b" strokeWidth="11" fill="none" strokeLinecap="round" />
          {/* Metal Plate */}
          <rect x="33" y="32" width="34" height="12" rx="2.5" fill="url(#headbandPlate)" stroke="#18181b" strokeWidth="1" />
          {/* Plate Screws */}
          <circle cx="36" cy="35" r="0.9" fill="#18181b" />
          <circle cx="36" cy="41" r="0.9" fill="#18181b" />
          <circle cx="64" cy="35" r="0.9" fill="#18181b" />
          <circle cx="64" cy="41" r="0.9" fill="#18181b" />
          {/* Konoha Leaf / Spiral Symbol */}
          <path d="M 50 36 A 2.2 2.2 0 1 1 48 38 L 47 40 L 52 38" stroke="#18181b" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Sharingan Left Eye */}
          <ellipse cx="36" cy="56" rx="7.5" ry="5.5" fill="url(#catEyeGlow)" filter="url(#sharinganGlow)" />
          <circle cx="36" cy="56" r="2.2" fill="#111" />
          {/* Tomoe Left */}
          <circle cx="33.5" cy="54" r="0.9" fill="#111" />
          <circle cx="38.5" cy="54" r="0.9" fill="#111" />
          <circle cx="36" cy="58.8" r="0.9" fill="#111" />

          {/* Sharingan Right Eye */}
          <ellipse cx="64" cy="56" rx="7.5" ry="5.5" fill="url(#catEyeGlow)" filter="url(#sharinganGlow)" />
          <circle cx="64" cy="56" r="2.2" fill="#111" />
          {/* Tomoe Right */}
          <circle cx="61.5" cy="54" r="0.9" fill="#111" />
          <circle cx="66.5" cy="54" r="0.9" fill="#111" />
          <circle cx="64" cy="58.8" r="0.9" fill="#111" />

          {/* Nose & Muzzle */}
          <polygon points="50,65 47.5,62 52.5,62" fill="#f43f5e" />
          <path d="M 50 65 L 50 68 Q 46 71 42 69 M 50 68 Q 54 71 58 69" stroke="#3d2814" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Whiskers */}
          <line x1="28" y1="65" x2="12" y2="62" stroke="#d4d4d8" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="27" y1="68" x2="14" y2="70" stroke="#d4d4d8" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="72" y1="65" x2="88" y2="62" stroke="#d4d4d8" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="73" y1="68" x2="86" y2="70" stroke="#d4d4d8" strokeWidth="1.1" strokeLinecap="round" />

          {/* Akatsuki Cloak High Collar */}
          <path d="M 22 84 Q 30 76 50 78 Q 70 76 78 84 L 84 100 L 16 100 Z" fill="url(#ninjaCloak)" stroke="#dc2626" strokeWidth="1.5" />
          <path d="M 50 78 L 50 100" stroke="#dc2626" strokeWidth="1.2" />
        </svg>
      )}

      {/* Hover upload helper hint */}
      {allowUpload && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-bold text-center p-0.5 pointer-events-none">
          <Camera className="w-3.5 h-3.5 text-orange-400 mb-0.5" />
          <span>Upload</span>
        </div>
      )}

      {/* Hidden file input for uploading the user's cat picture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
