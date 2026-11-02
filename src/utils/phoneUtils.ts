/**
 * Phone number utilities for dialing, copying, formatting and searching
 */

export const cleanPhoneForDialing = (phone: string): string => {
  if (!phone) return '';
  // Keep leading +, digits, remove spaces, parentheses, dashes, dots
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
};

export const normalizePhoneForSearch = (str: string): string => {
  if (!str) return '';
  return str.replace(/[^0-9+]/g, '');
};

export const isPhoneMatch = (phone: string, query: string): boolean => {
  if (!phone || !query) return false;
  const rawQuery = query.trim().toLowerCase();
  if (phone.toLowerCase().includes(rawQuery)) return true;

  const normPhone = normalizePhoneForSearch(phone);
  const normQuery = normalizePhoneForSearch(rawQuery);
  if (normQuery && normPhone.includes(normQuery)) return true;

  return false;
};

export const copyPhoneToClipboard = async (phone: string): Promise<boolean> => {
  if (!phone) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(phone);
      return true;
    }
  } catch {
    // fallback
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = phone;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
};
