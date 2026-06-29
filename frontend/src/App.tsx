import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AppLayout } from './components/layout/app-layout'
import { useSearchStore } from './hooks/use-search'
import { useRTL } from './hooks/use-rtl'
import { SearchCommand } from './components/search/search-command'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import Provinces from './pages/provinces'
import ProvinceDetail from './pages/province-detail'
import Compare from './pages/compare'
import Search from './pages/search'
import Assistant from './pages/assistant'
import Decisions from './pages/decisions'
import Reports from './pages/reports'
import Settings from './pages/settings'

function AppContent() {
  const { isOpen, close } = useSearchStore()
  useRTL()

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/provinces" element={<Provinces />} />
          <Route path="/provinces/:code" element={<ProvinceDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/search" element={<Search />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {isOpen && <SearchCommand onSelect={close} />}
    </>
  )
}

export default function App() {
  useEffect(() => {
    const stored = localStorage.getItem('monadhama-theme')
    if (!stored) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', stored === 'dark')
    }
  }, [])

  return <AppContent />
}
