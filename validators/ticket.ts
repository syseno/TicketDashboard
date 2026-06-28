import { z } from 'zod';

export const ticketSchema = z.object({
  title: z.string().trim().min(3, { message: 'Title must be at least 3 characters long' }),
  issueCategory: z.enum(['Hardware', 'Software', 'Network', 'Security', 'Account', 'Other'], {
    message: 'Please select a valid issue category',
  }),
  priority: z.enum(['Low', 'Medium', 'High'], {
    message: 'Please select a valid priority',
  }),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed'], {
    message: 'Please select a valid status',
  }),
  assignedPerson: z.string().trim().min(2, { message: 'Assigned person name must be at least 2 characters long' }),
});

export const commentSchema = z.object({
  message: z.string().trim().min(1, { message: 'Comment message cannot be empty' }),
  author: z.string().trim().min(2, { message: 'Author name must be at least 2 characters long' }),
});

export const ticketStatusSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed'], {
    message: 'Please select a valid status',
  }),
});
export type TicketFormValues = z.infer<typeof ticketSchema>;
