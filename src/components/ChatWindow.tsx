import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  Check,
  CheckCheck,
  Clock,
  Play,
  Pause,
  Image as ImageIcon,
  FileText,
  Star,
  Copy,
  Trash2,
  Lock,
  PanelRightOpen,
  PanelRightClose,
  X,
  Volume2,
  Archive,
  Music,
  UploadCloud,
  FileCheck,
  Smartphone,
} from 'lucide-react';
import { Chat, Message, Contact, AttachmentMediaType, AttachmentDraft } from '../types';
import { Avatar } from './Avatar';
import { APP_ICON_PATH } from './HeaderLogo';
import { AttachmentMessageBubble } from './AttachmentMessageBubble';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { detectFileType, formatFileSize } from '../utils/fileStorage';

interface ChatWindowProps {
  chat: Chat | null;
  onSendMessage: (
    text: string,
    mediaType?: AttachmentMediaType,
    mediaUrl?: string,
    fileMeta?: {
      fileName?: string;
      fileSize?: string;
      fileSizeBytes?: number;
      fileExtension?: string;
      fileBlob?: Blob | File;
    }
  ) => void;
  onBackToList: () => void;
  onStartCall: (contact: Contact, type: 'audio' | 'video') => void;
  onToggleRightPanel: () => void;
  isRightPanelOpen: boolean;
  onReactMessage: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onToggleStarMessage: (messageId: string) => void;
  onOpenAndroidInstall?: () => void;
}

