'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  User,
  Palette,
  Shield,
  Globe,
  Camera,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Laptop,
  MonitorX,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'

type SettingsTab = 'profile' | 'appearance' | 'security' | 'language'
type Theme = 'light' | 'dark' | 'system'
type FontSize = 'small' | 'medium' | 'large'
type Density = 'compact' | 'comfortable' | 'spacious'

interface Session {
  id: string
  device: string
  deviceIcon: typeof Smartphone | typeof Laptop | typeof MonitorX
  ip: string
  lastActive: string
  isCurrent: boolean
}

const tabs: { id: SettingsTab; labelKey: string; icon: typeof User }[] = [
  { id: 'profile', labelKey: 'settings.tabs.profile', icon: User },
  { id: 'appearance', labelKey: 'settings.tabs.appearance', icon: Palette },
  { id: 'security', labelKey: 'settings.tabs.security', icon: Shield },
  { id: 'language', labelKey: 'settings.tabs.language', icon: Globe },
]

function getSessions(t: (key: string) => string): Session[] {
  return [
    { id: 'sess-1', device: t('mockData.sessions.currentSession'), deviceIcon: Laptop, ip: '41.200.123.45', lastActive: t('mockData.sessionTimes.activeNow'), isCurrent: true },
    { id: 'sess-2', device: t('mockData.sessions.algiersOffice'), deviceIcon: MonitorX, ip: '41.200.67.89', lastActive: t('mockData.sessionTimes.twoHoursAgo'), isCurrent: false },
    { id: 'sess-3', device: t('mockData.sessions.mobileSafari'), deviceIcon: Smartphone, ip: '197.120.34.56', lastActive: t('mockData.sessionTimes.yesterday'), isCurrent: false },
    { id: 'sess-4', device: t('mockData.sessions.vpnChrome'), deviceIcon: Laptop, ip: '185.220.101.23', lastActive: t('mockData.sessionTimes.threeDaysAgo'), isCurrent: false },
  ]
}

const tabVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h2>
      {description && <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{description}</p>}
    </div>
  )
}

