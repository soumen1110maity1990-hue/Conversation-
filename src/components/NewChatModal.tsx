import React, { useState } from 'react';
import { X, UserPlus, Search, Phone, User, Sparkles, Copy, Check, MessageSquare, PhoneCall, Video } from 'lucide-react';
import { Contact } from '../types';
import { createSvgAvatar, LIVE_AVATAR_PRESETS } from '../data/initialData';
import { Avatar } from './Avatar';
import { cleanPhoneForDialing, copyPhoneToClipboard, isPhoneMatch } from '../utils/phoneUtils';

interface NewChatModalProps {
  contacts: Contact[];
  onSelectContact: (contactId: string) => void;
  onStartChatWithPhone?: (phone: string, name?: string) => void;
  onStartCall?: (contact: Contact, type: 'audio' | 'video') => void;
  onCreateNewContact: (newContact: Contact) => void;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  contacts,
  onSelectContact,
  onStartChatWithPhone,
  onStartCall,
  onCreateNewContact,
  onClose,
}) => {
  const [tab, setTab] = useState<'existing' | 'directPhone' | 'create'>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [directPhoneInput, setDirectPhoneInput] = useState('');
  const [directNameInput, setDirectNameInput] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // New Contact Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAbout, setNewAbout] = useState("Hey there! I am using What's up.");
  const [colorIdx, setColorIdx] = useState(0);
  const [isLiveAvatar, setIsLiveAvatar] = useState(false);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);

  const colorPalette = ['#00a884', '#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#10b981'];

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    isPhoneMatch(c.phone, searchTerm)
  );

  const handleCopyPhone = async (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyPhoneToClipboard(phone);
    if (ok) {
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  const handleStartDirectChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directPhoneInput.trim()) return;
    if (onStartChatWithPhone) {
      onStartChatWithPhone(directPhoneInput.trim(), directNameInput.trim() || undefined);
    } else {
      // fallback create new contact
      const newContact: Contact = {
        id: `contact-direct-${Date.now()}`,
        name: directNameInput.trim() || directPhoneInput.trim(),
        phone: directPhoneInput.trim(),
        about: "Hey there! I am using What's up.",
        avatar: createSvgAvatar('WA', '#00a884'),
        isOnline: true,
        unreadCount: 0,
      };
      onCreateNewContact(newContact);
    }
    onClose();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const initials =
      newName
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#202c33] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#111b21] border-b border-[#2a3942]">
          <div>
            <h3 className="font-semibold text-lg text-white">New Chat & Phone Directory</h3>
            <p className="text-xs text-slate-400">All contacts linked with individual phone numbers</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3 Tab Switcher */}
        <div className="flex border-b border-[#2a3942] bg-[#111b21] text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setTab('existing')}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'existing'
                ? 'text-[#00a884] border-b-2 border-[#00a884]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contacts ({filteredContacts.length})
          </button>
          <button
            onClick={() => setTab('directPhone')}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'directPhone'
                ? 'text-[#00a884] border-b-2 border-[#00a884]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Direct Phone
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'create'
                ? 'text-[#00a884] border-b-2 border-[#00a884]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Add New
          </button>
        </div>

        {/* Tab 1: Select Contact with Phone Numbers */}
        {tab === 'existing' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            <div className="relative mb-3">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by contact name or phone number..."
                className="w-full bg-[#111b21] text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl text-sm outline-none border border-[#2a3942] focus:border-[#00a884]"
              />
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[400px] pr-1 divide-y divide-[#2a3942]/40">
              {filteredContacts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectContact(c.id);
                    onClose();
                  }}
                  className="pt-2 flex items-center justify-between p-2.5 rounded-xl hover:bg-[#111b21] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar contact={c} size="md" showLiveBadge={true} showOnlineDot={true} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-[#00a884] transition-colors">
                        {c.name}
                      </p>
                      
                      {/* Individual Phone Link */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${cleanPhoneForDialing(c.phone)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-mono text-[#00a884] hover:underline flex items-center gap-1"
                          title={`Dial ${c.phone}`}
                        >
                          <Phone size={11} className="shrink-0" />
                          <span>{c.phone}</span>
                        </a>

                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(c.phone, e)}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#202c33] transition-colors"
                          title="Copy phone number"
                        >
                          {copiedPhone === c.phone ? (
                            <span className="flex items-center gap-1 text-[10px] text-[#00a884] font-medium">
                              <Check size={12} /> Copied
                            </span>
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.about}</p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1 ml-2 opacity-80 group-hover:opacity-100">
                    <a
                      href={`tel:${cleanPhoneForDialing(c.phone)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-slate-300 hover:text-[#00a884] hover:bg-[#202c33] rounded-full transition-colors"
                      title="Direct phone call (tel:)"
                    >
                      <PhoneCall size={16} />
                    </a>
                    {onStartCall && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartCall(c, 'audio');
                          onClose();
                        }}
                        className="p-2 text-[#00a884] hover:bg-[#202c33] rounded-full transition-colors"
                        title="Voice Call"
                      >
                        <Phone size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectContact(c.id);
                        onClose();
                      }}
                      className="p-2 text-slate-300 hover:text-white hover:bg-[#202c33] rounded-full transition-colors"
                      title="Open Chat"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm font-medium">No contact matching "{searchTerm}"</p>
                  <button
                    onClick={() => {
                      setDirectPhoneInput(searchTerm);
                      setTab('directPhone');
                    }}
                    className="mt-2 text-xs text-[#00a884] hover:underline"
                  >
                    Start direct chat with number "{searchTerm}" →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Direct Phone Chat (Enter any individual phone number) */}
        {tab === 'directPhone' && (
          <form onSubmit={handleStartDirectChat} className="p-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#111b21] border border-[#2a3942] space-y-2">
              <div className="flex items-center gap-2 text-[#00a884] font-semibold text-sm">
                <PhoneCall size={18} />
                <span>Message or Call Any Phone Number</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Start a direct conversation with any individual phone number worldwide without needing to add them to your address book first.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Individual Phone Number (with Country Code)
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={directPhoneInput}
                  onChange={(e) => setDirectPhoneInput(e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678 or +91 98201 44321"
                  className="w-full bg-[#111b21] text-white pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none border border-[#2a3942] focus:border-[#00a884] font-mono"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contact Name (Optional)
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={directNameInput}
                  onChange={(e) => setDirectNameInput(e.target.value)}
                  placeholder="e.g. John Doe (defaults to phone number)"
                  className="w-full bg-[#111b21] text-white pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none border border-[#2a3942] focus:border-[#00a884]"
                />
              </div>
            </div>

            {/* Quick Sample Numbers */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Sample International Direct Numbers
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Sarah Jenkins', phone: '+1 (555) 349-2011' },
                  { label: 'Priya Sharma (IN)', phone: '+91 98201 44321' },
                  { label: 'Lucas Silva (BR)', phone: '+55 11 98765-4321' },
                  { label: 'Emma Watson (UK)', phone: '+44 7700 900123' },
                ].map((sample) => (
                  <button
                    key={sample.phone}
                    type="button"
                    onClick={() => {
                      setDirectPhoneInput(sample.phone);
                      setDirectNameInput(sample.label);
                    }}
                    className="p-2 rounded-lg bg-[#111b21] hover:bg-[#182229] border border-[#2a3942] text-left transition-colors truncate"
                  >
                    <p className="font-semibold text-white truncate">{sample.label}</p>
                    <p className="text-[11px] text-[#00a884] font-mono truncate">{sample.phone}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={!directPhoneInput.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageSquare size={17} />
                <span>Start Direct Chat</span>
              </button>
              {directPhoneInput.trim() && (
                <a
                  href={`tel:${cleanPhoneForDialing(directPhoneInput)}`}
                  className="px-4 py-2.5 rounded-xl bg-[#111b21] hover:bg-[#182229] border border-[#00a884]/40 text-[#00a884] text-sm font-medium flex items-center gap-1.5 transition-colors"
                  title="Dial number directly"
                >
                  <PhoneCall size={16} />
                  <span>Dial</span>
                </a>
              )}
            </div>
          </form>
        )}

        {/* Tab 3: Create Full Contact Profile */}
        {tab === 'create' && (
          <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto">
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Individual Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#111b21] text-white pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none border border-[#2a3942] focus:border-[#00a884] font-mono"
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
                <span>Save Contact & Start Chat</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
