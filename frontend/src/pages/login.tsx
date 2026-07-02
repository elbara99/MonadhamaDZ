import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Globe, 
  ChevronDown, 
  Mail, 
  Lock, 
  ArrowLeft,
  ArrowRight,
  UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogin } from '../hooks/use-auth'
import { algeriaProvinces } from '@/lib/algeria-geojson'

interface LoginTranslations {
  welcome: string
  subtitle: string
  emailLabel: string
  emailPlaceholder: string
  passwordLabel: string
  passwordPlaceholder: string
  rememberMe: string
  forgotPassword: string
  signInButton: string
  signingIn: string
  orText: string
  createAccountButton: string
  secureFooterText: string
  sloganTitleLine1: string
  sloganTitleLine2: string
  sloganDesc: string
  platformDesc: string
  noAccountAlert: string
}

// Custom translations dictionary to strictly match the requested text exactly and support multilingual
const LOCAL_TRANSLATIONS: Record<string, LoginTranslations> = {
  ar: {
    welcome: "تسجيل الدخول",
    subtitle: "مرحبًا بعودتك، يرجى تسجيل الدخول للمتابعة.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    signInButton: "تسجيل الدخول",
    signingIn: "جارٍ تسجيل الدخول...",
    orText: "أو",
    createAccountButton: "إنشاء حساب جديد",
    secureFooterText: "تسجيل دخول آمن وموثوق",
    sloganTitleLine1: "ذكاء البيانات",
    sloganTitleLine2: "لخدمة القرار",
    sloganDesc: "حلل وتوقع ووجه العمل العمومي بفضل ذكاء متكامل للبيانات في خدمة الجزائر.",
    platformDesc: "Plateforme d'intelligence gouvernementale",
    noAccountAlert: "يرجى الاتصال بمسؤول النظام لإنشاء حساب جديد."
  },
  fr: {
    welcome: "Connexion",
    subtitle: "Bon retour, veuillez vous connecter pour continuer.",
    emailLabel: "E-mail",
    emailPlaceholder: "Entrez votre adresse e-mail",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublié ?",
    signInButton: "Se connecter",
    signingIn: "Connexion...",
    orText: "Ou",
    createAccountButton: "Créer un compte",
    secureFooterText: "Connexion sécurisée et fiable",
    sloganTitleLine1: "Des données fiables",
    sloganTitleLine2: "pour des décisions éclairées",
    sloganDesc: "Analysez, anticipez et pilotez l'action publique grâce à une intelligence de données intégrée au service de l'Algérie.",
    platformDesc: "Plateforme d'intelligence gouvernementale",
    noAccountAlert: "Veuillez contacter l'administrateur pour créer un compte."
  },
  en: {
    welcome: "Sign In",
    subtitle: "Welcome back, please sign in to continue.",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signInButton: "Sign In",
    signingIn: "Signing in...",
    orText: "Or",
    createAccountButton: "Create an account",
    secureFooterText: "Secure and trusted login",
    sloganTitleLine1: "Reliable data",
    sloganTitleLine2: "for informed decisions",
    sloganDesc: "Analyze, anticipate, and direct public action using an integrated data intelligence service for Algeria.",
    platformDesc: "Plateforme d'intelligence gouvernementale",
    noAccountAlert: "Please contact the administrator to create an account."
  }
}

interface HubNode {
  name: string
  name_ar: string
  x: number
  y: number
  pulse?: boolean
}

// Bounding box for mapping GeoJSON coordinates to 500x500 local SVG
const minLng = -9.0
const maxLng = 12.2
const minLat = 18.0
const maxLat = 37.8

const mapCoords = (lng: number, lat: number): [number, number] => {
  const padding = 30
  const w = 500 - padding * 2
  const h = 500 - padding * 2
  const x = padding + ((lng - minLng) / (maxLng - minLng)) * w
  const y = padding + h - ((lat - minLat) / (maxLat - minLat)) * h
  return [x, y]
}

