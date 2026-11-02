import { AttachmentMediaType } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const detectFileType = (
  file: File | { name: string; type?: string }
): { type: AttachmentMediaType; extension: string } => {
  const name = file.name || 'file';
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const mime = file.type || '';

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(ext)) {
    return { type: 'image', extension: ext };
  }
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', '3gp'].includes(ext)) {
    return { type: 'video', extension: ext };
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) {
    return { type: 'audio', extension: ext };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return { type: 'archive', extension: ext };
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md', 'json'].includes(ext)) {
    return { type: 'document', extension: ext };
  }

  return { type: 'file', extension: ext || 'bin' };
};

// In-memory active Object URL cache for zero-latency retrieval
const objectUrlCache = new Map<string, string>();
const blobCache = new Map<string, Blob>();

// IndexedDB database setup for virtually unlimited local file storage (>GBs)
const DB_NAME = 'whatsup_file_vault_v1';
const STORE_NAME = 'attachments';

const openDb = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
};

export const saveAttachmentFile = async (messageId: string, file: Blob | File): Promise<string> => {
  const url = URL.createObjectURL(file);
  objectUrlCache.set(messageId, url);
  blobCache.set(messageId, file);

  try {
    const db = await openDb();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(file, messageId);
    }
  } catch {
    // If private mode or IDB quota issue, the in-memory blobCache handles current session
  }

  return url;
};

export const getAttachmentUrl = async (messageId: string, fallbackUrl?: string): Promise<string> => {
  if (objectUrlCache.has(messageId)) {
    return objectUrlCache.get(messageId)!;
  }

  try {
    const db = await openDb();
    if (db) {
      const blob = await new Promise<Blob | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(messageId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        objectUrlCache.set(messageId, url);
        blobCache.set(messageId, blob);
        return url;
      }
    }
  } catch {
    // Fall back to stored URL
  }

  return fallbackUrl || '';
};

// Instant file download handler
export const downloadAttachment = async (url: string, fileName: string, fallbackBlob?: Blob) => {
  try {
    let blobUrl = url;

    // If url is not already a blob URL or data URI, or if we have fallbackBlob
    if (fallbackBlob) {
      blobUrl = URL.createObjectURL(fallbackBlob);
    } else if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      const res = await fetch(url);
      const b = await res.blob();
      blobUrl = URL.createObjectURL(b);
    }

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up if we generated a temporary blob URL
    if (blobUrl !== url) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    }
  } catch {
    // Fallback: direct window download trigger
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