const COMMON_EMOJIS = ['😀', '😂', '😍', '🔥', '👍', '🙏', '🎉', '🚀', '❤️', '👏', '✨', '💯', '🤔', '😎', '🥳', '🙌', '☕', '💡', '🌟', '👀'];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  onSendMessage,
  onBackToList,
  onStartCall,
  onToggleRightPanel,
  isRightPanelOpen,
  onReactMessage,
  onDeleteMessage,
  onToggleStarMessage,
  onOpenAndroidInstall,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [activeMessageActionId, setActiveMessageActionId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [attachmentDraft, setAttachmentDraft] = useState<AttachmentDraft | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<number | null>(null);

  // Hidden File Inputs for Attachment Types
  const imageVideoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const archiveInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const anyFileInputRef = useRef<HTMLInputElement>(null);

  const stageFileForAttachment = (file: File) => {
    if (!file) return;
    const detected = detectFileType(file);
    const sizeFormatted = formatFileSize(file.size);
    const previewUrl = URL.createObjectURL(file);

    setAttachmentDraft({
      file,
      name: file.name,
      sizeFormatted,
      sizeBytes: file.size,
      type: detected.type,
      mimeType: file.type || 'application/octet-stream',
      previewUrl,
      extension: detected.extension,
    });
    setShowAttachMenu(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stageFileForAttachment(file);
    }
    e.target.value = '';
  };

  const handleSendDraft = (draft: AttachmentDraft, caption: string) => {
    onSendMessage(
      caption,
      draft.type,
      draft.previewUrl,
      {
        fileName: draft.name,
        fileSize: draft.sizeFormatted,
        fileSizeBytes: draft.sizeBytes,
        fileExtension: draft.extension,
        fileBlob: draft.file,
      }
    );
    setAttachmentDraft(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      stageFileForAttachment(file);
    }
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages.length, chat?.contact.isTyping]);

  // Handle voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setVoiceTimer(0);
      recordingIntervalRef.current = window.setInterval(() => {
        setVoiceTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecordingVoice]);

  if (!chat) {
    return (
      <div className="flex-1 h-full bg-[#222e35] flex flex-col items-center justify-center p-8 text-center select-none border-b-6 border-[#00a884]">
        <div className="max-w-md flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-[#00a884]/40 bg-[#0f172a] transform group-hover:scale-105 transition-all duration-300">
              <img
                src={APP_ICON_PATH}
                alt="What's up App Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00a884] ring-4 ring-[#222e35] flex items-center justify-center text-[10px] text-white font-bold">
              ✓
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">What's up for Web</h2>
          <p className="text-sm text-[#8696a0] leading-relaxed">
            Send and receive messages seamlessly. Select a chat from the left panel or click the '+' button to start a new conversation.
          </p>
          <div className="pt-3 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#8696a0]">
              <Lock size={13} className="text-[#00a884]" />
              <span>End-to-end encrypted</span>
            </div>

            {onOpenAndroidInstall && (
              <button
                onClick={onOpenAndroidInstall}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#111b21] hover:bg-[#182229] text-[#00a884] border border-[#00a884]/30 shadow-md hover:scale-105 transition-all"
              >
                <Smartphone size={15} />
                <span>Get Android App / APK</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const contact = chat.contact;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    const durationStr = `0:${voiceTimer.toString().padStart(2, '0')}`;
    onSendMessage(`Voice message (${durationStr})`, 'audio');
  };

  const handleSendDemoImage = (caption: string) => {
    // Clean SVG image data card
    const svgImg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#005c4b"/>
          <stop offset="100%" stopColor="#00a884"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#g)"/>
      <circle cx="200" cy="130" r="45" fill="#ffffff" opacity="0.9"/>
      <polygon points="190,115 220,130 190,145" fill="#005c4b"/>
      <text x="200" y="215" font-family="Plus Jakarta Sans, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">${caption}</text>
    </svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgImg)}`;
    onSendMessage(caption, 'image', dataUri);
    setShowAttachMenu(false);
  };

  const renderStatusCheck = (status: Message['status']) => {
    if (status === 'sending') return <Clock size={13} className="text-white/60 shrink-0" />;
    if (status === 'sent') return <Check size={14} className="text-white/60 shrink-0" />;
    if (status === 'delivered') return <CheckCheck size={14} className="text-white/60 shrink-0" />;
    if (status === 'read') return <CheckCheck size={14} className="text-[#53bdeb] shrink-0" />;
    return null;
  };

  const filteredMessages = chatSearch.trim()
    ? chat.messages.filter((m) => m.text?.toLowerCase().includes(chatSearch.toLowerCase()))
    : chat.messages;

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0b141a] relative select-none">
      {/* 1. Header */}
      <header className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222e35] shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button to toggle back to chat list */}
          <button
            onClick={onBackToList}
            className="md:hidden p-1.5 -ml-1 text-slate-300 hover:text-white rounded-full hover:bg-[#111b21] transition-colors"
            title="Back to Chats"
          >
            <ArrowLeft size={22} />
          </button>

          {/* Contact Avatar & Info */}
          <div
            onClick={onToggleRightPanel}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            {/* Contact Avatar (Static / Live Video / GIF) */}
            <Avatar
              contact={contact}
              size="custom"
              className="w-10 h-10 group-hover:opacity-90 transition-opacity"
              showLiveBadge={true}
              showOnlineDot={true}
            />

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#e9edef] truncate group-hover:text-white transition-colors">
                {contact.name}
              </h3>
              <p className="text-xs text-[#8696a0] truncate">
                {contact.isTyping ? (
                  <span className="text-[#00a884] font-medium animate-pulse">typing...</span>
                ) : contact.isOnline ? (
                  <span className="text-[#00a884]">online</span>
                ) : (
                  contact.lastSeen || 'offline'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Video Call, Audio Call, Search in chat, Toggle 3rd panel */}
        <div className="flex items-center gap-1 text-[#aebac1]">
          <button
            onClick={() => onStartCall(contact, 'video')}
            className="p-2 hover:bg-[#111b21] hover:text-white rounded-full transition-colors"
            title="Video call"
          >
            <Video size={19} />
          </button>

          <button
            onClick={() => onStartCall(contact, 'audio')}
            className="p-2 hover:bg-[#111b21] hover:text-white rounded-full transition-colors"
            title="Voice call"
          >
            <Phone size={18} />
          </button>

          <button
            onClick={() => setShowChatSearch(!showChatSearch)}
            className={`p-2 hover:bg-[#111b21] hover:text-white rounded-full transition-colors ${
              showChatSearch ? 'text-[#00a884]' : ''
            }`}
            title="Search in chat"
          >
            <Search size={18} />
          </button>

          <button
            onClick={onToggleRightPanel}
            className={`p-2 hover:bg-[#111b21] hover:text-white rounded-full transition-colors ${
              isRightPanelOpen ? 'text-[#00a884]' : ''
            }`}
            title={isRightPanelOpen ? 'Hide Right Panel' : 'Show Right Panel (Status/Calls/Info)'}
          >
            {isRightPanelOpen ? <PanelRightClose size={19} /> : <PanelRightOpen size={19} />}
          </button>
        </div>
      </header>

      {/* Optional Search Bar in Chat */}
      {showChatSearch && (
        <div className="px-4 py-2 bg-[#111b21] border-b border-[#222e35] flex items-center gap-2 animate-fade-in z-10">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            placeholder="Search in this conversation..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
            autoFocus
          />
          {chatSearch && (
            <button onClick={() => setChatSearch('')} className="text-slate-400 hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {/* 2. Message History Feed */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 whatsapp-chat-bg-dark relative"
      >
        {/* Drag & Drop Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-30 bg-[#00a884]/20 backdrop-blur-sm border-2 border-dashed border-[#00a884] flex flex-col items-center justify-center p-6 text-white animate-fade-in pointer-events-none">
            <UploadCloud size={54} className="text-[#00a884] animate-bounce mb-3" />
            <p className="text-lg font-bold">Drop files here to share</p>
            <p className="text-xs text-slate-300 mt-1">Unlimited file size · Any format</p>
          </div>
        )}

        {/* End-to-end Encryption Banner */}
        <div className="flex justify-center my-2">
          <div className="bg-[#182229]/90 border border-[#222e35] px-3.5 py-1.5 rounded-lg text-center max-w-md shadow-sm">
            <p className="text-[11px] text-[#ffd279] flex items-center justify-center gap-1.5 font-medium leading-relaxed">
              <Lock size={12} className="shrink-0" />
              Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
            </p>
          </div>
        </div>

        {/* Date separator */}
        <div className="flex justify-center my-3">
          <span className="bg-[#182229] text-[#8696a0] text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm">
            Today
          </span>
        </div>

        {filteredMessages.map((msg) => {
          const isMe = msg.sender === 'me';
          const isVoiceNote = msg.mediaType === 'audio' && !msg.fileName;
          const hasAttachment = !!msg.mediaType && !isVoiceNote;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'}`}
              onMouseLeave={() => {
                if (activeMessageActionId === msg.id) setActiveMessageActionId(null);
              }}
            >
              {/* Message Bubble Container */}
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 shadow-md transition-all ${
                  isMe
                    ? 'bg-[#005c4b] text-white rounded-tr-none'
                    : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                }`}
              >
                {/* File Attachment / Media Attachment with View & Download */}
                {hasAttachment && (
                  <AttachmentMessageBubble
                    message={msg}
                    onOpenImageLightbox={setLightboxImage}
                  />
                )}

                {/* Audio Voice Note Player (if live mic recording) */}
                {isVoiceNote && (
                  <div className="flex items-center gap-3 py-1 px-1 min-w-[220px]">
                    <button
                      type="button"
                      onClick={() => {
                        setPlayingAudioId(playingAudioId === msg.id ? null : msg.id);
                      }}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white shrink-0 transition-colors"
                    >
                      {playingAudioId === msg.id ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                    </button>

                    <div className="flex-1">
                      {/* Audio waveform visualization bars */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[40, 70, 30, 90, 60, 45, 80, 50, 65, 35, 75, 45, 90, 30, 60].map((h, i) => (
                          <span
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1 rounded-full transition-all ${
                              playingAudioId === msg.id && i % 2 === 0
                                ? 'bg-[#53bdeb] animate-pulse'
                                : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-white/70 mt-0.5">
                        <span>{playingAudioId === msg.id ? 'Playing...' : 'Voice message'}</span>
                        <span>0:14</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Content */}
                {msg.text && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-1">
                    {msg.text}
                  </p>
                )}

                {/* Timestamp & Status Check Indicator */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-white/70 float-right ml-3">
                  <span>{msg.timeFormatted}</span>
                  {isMe && renderStatusCheck(msg.status)}
                </div>

                {/* Reactions badge */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2.5 right-2 flex items-center gap-0.5 bg-[#182229] border border-[#222e35] px-1.5 py-0.5 rounded-full shadow-md text-xs">
                    {msg.reactions.map((r, i) => (
                      <span key={i}>{r.emoji}</span>
                    ))}
                  </div>
                )}

                {/* Hover trigger for message action options */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveMessageActionId(activeMessageActionId === msg.id ? null : msg.id)
                  }
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-opacity"
                  title="Message options"
                >
                  <MoreVertical size={13} />
                </button>

                {/* Message Dropdown / Reaction popover */}
                {activeMessageActionId === msg.id && (
                  <div
                    className={`absolute z-30 top-7 ${
                      isMe ? 'right-0' : 'left-0'
                    } bg-[#233138] rounded-xl shadow-2xl py-1.5 border border-white/10 min-w-44 text-xs text-[#d1d7db] animate-fade-in`}
                  >
                    {/* Reaction Emojis Row */}
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#374248]">
                      {['❤️', '👍', '😂', '😮', '😢', '🙏'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReactMessage(msg.id, emoji);
                            setActiveMessageActionId(null);
                          }}
                          className="hover:scale-130 transition-transform text-sm p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        onToggleStarMessage(msg.id);
                        setActiveMessageActionId(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2"
                    >
                      <Star size={13} className={msg.isStarred ? 'text-amber-400 fill-amber-400' : ''} />
                      {msg.isStarred ? 'Unstar message' : 'Star message'}
                    </button>

                    {msg.text && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.text || '');
                          setActiveMessageActionId(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#182229] flex items-center gap-2"
                      >
                        <Copy size={13} />
                        Copy text
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onDeleteMessage(msg.id);
                        setActiveMessageActionId(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#182229] text-rose-400 flex items-center gap-2"
                    >
                      <Trash2 size={13} />
                      Delete message
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Typing bubble simulation */}
        {contact.isTyping && (
          <div className="flex items-start">
            <div className="bg-[#202c33] px-4 py-2.5 rounded-2xl rounded-tl-none shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Bar */}
      <footer className="p-2 sm:p-3 bg-[#202c33] border-t border-[#222e35] shrink-0 relative z-20">
        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-3 z-30 bg-[#233138] p-3 rounded-2xl shadow-2xl border border-white/10 w-72 sm:w-80 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#374248] mb-2">
              <span className="text-xs font-semibold text-slate-300">Quick Emojis</span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2 text-xl">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputText((prev) => prev + emoji);
                    inputRef.current?.focus();
                  }}
                  className="hover:scale-125 transition-transform p-1 rounded hover:bg-[#182229]"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attach Menu Popover */}
        {showAttachMenu && (
          <div className="absolute bottom-16 left-12 z-30 bg-[#233138] p-2 rounded-2xl shadow-2xl border border-white/10 w-64 animate-fade-in space-y-1 select-none">
            {/* 1. Photos & Videos */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                imageVideoInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#182229] text-xs font-medium text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <ImageIcon size={16} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Photos & Videos</p>
                <p className="text-[10px] text-slate-400">High-res, unlimited size</p>
              </div>
            </button>

            {/* 2. Documents & PDFs */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                documentInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#182229] text-xs font-medium text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <FileText size={16} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Document & PDF</p>
                <p className="text-[10px] text-slate-400">PDF, Word, Excel, CSV</p>
              </div>
            </button>

            {/* 3. Archives & Packages */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                archiveInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#182229] text-xs font-medium text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <Archive size={16} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Archive Package</p>
                <p className="text-[10px] text-slate-400">ZIP, RAR, 7Z, TAR</p>
              </div>
            </button>

            {/* 4. Audio Tracks */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                audioInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#182229] text-xs font-medium text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <Music size={16} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Audio Track</p>
                <p className="text-[10px] text-slate-400">MP3, WAV, FLAC, M4A</p>
              </div>
            </button>

            {/* 5. Any File */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(false);
                anyFileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#182229] text-xs font-medium text-white transition-colors group border-t border-[#374248]/80"
            >
              <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <UploadCloud size={16} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Any File (Unlimited)</p>
                <p className="text-[10px] text-slate-400">Zero restriction or compression</p>
              </div>
            </button>
          </div>
        )}

        {/* Active Audio Recording Mode */}
        {isRecordingVoice ? (
          <div className="flex items-center justify-between bg-[#111b21] px-4 py-2 rounded-full border border-rose-500/30">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-sm font-mono font-semibold text-rose-400">
                0:{voiceTimer.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-400 animate-pulse">Recording voice note...</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRecordingVoice(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendVoiceNote}
                className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-md"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Typing Bar */
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Emoji Trigger */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className={`p-2 rounded-full hover:bg-[#111b21] transition-colors ${
                showEmojiPicker ? 'text-[#00a884]' : 'text-slate-400 hover:text-white'
              }`}
              title="Emoji"
            >
              <Smile size={22} />
            </button>

            {/* Attach Trigger */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className={`p-2 rounded-full hover:bg-[#111b21] transition-colors ${
                showAttachMenu ? 'text-[#00a884]' : 'text-slate-400 hover:text-white'
              }`}
              title="Attach"
            >
              <Paperclip size={21} />
            </button>

            {/* Input field */}
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message"
                className="w-full bg-[#2a3942] text-white placeholder-[#8696a0] px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#00a884] transition-all"
              />
            </div>

            {/* Send Button or Mic Button */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] active:scale-95 text-white flex items-center justify-center shadow-md transition-all shrink-0"
                title="Send message"
              >
                <Send size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2.5 rounded-full hover:bg-[#111b21] text-slate-400 hover:text-white transition-colors shrink-0"
                title="Record voice note"
              >
                <Mic size={22} />
              </button>
            )}
          </form>
        )}
      </footer>

      {/* Lightbox for Image Preview */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
          >
            <X size={26} />
          </button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Attachment Staging Preview Modal before sending */}
      {attachmentDraft && (
        <AttachmentPreviewModal
          draft={attachmentDraft}
          contact={contact}
          onSend={handleSendDraft}
          onCancel={() => setAttachmentDraft(null)}
        />
      )}

      {/* Hidden File Inputs for Attachment Types */}
      <input
        ref={imageVideoInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.md"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={archiveInputRef}
        type="file"
        accept=".zip,.rar,.7z,.tar,.gz,.bz2"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={anyFileInputRef}
        type="file"
        accept="*/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};
