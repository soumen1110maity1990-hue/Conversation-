import { Chat, StatusStory, CallRecord, UserProfile } from '../types';

// Crisp, lightweight inline SVG avatars with distinct themes and initials
export const createSvgAvatar = (initials: string, bg: string, textColor: string = '#ffffff') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="50" fill="${bg}"/>
    <text x="50" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="38" font-weight="700" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Smooth animated looping avatar (SVG with CSS keyframe animation, operates 100% offline)
export const createAnimatedAvatar = (initials: string, theme: 'emerald' | 'sunset' | 'aurora' | 'cyber') => {
  const gradients = {
    emerald: ['#00a884', '#059669', '#10b981', '#34d399'],
    sunset: ['#f43f5e', '#fb923c', '#e11d48', '#f97316'],
    aurora: ['#8b5cf6', '#06b6d4', '#3b82f6', '#a855f7'],
    cyber: ['#ec4899', '#6366f1', '#3b82f6', '#d946ef'],
  }[theme];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="animGrad_${theme}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradients[0]}">
          <animate attributeName="stop-color" values="${gradients.join(';')};${gradients[0]}" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stop-color="${gradients[1]}">
          <animate attributeName="stop-color" values="${gradients.slice(1).concat(gradients[0]).join(';')};${gradients[1]}" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#animGrad_${theme})" />
    <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="10 8" opacity="0.6">
      <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="8s" repeatCount="indefinite" />
    </circle>
    <text x="50" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export interface LiveAvatarPreset {
  id: string;
  name: string;
  type: 'video' | 'gif';
  url: string;
  previewName: string;
}

export const LIVE_AVATAR_PRESETS: LiveAvatarPreset[] = [
  {
    id: 'preset-video-1',
    name: 'Nature Blaze (MP4 Video)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    previewName: 'Blaze Loop',
  },
  {
    id: 'preset-video-2',
    name: 'Road Expedition (MP4 Video)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    previewName: 'Bullrun Loop',
  },
  {
    id: 'preset-video-3',
    name: 'Sci-Fi Motion (MP4 Video)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    previewName: 'Sci-Fi Loop',
  },
  {
    id: 'preset-gif-1',
    name: 'Emerald Aurora (Animated Loop)',
    type: 'gif',
    url: createAnimatedAvatar('LIVE', 'emerald'),
    previewName: 'Emerald Flow',
  },
  {
    id: 'preset-gif-2',
    name: 'Cyberpunk Pulse (Animated Loop)',
    type: 'gif',
    url: createAnimatedAvatar('SJ', 'cyber'),
    previewName: 'Cyber Pulse',
  },
  {
    id: 'preset-gif-3',
    name: 'Sunset Glow (Animated Loop)',
    type: 'gif',
    url: createAnimatedAvatar('MOM', 'sunset'),
    previewName: 'Sunset Glow',
  },
];

export const defaultUserProfile: UserProfile = {
  name: 'Alex Morgan',
  about: 'Available | Building the future 🚀',
  phone: '+1 (555) 234-8901',
  avatar: createSvgAvatar('AM', '#00a884'),
  avatarType: 'video',
  liveAvatarUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  isLiveAvatar: false,
  theme: 'dark',
  soundEnabled: true,
};

export const initialChats: Chat[] = [
  {
    id: 'chat-1',
    pinned: true,
    contact: {
      id: 'contact-1',
      name: 'Sarah Jenkins',
      avatar: createSvgAvatar('SJ', '#ec4899'),
      avatarType: 'video',
      liveAvatarUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      isLiveAvatar: true,
      about: 'Designing experiences & drinking coffee ☕',
      phone: '+1 (555) 349-2011',
      isOnline: true,
      unreadCount: 2,
      isFavorite: true,
    },
    messages: [
      {
        id: 'm-1-1',
        sender: 'contact',
        text: 'Hey! Did you check out the new design system components?',
        timestamp: '2026-11-01T09:30:00Z',
        timeFormatted: '9:30 AM',
        status: 'read',
      },
      {
        id: 'm-1-2',
        sender: 'me',
        text: 'Yes! The responsive layout and double-tick indicators look super clean.',
        timestamp: '2026-11-01T09:32:00Z',
        timeFormatted: '9:32 AM',
        status: 'read',
        reactions: [{ emoji: '🔥', sender: 'contact' }],
      },
      {
        id: 'm-1-3',
        sender: 'contact',
        text: 'Awesome! We are launching the 3-panel layout today.',
        timestamp: '2026-11-01T10:14:00Z',
        timeFormatted: '10:14 AM',
        status: 'read',
      },
      {
        id: 'm-1-4',
        sender: 'contact',
        text: 'Here is the full technical documentation and specification report:',
        mediaType: 'document',
        fileName: 'WhatsUp_Engineering_Spec_v2.4.pdf',
        fileSize: '14.2 MB',
        fileSizeBytes: 14889779,
        fileExtension: 'pdf',
        mediaUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iagp0cmFpbGVyCjw8Ci9Sb290IDEgMCBSCj4+CiUlRU9G',
        timestamp: '2026-11-01T10:15:00Z',
        timeFormatted: '10:15 AM',
        status: 'read',
      },
      {
        id: 'm-1-5',
        sender: 'me',
        text: 'Got it! Also attaching the export package with all vector icons and tokens:',
        mediaType: 'archive',
        fileName: 'WhatsUp_Design_Tokens_Bundle.zip',
        fileSize: '36.8 MB',
        fileSizeBytes: 38587596,
        fileExtension: 'zip',
        mediaUrl: 'data:application/zip;base64,UEsDBAoAAAAAAKeaQlMAAAAAAAAAAAAAAAAIAAAAdGVzdC50eHRQSwECPwAKAAAAAAAKQlMAAAAAAAAAAAAAAAAIAAAkAAAAAAAAAAAAAAC0gAAAAAHRlc3QudHh0UEsFBgAAAAABAAEAPgAAACkAAAAAAA==',
        timestamp: '2026-11-01T10:18:00Z',
        timeFormatted: '10:18 AM',
        status: 'read',
        reactions: [{ emoji: '🔥', sender: 'contact' }],
      },
    ],
  },
  {
    id: 'chat-2',
    pinned: true,
    contact: {
      id: 'contact-2',
      name: 'Tech Lead Core Group 🚀',
      avatar: createSvgAvatar('TL', '#3b82f6'),
      avatarType: 'gif',
      liveAvatarUrl: createAnimatedAvatar('TL', 'aurora'),
      isLiveAvatar: true,
      about: 'Architecture, deployments, and release notes',
      phone: 'Group (4 members)',
      isOnline: true,
      unreadCount: 0,
      isGroup: true,
      groupMembers: ['Alex Morgan', 'David Kim', 'Elena Chen', 'Marcus Vance'],
    },
    messages: [
      {
        id: 'm-2-1',
        sender: 'contact',
        text: 'Production build passed all tests. Zero bundle regression.',
        timestamp: '2026-11-01T08:15:00Z',
        timeFormatted: '8:15 AM',
        status: 'read',
      },
      {
        id: 'm-2-2',
        sender: 'me',
        text: 'Great job team! LocalStorage sync is verified across sessions.',
        timestamp: '2026-11-01T08:20:00Z',
        timeFormatted: '8:20 AM',
        status: 'read',
        reactions: [{ emoji: '👏', sender: 'contact' }],
      },
      {
        id: 'm-2-3',
        sender: 'contact',
        text: 'Remember to test call simulation and audio waveforms too!',
        timestamp: '2026-11-01T08:21:00Z',
        timeFormatted: '8:21 AM',
        status: 'read',
      },
    ],
  },
  {
    id: 'chat-3',
    contact: {
      id: 'contact-3',
      name: 'David Kim',
      avatar: createSvgAvatar('DK', '#8b5cf6'),
      avatarType: 'video',
      liveAvatarUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      isLiveAvatar: false,
      about: 'Software engineer & tech enthusiast',
      phone: '+1 (555) 782-9932',
      isOnline: false,
      lastSeen: 'today at 9:45 AM',
      unreadCount: 0,
      isFavorite: true,
    },
    messages: [
      {
        id: 'm-3-1',
        sender: 'contact',
        text: 'Are we still on for the 2 PM product walkthrough?',
        timestamp: '2026-11-01T09:40:00Z',
        timeFormatted: '9:40 AM',
        status: 'read',
      },
      {
        id: 'm-3-2',
        sender: 'me',
        text: 'Definitely! I will share the screen and demonstrate the chat switching.',
        timestamp: '2026-11-01T09:42:00Z',
        timeFormatted: '9:42 AM',
        status: 'read',
        reactions: [{ emoji: '👍', sender: 'contact' }],
      },
    ],
  },
  {
    id: 'chat-4',
    contact: {
      id: 'contact-4',
      name: 'Elena Chen',
      avatar: createSvgAvatar('EC', '#10b981'),
      avatarType: 'gif',
      liveAvatarUrl: createAnimatedAvatar('EC', 'emerald'),
      isLiveAvatar: true,
      about: 'Exploring nature 🌿 | offline weekends',
      phone: '+1 (555) 604-1229',
      isOnline: true,
      unreadCount: 1,
    },
    messages: [
      {
        id: 'm-4-1',
        sender: 'me',
        text: 'Hey Elena! Did you check the status updates tab?',
        timestamp: '2026-10-31T18:00:00Z',
        timeFormatted: '6:00 PM',
        status: 'read',
      },
      {
        id: 'm-4-2',
        sender: 'contact',
        text: 'Just uploaded photos from the weekend hike! Let me know what you think.',
        timestamp: '2026-11-01T07:10:00Z',
        timeFormatted: '7:10 AM',
        status: 'read',
      },
    ],
  },
  {
    id: 'chat-5',
    contact: {
      id: 'contact-5',
      name: 'Marcus Vance',
      avatar: createSvgAvatar('MV', '#f59e0b'),
      about: 'Product Manager @ CloudSync',
      phone: '+1 (555) 441-9080',
      isOnline: false,
      lastSeen: 'yesterday at 11:20 PM',
      unreadCount: 0,
    },
    messages: [
      {
        id: 'm-5-1',
        sender: 'contact',
        text: 'Voice note feature is working smoothly in testing.',
        timestamp: '2026-10-31T20:30:00Z',
        timeFormatted: '8:30 PM',
        status: 'read',
      },
      {
        id: 'm-5-2',
        sender: 'me',
        text: 'Glad to hear that. Hitting send generates instant timestamps and read ticks.',
        timestamp: '2026-10-31T20:35:00Z',
        timeFormatted: '8:35 PM',
        status: 'read',
      },
    ],
  },
  {
    id: 'chat-6',
    contact: {
      id: 'contact-6',
      name: 'Mom ❤️',
      avatar: createSvgAvatar('M', '#ef4444'),
      about: 'Family first always ✨',
      phone: '+1 (555) 998-3321',
      isOnline: true,
      unreadCount: 0,
      isFavorite: true,
    },
    messages: [
      {
        id: 'm-6-1',
        sender: 'contact',
        text: 'Good morning sweetheart! Hope you have a wonderful and productive day.',
        timestamp: '2026-11-01T07:00:00Z',
        timeFormatted: '7:00 AM',
        status: 'read',
        reactions: [{ emoji: '❤️', sender: 'me' }],
      },
      {
        id: 'm-6-2',
        sender: 'me',
        text: 'Thank you Mom! Love you, will call you this evening.',
        timestamp: '2026-11-01T07:15:00Z',
        timeFormatted: '7:15 AM',
        status: 'read',
      },
    ],
  },
];

export const initialStatusStories: StatusStory[] = [
  {
    id: 'story-1',
    contactId: 'contact-1',
    contactName: 'Sarah Jenkins',
    contactAvatar: createSvgAvatar('SJ', '#ec4899'),
    lastUpdated: '15 minutes ago',
    allViewed: false,
    stories: [
      {
        id: 's-1-1',
        type: 'text',
        caption: 'Design sprint week 4 done! Excited for the prototype reveal tomorrow 🚀🎨',
        backgroundColor: '#005c4b',
        mediaUrl: '',
        timestamp: '15m ago',
      },
      {
        id: 's-1-2',
        type: 'text',
        caption: '"Simplicity is about subtracting the obvious and adding the meaningful."',
        backgroundColor: '#7c3aed',
        mediaUrl: '',
        timestamp: '10m ago',
      },
    ],
  },
  {
    id: 'story-2',
    contactId: 'contact-4',
    contactName: 'Elena Chen',
    contactAvatar: createSvgAvatar('EC', '#10b981'),
    lastUpdated: '42 minutes ago',
    allViewed: false,
    stories: [
      {
        id: 's-2-1',
        type: 'text',
        caption: 'Morning summit trail! The sunrise over the ridge was absolutely breathtaking 🏔️☀️',
        backgroundColor: '#0284c7',
        mediaUrl: '',
        timestamp: '42m ago',
      },
    ],
  },
  {
    id: 'story-3',
    contactId: 'contact-3',
    contactName: 'David Kim',
    contactAvatar: createSvgAvatar('DK', '#8b5cf6'),
    lastUpdated: '2 hours ago',
    allViewed: true,
    stories: [
      {
        id: 's-3-1',
        type: 'text',
        caption: 'Reading: "Designing Data-Intensive Applications". Highly recommended to everyone on the team! 📚',
        backgroundColor: '#b45309',
        mediaUrl: '',
        timestamp: '2h ago',
      },
    ],
  },
];

export const initialCalls: CallRecord[] = [
  {
    id: 'call-1',
    contactId: 'contact-1',
    contactName: 'Sarah Jenkins',
    contactAvatar: createSvgAvatar('SJ', '#ec4899'),
    type: 'video',
    direction: 'incoming',
    timestamp: 'Today, 11:20 AM',
    duration: '14 min 32 sec',
  },
  {
    id: 'call-2',
    contactId: 'contact-6',
    contactName: 'Mom ❤️',
    contactAvatar: createSvgAvatar('M', '#ef4444'),
    type: 'audio',
    direction: 'outgoing',
    timestamp: 'Yesterday, 8:15 PM',
    duration: '26 min 10 sec',
  },
  {
    id: 'call-3',
    contactId: 'contact-3',
    contactName: 'David Kim',
    contactAvatar: createSvgAvatar('DK', '#8b5cf6'),
    type: 'audio',
    direction: 'missed',
    timestamp: 'Yesterday, 3:45 PM',
  },
  {
    id: 'call-4',
    contactId: 'contact-5',
    contactName: 'Marcus Vance',
    contactAvatar: createSvgAvatar('MV', '#f59e0b'),
    type: 'video',
    direction: 'outgoing',
    timestamp: 'October 30, 4:10 PM',
    duration: '8 min 05 sec',
  },
];
