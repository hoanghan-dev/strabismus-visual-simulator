import React from 'react';

interface RemiCareLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
  subtextClassName?: string;
  variant?: 'white' | 'transparent';
}

/**
 * RemiCare Official Brand Logo Component
 * Uses the user's authentic brand image asset (PNG image, no SVG).
 */
export const RemiCareLogo: React.FC<RemiCareLogoProps> = ({
  className = '',
  size = 38,
  showText = true,
  textClassName = '',
  subtextClassName = '',
  variant = 'white',
}) => {
  const logoSrc = variant === 'transparent' ? '/remicare-logo-transparent.png' : '/remicare-logo.png';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Authentic High-Resolution Logo Image Asset (No SVG) */}
      <img
        src={logoSrc}
        alt="RemiCare Brand Logo"
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="shrink-0 object-contain rounded-xl shadow-sm transition-transform duration-200 hover:scale-105"
      />

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`flex items-baseline leading-none tracking-tight font-extrabold ${textClassName}`}>
            <span className="text-white">Remi</span>
            <span className="text-[#00c4b4] drop-shadow-sm">Care</span>
          </div>
          <span className={`text-[10px] font-medium tracking-wider text-slate-400 uppercase leading-none mt-0.5 ${subtextClassName}`}>
            Ophthalmology & Binocular Vision
          </span>
        </div>
      )}
    </div>
  );
};

