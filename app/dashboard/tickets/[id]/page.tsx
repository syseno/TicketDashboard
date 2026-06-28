'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTicketDetailsQuery, useAddCommentMutation, useUpdateStatusMutation, useUpdatePriorityMutation } from '@/hooks/useTickets';
import { StatusBadge, PriorityBadge } from '@/features/tickets/components/TicketTable';
import { format } from 'date-fns';
import { MessageSquare, User, Calendar, History, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const { data: ticket, isLoading, isError } = useTicketDetailsQuery(ticketId);
  const addCommentMutation = useAddCommentMutation();
  const updateStatusMutation = useUpdateStatusMutation();
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

  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (ticket) {
      setAuthor(ticket.assignedPerson || '');
    }
  }, [ticket]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');

    if (!author.trim()) {
      setCommentError('Author name is required');
      return;
    }
    if (!message.trim()) {
      setCommentError('Comment message cannot be empty');
      return;
    }

    try {
      await addCommentMutation.mutateAsync({
        id: ticket._id,
        comment: {
          author: author.trim(),
          message: message.trim(),
        },
      });
      toast.success('Comment added successfully');
      setMessage('');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-2 h-9"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 font-extrabold shadow-md">
              IT
            </div>
            <span className="font-semibold text-lg tracking-tight text-zinc-100">Ticket Tracking</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-zinc-500 mb-3" />
            <span className="text-zinc-500 text-sm">Loading ticket details...</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <ShieldAlert className="h-10 w-10 text-red-500" />
            <p className="text-red-400 font-semibold">Failed to load ticket details.</p>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {ticket && !isLoading && (
          <div className="max-w-5xl mx-auto space-y-8">

            {/* ── Header ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>Ticket #{ticket._id.substring(ticket._id.length - 6)}</span>
                <span>•</span>
                <span>Category: {ticket.issueCategory}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
                {ticket.title}
              </h1>
            </div>

            {/* ── Details & Activity History ── */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Details Card */}
              <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 space-y-5">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Status</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="outline-none cursor-pointer flex items-center">
                        <StatusBadge status={ticket.status} interactive />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 min-w-[130px]">
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
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Priority</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="outline-none cursor-pointer flex items-center">
                        <PriorityBadge priority={ticket.priority} interactive />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 min-w-[130px]">
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
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Assignee</span>
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      <User className="h-4 w-4 text-zinc-500" />
                      {ticket.assignedPerson}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Created</span>
                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      {format(new Date(ticket.createdAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Updated</span>
                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      {format(new Date(ticket.updatedAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity History Card */}
              <div className="md:col-span-3 bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 space-y-5">
                <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                  <History className="h-3.5 w-3.5" />
                  Activity History
                </h3>
                <div className="space-y-4 pl-1">
                  {ticket.history?.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">No history logs.</p>
                  ) : (
                    ticket.history.map((hist: { message: string; createdAt: string }, index: number) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-zinc-700 mt-1.5" />
                          {index < ticket.history.length - 1 && (
                            <div className="w-[1px] grow bg-zinc-800/80 my-1" />
                          )}
                        </div>
                        <div className="flex flex-col pb-2">
                          <span className="text-zinc-300 leading-snug">{hist.message}</span>
                          <span className="text-zinc-500 text-xs mt-0.5">
                            {format(new Date(hist.createdAt), 'MMM dd, h:mm a')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ── Comments Section ── */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 space-y-6">
              <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({ticket.comments?.length || 0})
              </h3>

              <div className="space-y-4">
                {ticket.comments?.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic">No comments posted yet.</p>
                ) : (
                  ticket.comments.map((comment: { author: string; message: string; createdAt: string }, index: number) => (
                    <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-3 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <div className="font-semibold text-zinc-300 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400 border border-zinc-700 shrink-0 aspect-square">
                            {comment.author.substring(0, 2).toUpperCase()}
                          </div>
                          {comment.author}
                        </div>
                        <span className="text-zinc-500 text-xs">
                          {format(new Date(comment.createdAt), 'MMM dd, h:mm a')}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{comment.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-4 pt-6 border-t border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="c-author" className="text-zinc-400 text-sm font-medium">Your Name</Label>
                    <Input
                      id="c-author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Name"
                      className="bg-zinc-950 border-zinc-800 text-sm text-zinc-100 focus-visible:ring-zinc-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-message" className="text-zinc-400 text-sm font-medium">New Comment</Label>
                  <Textarea
                    id="c-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a comment to this ticket..."
                    className="bg-zinc-950 border-zinc-800 text-sm text-zinc-100 focus-visible:ring-zinc-700 resize-none"
                  />
                </div>
                {commentError && (
                  <p className="text-sm text-red-400 font-medium">{commentError}</p>
                )}
                <Button
                  type="submit"
                  disabled={addCommentMutation.isPending}
                  className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                >
                  {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
