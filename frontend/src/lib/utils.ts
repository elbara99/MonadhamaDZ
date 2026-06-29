import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, t?: (key: string) => string): string {
  const billionSuffix = t ? t('common.billion') : 'B'
  const millionSuffix = t ? t('common.million') : 'M'
  const thousandSuffix = t ? t('common.thousand') : 'ألف'
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + billionSuffix
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + millionSuffix
  if (num >= 1_000) return (num / 1_000).toFixed(1) + thousandSuffix
  return num.toLocaleString()
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + '%'
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-score-excellent'
  if (score >= 75) return 'text-score-good'
  if (score >= 60) return 'text-score-fair'
  if (score >= 40) return 'text-score-warning'
  return 'text-score-critical'
}

export function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-score-excellent'
  if (score >= 75) return 'bg-score-good'
  if (score >= 60) return 'bg-score-fair'
  if (score >= 40) return 'bg-score-warning'
  return 'bg-score-critical'
}

export function getScoreLabel(score: number, t?: (key: string) => string): string {
  if (score >= 90) return t ? t('scores.excellent') : 'ممتاز'
  if (score >= 75) return t ? t('scores.good') : 'جيد'
  if (score >= 60) return t ? t('scores.fair') : 'متوسط'
  if (score >= 40) return t ? t('scores.warning') : 'تنبيه'
  return t ? t('scores.critical') : 'حرج'
}

export function getScoreEmoji(score: number): string {
  if (score >= 90) return '●'
  if (score >= 75) return '●'
  if (score >= 60) return '●'
  if (score >= 40) return '●'
  return '●'
}
