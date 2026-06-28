'use client';

import React, { useState, useEffect } from 'react';
import { useTicketDetailsQuery, useAddCommentMutation, useUpdateStatusMutation, useUpdatePriorityMutation } from '@/hooks/useTickets';
import { useTicketStore } from '@/store/useTicketStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge, PriorityBadge } from './TicketTable';
import { format } from 'date-fns';
import { MessageSquare, User, Calendar, History, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function TicketDetailModal() {
  const store = useTicketStore();
  const { data: ticket, isLoading, isError } = useTicketDetailsQuery(store.selectedTicketId);
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

  // Set default author name when ticket loads
  useEffect(() => {
    if (ticket) {
      setAuthor(ticket.assignedPerson || '');
    }
  }, [ticket]);

  const handleClose = () => {
    store.setSelectedTicketId(null);
    store.setDetailOpen(false);
    setMessage('');
    setCommentError('');
  };

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
    } catch (err: any) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <Dialog open={store.isDetailOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-4xl h-[85vh] max-h-[750px] !flex !flex-col !gap-0 bg-zinc-900 border-zinc-800 text-zinc-100 !p-0 overflow-hidden sm:rounded-xl"
      >
        {isLoading && (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        )}

        {isError && (
          <div className="flex h-[400px] flex-col items-center justify-center gap-2 p-8">
            <p className="text-red-400 font-semibold">Failed to load ticket details.</p>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        )}

        {ticket && !isLoading && (
          <>

            {/* ── FIXED TOP: Header ── */}
            <div className="flex-none px-8 pt-8 pb-5 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                <span>Ticket #{ticket._id.substring(ticket._id.length - 6)}</span>
                <span>•</span>
                <span>Category: {ticket.issueCategory}</span>
              </div>
              <DialogTitle className="text-xl font-semibold text-zinc-100 leading-tight">
                {ticket.title}
              </DialogTitle>
            </div>

            {/* ── FIXED TOP: Details & Activity History ── */}
            <div className="flex-none px-8 py-6 bg-zinc-900/10 border-b border-zinc-800">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Details */}
                <div className="md:col-span-2 space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Details</h3>
                  <div className="space-y-2.5 text-xs">
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
                      <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                        <User className="h-3.5 w-3.5 text-zinc-500" />
                        {ticket.assignedPerson}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Created</span>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        {format(new Date(ticket.createdAt), 'MMM dd, yyyy h:mm a')}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Updated</span>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        {format(new Date(ticket.updatedAt), 'MMM dd, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity History */}
                <div className="md:col-span-3 space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    <History className="h-3.5 w-3.5" />
                    Activity History
                  </h3>
                  <div className="space-y-2.5 pl-1 max-h-[120px] overflow-y-auto pr-2">
                    {ticket.history?.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No history logs.</p>
                    ) : (
                      ticket.history.map((hist: any, index: number) => (
                        <div key={index} className="flex gap-2.5 text-xs">
                          <div className="flex flex-col items-center">
                            <div className="h-2 w-2 rounded-full bg-zinc-700 mt-1" />
                            {index < ticket.history.length - 1 && (
                              <div className="w-[1px] grow bg-zinc-800/80 my-1" />
                            )}
                          </div>
                          <div className="flex flex-col pb-1">
                            <span className="text-zinc-300 leading-tight">{hist.message}</span>
                            <span className="text-zinc-500 text-[10px] mt-0.5">
                              {format(new Date(hist.createdAt), 'MMM dd, h:mm a')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── SCROLLABLE MIDDLE: Comments List ── */}
            <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
              <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4" />
                Comments ({ticket.comments?.length || 0})
              </h3>

              <div className="space-y-4">
                {ticket.comments?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No comments posted yet.</p>
                ) : (
                  ticket.comments.map((comment: any, index: number) => (
                    <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-3 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <div className="font-semibold text-zinc-300 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400 border border-zinc-700 shrink-0 aspect-square">
                            {comment.author.substring(0, 2).toUpperCase()}
                          </div>
                          {comment.author}
                        </div>
                        <span className="text-zinc-500 text-[10px]">
                          {format(new Date(comment.createdAt), 'MMM dd, h:mm a')}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{comment.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── PINNED BOTTOM: Comment Form ── */}
            <div className="flex-none px-8 py-6 bg-zinc-950/40 border-t border-zinc-800">
              <form onSubmit={handleAddComment} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="c-author" className="text-zinc-400 text-xs font-medium">Your Name</Label>
                  <Input
                    id="c-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Name"
                    className="h-9 bg-zinc-950 border-zinc-800 text-sm text-zinc-100 focus-visible:ring-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-message" className="text-zinc-400 text-xs font-medium">New Comment</Label>
                  <Textarea
                    id="c-message"
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a comment to this ticket..."
                    className="bg-zinc-950 border-zinc-800 text-sm text-zinc-100 focus-visible:ring-zinc-700 resize-none"
                  />
                </div>
                {commentError && (
                  <p className="text-[11px] text-red-400 font-medium">{commentError}</p>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={addCommentMutation.isPending}
                  className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                >
                  {addCommentMutation.isPending ? 'Posting...' : 'Comment'}
                </Button>
              </form>
            </div>

          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
