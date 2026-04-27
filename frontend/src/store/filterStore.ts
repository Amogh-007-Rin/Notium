import { create } from 'zustand';

interface FilterStore {
  selectedProduct: string;
  selectedSegment: string;
  dateRange: { start: string; end: string };
  setProduct: (p: string) => void;
  setSegment: (s: string) => void;
  setDateRange: (range: { start: string; end: string }) => void;
  resetFilters: () => void;
}

const DEFAULT_RANGE = { start: '2022-01', end: '2024-12' };

export const useFilterStore = create<FilterStore>((set) => ({
  selectedProduct: 'all',
  selectedSegment: 'all',
  dateRange: DEFAULT_RANGE,

  setProduct: (p) => set({ selectedProduct: p }),
  setSegment: (s) => set({ selectedSegment: s }),
  setDateRange: (range) => set({ dateRange: range }),
  resetFilters: () => set({ selectedProduct: 'all', selectedSegment: 'all', dateRange: DEFAULT_RANGE }),
}));
