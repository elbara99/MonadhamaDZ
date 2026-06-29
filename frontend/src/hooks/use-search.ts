import { create } from 'zustand'

export interface SearchResult {
  type: string
  id: string
  title: string
  subtitle: string
}

interface SearchStore {
  isOpen: boolean
  query: string
  results: SearchResult[]
  open: () => void
  close: () => void
  toggle: () => void
  setQuery: (query: string) => void
  setResults: (results: SearchResult[]) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  query: '',
  results: [],
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: '', results: [] }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
}))