function Divider() {
  return <div className="my-6 border-t border-surface-200 dark:border-surface-800" />
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-[1100px] pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-surface-900 dark:text-white sm:text-3xl">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          {t('settings.description')}
        </p>
      </motion.div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Navigation */}
        <nav className="lg:w-56 shrink-0">
          <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-950/30 dark:text-primary-300'
                      : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">{t(tab.labelKey)}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-surface-200/70 bg-white p-6 shadow-sm dark:border-surface-800/50 dark:bg-surface-900 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'appearance' && <AppearanceTab />}
                {activeTab === 'security' && <SecurityTab />}
                {activeTab === 'language' && <LanguageTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileTab() {
  const { t } = useTranslation()
  const [avatarHover, setAvatarHover] = useState(false)
  const [name, setName] = useState(t('mockData.profile.userName'))
  const [email] = useState('malik.benmoussa@monadhama.dz')
  const [role, setRole] = useState(t('settings.profile.roleTitle'))
  const [org, setOrg] = useState(t('settings.profile.organization'))

  return (
    <div>
      <SectionHeading title={t('settings.profile.title')} description={t('settings.profile.description')} />

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-6">
        <div
          className="relative"
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
        >
          <Avatar name="Malik Benmoussa" size="lg" className="h-20 w-20 text-xl" />
          <AnimatePresence>
            {avatarHover && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40"
              >
                <Camera className="h-5 w-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div>
          <p className="text-sm font-semibold text-surface-900 dark:text-white">{name}</p>
          <p className="text-xs text-surface-500 dark:text-surface-400">{role}</p>
          <button
            type="button"
            className="mt-1.5 text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            {t('settings.profile.changePhoto')}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <Input label={t('settings.profile.fullName')} value={name} onChange={(e) => setName(e.target.value)} />

        <div>
          <Input label={t('settings.profile.email')} value={email} disabled />
          <div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t('settings.profile.verified')}
          </div>
        </div>

        <Input label={t('settings.profile.roleTitle')} value={role} onChange={(e) => setRole(e.target.value)} />
        <Input label={t('settings.profile.organization')} value={org} onChange={(e) => setOrg(e.target.value)} />
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Button>{t('settings.profile.saveChanges')}</Button>
        <Button variant="ghost">{t('settings.profile.reset')}</Button>
      </div>
    </div>
  )
}

function AppearanceTab() {
  const { t } = useTranslation()
  const [theme, setTheme] = useState<Theme>('system')
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [density, setDensity] = useState<Density>('comfortable')

  const themeOptions: { id: Theme; labelKey: string; icon: typeof Sun; preview: string }[] = [
    { id: 'light', labelKey: 'settings.appearance.light', icon: Sun, preview: 'bg-white border border-surface-200' },
    { id: 'dark', labelKey: 'settings.appearance.dark', icon: Moon, preview: 'bg-surface-900 border border-surface-700' },
    { id: 'system', labelKey: 'settings.appearance.system', icon: Monitor, preview: 'bg-gradient-to-r from-white to-surface-900 border border-surface-300' },
  ]

  const sizeOptions: { id: FontSize; labelKey: string; preview: string }[] = [
    { id: 'small', labelKey: 'settings.appearance.small', preview: 'Aa' },
    { id: 'medium', labelKey: 'settings.appearance.medium', preview: 'Aa' },
    { id: 'large', labelKey: 'settings.appearance.large', preview: 'Aa' },
  ]

  const densityOptions: { id: Density; labelKey: string; descriptionKey: string }[] = [
    { id: 'compact', labelKey: 'settings.appearance.compact', descriptionKey: 'settings.appearance.compactDesc' },
    { id: 'comfortable', labelKey: 'settings.appearance.comfortable', descriptionKey: 'settings.appearance.comfortableDesc' },
    { id: 'spacious', labelKey: 'settings.appearance.spacious', descriptionKey: 'settings.appearance.spaciousDesc' },
  ]

  return (
    <div>
      <SectionHeading title={t('settings.appearance.title')} description={t('settings.appearance.description')} />

      {/* Theme */}
      <div>
        <label className="mb-3 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.appearance.theme')}</label>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon
            const isSelected = theme === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-all',
                  isSelected
                    ? 'border-primary-500 ring-1 ring-primary-500/20'
                    : 'border-surface-200 hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600',
                )}
              >
                <div className={cn('mb-3 h-16 rounded-lg', opt.preview)} />
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg',
                    isSelected
                      ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400'
                      : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-surface-700 dark:text-surface-300',
                  )}>
                    {t(opt.labelKey)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <Divider />

      {/* Font Size */}
      <div>
        <label className="mb-3 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.appearance.fontSize')}</label>
        <div className="flex gap-2">
          {sizeOptions.map((opt) => {
            const isSelected = fontSize === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFontSize(opt.id)}
                className={cn(
                  'flex-1 rounded-xl border-2 px-4 py-3 text-center transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                    : 'border-surface-200 hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600',
                )}
              >
                <span className={cn(
                  'font-semibold text-surface-900 dark:text-white',
                  opt.id === 'small' && 'text-sm',
                  opt.id === 'medium' && 'text-base',
                  opt.id === 'large' && 'text-lg',
                )}>
                  {opt.preview}
                </span>
                <p className={cn(
                  'mt-1 text-xs font-medium',
                  isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400',
                )}>
                  {t(opt.labelKey)}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <Divider />

      {/* Density */}
      <div>
        <label className="mb-3 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.appearance.density')}</label>
        <div className="flex gap-2">
          {densityOptions.map((opt) => {
            const isSelected = density === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDensity(opt.id)}
                className={cn(
                  'flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                    : 'border-surface-200 hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600',
                )}
              >
                <p className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-surface-900 dark:text-white',
                )}>
                  {t(opt.labelKey)}
                </p>
                <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
                  {t(opt.descriptionKey)}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        <Button>{t('settings.appearance.apply')}</Button>
      </div>
    </div>
  )
}

function SecurityTab() {
  const { t } = useTranslation()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const sessions = useMemo(() => getSessions(t), [t])

  const strengthCriteria = [
    { label: t('settings.security.criteria.minLength'), met: newPw.length >= 8 },
    { label: t('settings.security.criteria.uppercase'), met: /[A-Z]/.test(newPw) },
    { label: t('settings.security.criteria.number'), met: /[0-9]/.test(newPw) },
    { label: t('settings.security.criteria.special'), met: /[^A-Za-z0-9]/.test(newPw) },
  ]

  const strengthMet = strengthCriteria.filter((c) => c.met).length
  const strengthPercent = (strengthMet / strengthCriteria.length) * 100

  const strengthColor =
    strengthPercent <= 25 ? 'bg-danger-500' :
    strengthPercent <= 50 ? 'bg-warning-500' :
    strengthPercent <= 75 ? 'bg-warning-400' :
    'bg-emerald-500'

  const strengthLabel =
    strengthPercent <= 25 ? t('settings.security.weak') :
    strengthPercent <= 50 ? t('settings.security.fair') :
    strengthPercent <= 75 ? t('settings.security.good') :
    t('settings.security.strong')

  return (
    <div>
      <SectionHeading title={t('settings.security.title')} description={t('settings.security.description')} />

      {/* Password Change */}
      <div className="space-y-4">
        <div className="relative">
          <Input
            label={t('settings.security.currentPassword')}
            type={showPw ? 'text' : 'password'}
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
        </div>
        <div className="relative">
          <Input
            label={t('settings.security.newPassword')}
            type={showPw ? 'text' : 'password'}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
        </div>
        <div className="relative">
          <Input
            label={t('settings.security.confirmNewPassword')}
            type={showPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
        >
          {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPw ? t('settings.security.hidePasswords') : t('settings.security.showPasswords')}
        </button>

        {/* Strength Indicator */}
        {newPw.length > 0 && (
          <div className="rounded-xl border border-surface-200 p-4 dark:border-surface-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
                {t('settings.security.passwordStrength')}
              </span>
              <span className={cn(
                'text-xs font-bold',
                strengthColor.replace('bg-', 'text-'),
              )}>
                {strengthLabel}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-200 dark:bg-surface-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strengthPercent}%` }}
                transition={{ duration: 0.3 }}
                className={cn('h-1.5 rounded-full transition-colors', strengthColor)}
              />
            </div>
            <ul className="mt-3 space-y-1">
              {strengthCriteria.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    'flex h-3.5 w-3.5 items-center justify-center rounded-full',
                    c.met ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-surface-100 text-surface-400 dark:bg-surface-800',
                  )}>
                    {c.met ? (
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span className={c.met ? 'text-surface-700 dark:text-surface-300' : 'text-surface-400 dark:text-surface-500'}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button disabled={!currentPw || !newPw || !confirmPw}>
          {t('settings.security.updatePassword')}
        </Button>
      </div>

      <Divider />

      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-1">{t('settings.security.twoFactorAuth')}</h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
          {t('settings.security.twoFactorDesc')}
        </p>
        <div className="flex items-center justify-between rounded-xl border border-surface-200 px-4 py-3 dark:border-surface-700">
          <div>
            <p className="text-sm font-medium text-surface-900 dark:text-white">{t('settings.security.authenticatorApp')}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              {twoFactor ? t('settings.security.twoFactorEnabled') : t('settings.security.twoFactorDisabled')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={twoFactor}
            onClick={() => setTwoFactor(!twoFactor)}
            className={cn(
              'relative h-6 w-11 shrink-0 rounded-full transition-colors',
              twoFactor ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600',
            )}
          >
            <span className={cn(
              'block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
              twoFactor ? 'translate-x-[22px]' : 'translate-x-0.5',
            )} />
          </button>
        </div>
        {twoFactor && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              {t('settings.security.setupAuthenticator')}
            </Button>
          </motion.div>
        )}
      </div>

      <Divider />

      {/* Active Sessions */}
      <div>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-1">{t('settings.security.activeSessions')}</h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
          {t('settings.security.activeSessionsDesc')}
        </p>
        <div className="space-y-2">
          {sessions.map((sess) => {
            const Icon = sess.deviceIcon
            return (
              <div
                key={sess.id}
                className="flex items-center gap-4 rounded-xl border border-surface-200 px-4 py-3 dark:border-surface-700"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                      {sess.device}
                    </p>
                    {sess.isCurrent && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-2xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {t('settings.security.current')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
                    <span>{sess.ip}</span>
                    <span>&middot;</span>
                    <span>{sess.lastActive}</span>
                  </div>
                </div>
                  {!sess.isCurrent && (
                  <Button variant="ghost" size="sm" className="text-surface-400 hover:text-danger-500 text-xs">
                    {t('settings.security.revoke')}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LanguageTab() {
  const { t } = useTranslation()
  const [interfaceLang, setInterfaceLang] = useState('العربية')
  const [contentLangs, setContentLangs] = useState(['العربية', 'English', 'Français'])
  const [numberFormat, setNumberFormat] = useState(t('settings.language.westernFormat'))
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [calendar, setCalendar] = useState(t('settings.language.gregorian'))

  const availableContentLangs = [
    { id: 'English', label: 'English' },
    { id: 'Arabic', label: 'العربية' },
    { id: 'French', label: 'Français' },
    { id: 'Tamazight', label: 'Tamazight', disabled: true },
  ]

  const toggleContentLang = (lang: string) => {
    if (contentLangs.includes(lang)) {
      if (contentLangs.length > 1) {
        setContentLangs(contentLangs.filter((l) => l !== lang))
      }
    } else {
      setContentLangs([...contentLangs, lang])
    }
  }

  const selectStyles = 'block w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-sm text-surface-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100'

  return (
    <div>
      <SectionHeading title={t('settings.language.title')} description={t('settings.language.description')} />

      <div className="space-y-6">
        {/* Interface Language */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.language.interfaceLanguage')}</label>
          <select value={interfaceLang} onChange={(e) => setInterfaceLang(e.target.value)} className={selectStyles}>
            {['English', 'العربية', 'Français'].map((opt) => (
              <option key={opt} value={opt.replace('العربية', 'Arabic').replace('Français', 'French')}>{opt}</option>
            ))}
          </select>
        </div>

        <Divider />

        {/* Content Language Priority */}
        <div>
          <label className="mb-3 block text-sm font-medium text-surface-700 dark:text-surface-300">
            {t('settings.language.contentLanguagePriority')}
          </label>
          <div className="space-y-2">
            {availableContentLangs.map((lang) => (
              <button
                key={lang.id}
                type="button"
                disabled={lang.disabled}
                onClick={() => toggleContentLang(lang.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                  lang.disabled
                    ? 'border-surface-100 opacity-50 dark:border-surface-800 cursor-not-allowed'
                    : contentLangs.includes(lang.id)
                      ? 'border-primary-200 bg-primary-50 dark:border-primary-900/50 dark:bg-primary-950/20'
                      : 'border-surface-200 hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600',
                )}
              >
                <span className={cn(
                  'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                  contentLangs.includes(lang.id) && !lang.disabled
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-surface-300 dark:border-surface-600',
                )}>
                  {contentLangs.includes(lang.id) && <CheckCircle2 className="h-3.5 w-3.5" />}
                </span>
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    contentLangs.includes(lang.id)
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-surface-700 dark:text-surface-300',
                  )}>
                    {lang.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Number Format */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.language.numberFormat')}</label>
          <select value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)} className={selectStyles}>
            <option value="Western">{t('settings.language.westernFormat')}</option>
            <option value="Arabic">{t('settings.language.arabicFormat')}</option>
          </select>
        </div>

        {/* Date Format */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.language.dateFormat')}</label>
          <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className={selectStyles}>
            {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Calendar */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.language.calendar')}</label>
          <select value={calendar} onChange={(e) => setCalendar(e.target.value)} className={selectStyles}>
            <option value="Gregorian">{t('settings.language.gregorian')}</option>
            <option value="Hijri">{t('settings.language.hijri')}</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        <Button>{t('settings.language.apply')}</Button>
      </div>
    </div>
  )
}
