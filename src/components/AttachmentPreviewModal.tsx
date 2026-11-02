import React, { useState } from 'react';
import {
  X,
  Send,
  FileText,
  Archive,
  Music,
  Video,
  Image as ImageIcon,
  FileQuestion,
  FileCheck,
} from 'lucide-react';
import { AttachmentDraft, Contact } from '../types';

interface AttachmentPreviewModalProps {
  draft: AttachmentDraft | null;
  contact: Contact | null;
  onSend: (draft: AttachmentDraft, caption: string) => void;
  onCancel: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  draft,
  contact,
  onSend,
  onCancel,
}) => {
  const [caption, setCaption] = useState('');

  if (!draft) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(draft, caption.trim());
  };

  const renderFileIcon = () => {
    const size = 52;
    switch (draft.type) {
      case 'image':
        return <ImageIcon size={size} className="text-emerald-400" />;
      case 'video':
        return <Video size={size} className="text-cyan-400" />;
      case 'audio':
        return <Music size={size} className="text-purple-400" />;
      case 'archive':
        return <Archive size={size} className="text-amber-400" />;
      case 'document':
        return <FileText size={size} className="text-rose-400" />;
      default:
        return <FileQuestion size={size} className="text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#111b21] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="h-14 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222e35]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Cancel and discard"
            >
              <X size={20} />
            </button>
            <div>
              <p className="text-sm font-semibold text-white">Preview Attachment</p>
              <p className="text-xs text-slate-400">
                Send to {contact ? contact.name : 'contact'}
              </p>
            </div>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] text-xs font-semibold capitalize">
            {draft.type}
          </div>
        </div>

        {/* Media Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[260px] max-h-[50vh] bg-[#0b141a]">
          {draft.type === 'image' ? (
            <div className="relative max-h-full max-w-full flex items-center justify-center rounded-xl overflow-hidden shadow-lg border border-white/5">
              <img
                src={draft.previewUrl}
                alt={draft.name}
                className="max-h-[340px] max-w-full object-contain rounded-lg"
              />
            </div>
          ) : draft.type === 'video' ? (
            <div className="w-full max-w-md rounded-xl overflow-hidden bg-black shadow-lg border border-white/10">
              <video
                src={draft.previewUrl}
                controls
                className="w-full max-h-[320px] object-contain rounded-xl"
              />
            </div>
          ) : draft.type === 'audio' ? (
            <div className="w-full max-w-md p-5 rounded-2xl bg-[#202c33] border border-[#2a3942] flex flex-col items-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Music size={32} />
              </div>
              <div className="text-center w-full">
                <p className="text-sm font-semibold text-white truncate">{draft.name}</p>
                <p className="text-xs text-slate-400 mt-1">{draft.sizeFormatted}</p>
              </div>
              <audio src={draft.previewUrl} controls className="w-full h-10" />
            </div>
          ) : (
            /* Document, Archive, or Generic File */
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#202c33] border border-[#2a3942] flex flex-col items-center text-center shadow-xl space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-[#111b21] flex items-center justify-center shadow-inner border border-white/5">
                {renderFileIcon()}
              </div>

              <div className="w-full">
                <h4 className="text-base font-semibold text-white break-words line-clamp-2 px-2">
                  {draft.name}
                </h4>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-400 font-mono">
                  <span>{draft.sizeFormatted}</span>
                  <span>·</span>
                  <span className="uppercase font-bold text-emerald-400">{draft.extension}</span>
                </div>
              </div>

              <div className="w-full py-2 px-3 bg-[#111b21] rounded-xl text-xs text-slate-400 flex items-center justify-center gap-2">
                <FileCheck size={14} className="text-[#00a884]" />
                <span>Unlimited file sharing ready (zero compression)</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Caption & Send Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-[#202c33] border-t border-[#222e35] flex items-center gap-3"
        >
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            autoFocus
            className="flex-1 bg-[#2a3942] text-white placeholder-slate-400 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#00a884] transition-all"
          />

          <button
            type="submit"
            className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f6f] active:scale-95 text-white flex items-center justify-center shadow-lg transition-all shrink-0"
            title="Send attachment"
          >
            <Send size={19} />
          </button>
        </form>
      </div>
    </div>
  );
};
