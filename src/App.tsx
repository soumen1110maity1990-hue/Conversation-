/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Chat, Contact, StatusStory, CallRecord, UserProfile, Message, AttachmentMediaType } from './types';
import { initialChats, initialStatusStories, initialCalls, defaultUserProfile } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { RightPanel, RightPanelTab } from './components/RightPanel';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CallModal } from './components/CallModal';
import { NewChatModal } from './components/NewChatModal';
import { SettingsModal } from './components/SettingsModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { playSendSound, playReceiveSound } from './utils/sound';
import { saveAttachmentFile } from './utils/fileStorage';

const STORAGE_KEYS = {
  CHATS: 'whatsup_chats_v1',
  ACTIVE_CHAT: 'whatsup_active_chat_v1',
  STATUS: 'whatsup_status_v1',
  CALLS: 'whatsup_calls_v1',
  PROFILE: 'whatsup_profile_v1',
};

export default function App() {
  // 1. LocalStorage state initialization
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
      return saved ? JSON.parse(saved) : initialChats;
    } catch {
      return initialChats;
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT);
      return saved || initialChats[0]?.id || null;
    } catch {
      return initialChats[0]?.id || null;
    }
  });

  const [statusStories, setStatusStories] = useState<StatusStory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATUS);
      return saved ? JSON.parse(saved) : initialStatusStories;
    } catch {
      return initialStatusStories;
    }
  });

  const [calls, setCalls] = useState<CallRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALLS);
      return saved ? JSON.parse(saved) : initialCalls;
    } catch {
      return initialCalls;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : defaultUserProfile;
    } catch {
      return defaultUserProfile;
    }
  });

  // UI Navigation states
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('status');

  // Modals
  const [activeStory, setActiveStory] = useState<StatusStory | null>(null);
  const [activeCall, setActiveCall] = useState<{ contact: Contact; type: 'audio' | 'video' } | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAndroidInstallModal, setShowAndroidInstallModal] = useState(false);

  // Sync theme to root DOM
  useEffect(() => {
    const root = document.documentElement;
    if (userProfile.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [userProfile.theme]);

  // Persist state in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch {
      // storage full or disabled
    }
  }, [chats]);

  useEffect(() => {
    try {
      if (activeChatId) localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT, activeChatId);
    } catch {
      // ignore
    }
  }, [activeChatId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(statusStories));
    } catch {
      // ignore
    }
  }, [statusStories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
    } catch {
      // ignore
    }
  }, [calls]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    } catch {
      // ignore
    }
  }, [userProfile]);

  // Current active chat object
  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Handle Chat Selection
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setMobileView('chat');

    // Mark unread messages as read
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              contact: { ...c.contact, unreadCount: 0 },
              messages: c.messages.map((m) => (m.sender === 'contact' ? { ...m, status: 'read' } : m)),
            }
          : c
      )
    );
  };

  // Automated smart reply phrases based on user input or shared files
  const getSimulatedReply = (
    userMsg: string,
    contactName: string,
    fileMeta?: { fileName?: string; fileSize?: string; type?: AttachmentMediaType }
  ): string => {
    if (fileMeta?.fileName) {
      const type = fileMeta.type;
      if (type === 'image') return `Received "${fileMeta.fileName}". Super high resolution! 🖼️`;
      if (type === 'video') return `Got the video clip "${fileMeta.fileName}" (${fileMeta.fileSize || ''}). Playing it now! 🎬`;
      if (type === 'archive') return `Received archive "${fileMeta.fileName}" (${fileMeta.fileSize || ''}). Extracting the package now! 📦`;
      if (type === 'document') return `Received "${fileMeta.fileName}" (${fileMeta.fileSize || ''}). Document downloaded and filed! 📄`;
      if (type === 'audio') return `Listening to "${fileMeta.fileName}". Sound quality is crystal clear! 🎵`;
      return `Received "${fileMeta.fileName}" (${fileMeta.fileSize || ''}). Saved to vault! 📁`;
    }

    const lower = userMsg.toLowerCase();
    if (lower.includes('hello') || lower.includes('hey') || lower.includes('hi')) {
      return `Hey Alex! Great to hear from you. How is your day going?`;
    }
    if (lower.includes('status') || lower.includes('update')) {
      return `Everything is on track! The release is looking rock solid. 🚀`;
    }
    if (lower.includes('call') || lower.includes('meet') || lower.includes('zoom')) {
      return `Sounds good! Let's connect in a few minutes. Tap the call icon whenever you're ready.`;
    }
    if (lower.includes('photo') || lower.includes('image') || lower.includes('mockup')) {
      return `Looks fantastic! Love the crisp alignment and color hierarchy.`;
    }
    if (lower.includes('thanks') || lower.includes('thank you')) {
      return `You're welcome! Always happy to collaborate. ✨`;
    }
    return `Got it! Thanks for the note. Let me review that and get right back to you.`;
  };

  // Send message handler with live timestamp, unlimited file attachment, & double-tick progression
  const handleSendMessage = useCallback(
    async (
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
    ) => {
      if (!activeChatId) return;

      const now = new Date();
      const timeFormatted = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const newMsgId = `msg-${Date.now()}`;

      let finalMediaUrl = mediaUrl || '';
      if (fileMeta?.fileBlob) {
        finalMediaUrl = await saveAttachmentFile(newMsgId, fileMeta.fileBlob);
      }

      const newMessage: Message = {
        id: newMsgId,
        sender: 'me',
        text: text || undefined,
        mediaType,
        mediaUrl: finalMediaUrl,
        fileName: fileMeta?.fileName,
        fileSize: fileMeta?.fileSize,
        fileSizeBytes: fileMeta?.fileSizeBytes,
        fileExtension: fileMeta?.fileExtension,
        timestamp: now.toISOString(),
        timeFormatted,
        status: 'sent', // Step 1: Sent (single check)
      };

      playSendSound(userProfile.soundEnabled);

      // Append new message immediately
      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c.id === activeChatId) {
            return {
              ...c,
              messages: [...c.messages, newMessage],
            };
          }
          return c;
        })
      );

      // Step 2: Transition to 'delivered' after 600ms
      setTimeout(() => {
        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === activeChatId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMsgId ? { ...m, status: 'delivered' } : m
                ),
              };
            }
            return c;
          })
        );
      }, 600);

      // Step 3: Transition to 'read' (blue double ticks) after 1400ms
      setTimeout(() => {
        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id === activeChatId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMsgId ? { ...m, status: 'read' } : m
                ),
              };
            }
            return c;
          })
        );
      }, 1400);

      // Step 4: Contact Typing simulation & auto-response
      const targetChat = chats.find((c) => c.id === activeChatId);
      if (targetChat) {
        // Show typing indicator after 1.2s
        setTimeout(() => {
          setChats((prevChats) =>
            prevChats.map((c) => {
              if (c.id === activeChatId) {
                return {
                  ...c,
                  contact: { ...c.contact, isTyping: true },
                };
              }
              return c;
            })
          );
        }, 1200);

        // Send simulated reply after 2.8s
        setTimeout(() => {
          const replyText = getSimulatedReply(text, targetChat.contact.name, {
            fileName: fileMeta?.fileName,
            fileSize: fileMeta?.fileSize,
            type: mediaType,
          });
          const replyTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

          const incomingMessage: Message = {
            id: `reply-${Date.now()}`,
            sender: 'contact',
            text: replyText,
            timestamp: new Date().toISOString(),
            timeFormatted: replyTime,
            status: 'read',
          };

          playReceiveSound(userProfile.soundEnabled);

          setChats((prevChats) =>
            prevChats.map((c) => {
              if (c.id === activeChatId) {
                return {
                  ...c,
                  contact: { ...c.contact, isTyping: false },
                  messages: [...c.messages, incomingMessage],
                };
              }
              return c;
            })
          );
        }, 3000);
      }
    },
    [activeChatId, chats, userProfile.soundEnabled]
  );


  // Message Reactions
  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!activeChatId) return;
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === messageId) {
                const existing = m.reactions || [];
                const updated = [...existing.filter((r) => r.sender !== 'me'), { emoji, sender: 'me' as const }];
                return { ...m, reactions: updated };
              }
              return m;
            }),
          };
        }
        return c;
      })
    );
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    if (!activeChatId) return;
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.filter((m) => m.id !== messageId),
          };
        }
        return c;
      })
    );
  };

  // Toggle Star message
  const handleToggleStarMessage = (messageId: string) => {
    if (!activeChatId) return;
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
            ),
          };
        }
        return c;
      })
    );
  };

  // Start Simulated Call
  const handleStartCall = (contact: Contact, type: 'audio' | 'video') => {
    setActiveCall({ contact, type });
  };

  // End Call & record in log
  const handleEndCall = (durationFormatted?: string) => {
    if (activeCall) {
      const newCallRecord: CallRecord = {
        id: `call-${Date.now()}`,
        contactId: activeCall.contact.id,
        contactName: activeCall.contact.name,
        contactAvatar: activeCall.contact.avatar,
        type: activeCall.type,
        direction: 'outgoing',
        timestamp: 'Just now',
        duration: durationFormatted || 'Cancelled',
      };
      setCalls((prev) => [newCallRecord, ...prev]);
    }
    setActiveCall(null);
  };

  // Add new status story
  const handleAddStatus = (text: string, bgColor: string) => {
    const newStoryItem = {
      id: `story-item-${Date.now()}`,
      type: 'text' as const,
      caption: text,
      backgroundColor: bgColor,
      mediaUrl: '',
      timestamp: 'Just now',
    };

    const userStory: StatusStory = {
      id: `story-user-${Date.now()}`,
      contactId: 'user-me',
      contactName: userProfile.name,
      contactAvatar: userProfile.avatar,
      isUser: true,
      lastUpdated: 'Just now',
      allViewed: false,
      stories: [newStoryItem],
    };

    setStatusStories((prev) => [userStory, ...prev]);
  };

  // Create & Start chat with new contact
  const handleCreateNewContact = (newContact: Contact) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      contact: newContact,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'contact',
          text: `Hey Alex! I just joined What's up.`,
          timestamp: new Date().toISOString(),
          timeFormatted: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          status: 'read',
        },
      ],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMobileView('chat');
  };

  // Delete chat history
  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      const remaining = chats.filter((c) => c.id !== chatId);
      setActiveChatId(remaining[0]?.id || null);
      setMobileView('list');
    }
  };

  // Update contact avatar media (live video, animated GIF, or static photo)
  const handleUpdateContactAvatar = (
    contactId: string,
    updates: { isLiveAvatar: boolean; avatarType: 'image' | 'video' | 'gif'; liveAvatarUrl?: string }
  ) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.contact.id === contactId) {
          return {
            ...c,
            contact: {
              ...c.contact,
              ...updates,
            },
          };
        }
        return c;
      })
    );
  };

  // Reset to default seed data
  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
    localStorage.removeItem(STORAGE_KEYS.STATUS);
    localStorage.removeItem(STORAGE_KEYS.CALLS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    setChats(initialChats);
    setActiveChatId(initialChats[0].id);
    setStatusStories(initialStatusStories);
    setCalls(initialCalls);
    setUserProfile(defaultUserProfile);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c1317] text-[#e9edef] font-sans">
      {/* Container simulating WhatsApp Web frame */}
      <div className="w-full h-full flex overflow-hidden">
        {/* ================= PANEL 1: CHAT LIST (SIDEBAR) ================= */}
        <div
          className={`h-full flex-shrink-0 transition-all duration-200 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex w-full md:w-auto'
          }`}
        >
          <Sidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onOpenNewChat={() => setShowNewChatModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenAndroidInstall={() => setShowAndroidInstallModal(true)}
            onOpenRightPanelTab={(tab) => {
              setRightPanelTab(tab);
              setIsRightPanelOpen(true);
            }}
            hasUnreadStories={statusStories.some((s) => !s.allViewed)}
          />
        </div>

        {/* ================= PANEL 2: ACTIVE CHAT WINDOW ================= */}
        <div
          className={`h-full flex-1 flex flex-col min-w-0 transition-all duration-200 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex w-full md:w-auto'
          }`}
        >
          <ChatWindow
            chat={activeChat}
            onSendMessage={handleSendMessage}
            onBackToList={() => setMobileView('list')}
            onStartCall={handleStartCall}
            onToggleRightPanel={() => {
              setRightPanelTab('info');
              setIsRightPanelOpen(!isRightPanelOpen);
            }}
            isRightPanelOpen={isRightPanelOpen}
            onReactMessage={handleReactMessage}
            onDeleteMessage={handleDeleteMessage}
            onToggleStarMessage={handleToggleStarMessage}
            onOpenAndroidInstall={() => setShowAndroidInstallModal(true)}
          />
        </div>

        {/* ================= PANEL 3: STATUS / CALLS / CONTACT INFO ================= */}
        {isRightPanelOpen && (
          <div className="fixed inset-y-0 right-0 z-40 lg:static lg:flex h-full shadow-2xl lg:shadow-none animate-slide-in-right">
            <RightPanel
              activeTab={rightPanelTab}
              setActiveTab={setRightPanelTab}
              activeChat={activeChat}
              statusStories={statusStories}
              calls={calls}
              onOpenStory={(story) => {
                setActiveStory(story);
                // Mark viewed
                setStatusStories((prev) =>
                  prev.map((s) => (s.id === story.id ? { ...s, allViewed: true } : s))
                );
              }}
              onAddStatus={handleAddStatus}
              onStartCall={handleStartCall}
              onDeleteChat={handleDeleteChat}
              onUpdateContactAvatar={handleUpdateContactAvatar}
              onClose={() => setIsRightPanelOpen(false)}
            />
          </div>
        )}
      </div>

      {/* ================= MODALS & OVERLAYS ================= */}

      {/* 1. Status Story Viewer Modal */}
      {activeStory && (
        <StoryViewerModal
          statusStory={activeStory}
          onClose={() => setActiveStory(null)}
          onReply={(contactId, replyText) => {
            const targetChat = chats.find((c) => c.contact.id === contactId);
            if (targetChat) {
              setActiveChatId(targetChat.id);
              handleSendMessage(replyText);
              setMobileView('chat');
            }
          }}
        />
      )}

      {/* 2. Simulated WhatsApp Video/Audio Call Screen */}
      {activeCall && (
        <CallModal
          contact={activeCall.contact}
          type={activeCall.type}
          onEndCall={handleEndCall}
          soundEnabled={userProfile.soundEnabled}
        />
      )}

      {/* 3. New Chat / Contact Creator Modal */}
      {showNewChatModal && (
        <NewChatModal
          contacts={chats.map((c) => c.contact)}
          onSelectContact={(contactId) => {
            const existing = chats.find((c) => c.contact.id === contactId);
            if (existing) {
              handleSelectChat(existing.id);
            }
          }}
          onCreateNewContact={handleCreateNewContact}
          onClose={() => setShowNewChatModal(false)}
        />
      )}

      {/* 4. Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          userProfile={userProfile}
          onUpdateProfile={setUserProfile}
          onResetData={handleResetData}
          onOpenAndroidInstall={() => setShowAndroidInstallModal(true)}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* 5. Android App & APK Installation Modal */}
      {showAndroidInstallModal && (
        <AndroidInstallModal
          onClose={() => setShowAndroidInstallModal(false)}
        />
      )}
    </div>
  );
}
