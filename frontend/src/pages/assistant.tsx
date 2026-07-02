'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Send,
  Plus,
  MessageSquare,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MapPin,
  Loader2,
} from 'lucide-react'
import { cn, getScoreColor } from '@/lib/utils'
import { provinces, getProvinceByCode } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  dataCards?: { label: string; value: string; color: string }[]
}

interface Conversation {
  id: string
  title: string
  titleKey: string
  date: string
  count: number
  messages: Message[]
}

const mockConversationData: Omit<Conversation, 'titleKey'>[] = [
  {
    id: 'conv-1',
    title: 'تحليل الرعاية الصحية في الولايات الجنوبية',
    date: '2026-06-28',
    count: 8,
    messages: [
      {
        id: 'msg-1', role: 'user',
        content: 'Analyze the healthcare situation in southern provinces.',
        timestamp: new Date('2026-06-28T10:00:00'),
      },
      {
        id: 'msg-2', role: 'assistant',
        content:
          'بناءً على أحدث البيانات، **ولاية تمنراست** تتطلب اهتماماً فورياً في البنية التحتية للرعاية الصحية.\n\n**النتائج الرئيسية:**\n\u2022 أسرة المستشفيات لكل 1,000 نسمة: 0.8 (المتوسط الوطني: 2.1)\n\u2022 نسبة إشغال العناية المركزة: 98%\n\u2022 النمو السكاني: 3.2% سنوياً\n\n**التوصية:** تخصيص تمويل طارئ للرعاية الصحية بقيمة 4.5 مليار دينار جزائري لبناء مستشفى جديد.\n\n*المصادر: وزارة الصحة 2025، بيانات الإحصاء الوطني*',
        timestamp: new Date('2026-06-28T10:00:05'),
        sources: ['وزارة الصحة — التقرير السنوي 2025', 'بيانات الإحصاء الوطني 2025'],
        dataCards: [
          { label: 'أسرة لكل 1K', value: '0.8', color: 'text-danger-500' },
          { label: 'إشغال العناية', value: '98%', color: 'text-danger-500' },
          { label: 'النمو السكاني', value: '3.2%', color: 'text-warning-500' },
        ],
      },
    ],
  },
  { id: 'conv-2', title: 'مقارنة اتجاهات التعليم 2024 مقابل 2025', date: '2026-06-27', count: 5, messages: [] },
  { id: 'conv-3', title: 'توصيات الاستثمار في البنية التحتية', date: '2026-06-26', count: 12, messages: [] },
  { id: 'conv-4', title: 'توقعات النمو السكاني', date: '2026-06-25', count: 3, messages: [] },
]

const messageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-algeria-100 text-algeria-600 dark:bg-algeria-900/30 dark:text-algeria-400">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl bg-surface-100 px-4 py-3 dark:bg-navy-800">
        <span className="h-2 w-2 animate-bounce rounded-full bg-surface-400" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-surface-400" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-surface-400" style={{ animationDelay: '300ms' }} />
      </div>
    </motion.div>
  )
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**'))
      return <p key={i} className="mb-2 text-sm font-semibold text-navy-900 dark:text-white">{line.slice(2, -2)}</p>
    if (line.startsWith('\u2022 '))
      return (
        <div key={i} className="mb-1 flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span className="text-sm text-surface-600 dark:text-surface-400">{line.slice(2)}</span>
        </div>
      )
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**'))
      return <p key={i} className="mt-3 text-xs italic text-surface-400 dark:text-surface-500">{line.slice(1, -1)}</p>
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="mb-1 text-sm leading-relaxed text-surface-700 dark:text-surface-300">{line}</p>
  })
}

