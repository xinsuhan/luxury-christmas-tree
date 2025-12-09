import { create } from 'zustand';

interface AppState {
  mode: 'CHAOS' | 'FORMED';
  handPosition: [number, number]; // x, y normalized
  setMode: (mode: 'CHAOS' | 'FORMED') => void;
  setHandPosition: (pos: [number, number]) => void;
}

export const useStore = create<AppState>((set) => ({
  mode: 'FORMED',
  handPosition: [0, 0],
  setMode: (mode) => set({ mode }),
  setHandPosition: (pos) => set({ handPosition: pos }),
}));
