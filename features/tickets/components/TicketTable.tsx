'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { MoreHorizontal, Eye, Edit, Trash, CheckSquare, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useTicketStore } from '@/store/useTicketStore';
import { useDeleteTicketMutation, useUpdateStatusMutation, useUpdatePriorityMutation } from '@/hooks/useTickets';
import { toast } from 'sonner';

interface TicketData {
  _id: string;
  title: string;
  issueCategory: string;
  priority: string;
  status: string;
  assignedPerson: string;
  createdAt: string;
}

interface TicketTableProps {
  data: TicketData[];
}

export function StatusBadge({ status, interactive }: { status: string; interactive?: boolean }) {
  let color = { bg: '#6B7280', border: '#4B5563' }; // gray default
  if (status === 'Open') {
    color = { bg: '#3B82F6', border: '#2563EB' };
  } else if (status === 'In Progress') {
    color = { bg: '#F59E0B', border: '#D97706' };
  } else if (status === 'Resolved') {
    color = { bg: '#22C55E', border: '#16A34A' };
  } else if (status === 'Closed') {
    color = { bg: '#6B7280', border: '#4B5563' };
  }
  return (
    <span
      className={`inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
        interactive ? 'hover:brightness-110 active:scale-95 cursor-pointer select-none pr-1.5' : ''
      }`}
      style={{ backgroundColor: color.bg, color: '#fff', borderWidth: 1, borderColor: color.border }}
    >
      {status}
      {interactive && <ChevronDown className="h-3 w-3 ml-1 opacity-70" />}
    </span>
  );
}

export function PriorityBadge({ priority, interactive }: { priority: string; interactive?: boolean }) {
  let color = { bg: '#6B7280', border: '#4B5563' }; // gray default
  if (priority === 'High') {
    color = { bg: '#EF4444', border: '#DC2626' };
  } else if (priority === 'Medium') {
    color = { bg: '#F59E0B', border: '#D97706' };
  } else if (priority === 'Low') {
    color = { bg: '#22C55E', border: '#16A34A' };
  }
  return (
    <span
      className={`inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
        interactive ? 'hover:brightness-110 active:scale-95 cursor-pointer select-none pr-1.5' : ''
      }`}
      style={{ backgroundColor: color.bg, color: '#fff', borderWidth: 1, borderColor: color.border }}
    >
      {priority}
      {interactive && <ChevronDown className="h-3 w-3 ml-1 opacity-70" />}
    </span>
  );
}

export default function TicketTable({ data }: TicketTableProps) {
  const store = useTicketStore();
  const router = useRouter();
  const deleteMutation = useDeleteTicketMutation();
  const updateStatusMutation = useUpdateStatusMutation();

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

  const updatePriorityMutation = useUpdatePriorityMutation();

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

  const columnHelper = createColumnHelper<TicketData>();

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => (
        <button
          onClick={() => router.push(`/dashboard/tickets/${info.row.original._id}`)}
          className="font-medium text-zinc-100 hover:underline text-left transition-colors duration-150 outline-none focus:underline"
        >
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor('issueCategory', {
      header: 'Category',
      cell: (info) => (
        <span className="text-zinc-400 text-sm">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: (info) => {
        const ticket = info.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none cursor-pointer flex items-center">
              <PriorityBadge priority={info.getValue()} interactive />
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
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const ticket = info.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none cursor-pointer flex items-center">
              <StatusBadge status={info.getValue()} interactive />
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
        );
      },
    }),
    columnHelper.accessor('assignedPerson', {
      header: 'Assigned Person',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300 shrink-0">
            {info.getValue().substring(0, 2).toUpperCase()}
          </div>
          <span className="text-zinc-300 text-sm">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created Date',
      cell: (info) => (
        <span className="text-zinc-500 text-sm">
          {format(new Date(info.getValue()), 'MMM dd, yyyy')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const ticket = info.row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 px-3 text-xs font-semibold text-zinc-450 hover:text-zinc-100 hover:bg-zinc-800/80 flex items-center justify-center gap-1.5 rounded-md border border-zinc-850 bg-zinc-900/30 transition-colors outline-none cursor-pointer">
              <span>Action</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
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
                className="hover:bg-red-950/80 hover:text-red-300 text-red-400 gap-2 cursor-pointer"
              >
                <Trash className="h-4 w-4 text-red-500/80" />
                Delete Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10 min-h-[300px]">
        <span className="text-zinc-500 text-sm">No tickets found matching current filters.</span>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800/80 rounded-xl bg-zinc-900/20 backdrop-blur-sm overflow-hidden shadow-xl">
      <Table>
        <TableHeader className="bg-zinc-900/50 border-zinc-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent border-zinc-800">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-zinc-400 font-semibold text-xs uppercase tracking-wider h-10">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-zinc-900/30 border-zinc-800 transition-colors duration-150"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-3 h-14">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
