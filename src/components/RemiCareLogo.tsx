import React from 'react';

interface RemiCareLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
  subtextClassName?: string;
}

/**
 * RemiCare Official Brand Logo Component
 * Uses the official logo image from public/images/logo.jpg
 */
export const RemiCareLogo: React.FC<RemiCareLogoProps> = ({
  className = '',
  size = 38,
  showText = true,
  textClassName = '',
  subtextClassName = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Logo Image */}
      <img
        src="/images/logo.jpg"
        alt="RemiCare Logo"
        width={size}
        height={size}
        className="shrink-0 rounded-lg object-contain transition-transform duration-200 hover:scale-105"
        style={{ width: size, height: size }}
      />

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`flex items-baseline leading-none tracking-tight font-extrabold ${textClassName}`}>
            <span className="text-[#006666]">Remi</span>
            <span className="text-[#00c4b4] drop-shadow-sm">Care</span>
          </div>
          <span className={`text-[10px] font-medium tracking-wider text-slate-400 uppercase leading-none mt-0.5 ${subtextClassName}`}>
            Visual Simulator
          </span>
        </div>
      )}
    </div>
  );
};
