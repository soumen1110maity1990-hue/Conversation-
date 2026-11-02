import React, { useState } from 'react';
import {
  Search,
  Plus,
  CircleDot,
  Phone,
  MoreVertical,
  Check,
  CheckCheck,
  Pin,
  Clock,
  Filter,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Chat } from '../types';
import { HeaderLogo } from './HeaderLogo';
import { Avatar } from './Avatar';
import { InstallAppButton } from './InstallAppButton';

type FilterType = 'all' | 'unread' | 'favorites' | 'groups';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  onOpenSettings: () => void;
  onOpenRightPanelTab: (tab: 'status' | 'calls') => void;
  onOpenAndroidInstall: () => void;
  hasUnreadStories?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenNewChat,
  onOpenSettings,
  onOpenRightPanelTab,
  onOpenAndroidInstall,
  hasUnreadStories = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showMenu, setShowMenu] = useState(false);

  // Filter chats by search and category
  const filteredChats = chats.filter((chat) => {
    const contact = chat.contact;
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'unread') return contact.unreadCount > 0;
    if (activeFilter === 'favorites') return contact.isFavorite;
    if (activeFilter === 'groups') return contact.isGroup;
    return true;
  });

  // Sort pinned chats to top
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const renderStatusIcon = (status?: string) => {
    if (status === 'sending') return <Clock size={13} className="text-slate-400" />;
    if (status === 'sent') return <Check size={13} className="text-slate-400" />;
    if (status === 'delivered') return <CheckCheck size={13} className="text-slate-400" />;
    if (status === 'read') return <CheckCheck size={13} className="text-[#53bdeb]" />;
    return null;
  };

  return (
    <div className="w-full md:w-80 lg:w-[380px] h-full bg-[#111b21] flex flex-col border-r border-[#222e35] shrink-0 select-none">
      {/* 1. Header with 'What's up' Branding & Action Icons */}
      <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222e35] shrink-0">
        <HeaderLogo size="md" />

        <div className="flex items-center gap-1 text-slate-300">
          {/* Android App / APK button */}
          <InstallAppButton onOpenModal={onOpenAndroidInstall} variant="icon" />

          {/* Status Tab Trigger */}
          <button
            onClick={() => onOpenRightPanelTab('status')}
            className="relative p-2 hover:bg-[#111b21] rounded-full transition-colors text-slate-300 hover:text-white"
            title="Status Updates"
          >
            <CircleDot size={20} />
            {hasUnreadStories && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a884] ring-2 ring-[#202c33]" />
            )}
          </button>

          {/* Calls Tab Trigger */}
          <button
            onClick={() => onOpenRightPanelTab('calls')}
            className="p-2 hover:bg-[#111b21] rounded-full transition-colors text-slate-300 hover:text-white"
            title="Calls History"
          >
            <Phone size={19} />
          </button>

          {/* New Chat Button */}
          <button
            onClick={onOpenNewChat}
            className="p-2 hover:bg-[#111b21] rounded-full transition-colors text-slate-300 hover:text-white"
            title="New Chat"
          >
            <Plus size={21} />
          </button>

          {/* Settings Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#111b21] rounded-full transition-colors text-slate-300 hover:text-white"
              title="Menu"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-12 z-40 w-52 bg-[#233138] rounded-xl shadow-2xl py-2 border border-white/10 animate-fade-in text-sm text-[#d1d7db]">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenAndroidInstall();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors flex items-center justify-between text-[#00a884] font-medium"
                  >
                    <span>Get Android APK</span>
                    <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] px-1.5 py-0.5 rounded font-mono">APK</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenNewChat();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors"
                  >
                    New Chat
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenRightPanelTab('status');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors"
                  >
                    Status
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenRightPanelTab('calls');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors"
                  >
                    Calls
                  </button>
                  <div className="my-1 border-t border-[#374248]" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors flex items-center justify-between"
                  >
                    <span>Settings</span>
                    <SlidersHorizontal size={14} className="text-slate-400" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Search Bar & Filter Controls */}
      <div className="p-3 space-y-2 border-b border-[#222e35]/70 shrink-0">
        <div className="relative flex items-center">
          <Search size={17} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-[#202c33] text-white placeholder-[#8696a0] pl-10 pr-9 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#00a884] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {(['all', 'unread', 'favorites', 'groups'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                activeFilter === filter
                  ? 'bg-[#00a884] text-white'
                  : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Chats List with Pinned Items and Scroll */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/40">
        {sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <Filter size={28} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">No chats found</p>
            <p className="text-xs text-slate-600 mt-1">Try another search or start a new chat</p>
          </div>
        ) : (
          sortedChats.map((chat) => {
            const contact = chat.contact;
            const lastMsg = chat.messages[chat.messages.length - 1];
            const isActive = chat.id === activeChatId;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors relative group ${
                  isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                }`}
              >
                {/* Contact Avatar (Static / Live Video / GIF) */}
                <Avatar
                  contact={contact}
                  size="custom"
                  className="w-12 h-12"
                  showLiveBadge={true}
                  showOnlineDot={true}
                />

                {/* Chat Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#e9edef] truncate">
                      {contact.name}
                    </span>
                    <span
                      className={`text-[11px] shrink-0 font-medium ${
                        contact.unreadCount > 0 ? 'text-[#00a884]' : 'text-[#8696a0]'
                      }`}
                    >
                      {lastMsg ? lastMsg.timeFormatted : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0 pr-2">
                      {contact.isTyping ? (
                        <span className="text-xs text-[#00a884] font-medium animate-pulse">
                          typing...
                        </span>
                      ) : (
                        <>
                          {lastMsg && lastMsg.sender === 'me' && renderStatusIcon(lastMsg.status)}
                          <p className="text-xs text-[#8696a0] truncate">
                            {lastMsg ? lastMsg.text || (lastMsg.mediaType === 'audio' ? '🎤 Voice message' : '📷 Photo') : 'Start chatting'}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.pinned && <Pin size={12} className="text-slate-500 fill-slate-500" />}
                      {contact.unreadCount > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#00a884] text-white text-[11px] font-bold flex items-center justify-center">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
