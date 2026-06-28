import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/lib/models/Ticket';
import { ticketStatusSchema } from '@/validators/ticket';

// PATCH /api/tickets/:id/status
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const validation = ticketStatusSchema.safeParse(body);
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

    const oldStatus = currentTicket.status;
    const newStatus = validation.data.status;

    if (oldStatus === newStatus) {
      return NextResponse.json(currentTicket);
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        $set: { status: newStatus },
        $push: {
          history: {
            message: `Status updated from ${oldStatus} to ${newStatus}`,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error patching ticket status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
