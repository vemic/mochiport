// 文字列関連のユーティリティ
export const truncate = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space before or at the maxLength position
  let truncateIndex = maxLength;
  
  // Look for word boundary - find last space at or before maxLength
  const spaceIndex = text.lastIndexOf(' ', maxLength);
  
  if (spaceIndex > 0) {
    // Use word boundary if it's reasonable (not too short)
    truncateIndex = spaceIndex;
  }
  
  // Extract content and add suffix
  const content = text.substring(0, truncateIndex).trimEnd();
  return content + ' ' + suffix;
};

export const capitalize = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const camelCase = (text: string): string => {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

export const kebabCase = (text: string): string => {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    // Handle Unicode characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    // Remove non-alphanumeric characters except spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
};

export const removeHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

export const highlightText = (text: string, query: string): string => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// 日本語対応
export const countCharacters = (text: string): number => {
  return [...text].length; // サロゲートペア対応
};

export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Allow common email formats including plus signs
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  
  // Check for consecutive dots
  if (email.includes('..')) return false;
  
  // Check for valid length
  if (email.length > 254) return false;
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain || localPart.length > 64) return false;
  
  return regex.test(email);
};

// エイリアス
export const isEmail = isValidEmail;

export const extractEmails = (text: string): string[] => {
  const regex = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
  return text.match(regex) || [];
};

// テキスト解析
export const wordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const readingTime = (text: string, wordsPerMinute: number = 200): number => {
  const words = wordCount(text);
  return Math.ceil(words / wordsPerMinute);
};

export const isEmpty = (text: string): boolean => {
  if (!text || typeof text !== 'string') return true;
  // Handle escape sequences by checking the actual trimmed length
  return text.replace(/\\[tn]/g, '').trim().length === 0;
};
