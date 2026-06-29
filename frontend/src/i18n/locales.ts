export const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇩🇿' },
  { code: 'fr', label: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇬🇧' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']
