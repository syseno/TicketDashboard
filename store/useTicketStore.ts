import { create } from 'zustand';

interface TicketFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  sort: string;
}

interface TicketUIState {
  filters: TicketFilters;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setCategoryFilter: (category: string) => void;
  setSort: (sort: string) => void;
  resetFilters: () => void;

  // Selected ticket for details modal
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;

  // Editing ticket
  editingTicket: any | null;
  setEditingTicket: (ticket: any | null) => void;

  // Modals visibility
  isCreateOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  isEditOpen: boolean;
  setEditOpen: (open: boolean) => void;
  isDetailOpen: boolean;
  setDetailOpen: (open: boolean) => void;
}

const initialFilters = {
  search: '',
  status: '',
  priority: '',
  category: '',
  sort: 'createdAt',
};

export const useTicketStore = create<TicketUIState>((set) => ({
  filters: { ...initialFilters },
  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
  setStatusFilter: (status) => set((state) => ({ filters: { ...state.filters, status } })),
  setPriorityFilter: (priority) => set((state) => ({ filters: { ...state.filters, priority } })),
  setCategoryFilter: (category) => set((state) => ({ filters: { ...state.filters, category } })),
  setSort: (sort) => set((state) => ({ filters: { ...state.filters, sort } })),
  resetFilters: () => set({ filters: { ...initialFilters } }),

  selectedTicketId: null,
  setSelectedTicketId: (selectedTicketId) => set({ selectedTicketId }),

  editingTicket: null,
  setEditingTicket: (editingTicket) => set({ editingTicket }),

  isCreateOpen: false,
  setCreateOpen: (isCreateOpen) => set({ isCreateOpen }),
  isEditOpen: false,
  setEditOpen: (isEditOpen) => set({ isEditOpen }),
  isDetailOpen: false,
  setDetailOpen: (isDetailOpen) => set({ isDetailOpen }),
}));
