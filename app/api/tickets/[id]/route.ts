import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/lib/models/Ticket';
import { ticketSchema } from '@/validators/ticket';

// GET /api/tickets/:id
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

// PUT /api/tickets/:id
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const validation = ticketSchema.safeParse(body);
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

    // Capture changes to build a descriptive history message
    const changes: string[] = [];
    if (currentTicket.title !== validation.data.title) changes.push('title');
    if (currentTicket.issueCategory !== validation.data.issueCategory) changes.push('category');
    if (currentTicket.priority !== validation.data.priority) changes.push('priority');
    if (currentTicket.status !== validation.data.status) changes.push('status');
    if (currentTicket.assignedPerson !== validation.data.assignedPerson) changes.push('assignee');

    const historyMessage = changes.length > 0 
      ? `Ticket updated (${changes.join(', ')})`
      : 'Ticket updated (no values changed)';

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        $set: {
          title: validation.data.title,
          issueCategory: validation.data.issueCategory,
          priority: validation.data.priority,
          status: validation.data.status,
          assignedPerson: validation.data.assignedPerson,
        },
        $push: {
          history: {
            message: historyMessage,
            createdAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

// DELETE /api/tickets/:id
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedTicket = await Ticket.findByIdAndDelete(id);
    if (!deletedTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}
