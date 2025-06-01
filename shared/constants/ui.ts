// UI関連の定数
export const UI_BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

export const COLORS = {
  PRIMARY: 'hsl(222.2 84% 4.9%)',
  SECONDARY: 'hsl(210 40% 96%)',
  ACCENT: 'hsl(210 40% 98%)',
  MUTED: 'hsl(210 40% 96%)',
  DESTRUCTIVE: 'hsl(0 84.2% 60.2%)',
  BORDER: 'hsl(214.3 31.8% 91.4%)',
  INPUT: 'hsl(214.3 31.8% 91.4%)',
  RING: 'hsl(222.2 84% 4.9%)',
} as const;

export const ANIMATION_DURATION = {
  FAST: '150ms',
  NORMAL: '250ms',
  SLOW: '350ms',
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;
