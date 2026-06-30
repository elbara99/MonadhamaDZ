import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Hexagon, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogin } from '../hooks/use-auth'

const stagger = {
  animate: {
    transition: { staggerChildren: 0.07 },
  },
}

const fadeItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({})
  const [shake, setShake] = useState(false)

  const loginMutation = useLogin()

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim()) e.email = t('login.emailRequired')
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t('login.invalidEmail')
    if (!password) e.password = t('login.passwordRequired')
    else if (password.length < 6) e.password = t('login.passwordMinLength')
    return e
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    try {
      await loginMutation.mutateAsync({ email, password })
      navigate('/')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setErrors({ api: detail || t('login.invalidCredentials') })
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-surface-950">
      {/* Mobile: full-width form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-2/5 lg:px-16"
      >
        <div className="mx-auto w-full max-w-sm">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-6"
          >
            {/* Logo — mobile only */}
            <motion.div
              variants={fadeItem}
              className="flex items-center gap-2 lg:hidden"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                <Hexagon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-surface-900 dark:text-white">
                {t('nav.home')}
              </span>
            </motion.div>

            <motion.div variants={fadeItem} className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-surface-900 dark:text-white">
                {t('login.welcomeBack')}
              </h1>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {t('login.signInToAccount')}
              </p>
            </motion.div>

            <motion.form
              variants={fadeItem}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              {errors.api && (
                <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger-600 dark:bg-danger-950/50 dark:text-danger-400">
                  {errors.api}
                </div>
              )}

              <div className={shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}>
                <Input
                  label={t('login.email')}
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined, api: undefined })) }}
                  error={errors.email}
                  autoComplete="email"
                />
              </div>

              <div className={shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}>
                <div className="relative">
                  <Input
                    label={t('login.password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined, api: undefined })) }}
                    error={errors.password}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                    tabIndex={-1}
                    aria-label={showPassword ? t('common.hide') : t('common.show')}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500/30 dark:border-surface-600 dark:bg-surface-800"
                  />
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {t('login.rememberMe')}
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              <Button type="submit" size="lg" loading={loginMutation.isPending} className="w-full">
                {loginMutation.isPending ? t('login.signingIn') : t('login.signIn')}
              </Button>
            </motion.form>

            {/* Social login — mock disabled */}
            <motion.div variants={fadeItem} className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-surface-200 dark:border-surface-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-surface-400 dark:bg-surface-950 dark:text-surface-500">
                    {t('login.orContinueWith')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 rounded-lg border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-400 opacity-50 dark:border-surface-800 dark:text-surface-500"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t('login.google')}
                </button>
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 rounded-lg border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-400 opacity-50 dark:border-surface-800 dark:text-surface-500"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V0h11.4v2.7H2.7v18.6h8.7V24zM22.3 6.6l-2.1 2.4c-.6-.8-1.5-1.2-2.5-1.2-1.8 0-3.3 1.5-3.3 3.3s1.5 3.3 3.3 3.3c1.1 0 1.9-.5 2.5-1.4l2.1 2.2c-1.1 1.4-2.8 2.2-4.6 2.2-3.3 0-6-2.7-6-6s2.7-6 6-6c1.8 0 3.4.7 4.6 2.2z" />
                  </svg>
                  {t('login.microsoft')}
                </button>
              </div>
            </motion.div>

            <motion.p
              variants={fadeItem}
              className="text-center text-sm text-surface-400 dark:text-surface-500"
            >
              {t('login.dontHaveAccount')}{' '}
              <span className="font-medium text-surface-600 dark:text-surface-300">
                {t('login.contactAdmin')}
              </span>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right brand panel — hidden on mobile */}
      <div className="relative hidden lg:flex lg:w-3/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-950 to-surface-950" />

        {/* Abstract decorative elements */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent-500/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-primary-400/5 blur-2xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Futuristic ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center">
            <div className="h-[500px] w-[500px] animate-[spin_40s_linear_infinite] rounded-full border border-primary-500/10" />
            <div className="absolute h-[380px] w-[380px] animate-[spin_30s_linear_infinite_reverse] rounded-full border border-accent-500/10" />
            <div className="absolute h-[260px] w-[260px] animate-[spin_20s_linear_infinite] rounded-full border border-primary-400/15" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-16">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Hexagon className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                {t('nav.home')}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-primary-200/80">
              {t('common.governmentIntelligencePlatform')}
            </p>
          </div>

          <div className="space-y-6">
            <blockquote className="text-2xl font-light leading-snug text-white/90">
              &ldquo;{t('login.tagline')}&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-primary-400/50 to-transparent" />
            </div>
          </div>

          <p className="text-xs text-white/40">{t('login.copyright')}</p>
        </div>
      </div>
    </div>
  )
}
