import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SpaceState {
  activeSpaceId: string | null
  setActiveSpace: (id: string) => void
}

export const useSpaceStore = create<SpaceState>()(
  persist(
    (set) => ({
      activeSpaceId: null,
      setActiveSpace: (id) => set({ activeSpaceId: id }),
    }),
    {
      name: 'space-storage',
    }
  )
)
