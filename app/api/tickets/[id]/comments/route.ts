import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/lib/models/Ticket';
import { commentSchema } from '@/validators/ticket';

// POST /api/tickets/:id/comments
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const validation = commentSchema.safeParse(body);
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

    const newComment = {
      message: validation.data.message,
      author: validation.data.author,
      createdAt: new Date(),
    };

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: newComment,
          history: {
            message: `Comment added by ${validation.data.author}`,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
