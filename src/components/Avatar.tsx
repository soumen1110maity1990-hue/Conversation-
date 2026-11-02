import React, { useState } from 'react';
import { Sparkles, Video as VideoIcon } from 'lucide-react';
import { Contact } from '../types';

interface AvatarProps {
  contact?: Partial<Contact> | null;
  src?: string;
  liveSrc?: string;
  type?: 'image' | 'video' | 'gif';
  isLive?: boolean;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  showLiveBadge?: boolean;
  showOnlineDot?: boolean;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  contact,
  src,
  liveSrc,
  type,
  isLive,
  alt,
  size = 'md',
  className = '',
  showLiveBadge = false,
  showOnlineDot = false,
  onClick,
}) => {
  const [videoError, setVideoError] = useState(false);

  // Determine media properties from contact or direct props
  const effectiveIsLive = isLive ?? contact?.isLiveAvatar ?? false;
  const effectiveType = type ?? contact?.avatarType ?? 'image';
  const effectiveLiveSrc = liveSrc || contact?.liveAvatarUrl;
  const effectiveStaticSrc = src || contact?.avatar || '';
  const effectiveAlt = alt || contact?.name || 'Profile Picture';
  const isOnline = contact?.isOnline ?? false;

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
    '2xl': 'w-24 h-24 text-xl',
    custom: '',
  }[size];

  const isVideo = effectiveIsLive && effectiveType === 'video' && !!effectiveLiveSrc && !videoError;
  const isGif = effectiveIsLive && effectiveType === 'gif' && !!effectiveLiveSrc;

  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 rounded-full select-none ${sizeClasses} ${className} ${
        onClick ? 'cursor-pointer hover:opacity-95' : ''
      }`}
    >
      {/* Circular Avatar Frame */}
      <div className="w-full h-full rounded-full overflow-hidden bg-[#202c33] flex items-center justify-center relative">
        {isVideo ? (
          <video
            src={effectiveLiveSrc}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover rounded-full"
          />
        ) : isGif ? (
          <img
            src={effectiveLiveSrc || effectiveStaticSrc}
            alt={effectiveAlt}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <img
            src={effectiveStaticSrc}
            alt={effectiveAlt}
            className="w-full h-full object-cover rounded-full"
          />
        )}
      </div>

      {/* Optional Live Indicator Badge */}
      {effectiveIsLive && showLiveBadge && (
        <span
          className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-white p-0.5 rounded-full ring-2 ring-[#111b21] shadow-md flex items-center justify-center"
          title="Live Moving Profile"
        >
          <Sparkles size={size === 'xs' || size === 'sm' ? 8 : 10} />
        </span>
      )}

      {/* Online presence dot */}
      {showOnlineDot && isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]" />
      )}
    </div>
  );
};
