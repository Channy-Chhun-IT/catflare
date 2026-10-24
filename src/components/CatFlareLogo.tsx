import React from 'react';
import itachiCatLogo from '../assets/logo.png';

interface CatFlareLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  allowUpload?: boolean;
}

export const CatFlareLogo: React.FC<CatFlareLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const dimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';

  return (
    <div 
      className={`relative rounded-xl overflow-hidden border border-orange-500/40 shadow-md shadow-orange-500/10 flex-shrink-0 cursor-default select-none ${dimensions} ${className}`}
      title="CatFlare Logo"
    >
      <img
        src={itachiCatLogo}
        alt="CatFlare Logo"
        className="w-full h-full object-cover rounded-xl"
      />
    </div>
  );
};


