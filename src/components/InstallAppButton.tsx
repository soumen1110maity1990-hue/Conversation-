import React from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppButtonProps {
  onOpenModal: () => void;
  variant?: 'icon' | 'badge' | 'full';
  className?: string;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  onOpenModal,
  variant = 'icon',
  className = '',
}) => {
  const { isInstalled } = usePWAInstall();

  if (variant === 'icon') {
    return (
      <button
        onClick={onOpenModal}
        className={`relative p-2 rounded-full transition-all text-slate-300 hover:text-white hover:bg-[#111b21] group ${className}`}
        title="Get Android App / APK"
        aria-label="Get Android App / APK"
      >
        <Smartphone size={19} className="group-hover:text-[#00a884] transition-colors" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00a884] ring-2 ring-[#202c33]" />
      </button>
    );
  }

  if (variant === 'badge') {
    return (
      <button
        onClick={onOpenModal}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#00a884]/15 hover:bg-[#00a884]/25 text-[#00a884] border border-[#00a884]/30 transition-all ${className}`}
      >
        <Smartphone size={13} />
        <span>{isInstalled ? 'App Installed' : 'Get Android App / APK'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onOpenModal}
      className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00a884] to-[#008f6f] hover:brightness-105 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all ${className}`}
    >
      <Smartphone size={16} />
      <span>Install on Android / Download APK</span>
    </button>
  );
};
