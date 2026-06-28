'use client';

import React from 'react';
import { useTicketsQuery } from '@/hooks/useTickets';
import { useTicketStore } from '@/store/useTicketStore';
import StatsCards from '@/components/dashboard/StatsCards';
import TicketTable from '@/features/tickets/components/TicketTable';
import TicketFormModal from '@/features/tickets/components/TicketFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, RotateCcw, ShieldAlert, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const store = useTicketStore();
  const { data: tickets = [], isLoading, isError } = useTicketsQuery(store.filters);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 font-extrabold shadow-md">
              IT
            </div>
            <span className="font-semibold text-lg tracking-tight text-zinc-100">Ticket Tracking</span>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search tickets by title or agent..."
                value={store.filters.search}
                onChange={(e) => store.setSearch(e.target.value)}
                className="pl-9 bg-zinc-900/60 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-700 h-9"
              />
            </div>
          </div>

          <Button
            onClick={() => {
              store.setEditingTicket(null);
              store.setCreateOpen(true);
            }}
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shadow-sm flex items-center gap-1.5 h-9 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Add Ticket
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Mobile Search Box */}
        <div className="md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search tickets by title or agent..."
              value={store.filters.search}
              onChange={(e) => store.setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-700"
            />
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Dashboard</h1>
          <p className="text-zinc-400 text-sm">Monitor, assign, and resolve internal IT support tickets.</p>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <StatsCards tickets={tickets} />
        )}

        {/* Table & Filtering Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-zinc-850 bg-zinc-900/10 rounded-xl backdrop-blur-sm">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter by Status */}
              <div className="w-[140px]">
                <Select
                  value={store.filters.status}
                  onValueChange={(val) => store.setStatusFilter(val === 'all' || !val ? '' : val)}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 focus:ring-zinc-700 h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="all" className="hover:bg-zinc-800 cursor-pointer">All Statuses</SelectItem>
                    {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                      <SelectItem key={s} value={s} className="hover:bg-zinc-800 cursor-pointer">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Priority */}
              <div className="w-[140px]">
                <Select
                  value={store.filters.priority}
                  onValueChange={(val) => store.setPriorityFilter(val === 'all' || !val ? '' : val)}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 focus:ring-zinc-700 h-9">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="all" className="hover:bg-zinc-800 cursor-pointer">All Priorities</SelectItem>
                    {['Low', 'Medium', 'High'].map((p) => (
                      <SelectItem key={p} value={p} className="hover:bg-zinc-800 cursor-pointer">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Category */}
              <div className="w-[140px]">
                <Select
                  value={store.filters.category}
                  onValueChange={(val) => store.setCategoryFilter(val === 'all' || !val ? '' : val)}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 focus:ring-zinc-700 h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="all" className="hover:bg-zinc-800 cursor-pointer">All Categories</SelectItem>
                    {['Hardware', 'Software', 'Network', 'Security', 'Account', 'Other'].map((c) => (
                      <SelectItem key={c} value={c} className="hover:bg-zinc-800 cursor-pointer">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              {(store.filters.status || store.filters.priority || store.filters.category || store.filters.search) && (
                <Button
                  variant="ghost"
                  onClick={store.resetFilters}
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 gap-1.5 h-9"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Filters
                </Button>
              )}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider hidden sm:inline">Sort By:</span>
              <div className="w-[160px]">
                <Select
                  value={store.filters.sort}
                  onValueChange={(val) => val && store.setSort(val)}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-300 focus:ring-zinc-700 h-9">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="createdAt" className="hover:bg-zinc-800 cursor-pointer">Created Date</SelectItem>
                    <SelectItem value="priority" className="hover:bg-zinc-800 cursor-pointer">Priority</SelectItem>
                    <SelectItem value="status" className="hover:bg-zinc-800 cursor-pointer">Status</SelectItem>
                    <SelectItem value="title" className="hover:bg-zinc-800 cursor-pointer">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Ticket Table Display */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 border border-zinc-850 rounded-xl bg-zinc-900/10 min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-2" />
              <span className="text-zinc-500 text-sm">Loading tickets...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-12 border border-red-900/30 rounded-xl bg-red-950/10 min-h-[300px]">
              <ShieldAlert className="h-8 w-8 text-red-500 mb-2" />
              <span className="text-red-400 text-sm font-semibold">Failed to retrieve tickets.</span>
              <span className="text-zinc-500 text-xs mt-1">Make sure MONGODB_URI is correctly configured.</span>
            </div>
          ) : (
            <TicketTable data={tickets} />
          )}
        </div>
      </main>

      {/* Modals */}
      <TicketFormModal />
    </div>
  );
}
