import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Pause, Play } from 'lucide-react';
import { StatusStory } from '../types';

interface StoryViewerModalProps {
  statusStory: StatusStory | null;
  onClose: () => void;
  onReply: (contactId: string, replyText: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  statusStory,
  onClose,
  onReply,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const timerRef = useRef<number | null>(null);

  const stories = statusStory?.stories || [];
  const currentStory = stories[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
  }, [statusStory?.id]);

  useEffect(() => {
    if (!statusStory || isPaused || !currentStory) return;

    const intervalTime = 50; // update every 50ms
    const totalDuration = 5000; // 5 seconds per story
    const step = (intervalTime / totalDuration) * 100;

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            // Reached end of stories
            window.clearInterval(timerRef.current!);
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [statusStory, currentIndex, isPaused, stories.length, onClose, currentStory]);

  if (!statusStory || !currentStory) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(statusStory.contactId, `Replying to status: "${currentStory.caption || 'Photo'}": ${replyText.trim()}`);
    setReplyText('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full max-w-md h-full sm:h-[85vh] sm:rounded-2xl overflow-hidden bg-[#111b21] flex flex-col justify-between shadow-2xl border border-white/10">
        {/* Top Header & Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Segmented Progress Bars */}
          <div className="flex gap-1.5 mb-3">
            {stories.map((story, idx) => (
              <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={statusStory.contactAvatar}
                alt={statusStory.contactName}
                className="w-10 h-10 rounded-full border-2 border-[#00a884] object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-white tracking-wide">{statusStory.contactName}</p>
                <p className="text-xs text-white/70">{currentStory.timestamp || statusStory.lastUpdated}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Story Body */}
        <div
          className="relative flex-1 flex items-center justify-center p-6 select-none"
          style={{
            backgroundColor: currentStory.backgroundColor || '#0b141a',
          }}
        >
          {currentStory.mediaUrl ? (
            <img
              src={currentStory.mediaUrl}
              alt="Status Story"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          ) : (
            <div className="max-w-xs text-center">
              <p className="text-xl sm:text-2xl font-semibold text-white leading-relaxed tracking-wide drop-shadow-md">
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* Tap Zones for Next/Prev */}
          <div
            className="absolute left-0 top-16 bottom-20 w-1/3 cursor-pointer"
            onClick={handlePrev}
          />
          <div
            className="absolute right-0 top-16 bottom-20 w-1/3 cursor-pointer"
            onClick={handleNext}
          />

          {/* Nav arrows */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm hidden sm:flex"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          {currentIndex < stories.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm hidden sm:flex"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Bottom Reply Bar */}
        <form
          onSubmit={handleSendReply}
          className="relative z-20 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            placeholder="Reply to status..."
            className="flex-1 bg-white/15 text-white placeholder-white/60 px-4 py-2.5 rounded-full text-sm outline-none border border-white/20 focus:border-[#00a884] focus:bg-white/20 transition-all"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 flex items-center justify-center text-white transition-all shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
