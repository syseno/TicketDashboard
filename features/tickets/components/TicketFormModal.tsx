'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketSchema, TicketFormValues } from '@/validators/ticket';
import { useTicketStore } from '@/store/useTicketStore';
import { useCreateTicketMutation, useUpdateTicketMutation } from '@/hooks/useTickets';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function TicketFormModal() {
  const store = useTicketStore();
  const createMutation = useCreateTicketMutation();
  const updateMutation = useUpdateTicketMutation();

  const isEdit = !!store.editingTicket;
  const isOpen = isEdit ? store.isEditOpen : store.isCreateOpen;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: '',
      issueCategory: 'Hardware',
      priority: 'Low',
      status: 'Open',
      assignedPerson: '',
    },
  });

  // Prepopulate form if editing
  useEffect(() => {
    if (isEdit && store.editingTicket) {
      reset({
        title: store.editingTicket.title,
        issueCategory: store.editingTicket.issueCategory,
        priority: store.editingTicket.priority,
        status: store.editingTicket.status,
        assignedPerson: store.editingTicket.assignedPerson,
      });
    } else {
      reset({
        title: '',
        issueCategory: 'Hardware',
        priority: 'Low',
        status: 'Open',
        assignedPerson: '',
      });
    }
  }, [isEdit, store.editingTicket, reset, isOpen]);

  const handleClose = () => {
    if (isEdit) {
      store.setEditingTicket(null);
      store.setEditOpen(false);
    } else {
      store.setCreateOpen(false);
    }
  };

  const onSubmit = async (values: TicketFormValues) => {
    try {
      if (isEdit && store.editingTicket) {
        await updateMutation.mutateAsync({
          id: store.editingTicket._id,
          data: values,
        });
        toast.success('Ticket updated successfully');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Ticket created successfully');
      }
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving the ticket');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px] bg-zinc-900 border-zinc-800 text-zinc-100 p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-100">
            {isEdit ? 'Edit IT Ticket' : 'Create IT Ticket'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-300 text-sm font-medium">
              Ticket Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., VPN login Gateway Timeout"
              className="bg-zinc-950 border-zinc-850 text-zinc-100 focus-visible:ring-zinc-700"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-red-400 font-medium mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Issue Category */}
          <div className="space-y-2">
            <Label htmlFor="issueCategory" className="text-zinc-300 text-sm font-medium">
              Issue Category
            </Label>
            <Controller
              name="issueCategory"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-850 text-zinc-100 focus:ring-zinc-700">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-850 text-zinc-100">
                    {['Hardware', 'Software', 'Network', 'Security', 'Account', 'Other'].map((cat) => (
                      <SelectItem key={cat} value={cat} className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-zinc-50 cursor-pointer">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.issueCategory && (
              <p className="text-xs text-red-400 font-medium mt-1">{errors.issueCategory.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-zinc-300 text-sm font-medium">
                Priority
              </Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-850 text-zinc-100 focus:ring-zinc-700">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-850 text-zinc-100">
                      {['Low', 'Medium', 'High'].map((prio) => (
                        <SelectItem key={prio} value={prio} className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-zinc-50 cursor-pointer">
                          {prio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-xs text-red-400 font-medium mt-1">{errors.priority.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-zinc-300 text-sm font-medium">
                Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-850 text-zinc-100 focus:ring-zinc-700">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-850 text-zinc-100">
                      {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                        <SelectItem key={s} value={s} className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-zinc-50 cursor-pointer">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-xs text-red-400 font-medium mt-1">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Assigned Person */}
          <div className="space-y-2">
            <Label htmlFor="assignedPerson" className="text-zinc-300 text-sm font-medium">
              Assigned IT Agent
            </Label>
            <Input
              id="assignedPerson"
              placeholder="e.g., Alex Johnson"
              className="bg-zinc-950 border-zinc-850 text-zinc-100 focus-visible:ring-zinc-700"
              {...register('assignedPerson')}
            />
            {errors.assignedPerson && (
              <p className="text-xs text-red-400 font-medium mt-1">{errors.assignedPerson.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-colors"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Ticket' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
