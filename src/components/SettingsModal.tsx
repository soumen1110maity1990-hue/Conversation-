import React, { useState } from 'react';
import { X, Moon, Sun, Volume2, VolumeX, RotateCcw, User, ShieldCheck, Sparkles, Upload, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';
import { createSvgAvatar, LIVE_AVATAR_PRESETS } from '../data/initialData';
import { Avatar } from './Avatar';
import { APP_ICON_PATH } from './HeaderLogo';

interface SettingsModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
  onOpenAndroidInstall?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  userProfile,
  onUpdateProfile,
  onResetData,
  onOpenAndroidInstall,
  onClose,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [about, setAbout] = useState(userProfile.about);
  const [soundEnabled, setSoundEnabled] = useState(userProfile.soundEnabled);
  const [theme, setTheme] = useState<'dark' | 'light'>(userProfile.theme);
  const [isLiveAvatar, setIsLiveAvatar] = useState(userProfile.isLiveAvatar ?? false);
  const [avatarType, setAvatarType] = useState<'image' | 'video' | 'gif'>(userProfile.avatarType || 'video');
  const [liveAvatarUrl, setLiveAvatarUrl] = useState(userProfile.liveAvatarUrl || LIVE_AVATAR_PRESETS[0].url);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = name
      .trim()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ME';

    const updated: UserProfile = {
      ...userProfile,
      name: name.trim() || 'Alex Morgan',
      about: about.trim() || 'Available',
      avatar: createSvgAvatar(initials, '#00a884'),
      avatarType,
      isLiveAvatar,
      liveAvatarUrl,
      soundEnabled,
      theme,
    };

    onUpdateProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#202c33] dark:bg-[#202c33] light:bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#111b21] border-b border-[#2a3942]">
          <div className="flex items-center gap-2.5">
            <img
              src={APP_ICON_PATH}
              alt="What's up"
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/10 shadow-sm"
            />
            <h3 className="font-semibold text-lg text-white">Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Profile Card with Live Motion Preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#111b21] border border-[#2a3942]">
            <Avatar
              src={userProfile.avatar}
              liveSrc={liveAvatarUrl}
              type={avatarType}
              isLive={isLiveAvatar}
              size="lg"
              showLiveBadge={true}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-white truncate">{name}</p>
              <p className="text-xs text-[#00a884] font-mono">{userProfile.phone}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {isLiveAvatar ? (
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles size={11} /> Live Avatar ({avatarType === 'video' ? 'MP4 Video' : 'GIF'})
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Static Photo</span>
                )}
              </div>
            </div>
          </div>

          {/* Live Motion Photo Toggle for User */}
          <div className="p-3.5 rounded-xl bg-[#111b21] border border-[#2a3942] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#00a884]" />
                <div>
                  <p className="text-sm font-medium text-white">Live Motion Avatar</p>
                  <p className="text-xs text-slate-400">Autoplay looping video / GIF in avatar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveAvatar(!isLiveAvatar)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  isLiveAvatar ? 'bg-[#00a884]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    isLiveAvatar ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {isLiveAvatar && (
              <div className="pt-2 border-t border-[#2a3942] space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Choose preset</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {LIVE_AVATAR_PRESETS.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setAvatarType(p.type);
                        setLiveAvatarUrl(p.url);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs text-left truncate transition-colors border ${
                        liveAvatarUrl === p.url
                          ? 'bg-[#00a884]/20 border-[#00a884] text-white'
                          : 'bg-[#182229] border-[#2a3942] text-slate-300 hover:text-white'
                      }`}
                    >
                      {p.previewName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111b21] text-white pl-9 pr-3 py-2 rounded-lg text-sm outline-none border border-[#2a3942] focus:border-[#00a884]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">About</label>
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full bg-[#111b21] text-white px-3 py-2 rounded-lg text-sm outline-none border border-[#2a3942] focus:border-[#00a884]"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#2a3942]">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#111b21]">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={18} className="text-[#00a884]" /> : <Sun size={18} className="text-amber-400" />}
                <div>
                  <p className="text-sm font-medium text-white">Appearance</p>
                  <p className="text-xs text-slate-400">{theme === 'dark' ? 'Dark theme' : 'Light theme'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2a3942] text-white hover:bg-[#32424b] transition-colors"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#111b21]">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 size={18} className="text-[#00a884]" /> : <VolumeX size={18} className="text-slate-500" />}
                <div>
                  <p className="text-sm font-medium text-white">Message Sounds</p>
                  <p className="text-xs text-slate-400">Play chimes on send & receive</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-[#00a884]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    soundEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Android App & APK Action */}
            {onOpenAndroidInstall && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#00a884]/15 to-[#008f6f]/10 border border-[#00a884]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#00a884]/20 text-[#00a884]">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Android App & APK</h5>
                    <p className="text-[11px] text-slate-400">Install WebAPK or generate signed .apk</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAndroidInstall();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-medium transition-colors shadow-sm"
                >
                  Get APK
                </button>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111b21]/50 border border-[#2a3942]/60">
              <ShieldCheck size={18} className="text-[#00a884] shrink-0" />
              <p className="text-xs text-slate-400">
                End-to-end encrypted messaging. All chats and preferences are stored in your local browser storage.
              </p>
            </div>
          </div>

          {/* Reset Action */}
          <div className="pt-2 border-t border-[#2a3942]">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all chats and restore default demo conversations?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw size={14} />
              Reset All Data to Default
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-[#2a3942] hover:bg-[#32424b] text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-sm font-medium shadow-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
