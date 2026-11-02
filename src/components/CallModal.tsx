import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { Contact } from '../types';
import { playRingtoneNote } from '../utils/sound';
import { Avatar } from './Avatar';
import { cleanPhoneForDialing } from '../utils/phoneUtils';

interface CallModalProps {
  contact: Contact | null;
  type: 'audio' | 'video';
  onEndCall: (durationFormatted?: string) => void;
  soundEnabled?: boolean;
}

export const CallModal: React.FC<CallModalProps> = ({
  contact,
  type,
  onEndCall,
  soundEnabled = true,
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'ringing' | 'connected'>('calling');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(type === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Status transitions: Calling (1.5s) -> Ringing (2.5s) -> Connected
  useEffect(() => {
    const t1 = setTimeout(() => {
      setCallStatus('ringing');
    }, 1500);

    const t2 = setTimeout(() => {
      setCallStatus('connected');
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Ringing audio pulse
  useEffect(() => {
    if (callStatus === 'ringing' || callStatus === 'calling') {
      const ringInterval = setInterval(() => {
        playRingtoneNote(soundEnabled);
      }, 2000);
      playRingtoneNote(soundEnabled);
      return () => clearInterval(ringInterval);
    }
  }, [callStatus, soundEnabled]);

  // Elapsed timer when connected
  useEffect(() => {
    if (callStatus !== 'connected') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!contact) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    const duration = callStatus === 'connected' ? formatTimer(elapsedSeconds) : undefined;
    onEndCall(duration);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-4">
      <div className="relative w-full max-w-lg h-[90vh] max-h-[720px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#182229] to-[#0c1317] border border-white/10 flex flex-col justify-between shadow-2xl">
        {/* Background Visual when Video */}
        {type === 'video' && isVideoEnabled ? (
          <div className="absolute inset-0 z-0 bg-[#0f171c]">
            {/* Simulated Remote Video Stream */}
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 via-emerald-950/40 to-slate-900">
              <div className="relative flex flex-col items-center">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-32 h-32 rounded-full border-4 border-[#00a884]/40 shadow-2xl object-cover"
                />
                <span className="mt-4 px-3 py-1 rounded-full bg-black/50 text-xs text-white/80 backdrop-blur-sm">
                  {callStatus === 'connected' ? 'Remote camera active' : 'Connecting HD video...'}
                </span>
              </div>
            </div>

            {/* Self Video PiP Thumbnail */}
            <div className="absolute top-5 right-5 w-28 h-36 rounded-2xl bg-slate-800 border-2 border-white/20 shadow-xl overflow-hidden flex flex-col items-center justify-center z-20">
              <span className="text-[10px] text-white/60 mb-1">You</span>
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-xs">
                Me
              </div>
            </div>
          </div>
        ) : null}

        {/* Top Header / Status bar */}
        <div className="relative z-10 pt-10 pb-6 px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[#00a884] font-semibold mb-1">
            WhatsApp {type === 'video' ? 'Video Call' : 'Audio Call'}
          </p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{contact.name}</h3>
          {contact.phone && (
            <div className="mt-1">
              <a
                href={`tel:${cleanPhoneForDialing(contact.phone)}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline px-3 py-0.5 rounded-full bg-black/40 border border-emerald-500/30"
                title="Dial direct cellular number"
              >
                <span>{contact.phone}</span>
              </a>
            </div>
          )}

          <div className="mt-2 flex items-center justify-center gap-2">
            {callStatus === 'calling' && (
              <span className="text-sm text-white/70 animate-pulse">Calling...</span>
            )}
            {callStatus === 'ringing' && (
              <span className="text-sm text-emerald-400 font-medium animate-pulse">Ringing...</span>
            )}
            {callStatus === 'connected' && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
                <span className="text-sm font-mono font-medium text-white">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center Avatar (if Audio or video disabled) */}
        {(!isVideoEnabled || type === 'audio') && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              <Avatar
                contact={contact}
                size="custom"
                className={`w-36 h-36 border-4 border-[#00a884]/60 shadow-2xl ${
                  callStatus !== 'connected' ? 'animate-bounce' : ''
                }`}
                showLiveBadge={true}
              />
              {callStatus === 'connected' && (
                <div className="absolute -bottom-1 -right-1 bg-[#00a884] p-2 rounded-full text-white shadow-lg">
                  {type === 'video' ? <Video size={16} /> : <Volume2 size={16} />}
                </div>
              )}
            </div>
            <p className="text-xs text-white/50 mt-4 tracking-wide">End-to-end encrypted</p>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="relative z-10 pb-8 px-6 pt-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-5">
            {/* Mute Mic */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Video Toggle */}
            <button
              type="button"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                !isVideoEnabled
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
            </button>

            {/* Speaker Toggle */}
            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                !isSpeakerOn
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
              }`}
              title={isSpeakerOn ? 'Speaker' : 'Earpiece'}
            >
              {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEnd}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 transition-all"
              title="End Call"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
