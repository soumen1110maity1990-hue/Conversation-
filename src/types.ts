export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Reaction {
  emoji: string;
  sender: 'me' | 'contact';
}

export type AttachmentMediaType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'file';

export interface AttachmentDraft {
  file: File;
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  type: AttachmentMediaType;
  mimeType: string;
  previewUrl: string;
  extension: string;
}

export interface Message {
  id: string;
  sender: 'me' | 'contact';
  text?: string;
  mediaUrl?: string;
  mediaType?: AttachmentMediaType;
  fileName?: string;
  fileSize?: string;
  fileSizeBytes?: number;
  fileExtension?: string;
  audioDuration?: string;
  timestamp: string; // ISO or formatted
  timeFormatted: string; // "10:42 PM"
  status: MessageStatus;
  reactions?: Reaction[];
  isStarred?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  avatarType?: 'image' | 'video' | 'gif';
  liveAvatarUrl?: string;
  isLiveAvatar?: boolean;
  about: string;
  phone: string;
  isOnline: boolean;
  lastSeen?: string;
  isTyping?: boolean;
  unreadCount: number;
  isFavorite?: boolean;
  isGroup?: boolean;
  groupMembers?: string[];
  groupMemberDetails?: { name: string; phone: string; avatar?: string; about?: string }[];
}

export interface Chat {
  id: string;
  contact: Contact;
  messages: Message[];
  pinned?: boolean;
  draft?: string;
}

export interface StatusStoryItem {
  id: string;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
  type: 'image' | 'text';
  backgroundColor?: string;
}

export interface StatusStory {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  isUser?: boolean;
  stories: StatusStoryItem[];
  allViewed?: boolean;
  lastUpdated: string;
}

export interface CallRecord {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  contactPhone?: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
}

export interface UserProfile {
  name: string;
  about: string;
  phone: string;
  avatar: string;
  avatarType?: 'image' | 'video' | 'gif';
  liveAvatarUrl?: string;
  isLiveAvatar?: boolean;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
}
