import React, { useState } from 'react';
import { X, UserPlus, Search, Phone, User, Sparkles } from 'lucide-react';
import { Contact } from '../types';
import { createSvgAvatar, LIVE_AVATAR_PRESETS } from '../data/initialData';
import { Avatar } from './Avatar';

interface NewChatModalProps {
  contacts: Contact[];
  onSelectContact: (contactId: string) => void;
  onCreateNewContact: (newContact: Contact) => void;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  contacts,
  onSelectContact,
  onCreateNewContact,
  onClose,
}) => {
  const [tab, setTab] = useState<'existing' | 'create'>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAbout, setNewAbout] = useState('Hey there! I am using What\'s up.');
  const [colorIdx, setColorIdx] = useState(0);
  const [isLiveAvatar, setIsLiveAvatar] = useState(false);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);

  const colorPalette = ['#00a884', '#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#10b981'];

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const initials = newName
      .trim()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

    const chosenPreset = LIVE_AVATAR_PRESETS[selectedPresetIdx];

    const newContact: Contact = {
      id: `contact-custom-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      about: newAbout.trim(),
      avatar: createSvgAvatar(initials, colorPalette[colorIdx]),
      isLiveAvatar,
      avatarType: isLiveAvatar ? chosenPreset.type : 'image',
      liveAvatarUrl: isLiveAvatar ? chosenPreset.url : undefined,
      isOnline: true,
      unreadCount: 0,
    };

    onCreateNewContact(newContact);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#202c33] dark:bg-[#202c33] light:bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#111b21] border-b border-[#2a3942]">
          <h3 className="font-semibold text-lg text-white">New Chat</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#2a3942] bg-[#111b21]">
          <button
            onClick={() => setTab('existing')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === 'existing'
                ? 'text-[#00a884] border-b-2 border-[#00a884]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Select Contact
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === 'create'
                ? 'text-[#00a884] border-b-2 border-[#00a884]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Contact
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'existing' ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            <div className="relative mb-3">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-[#111b21] text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg text-sm outline-none border border-[#2a3942] focus:border-[#00a884]"
              />
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[360px] pr-1">
              {filteredContacts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectContact(c.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#111b21] cursor-pointer transition-colors"
                >
                  <Avatar contact={c} size="md" showLiveBadge={true} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.about || c.phone}</p>
                  </div>
                </div>
              ))}
              {filteredContacts.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-6">No matching contacts found</p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jessica Taylor"
                  className="w-full bg-[#111b21] text-white pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none border border-[#2a3942] focus:border-[#00a884]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#111b21] text-white pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none border border-[#2a3942] focus:border-[#00a884]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status / About</label>
              <input
                type="text"
                value={newAbout}
                onChange={(e) => setNewAbout(e.target.value)}
                placeholder="About quote..."
                className="w-full bg-[#111b21] text-white px-3 py-2.5 rounded-lg text-sm outline-none border border-[#2a3942] focus:border-[#00a884]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Avatar Color</label>
              <div className="flex gap-2">
                {colorPalette.map((col, idx) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColorIdx(idx)}
                    style={{ backgroundColor: col }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      colorIdx === idx ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#202c33]' : 'opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Live Motion Avatar Toggle */}
            <div className="p-3 rounded-xl bg-[#111b21] border border-[#2a3942] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                  <Sparkles size={14} className="text-[#00a884]" />
                  <span>Live Motion Profile (Video/GIF)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLiveAvatar(!isLiveAvatar)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
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
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {LIVE_AVATAR_PRESETS.slice(0, 4).map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPresetIdx(idx)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] text-left truncate transition-colors border ${
                        selectedPresetIdx === idx
                          ? 'bg-[#00a884]/20 border-[#00a884] text-white'
                          : 'bg-[#202c33] border-[#2a3942] text-slate-300'
                      }`}
                    >
                      {p.previewName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full py-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <UserPlus size={18} />
                Create and Start Chat
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
