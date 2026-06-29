'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  CheckSquare,
  ChevronDown,
  User,
  Calendar,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTicketStore } from '@/store/useTicketStore';
import {
  useDeleteTicketMutation,
  useUpdateStatusMutation,
  useUpdatePriorityMutation,
} from '@/hooks/useTickets';
import { toast } from 'sonner';
import { StatusBadge, PriorityBadge } from './TicketTable';

interface TicketData {
  _id: string;
  title: string;
  issueCategory: string;
  priority: string;
  status: string;
  assignedPerson: string;
  createdAt: string;
}

interface TicketBoardProps {
  data: TicketData[];
}

const COLUMNS = [
  { id: 'Open', title: 'Open', color: 'border-t-blue-500', bgDot: 'bg-blue-500' },
  { id: 'In Progress', title: 'In Progress', color: 'border-t-amber-500', bgDot: 'bg-amber-500' },
  { id: 'Resolved', title: 'Resolved', color: 'border-t-emerald-500', bgDot: 'bg-emerald-500' },
  { id: 'Closed', title: 'Closed', color: 'border-t-zinc-500', bgDot: 'bg-zinc-500' },
];

export default function TicketBoard({ data }: TicketBoardProps) {
  const store = useTicketStore();
  const router = useRouter();
  const deleteMutation = useDeleteTicketMutation();
  const updateStatusMutation = useUpdateStatusMutation();
  const updatePriorityMutation = useUpdatePriorityMutation();

  // Track which column is being dragged over
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  // Track which card is being dragged
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Ticket deleted successfully');
      } catch (err) {
        toast.error('Failed to delete ticket');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (id: string, newPriority: string) => {
    try {
      await updatePriorityMutation.mutateAsync({ id, priority: newPriority });
      toast.success(`Priority updated to ${newPriority}`);
    } catch {
      toast.error('Failed to update priority');
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggingCardId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingCardId(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedOverColumn !== columnId) {
      setDraggedOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const ticketId = e.dataTransfer.getData('text/plain');
    if (!ticketId) return;

    // Find the ticket to see if the status actually changed
    const ticket = data.find((t) => t._id === ticketId);
    if (ticket && ticket.status !== targetStatus) {
      await handleStatusChange(ticketId, targetStatus);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTickets = data.filter((t) => t.status === col.id);
          const isOver = draggedOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col min-h-[500px] w-full rounded-xl border border-zinc-900 bg-zinc-900/10 transition-all duration-200 ${isOver ? 'bg-zinc-900/40 border-zinc-805 ring-2 ring-zinc-800/50 scale-[1.01]' : ''
                }`}
            >
              {/* Column Header */}
              <div className={`p-4 border-t-2 ${col.color} border-b border-zinc-900/60 flex items-center justify-between bg-zinc-955/40 rounded-t-xl`}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${col.bgDot}`} />
                  <span className="font-semibold text-sm text-zinc-200">{col.title}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-850">
                  {colTickets.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] custom-scrollbar">
                {colTickets.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 border border-dashed border-zinc-850 rounded-lg text-zinc-650 select-none">
                    <ArrowRightLeft className="h-5 w-5 mb-1.5 opacity-40 text-zinc-500" />
                    <span className="text-xs text-zinc-500">Drag tickets here</span>
                  </div>
                ) : (
                  colTickets.map((ticket) => {
                    const isDragging = draggingCardId === ticket._id;
                    const assigneeInitials = ticket.assignedPerson
                      ? ticket.assignedPerson.substring(0, 2).toUpperCase()
                      : 'IT';

                    return (
                      <div
                        key={ticket._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket._id)}
                        onDragEnd={handleDragEnd}
                        className={`group relative flex flex-col gap-3 p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-150 shadow-sm ${isDragging ? 'opacity-30 scale-95 border-dashed border-zinc-700 bg-zinc-950/20' : ''
                          }`}
                      >
                        {/* Card Header (Category & Quick Actions) */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] text-zinc-500 font-mono tracking-tight shrink-0">
                              #{ticket._id.substring(ticket._id.length - 6)}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium truncate max-w-[100px] border border-zinc-850">
                              {ticket.issueCategory}
                            </span>
                          </div>

                          {/* Quick Actions Dropdown */}
                          <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md outline-none cursor-pointer">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 min-w-[160px]">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="text-zinc-500 text-xs">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/dashboard/tickets/${ticket._id}`)}
                                    className="hover:bg-zinc-800 hover:text-zinc-100 gap-2 cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 text-zinc-400" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      store.setEditingTicket(ticket);
                                      store.setEditOpen(true);
                                    }}
                                    className="hover:bg-zinc-800 hover:text-zinc-100 gap-2 cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 text-zinc-400" />
                                    Edit Ticket
                                  </DropdownMenuItem>
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="hover:bg-zinc-800 hover:text-zinc-100 gap-2 cursor-pointer">
                                      <CheckSquare className="h-4 w-4 text-zinc-400" />
                                      Change Status
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                      {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                                        <DropdownMenuItem
                                          key={s}
                                          onClick={() => handleStatusChange(ticket._id, s)}
                                          className="hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer"
                                        >
                                          {s}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(ticket._id)}
                                  className="hover:bg-red-955/80 hover:text-red-300 text-red-400 gap-2 cursor-pointer"
                                >
                                  <Trash className="h-4 w-4 text-red-500/80" />
                                  Delete Ticket
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Title */}
                        <button
                          onClick={() => router.push(`/dashboard/tickets/${ticket._id}`)}
                          className="font-medium text-sm text-zinc-200 hover:underline text-left transition-colors duration-150 outline-none focus:underline leading-tight line-clamp-2"
                        >
                          {ticket.title}
                        </button>

                        {/* Badges / Meta Info */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-850 mt-1">
                          <div className="flex items-center gap-1.5">
                            {/* Priority dropdown wrapper */}
                            <DropdownMenu>
                              <DropdownMenuTrigger className="outline-none cursor-pointer flex items-center shrink-0">
                                <PriorityBadge priority={ticket.priority} interactive />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800 text-zinc-300 min-w-[130px]">
                                {['Low', 'Medium', 'High'].map((p) => (
                                  <DropdownMenuItem
                                    key={p}
                                    onClick={() => handlePriorityChange(ticket._id, p)}
                                    className="hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer text-xs"
                                  >
                                    {p}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Status dropdown wrapper (optional quick change on card) */}
                            <DropdownMenu>
                              <DropdownMenuTrigger className="outline-none cursor-pointer flex items-center shrink-0">
                                <StatusBadge status={ticket.status} interactive />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800 text-zinc-300 min-w-[130px]">
                                {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={() => handleStatusChange(ticket._id, s)}
                                    className="hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer text-xs"
                                  >
                                    {s}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Assignee Avatar */}
                          <div className="flex items-center gap-1.5 shrink-0" title={`Assigned to ${ticket.assignedPerson}`}>
                            <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
                              {assigneeInitials}
                            </div>
                          </div>
                        </div>

                        {/* Date Created */}
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
