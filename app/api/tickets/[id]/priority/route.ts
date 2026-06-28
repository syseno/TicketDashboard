import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/lib/models/Ticket';
import { z } from 'zod';

const ticketPrioritySchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High'], {
    message: 'Please select a valid priority',
  }),
});

// PATCH /api/tickets/:id/priority
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const validation = ticketPrioritySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const currentTicket = await Ticket.findById(id);
    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const oldPriority = currentTicket.priority;
    const newPriority = validation.data.priority;

    if (oldPriority === newPriority) {
      return NextResponse.json(currentTicket);
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        $set: { priority: newPriority },
        $push: {
          history: {
            message: `Priority updated from ${oldPriority} to ${newPriority}`,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error patching ticket priority:', error);
    return NextResponse.json({ error: 'Failed to update priority' }, { status: 500 });
  }
}
