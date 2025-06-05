// 日付関連のユーティリティ
export const formatDate = (date: Date | string | null | undefined, format?: string): string => {
  // null, undefinedの処理
  if (!date) {
    return 'Invalid Date';
  }

  // 文字列の場合はDateオブジェクトに変換
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
  } else {
    dateObj = date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
  }

  // カスタム形式が指定された場合
  if (format) {
    // 簡単な形式変換（より複雑な形式は date-fns などを使用することを推奨）
    if (format === 'yyyy-MM-dd') {
      return dateObj.toISOString().split('T')[0];
    }
    if (format === 'yyyy-MM-dd HH:mm') {
      return dateObj.toISOString().slice(0, 16).replace('T', ' ');
    }
    if (format === 'yyyy/MM/dd') {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    }
  }

  // デフォルト形式 (yyyy-MM-dd)
  return dateObj.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const rtf = new Intl.RelativeTimeFormat('ja-JP', { numeric: 'auto' });

  const units: [string, number][] = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
    ['second', 1000],
  ];

  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) {
      return rtf.format(-Math.round(diff / ms), unit as Intl.RelativeTimeFormatUnit);
    }
  }

  return rtf.format(0, 'second');
};

export const isValidDate = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }
  
  return false;
};

export const parseDate = (input: string | Date | null | undefined): Date | null => {
  if (input === null || input === undefined) {
    throw new Error('Date input cannot be null or undefined');
  }
  
  if (input instanceof Date) {
    return input;
  }
  
  if (typeof input === 'string') {
    const parsed = new Date(input);
    // Return invalid Date object for invalid strings (not null)
    return parsed;
  }
  
  throw new Error('Invalid date input type');
};

// 期間計算
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = addDays(new Date(), -1);
  return isSameDay(date, yesterday);
};