export default function AssistantPage() {
  const { t } = useTranslation()
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [conversationsList, setConversationsList] = useState<Conversation[]>(
    mockConversationData.map((c) => ({ ...c, titleKey: `assistant.${c.id.replace('conv-', 'convTitle')}` })),
  )
  const [isAiTyping, setIsAiTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const suggestedPrompts = [
    t('assistant.prompt1'), t('assistant.prompt2'), t('assistant.prompt3'),
    t('assistant.prompt4'), t('assistant.prompt5'),
  ]

  const selectedConv = conversationsList.find((c) => c.id === selectedConvId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConv?.messages, isAiTyping])

  function handleSend() {
    if (!inputValue.trim() || !selectedConv) return
    const userMsg: Message = { id: `msg-${Date.now()}`, role: 'user', content: inputValue, timestamp: new Date() }
    const updatedConv = { ...selectedConv, messages: [...selectedConv.messages, userMsg], count: selectedConv.count + 1 }
    setConversationsList((prev) => prev.map((c) => c.id === selectedConv.id ? updatedConv : c))
    setInputValue('')
    setIsAiTyping(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`, role: 'assistant',
        content: 'بناءً على البيانات المتاحة، يمكنني تقديم التحليل التالي.\n\n**الرؤى الرئيسية:**\n\u2022 الولايات الساحلية تُظهر نمواً في الناتج المحلي الإجمالي أسرع بـ 2.3 مرة من المناطق الداخلية\n\u2022 الولايات الجنوبية لديها نتائج بنية تحتية أقل بنسبة 60%\n\u2022 تحسن التعليم يتسارع في سطيف وتيزي وزو\n\n*المصادر: وزارة التخطيط 2025، البيانات الإقليمية للإحصاء الوطني*',
        timestamp: new Date(),
        sources: ['وزارة التخطيط — التقرير الإقليمي 2025', 'البيانات الاقتصادية للإحصاء الوطني'],
        dataCards: [
          { label: 'نمو الناتج المحلي', value: '+3.2%', color: 'text-emerald-500' },
          { label: 'فجوة البنية التحتية', value: '60%', color: 'text-danger-500' },
          { label: 'معدل الإلمام', value: '85.4%', color: 'text-gold-500' },
        ],
      }
      const finalConv = { ...updatedConv, messages: [...updatedConv.messages, aiMsg], count: updatedConv.count + 1 }
      setConversationsList((prev) => prev.map((c) => c.id === selectedConv.id ? finalConv : c))
      setIsAiTyping(false)
    }, 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function handleNewChat() {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`, title: t('assistant.newConversation'), titleKey: '',
      date: new Date().toISOString().slice(0, 10), count: 0, messages: [],
    }
    setConversationsList((prev) => [newConv, ...prev])
    setSelectedConvId(newConv.id)
  }

  function adjustTextareaHeight() {
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = `${Math.min(ta.scrollHeight, 108)}px` }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel — Conversation History */}
      <div className="hidden w-[30%] min-w-[260px] max-w-[340px] flex-col border-r border-surface-200 bg-white dark:border-navy-700 dark:bg-navy-900 lg:flex">
        <div className="border-b border-surface-100 p-4 dark:border-navy-700">
          <button type="button" onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-algeria-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-algeria-500">
            <Plus className="h-4 w-4" />
            {t('assistant.newChat')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {conversationsList.map((conv) => (
              <button key={conv.id} type="button" onClick={() => setSelectedConvId(conv.id)}
                className={cn('w-full rounded-xl px-3 py-3 text-left transition-all',
                  selectedConvId === conv.id
                      ? 'bg-algeria-50 shadow-sm dark:bg-algeria-950/30'
                      : 'hover:bg-surface-50 dark:hover:bg-navy-800/40',
                )}>
                <div className="flex items-start gap-2.5">
                  <MessageSquare className={cn('mt-0.5 h-4 w-4 shrink-0',
                    selectedConvId === conv.id ? 'text-algeria-500' : 'text-surface-400')} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm font-medium',
                      selectedConvId === conv.id ? 'text-algeria-700 dark:text-algeria-300' : 'text-surface-700 dark:text-surface-300')}>
                      {conv.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-2xs text-surface-400">
                      <span>{conv.date}</span>
                      <span>&middot;</span>
                      <span>{t('assistant.messagesCount', { count: conv.count })}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Chat Interface */}
      <div className="flex flex-1 flex-col bg-surface-50/50 dark:bg-navy-950/50">
        {selectedConv ? (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
              <div className="mx-auto max-w-[720px] space-y-4">
                <AnimatePresence mode="popLayout">
                  {selectedConv.messages.map((msg) => (
                    <motion.div key={msg.id} layout initial="hidden" animate="visible" variants={messageVariants}
                      className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[85%]', msg.role === 'user' ? '' : 'w-full')}>
                        {msg.role === 'assistant' ? (
                          <div className="group overflow-hidden rounded-2xl border border-surface-200/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-navy-700/50 dark:bg-navy-900/60">
                            <div className="flex items-center gap-2 border-b border-surface-100 px-5 py-3 dark:border-navy-700">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-algeria-100 text-algeria-600 dark:bg-algeria-900/30 dark:text-algeria-400">
                                <Bot className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-semibold text-navy-900 dark:text-white">{t('assistant.aiAssistant')}</span>
                              {msg.sources && msg.sources.length > 0 && (
                                <Badge variant="gold" size="sm" className="ml-auto">
                                  <FileText className="mr-1 h-3 w-3" />
                                  {t('assistant.sourcesCount', { count: msg.sources.length })}
                                </Badge>
                              )}
                            </div>
                            <div className="px-5 py-4">
                              <div className="prose-custom">{renderMarkdown(msg.content)}</div>
                              {msg.dataCards && msg.dataCards.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                  {msg.dataCards.map((card, i) => (
                                    <div key={i} className="rounded-xl border border-surface-100 bg-surface-50/60 px-3 py-3 dark:border-navy-700/50 dark:bg-navy-800/30">
                                      <p className="text-2xs text-surface-500 dark:text-surface-400">{card.label}</p>
                                      <p className={cn('text-lg font-bold', card.color)}>{card.value}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-surface-100 pt-3 dark:border-navy-700">
                                  {msg.sources.map((src, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-surface-50 px-2 py-1 text-2xs text-surface-500 dark:bg-navy-800/40 dark:text-surface-400">
                                      <FileText className="h-2.5 w-2.5" /> {src}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="inline-block rounded-2xl bg-algeria-600 px-4 py-3 text-sm text-white shadow-sm">
                            {msg.content}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <AnimatePresence>{isAiTyping && <TypingIndicator />}</AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-surface-200 bg-white/80 backdrop-blur-xl dark:border-navy-700 dark:bg-navy-900/80">
              <div className="mx-auto max-w-[720px] px-4 py-4 lg:px-8">
                <div className="flex items-end gap-2 rounded-2xl border border-surface-200/70 bg-surface-50 px-4 py-2 shadow-sm transition-all focus-within:border-algeria-400 focus-within:shadow-md dark:border-navy-700/50 dark:bg-navy-900/60 dark:focus-within:border-algeria-500/50">
                  <textarea ref={textareaRef} value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); adjustTextareaHeight() }}
                    onKeyDown={handleKeyDown} placeholder={t('assistant.placeholder')} rows={1}
                    className="max-h-[108px] flex-1 resize-none bg-transparent py-2 text-sm text-navy-900 placeholder-surface-400 outline-none dark:text-white dark:placeholder-surface-500"
                  />
                  <button type="button" onClick={handleSend} disabled={!inputValue.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-algeria-600 text-white transition-all hover:bg-algeria-500 disabled:opacity-40">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-center text-2xs text-surface-400">{t('assistant.aiDisclaimer')}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }} className="max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-algeria-100 text-algeria-600 dark:bg-algeria-900/30 dark:text-algeria-400">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold text-navy-900 dark:text-white">{t('assistant.askAboutAlgeria')}</h2>
              <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{t('assistant.askDescription')}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <motion.button key={prompt} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }} type="button" onClick={handleNewChat}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-surface-200/60 bg-white/60 px-4 py-2.5 text-xs font-medium text-surface-600 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-algeria-300 hover:bg-algeria-50/50 hover:text-algeria-700 dark:border-navy-700/40 dark:bg-navy-900/40 dark:text-surface-400 dark:hover:border-algeria-700/50 dark:hover:bg-algeria-950/20 dark:hover:text-algeria-300">
                    <Sparkles className="h-3 w-3 text-algeria-400" /> {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        <div className="border-t border-surface-200 p-3 lg:hidden dark:border-navy-700">
          <div className="flex gap-2 overflow-x-auto">
            {conversationsList.map((conv) => (
              <button key={conv.id} type="button" onClick={() => setSelectedConvId(conv.id)}
                className={cn('shrink-0 rounded-lg px-3 py-2 text-2xs font-medium transition-colors',
                  selectedConvId === conv.id
                    ? 'bg-algeria-100 text-algeria-700 dark:bg-algeria-900/30 dark:text-algeria-300'
                    : 'bg-surface-100 text-surface-500 dark:bg-navy-800 dark:text-surface-400')}>
                {conv.title}
              </button>
            ))}
            <button type="button" onClick={handleNewChat}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-algeria-600 px-3 py-2 text-2xs font-medium text-white">
              <Plus className="h-3 w-3" /> {t('assistant.new')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
