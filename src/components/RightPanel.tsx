import React, { useState } from 'react';
import {
  X,
  Phone,
  Video,
  Plus,
  Shield,
  Bell,
  Star,
  Trash2,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  PhoneCall,
  VideoOff,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Upload,
  Play,
  Check,
  Copy,
  Users,
} from 'lucide-react';
import { Contact, StatusStory, CallRecord, Chat } from '../types';
import { Avatar } from './Avatar';
import { LIVE_AVATAR_PRESETS } from '../data/initialData';
import { cleanPhoneForDialing, copyPhoneToClipboard } from '../utils/phoneUtils';

export type RightPanelTab = 'status' | 'calls' | 'info';

interface RightPanelProps {
  activeTab: RightPanelTab;
  setActiveTab: (tab: RightPanelTab) => void;
  activeChat: Chat | null;
  statusStories: StatusStory[];
  calls: CallRecord[];
  onOpenStory: (story: StatusStory) => void;
  onAddStatus: (text: string, bgColor: string) => void;
  onStartCall: (contact: Contact, type: 'audio' | 'video') => void;
  onDeleteChat: (chatId: string) => void;
  onToggleStarMessage?: (messageId: string) => void;
  onUpdateContactAvatar?: (contactId: string, updates: { isLiveAvatar: boolean; avatarType: 'image' | 'video' | 'gif'; liveAvatarUrl?: string }) => void;
  onClose: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  activeTab,
  setActiveTab,
  activeChat,
  statusStories,
  calls,
  onOpenStory,
  onAddStatus,
  onStartCall,
  onDeleteChat,
  onUpdateContactAvatar,
  onClose,
}) => {
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [newStatusText, setNewStatusText] = useState('');
  const [selectedBg, setSelectedBg] = useState('#005c4b');
  const [isMuted, setIsMuted] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = async (phone: string) => {
    if (!phone) return;
    const success = await copyPhoneToClipboard(phone);
    if (success) {
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  const bgColors = ['#005c4b', '#7c3aed', '#0284c7', '#b45309', '#db2777', '#334155'];

  const contact = activeChat?.contact;
  const starredMessages = activeChat?.messages.filter((m) => m.isStarred) || [];

  const handlePostStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusText.trim()) return;
    onAddStatus(newStatusText.trim(), selectedBg);
    setNewStatusText('');
    setShowAddStatusModal(false);
  };

  const handleLiveAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contact) return;
    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.webm');
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateContactAvatar?.(contact.id, {
          isLiveAvatar: true,
          avatarType: isVideo ? 'video' : isGif ? 'gif' : 'image',
          liveAvatarUrl: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full bg-[#111b21] border-l border-[#222e35] flex flex-col shrink-0 select-none z-20">
      {/* Top Header */}
      <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222e35]">
        <div className="flex items-center gap-2">
          {/* Panel Selector Tabs */}
          <div className="flex bg-[#111b21] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'status' ? 'bg-[#00a884] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setActiveTab('calls')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'calls' ? 'bg-[#00a884] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Calls
            </button>
            {activeChat && (
              <button
                onClick={() => setActiveTab('info')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'info' ? 'bg-[#00a884] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Contact Info
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#111b21] rounded-full transition-colors"
          title="Close panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* ================= STATUS TAB ================= */}
        {activeTab === 'status' && (
          <div className="p-4 space-y-5">
            {/* My Status */}
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">My Status</p>
              <div
                onClick={() => setShowAddStatusModal(true)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#202c33] cursor-pointer transition-colors group"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-sm">
                    You
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00a884] border-2 border-[#111b21] flex items-center justify-center text-white">
                    <Plus size={13} strokeWidth={3} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">Add to my status</p>
                  <p className="text-xs text-slate-400">Share photo, thought or quote</p>
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Recent Updates ({statusStories.filter((s) => !s.allViewed).length})
              </p>
              <div className="space-y-1">
                {statusStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => onOpenStory(story)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#202c33] cursor-pointer transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full p-0.5 ${
                          story.allViewed ? 'ring-2 ring-slate-600' : 'ring-2 ring-[#00a884] ring-offset-2 ring-offset-[#111b21]'
                        }`}
                      >
                        <img
                          src={story.contactAvatar}
                          alt={story.contactName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{story.contactName}</p>
                      <p className="text-xs text-slate-400">{story.lastUpdated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#202c33]/50 border border-[#222e35] text-xs text-slate-400 flex items-start gap-2.5">
              <Lock size={15} className="text-[#00a884] shrink-0 mt-0.5" />
              <span>Your status updates are end-to-end encrypted and disappear after 24 hours.</span>
            </div>
          </div>
        )}

        {/* ================= CALLS TAB ================= */}
        {activeTab === 'calls' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Recent Calls</p>
              {activeChat && (
                <button
                  onClick={() => onStartCall(activeChat.contact, 'audio')}
                  className="text-xs text-[#00a884] hover:underline font-medium flex items-center gap-1"
                >
                  <PhoneCall size={13} />
                  Call {activeChat.contact.name.split(' ')[0]}
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#202c33] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={call.contactAvatar} alt={call.contactName} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{call.contactName}</p>
                      {call.contactPhone && (
                        <div className="flex items-center gap-1.5 my-0.5">
                          <a
                            href={`tel:${cleanPhoneForDialing(call.contactPhone)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-mono text-[#00a884] hover:underline flex items-center gap-1"
                            title={`Call ${call.contactPhone} directly`}
                          >
                            <Phone size={10} />
                            <span>{call.contactPhone}</span>
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPhone(call.contactPhone!);
                            }}
                            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                            title="Copy number"
                          >
                            {copiedPhone === call.contactPhone ? (
                              <Check size={11} className="text-[#00a884]" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        {call.direction === 'incoming' && <ArrowDownLeft size={13} className="text-[#00a884]" />}
                        {call.direction === 'outgoing' && <ArrowUpRight size={13} className="text-[#00a884]" />}
                        {call.direction === 'missed' && <ArrowDownLeft size={13} className="text-rose-400" />}
                        <span className={call.direction === 'missed' ? 'text-rose-400' : ''}>
                          {call.timestamp}
                        </span>
                        {call.duration && (
                          <>
                            <span>·</span>
                            <span>{call.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Callback actions */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {call.contactPhone && (
                      <a
                        href={`tel:${cleanPhoneForDialing(call.contactPhone)}`}
                        className="p-2 text-slate-300 hover:text-[#00a884] hover:bg-[#111b21] rounded-full transition-colors"
                        title="Dial on phone"
                      >
                        <PhoneCall size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        const targetContact = {
                          id: call.contactId,
                          name: call.contactName,
                          avatar: call.contactAvatar,
                          phone: call.contactPhone || '',
                          about: '',
                          isOnline: true,
                          unreadCount: 0,
                        };
                        onStartCall(targetContact, call.type);
                      }}
                      className="p-2 text-[#00a884] hover:bg-[#111b21] rounded-full transition-colors"
                      title={`Call back with ${call.type}`}
                    >
                      {call.type === 'video' ? <Video size={17} /> : <Phone size={17} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= CONTACT INFO TAB ================= */}
        {activeTab === 'info' && contact && (
          <div className="p-4 space-y-4">
            {/* Profile Avatar Card */}
            <div className="flex flex-col items-center text-center p-4 bg-[#202c33] rounded-2xl">
              <Avatar
                contact={contact}
                size="2xl"
                showLiveBadge={true}
                className="border-4 border-[#111b21] shadow-xl mb-3"
              />
              <h3 className="text-lg font-bold text-white">{contact.name}</h3>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <a
                  href={`tel:${cleanPhoneForDialing(contact.phone)}`}
                  className="text-xs font-mono text-[#00a884] hover:underline flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111b21] border border-[#2a3942] hover:border-[#00a884] transition-colors"
                  title="Tap to dial phone number directly"
                >
                  <Phone size={11} />
                  <span>{contact.phone}</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyPhone(contact.phone)}
                  className="p-1.5 rounded-full bg-[#111b21] hover:bg-[#182229] border border-[#2a3942] text-slate-400 hover:text-white transition-colors"
                  title="Copy phone number"
                >
                  {copiedPhone === contact.phone ? (
                    <Check size={12} className="text-[#00a884]" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111b21] text-xs text-[#00a884]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                  {contact.isOnline ? 'Online' : contact.lastSeen || 'Offline'}
                </div>
                {contact.isLiveAvatar && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-xs text-emerald-300 border border-emerald-500/30">
                    <Sparkles size={11} className="text-emerald-400" />
                    <span>Live {contact.avatarType === 'video' ? 'Video (.mp4)' : 'GIF'}</span>
                  </div>
                )}
              </div>

              {/* Call shortcuts */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => onStartCall(contact, 'audio')}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-[#111b21] text-[#00a884] text-xs font-medium transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#111b21] flex items-center justify-center">
                    <Phone size={18} />
                  </div>
                  Audio
                </button>
                <button
                  onClick={() => onStartCall(contact, 'video')}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-[#111b21] text-[#00a884] text-xs font-medium transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#111b21] flex items-center justify-center">
                    <Video size={18} />
                  </div>
                  Video
                </button>
              </div>
            </div>

            {/* LIVE / ANIMATED PROFILE PICTURE CONTROLS */}
            <div className="p-4 bg-[#202c33] rounded-2xl space-y-3.5 border border-[#00a884]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles size={16} className="text-[#00a884]" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Live Profile Picture</span>
                </div>
                {/* Main Toggle Switch */}
                <button
                  type="button"
                  onClick={() => {
                    const willEnable = !contact.isLiveAvatar;
                    onUpdateContactAvatar?.(contact.id, {
                      isLiveAvatar: willEnable,
                      avatarType: contact.avatarType || 'video',
                      liveAvatarUrl: contact.liveAvatarUrl || LIVE_AVATAR_PRESETS[0].url,
                    });
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    contact.isLiveAvatar ? 'bg-[#00a884]' : 'bg-slate-700'
                  }`}
                  title={contact.isLiveAvatar ? 'Disable Live Avatar' : 'Enable Live Avatar'}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      contact.isLiveAvatar ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Render an autoplaying, muted, and looping video (.mp4) or animated GIF in circular avatar frames across the chat list and active header.
              </p>

              {/* Simulation Presets */}
              <div>
                <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Sample Presets & Simulations
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LIVE_AVATAR_PRESETS.map((preset) => {
                    const isSelected =
                      contact.isLiveAvatar &&
                      contact.liveAvatarUrl === preset.url &&
                      contact.avatarType === preset.type;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onUpdateContactAvatar?.(contact.id, {
                            isLiveAvatar: true,
                            avatarType: preset.type,
                            liveAvatarUrl: preset.url,
                          });
                        }}
                        className={`p-2 rounded-xl text-left transition-all border flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#00a884]/20 border-[#00a884] text-white shadow-sm'
                            : 'bg-[#111b21] border-[#2a3942] hover:border-[#00a884]/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        {/* Miniature Avatar Preview */}
                        <Avatar
                          type={preset.type}
                          liveSrc={preset.url}
                          isLive={true}
                          alt={preset.name}
                          size="xs"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{preset.previewName}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{preset.type}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-[#00a884] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Custom Media */}
              <div className="pt-2 border-t border-[#111b21]">
                <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#111b21] hover:bg-[#182229] border border-dashed border-[#00a884]/40 hover:border-[#00a884] text-xs font-semibold text-white transition-all group">
                  <Upload size={14} className="text-[#00a884] group-hover:scale-110 transition-transform" />
                  <span>Upload Live Video (.mp4) or GIF</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,image/gif"
                    onChange={handleLiveAvatarUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-500 text-center mt-1.5">
                  Saved directly to LocalStorage with instant persistence.
                </p>
              </div>

              {/* Reset to Static button */}
              {contact.isLiveAvatar && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateContactAvatar?.(contact.id, {
                      isLiveAvatar: false,
                      avatarType: 'image',
                    });
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-rose-400 py-1 transition-colors"
                >
                  Revert to standard static photo
                </button>
              )}
            </div>

            {/* Phone Number & Direct Cellular Link */}
            <div className="p-4 bg-[#202c33] rounded-2xl space-y-2.5 border border-[#2a3942]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                  Direct Line
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111b21] border border-[#2a3942]">
                <div className="min-w-0 flex-1">
                  <a
                    href={`tel:${cleanPhoneForDialing(contact.phone)}`}
                    className="text-base font-semibold font-mono text-white hover:text-[#00a884] transition-colors block truncate"
                    title="Click to dial this phone number directly"
                  >
                    {contact.phone}
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mobile · Tap to open phone dialer</p>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(contact.phone)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-[#202c33] rounded-lg transition-colors"
                    title="Copy phone number"
                  >
                    {copiedPhone === contact.phone ? (
                      <span className="flex items-center gap-1 text-xs text-[#00a884] font-medium">
                        <Check size={14} /> Copied
                      </span>
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <a
                    href={`tel:${cleanPhoneForDialing(contact.phone)}`}
                    className="p-2 text-[#00a884] hover:bg-[#202c33] rounded-lg transition-colors"
                    title="Dial with phone app"
                  >
                    <PhoneCall size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* About / Bio */}
            <div className="p-4 bg-[#202c33] rounded-2xl space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">About</p>
              <p className="text-sm text-white">{contact.about || 'Available'}</p>
            </div>

            {/* Group Members with Individual Phone Numbers */}
            {contact.isGroup && (
              <div className="p-4 bg-[#202c33] rounded-2xl space-y-3 border border-[#2a3942]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#00a884]" />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Group Members ({contact.groupMemberDetails?.length || contact.groupMembers?.length || 0})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">All numbers linked</span>
                </div>

                <div className="space-y-2 pt-1">
                  {(contact.groupMemberDetails || contact.groupMembers?.map((m) => ({ name: m, phone: '+1 (555) 234-8901', avatar: '', about: 'Member' })) || []).map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#111b21] hover:bg-[#182229] border border-[#2a3942]/60 transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                        <a
                          href={`tel:${cleanPhoneForDialing(member.phone)}`}
                          className="text-[11px] font-mono text-[#00a884] hover:underline flex items-center gap-1 mt-0.5"
                          title={`Dial ${member.phone}`}
                        >
                          <Phone size={10} />
                          <span>{member.phone}</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(member.phone)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#202c33] rounded-lg transition-colors"
                          title="Copy member phone number"
                        >
                          {copiedPhone === member.phone ? (
                            <Check size={12} className="text-[#00a884]" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const memberContact: Contact = {
                              id: `member-${idx}`,
                              name: member.name,
                              avatar: member.avatar || '',
                              about: member.about || 'Member',
                              phone: member.phone,
                              isOnline: true,
                              unreadCount: 0,
                            };
                            onStartCall(memberContact, 'audio');
                          }}
                          className="p-1.5 text-[#00a884] hover:bg-[#202c33] rounded-lg transition-colors"
                          title="Call member"
                        >
                          <Phone size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Media */}
            <div className="p-4 bg-[#202c33] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Media, Links & Docs</p>
                <span className="text-xs text-[#00a884]">12 items</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square rounded-lg bg-[#111b21] flex flex-col items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors">
                  <ImageIcon size={20} />
                  <span className="text-[10px] mt-1">Photos</span>
                </div>
                <div className="aspect-square rounded-lg bg-[#111b21] flex flex-col items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors">
                  <Star size={20} />
                  <span className="text-[10px] mt-1">Starred ({starredMessages.length})</span>
                </div>
                <div className="aspect-square rounded-lg bg-[#111b21] flex flex-col items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors">
                  <Lock size={20} />
                  <span className="text-[10px] mt-1">Docs</span>
                </div>
              </div>
            </div>

            {/* Settings & Danger Zone */}
            <div className="p-4 bg-[#202c33] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-sm text-white">
                  <Bell size={16} className="text-slate-400" />
                  <span>Mute notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${isMuted ? 'bg-[#00a884]' : 'bg-slate-700'}`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      isMuted ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-white pt-2 border-t border-[#111b21]">
                <Shield size={16} className="text-[#00a884]" />
                <div>
                  <p>Encryption</p>
                  <p className="text-xs text-slate-400">Messages and calls are end-to-end encrypted.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeChat && window.confirm(`Clear chat with ${contact.name}?`)) {
                    onDeleteChat(activeChat.id);
                  }
                }}
                className="w-full pt-3 border-t border-[#111b21] text-left text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={15} />
                Delete Chat History
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add New Status Story */}
      {showAddStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#202c33] p-5 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-white">Add Status Update</h4>
              <button onClick={() => setShowAddStatusModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePostStatus} className="space-y-4">
              <div
                className="w-full h-36 rounded-xl flex items-center justify-center p-4 transition-colors"
                style={{ backgroundColor: selectedBg }}
              >
                <textarea
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  placeholder="Type a status..."
                  maxLength={160}
                  className="w-full h-full bg-transparent text-white text-center font-medium placeholder-white/60 resize-none outline-none text-base"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Choose Background Color</p>
                <div className="flex gap-2">
                  {bgColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedBg(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        selectedBg === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#202c33]' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStatusModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#111b21] hover:bg-[#2a3942] text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newStatusText.trim()}
                  className="flex-1 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 text-white text-xs font-semibold shadow-md"
                >
                  Post Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
