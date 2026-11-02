import React, { useState } from 'react';
import {
  Download,
  FileText,
  Archive,
  Music,
  Video,
  Image as ImageIcon,
  FileCode,
  FileCheck,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Message } from '../types';
import { downloadAttachment } from '../utils/fileStorage';

interface AttachmentMessageBubbleProps {
  message: Message;
  onOpenImageLightbox?: (url: string) => void;
}

export const AttachmentMessageBubble: React.FC<AttachmentMessageBubbleProps> = ({
  message,
  onOpenImageLightbox,
}) => {
  const [downloading, setDownloading] = useState(false);

  const {
    mediaUrl = '',
    mediaType = 'file',
    fileName = 'attachment',
    fileSize = 'File',
    fileExtension = '',
  } = message;

  const ext = (fileExtension || fileName.split('.').pop() || '').toLowerCase();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mediaUrl) return;
    setDownloading(true);
    await downloadAttachment(mediaUrl, fileName);
    setTimeout(() => setDownloading(false), 800);
  };

  const renderDocIcon = () => {
    const size = 26;
    if (ext === 'pdf') return <FileText size={size} className="text-rose-400" />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <Archive size={size} className="text-amber-400" />;
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return <Music size={size} className="text-purple-400" />;
    if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) return <Video size={size} className="text-cyan-400" />;
    if (['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'py', 'sh'].includes(ext)) {
      return <FileCode size={size} className="text-blue-400" />;
    }
    return <FileCheck size={size} className="text-emerald-400" />;
  };

  // 1. IMAGE ATTACHMENT
  if (mediaType === 'image') {
    return (
      <div className="mb-1.5 rounded-xl overflow-hidden group/img relative">
        <div
          onClick={() => onOpenImageLightbox?.(mediaUrl)}
          className="cursor-pointer relative overflow-hidden max-h-[360px] bg-black/20"
        >
          <img
            src={mediaUrl}
            alt={fileName}
            className="w-full h-auto object-cover rounded-xl group-hover/img:scale-[1.01] transition-transform duration-200"
          />
          {/* Quick hover overlay with download button */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover/img:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm shadow-md transition-colors"
              title="Download image"
            >
              <Download size={14} className={downloading ? 'animate-bounce' : ''} />
            </button>
            <button
              type="button"
              onClick={() => onOpenImageLightbox?.(mediaUrl)}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm shadow-md transition-colors"
              title="View full size"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>

        {fileName && (
          <div className="flex items-center justify-between text-[11px] text-white/80 px-1 py-1">
            <span className="truncate max-w-[200px]">{fileName}</span>
            {fileSize && <span className="opacity-70 text-[10px]">{fileSize}</span>}
          </div>
        )}
      </div>
    );
  }

  // 2. VIDEO ATTACHMENT
  if (mediaType === 'video') {
    return (
      <div className="mb-2 rounded-xl overflow-hidden bg-black/40 border border-white/10 max-w-sm">
        <video
          src={mediaUrl}
          controls
          playsInline
          className="w-full max-h-[260px] object-contain rounded-t-xl bg-black"
        />
        <div className="p-2 bg-black/30 flex items-center justify-between text-xs text-white">
          <div className="min-w-0 flex-1 pr-2">
            <p className="font-medium text-xs truncate text-white">{fileName}</p>
            <p className="text-[10px] text-white/70">{fileSize} · Video</p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors shrink-0"
            title="Download video"
          >
            <Download size={14} className={downloading ? 'animate-bounce' : ''} />
          </button>
        </div>
      </div>
    );
  }

  // 3. AUDIO ATTACHMENT
  if (mediaType === 'audio') {
    return (
      <div className="mb-2 p-2.5 rounded-xl bg-black/25 border border-white/10 min-w-[240px] max-w-sm space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <Music size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{fileName}</p>
              <p className="text-[10px] text-white/70">{fileSize}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors shrink-0"
            title="Download audio"
          >
            <Download size={14} className={downloading ? 'animate-bounce' : ''} />
          </button>
        </div>
        <audio src={mediaUrl} controls className="w-full h-8" />
      </div>
    );
  }

  // 4. DOCUMENT, ARCHIVE, OR ANY OTHER FILE
  return (
    <div
      onClick={handleDownload}
      className="mb-1.5 p-3 rounded-xl bg-black/30 hover:bg-black/40 border border-white/10 cursor-pointer transition-all min-w-[220px] max-w-sm group/doc"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Icon */}
        <div className="w-11 h-11 rounded-xl bg-[#111b21] flex items-center justify-center shrink-0 shadow-sm border border-white/5 group-hover/doc:scale-105 transition-transform">
          {renderDocIcon()}
        </div>

        {/* Middle Details */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate group-hover/doc:text-[#00a884] transition-colors">
            {fileName}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-white/70 mt-0.5 font-mono">
            <span>{fileSize}</span>
            <span>·</span>
            <span className="uppercase font-bold text-slate-300">{ext}</span>
          </div>
        </div>

        {/* Right Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-[#00a884] text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
          title="Download file"
        >
          <Download size={15} className={downloading ? 'animate-bounce' : ''} />
        </button>
      </div>
    </div>
  );
};