// Static nodes for visual layout matching the design
const MAP_HUBS: HubNode[] = [
  { name: 'Algiers', name_ar: 'الجزائر العاصمة', ...(() => { const [x,y] = mapCoords(3.0, 36.7); return {x,y} })(), pulse: true },
  { name: 'Oran', name_ar: 'وهران', ...(() => { const [x,y] = mapCoords(-0.6, 35.7); return {x,y} })() },
  { name: 'Constantine', name_ar: 'قسنطينة', ...(() => { const [x,y] = mapCoords(6.6, 36.3); return {x,y} })() },
  { name: 'Ouargla', name_ar: 'ورقلة', ...(() => { const [x,y] = mapCoords(5.3, 31.9); return {x,y} })() },
  { name: 'Adrar', name_ar: 'أدرار', ...(() => { const [x,y] = mapCoords(-0.2, 27.8); return {x,y} })(), pulse: true },
  { name: 'Tamanrasset', name_ar: 'تمنراست', ...(() => { const [x,y] = mapCoords(5.5, 22.8); return {x,y} })(), pulse: true },
  { name: 'Tindouf', name_ar: 'تندوف', ...(() => { const [x,y] = mapCoords(-6.2, 27.6); return {x,y} })() }
]

const MAP_CONNECTIONS = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 3, to: 5 },
  { from: 3, to: 4 },
  { from: 4, to: 6 },
  { from: 1, to: 4 }
]

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({})
  const [shake, setShake] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  
  // Custom dialog for registration alert
  const [showAlert, setShowAlert] = useState(false)

  const loginMutation = useLogin()

  const currentLang = (i18n.language || 'ar').startsWith('ar') 
    ? 'ar' 
    : i18n.language === 'fr' 
      ? 'fr' 
      : 'en'
      
  const dict = LOCAL_TRANSLATIONS[currentLang] || LOCAL_TRANSLATIONS.ar
  const isRtl = currentLang === 'ar'

  useEffect(() => {
    // Set root directory HTML direction based on locale
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [isRtl])

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim()) {
      e.email = isRtl ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = isRtl ? 'البريد الإلكتروني غير صالح' : 'Invalid email address'
    }
    if (!password) {
      e.password = isRtl ? 'كلمة المرور مطلوبة' : 'Password is required'
    } else if (password.length < 6) {
      e.password = isRtl ? 'يجب أن لا تقل كلمة المرور عن 6 أحرف' : 'Password must be at least 6 characters'
    }
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
      setErrors({ 
        api: err?.response?.data?.detail || (isRtl ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Invalid email or password.')
      })
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const LANGUAGES = [
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' }
  ]

  return (
    <div 
      className="flex h-screen w-full overflow-hidden bg-white selection:bg-[#0B6B43]/20 selection:text-[#0B6B43]"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Self-registration Alert Modal */}
      <AnimatePresence>
        {showAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-xl border border-surface-150 text-right"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <h3 className="text-lg font-bold text-navy-950 mb-2">
                {isRtl ? 'إنشاء حساب جديد' : 'Create New Account'}
              </h3>
              <p className="text-sm text-surface-600 mb-6 leading-relaxed">
                {dict.noAccountAlert}
              </p>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowAlert(false)}
                  className="bg-[#0B6B43] hover:bg-[#085233] text-white px-5 py-2.5 rounded-xl transition"
                >
                  {isRtl ? 'حسناً' : 'Close'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Left Panel - Login Form Container */}
      <div className="relative flex w-full flex-col justify-between px-6 py-8 sm:px-12 lg:w-[45%] xl:w-[40%] bg-white shrink-0">
        
        {/* Language Selector Dropdown at Top */}
        <div className="absolute top-6 left-6 ltr:left-auto ltr:right-6 md:top-8 md:left-8 md:ltr:right-8 z-20">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 text-surface-700 text-sm font-medium transition-all focus:outline-none"
            >
              <Globe className="w-4 h-4 text-surface-500" />
              <span>{LANGUAGES.find(l => l.code === currentLang)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
            </button>
            
            <AnimatePresence>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute top-full mt-1.5 w-32 bg-white border border-surface-150 rounded-xl shadow-lg py-1.5 z-20"
                    style={{ left: isRtl ? 0 : 'auto', right: isRtl ? 'auto' : 0 }}
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code)
                          setLangOpen(false)
                        }}
                        className={`w-full px-4 py-2 hover:bg-surface-50 text-sm text-surface-700 transition ${
                          isRtl ? 'text-right' : 'text-left'
                        } ${currentLang === lang.code ? 'font-bold text-[#0B6B43] bg-[#0B6B43]/5' : ''}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Logo and App Title */}
        <div className="flex flex-col items-center mt-8 md:mt-12 mb-4 text-center">
          {/* Custom SVG Hexagon Logo with Pillars */}
          <div className="flex h-16 w-16 items-center justify-center mb-3">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon 
                points="50,6 90,29 90,75 50,98 10,75 10,29" 
                stroke="#0B6B43" 
                strokeWidth="5.5" 
                strokeLinejoin="round"
                fill="none"
              />
              <path 
                d="M 28,43 L 50,23 L 72,43" 
                stroke="#0B6B43" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none"
              />
              <rect x="32" y="48" width="6" height="26" rx="1.5" fill="#0B6B43" />
              <rect x="42" y="45" width="6" height="29" rx="1.5" fill="#0B6B43" />
              <rect x="52" y="45" width="6" height="29" rx="1.5" fill="#0B6B43" />
              <rect x="62" y="48" width="6" height="26" rx="1.5" fill="#0B6B43" />
              <line x1="28" y1="76" x2="72" y2="76" stroke="#0B6B43" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-navy-950">
            MonadhamaDZ
          </h1>
          <p className="text-xs font-semibold text-surface-400 tracking-wider mt-1 uppercase opacity-85">
            {dict.platformDesc}
          </p>
          <div className="h-0.5 w-12 bg-[#0B6B43] mt-3" />
        </div>

        {/* Center Main Card Form Space */}
        <div className="mx-auto w-full max-w-sm flex-1 flex flex-col justify-center">
          <div className="space-y-1 mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900">
              {dict.welcome}
            </h2>
            <p className="text-sm text-surface-500 font-medium">
              {dict.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {errors.api && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-danger-50 border border-danger-200 p-3.5 text-sm text-danger-600 font-medium"
              >
                {errors.api}
              </motion.div>
            )}

            {/* Email Field with Left aligned Icon */}
            <div className={`space-y-1.5 ${shake && errors.email ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
              <label className="block text-sm font-bold text-surface-800">
                {dict.emailLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-surface-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((p) => ({ ...p, email: undefined, api: undefined }))
                  }}
                  autoComplete="email"
                  placeholder={dict.emailPlaceholder}
                  className={`w-full rounded-xl border border-surface-200 bg-white py-3.5 pl-12 pr-4 text-sm text-navy-950 placeholder-surface-400 transition focus:border-[#0B6B43] focus:ring-2 focus:ring-[#0B6B43]/15 focus:outline-none ${
                    errors.email ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/10' : ''
                  }`}
                  style={{ direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger-600 font-semibold mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field with Left Lock, Right Eye icons */}
            <div className={`space-y-1.5 ${shake && errors.password ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
              <label className="block text-sm font-bold text-surface-800">
                {dict.passwordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-surface-400">
                  <Lock className="h-5 w-5" />
                </div>
                
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((p) => ({ ...p, password: undefined, api: undefined }))
                  }}
                  autoComplete="current-password"
                  placeholder={dict.passwordPlaceholder}
                  className={`w-full rounded-xl border border-surface-200 bg-white py-3.5 pl-12 pr-12 text-sm text-navy-950 placeholder-surface-400 transition focus:border-[#0B6B43] focus:ring-2 focus:ring-[#0B6B43]/15 focus:outline-none ${
                    errors.password ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/10' : ''
                  }`}
                  style={{ direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-4 flex items-center text-surface-400 hover:text-surface-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger-600 font-semibold mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4.5 w-4.5 cursor-pointer rounded border-surface-300 bg-white text-[#0B6B43] transition focus:ring-0 focus:ring-offset-0 checked:bg-[#0B6B43]"
                />
                <span className="text-surface-600 hover:text-surface-900 font-medium">
                  {dict.rememberMe}
                </span>
              </label>
              <button
                type="button"
                className="font-semibold text-[#0B6B43] hover:text-[#085233] hover:underline"
              >
                {dict.forgotPassword}
              </button>
            </div>

            {/* Primary Submit Button with Left Arrow */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="relative w-full bg-[#0B6B43] hover:bg-[#085233] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition hover:shadow-md cursor-pointer disabled:opacity-80"
            >
              {loginMutation.isPending ? (
                <span>{dict.signingIn}</span>
              ) : (
                <>
                  {isRtl ? <ArrowLeft className="w-5 h-5 absolute left-4" /> : <ArrowRight className="w-5 h-5 absolute right-4" />}
                  <span>{dict.signInButton}</span>
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-y-1/2 left-0 right-0 border-t border-surface-150" />
            <span className="relative bg-white px-4 text-xs font-semibold text-surface-450 uppercase">
              {dict.orText}
            </span>
          </div>

          {/* Secondary Button - Outlined Create Account */}
          <button
            type="button"
            onClick={() => setShowAlert(true)}
            className="w-full flex items-center justify-center gap-2 border border-surface-200 bg-white hover:bg-surface-50 text-navy-950 text-sm font-bold py-3.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4.5 h-4.5 text-surface-500" />
            <span>{dict.createAccountButton}</span>
          </button>
        </div>

        {/* Safe Login Footer bottom */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-surface-400">
          <ShieldCheck className="h-4.5 w-4.5 text-surface-400" />
          <span>{dict.secureFooterText}</span>
        </div>
      </div>

      {/* Right Panel - Interactive Dashboard Aesthetics Container */}
      <div className="relative hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col justify-between p-12 xl:p-16 bg-[#071C1A] overflow-hidden shrink-0 select-none">
        
        {/* Subtle grid and glowing radial shapes in background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-[#071C1A] to-[#071C1A] z-0" />
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl z-0" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl z-0" />
        
        <div 
          className="absolute inset-0 opacity-[0.03] z-0" 
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} 
        />

        {/* Top Header Label */}
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-2xs font-extrabold uppercase tracking-widest text-[#0B6B43]/70">
              الجمهورية الجزائرية الديمقراطية الشعبية
            </p>
            <p className="text-xs text-white/50 font-medium mt-1">
              Plateforme d'intelligence gouvernementale
            </p>
          </div>
        </div>

        {/* Center Canvas with Algeria SVG Map & Connected Network */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-12">
          {/* Centered Map Wrapper */}
          <div className="relative w-full max-w-[500px] aspect-square pointer-events-auto">
            
            {/* Hover Tooltip display */}
            <AnimatePresence>
              {hoveredProvince && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-lg z-35 flex items-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full bg-[#0B6B43] animate-pulse" />
                  <span>{hoveredProvince}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing Map Chart overlay cards */}
            {/* Card 1 - Bottom Left */}
            <div className="absolute bottom-[5%] left-[2%] w-[120px] aspect-[1.8/1] rounded-xl border border-white/5 bg-[#071C1A]/40 backdrop-blur-md p-2.5 flex flex-col justify-between shadow-lg">
              <span className="text-3xs text-white/40 font-bold uppercase tracking-wider">Indicateurs</span>
              <div className="w-full h-8 flex items-end gap-1 overflow-hidden mt-1">
                <div className="w-[12%] h-[30%] bg-[#0B6B43]/40 rounded-sm" />
                <div className="w-[12%] h-[55%] bg-[#0b6b43]/60 rounded-sm animate-pulse" />
                <div className="w-[12%] h-[40%] bg-[#0B6B43]/40 rounded-sm" />
                <div className="w-[12%] h-[75%] bg-[#0B6B43]/80 rounded-sm" />
                <div className="w-[12%] h-[60%] bg-[#0B6B43]/50 rounded-sm" />
                <div className="w-[12%] h-[90%] bg-emerald-400 rounded-sm" />
              </div>
            </div>

            {/* Card 2 - Top Right */}
            <div className="absolute top-[8%] right-[2%] w-[110px] aspect-[1.5/1] rounded-xl border border-white/5 bg-[#071C1A]/40 backdrop-blur-md p-2.5 flex flex-col justify-between shadow-lg">
              <span className="text-3xs text-white/40 font-bold uppercase tracking-wider">Activité direct</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-white/90">98.4%</span>
              </div>
            </div>

            {/* Map SVG */}
            <svg 
              className="w-full h-full select-none" 
              viewBox="0 0 500 500" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.95">
                {algeriaProvinces.features.map((feature) => {
                  const rings = feature.geometry.coordinates
                  const pathData = rings.map(ring => {
                    return 'M ' + ring.map(([lng, lat]) => {
                      const [x, y] = mapCoords(lng, lat)
                      return `${x.toFixed(1)},${y.toFixed(1)}`
                    }).join(' L ') + ' Z'
                  }).join(' ')

                  const arabicName = feature.properties?.name_ar || ''
                  const regionName = feature.properties?.name || ''
                  const displayName = isRtl ? `${feature.id.replace('DZ-','')} - ${arabicName}` : `${feature.id.replace('DZ-','')} - ${regionName}`
                  
                  return (
                    <path
                      key={feature.id}
                      d={pathData}
                      stroke="rgba(11, 107, 67, 0.35)"
                      strokeWidth="0.8"
                      className="fill-emerald-950/5 hover:fill-emerald-900/25 hover:stroke-emerald-500/60 transition-all duration-300 cursor-pointer pointer-events-auto"
                      onMouseEnter={() => setHoveredProvince(displayName)}
                      onMouseLeave={() => setHoveredProvince(null)}
                    />
                  )
                })}
              </g>

              {/* Data Routes Network connections */}
              <g opacity="0.8">
                {MAP_CONNECTIONS.map((c, i) => {
                  const fromNode = MAP_HUBS[c.from]
                  const toNode = MAP_HUBS[c.to]
                  const dx = toNode.x - fromNode.x
                  const dy = toNode.y - fromNode.y
                  const mx = fromNode.x + dx / 2
                  const my = fromNode.y + dy / 2
                  
                  // Curved arch math
                  const ox = -dy * 0.12
                  const oy = dx * 0.12
                  
                  const cx = mx + ox
                  const cy = my + oy
                  
                  return (
                    <g key={i}>
                      {/* Dotted path */}
                      <path
                        d={`M ${fromNode.x} ${fromNode.y} Q ${cx} ${cy} ${toNode.x} ${toNode.y}`}
                        fill="none"
                        stroke="rgba(16, 185, 129, 0.22)"
                        strokeWidth="1.2"
                        strokeDasharray="4 4"
                      />
                      {/* Moving signal particle */}
                      <path
                        d={`M ${fromNode.x} ${fromNode.y} Q ${cx} ${cy} ${toNode.x} ${toNode.y}`}
                        fill="none"
                        stroke="url(#sparkGradient)"
                        strokeWidth="2.5"
                        strokeDasharray="8 60"
                        strokeDashoffset="0"
                        className="animate-[dash_8s_linear_infinite]"
                      />
                    </g>
                  )
                })}
              </g>

              {/* Glowing Pulse hubs dots */}
              <g>
                {MAP_HUBS.map((node, i) => (
                  <g key={i}>
                    {node.pulse && (
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r="10" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="1" 
                        className="animate-ping origin-center opacity-65"
                      />
                    )}
                    <circle 
                      cx={node.x} 
                      cy={node.y} 
                      r="4" 
                      fill={node.pulse ? '#10b981' : '#0B6B43'} 
                      stroke="#ffffff" 
                      strokeWidth="1.2"
                      className="shadow-sm"
                    />
                  </g>
                ))}
              </g>

              {/* Spark gradient definition */}
              <defs>
                <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Short Professional Slogan Panel */}
        <div className="relative z-10 space-y-4 max-w-lg mt-auto mb-16 select-text text-right" style={{ direction: 'rtl' }}>
          <div className="flex justify-start">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              {dict.sloganTitleLine1}
              <span className="block text-[#10b981]">
                {dict.sloganTitleLine2}
              </span>
            </h2>
          </div>
          <div className="h-1 w-14 bg-[#0B6B43]" />
          <p className="text-sm text-white/60 font-medium leading-relaxed max-w-md">
            {dict.sloganDesc}
          </p>
        </div>

        {/* Thin Modern Line-Art Skyline overlaying at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-5 pointer-events-none overflow-hidden select-none">
          <svg className="w-full h-24 opacity-30 hover:opacity-60 transition-opacity duration-300" viewBox="0 0 800 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(420, 20)">
              <path d="M 0,110 C -15,100 -25,60 -10,10 C -5,0 0,0 2,10 C 10,40 10,70 12,110" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <path d="M 40,110 C 55,100 65,60 50,10 C 45,0 40,0 38,10 C 30,40 30,70 28,110" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <path d="M 20,110 C 15,90 15,60 20,40 C 25,60 25,90 20,110" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M 12,85 C 12,75 28,75 28,85" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <circle cx="20" cy="55" r="3" fill="rgba(255,255,255,0.6)" />
            </g>
            
            <g transform="translate(560, -10)">
              <rect x="15" y="30" width="14" height="110" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <line x1="15" y1="30" x2="29" y2="40" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="29" y1="40" x2="15" y2="50" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="15" y1="50" x2="29" y2="60" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="29" y1="60" x2="15" y2="70" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="15" y1="70" x2="29" y2="80" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="29" y1="80" x2="15" y2="90" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="15" y1="90" x2="29" y2="100" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="29" y1="100" x2="15" y2="110" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <line x1="15" y1="110" x2="29" y2="120" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <rect x="13" y="20" width="18" height="10" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <polygon points="13,20 22,2 31,20" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <line x1="22" y1="2" x2="22" y2="-5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            </g>

            <g transform="translate(620, 80)">
              <rect x="0" y="20" width="120" height="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <path d="M 30,20 C 30,-10 90,-10 90,20" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <line x1="60" y1="-5" x2="60" y2="-12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <line x1="10" y1="20" x2="10" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="20" y1="20" x2="20" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="100" y1="20" x2="100" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="110" y1="20" x2="110" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </g>

            <g transform="translate(300, 95)">
              <path d="M 0,45 L 0,20 C 0,10 15,10 15,20 L 15,45 M 15,20 C 15,10 30,10 30,20 L 30,45 M 30,20 C 30,10 45,10 45,20 L 45,45 M 45,20 C 45,10 60,10 60,20 L 60,45 M 60,20 C 60,10 75,10 75,20 L 75,45" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
              <line x1="0" y1="45" x2="75" y2="45" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
            </g>

            <g transform="translate(760, 80)">
              <path d="M 10,60 C 8,40 12,20 15,0" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
              <path d="M 15,0 C 5,-10 -5,5 -5,5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M 15,0 C 0,-15 -10,-10 -10,-10" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M 15,0 C 15,-20 5,-25 5,-25" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M 15,0 C 25,-20 30,-15 30,-15" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <path d="M 15,0 C 30,-10 35,5 35,5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            </g>
            
            <g transform="translate(260, 90)">
              <path d="M 5,50 C 7,30 2,15 10,0" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <path d="M 10,0 C 2,-10 -6,2 -6,2" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <path d="M 10,0 C 10,-18 0,-20 0,-20" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <path d="M 10,0 C 20,-15 22,-10 22,-10" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <path d="M 10,0 C 22,-5 25,5 25,5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </g>

            <g transform="translate(10, 110)">
              <rect x="10" y="-30" width="20" height="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
              <rect x="30" y="-50" width="25" height="80" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
              <rect x="55" y="-20" width="15" height="50" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
              <rect x="70" y="-70" width="30" height="100" stroke="rgba(255,255,255,0.26)" strokeWidth="1.2" />
              <line x1="85" y1="-70" x2="85" y2="-90" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
              <rect x="100" y="-40" width="20" height="70" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
            </g>

            <line x1="0" y1="140" x2="800" y2="140" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Global panel footer metadata */}
        <div className="relative z-10 flex items-center justify-between text-2xs text-white/30 font-medium">
          <span>{isRtl ? 'منصة المراقبة الكبرى للجزائر' : 'MonadhamaDZ National Platform'}</span>
          <span>{isRtl ? '© ٢٠٢٦ منصة المراقبة. جميع الحقوق محفوظة.' : '© 2026 MonadhamaDZ. All rights reserved.'}</span>
        </div>
      </div>
    </div>
  )
}
