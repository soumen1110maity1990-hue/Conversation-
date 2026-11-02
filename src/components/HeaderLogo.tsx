import React from 'react';

interface HeaderLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const APP_ICON_PATH = '/assets/aistudio/WhatsApp_Image_2026-11-02_at_11.08.09_AM__1__d83e939e.jpeg';

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ className = '', size = 'md' }) => {
  const imgSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern App Icon with waving hand in speech bubble */}
      <div className="relative flex items-center justify-center shrink-0 group">
        <div className={`${imgSize} rounded-xl overflow-hidden shadow-md shadow-[#00a884]/20 ring-1 ring-white/10 group-hover:scale-105 transition-all duration-200 bg-[#0f172a]`}>
          <img
            src={APP_ICON_PATH}
            alt="What's up App Icon"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={`font-bold tracking-tight text-[#e9edef] ${textSize}`}>
            What's up
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse"></span>
        </div>
      </div>
    </div>
  );
};
