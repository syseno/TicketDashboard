import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/lib/models/Ticket';
import { ticketSchema } from '@/validators/ticket';
import { PipelineStage } from 'mongoose';

interface TicketMatchStage {
  $or?: Array<{ title?: { $regex: string; $options: string }; assignedPerson?: { $regex: string; $options: string } }>;
  status?: string;
  priority?: string;
  issueCategory?: string;
}

// GET /api/tickets
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'createdAt';

    // Build Match Stage for Mongo Aggregation Pipeline
    const matchStage: TicketMatchStage = {};

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { assignedPerson: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      matchStage.status = status;
    }

    if (priority) {
      matchStage.priority = priority;
    }

    if (category) {
      matchStage.issueCategory = category;
    }

    const pipeline: PipelineStage[] = [{ $match: matchStage }];

    // Handle Custom Sorting Weights
    if (sort === 'priority') {
      pipeline.push({
        $addFields: {
          priorityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'High'] }, then: 3 },
                { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                { case: { $eq: ['$priority', 'Low'] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      });
      pipeline.push({ $sort: { priorityWeight: -1, createdAt: -1 } });
    } else if (sort === 'status') {
      pipeline.push({
        $addFields: {
          statusWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'Open'] }, then: 1 },
                { case: { $eq: ['$status', 'In Progress'] }, then: 2 },
                { case: { $eq: ['$status', 'Resolved'] }, then: 3 },
                { case: { $eq: ['$status', 'Closed'] }, then: 4 },
              ],
              default: 5,
            },
          },
        },
      });
      pipeline.push({ $sort: { statusWeight: 1, createdAt: -1 } });
    } else if (sort === 'title') {
      pipeline.push({ $sort: { title: 1, createdAt: -1 } });
    } else {
      // Default: sort by newest created
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    const tickets = await Ticket.aggregate(pipeline);

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// POST /api/tickets
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const validation = ticketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const ticketData = {
      ...validation.data,
      comments: [],
      history: [
        {
          message: `Ticket created by ${validation.data.assignedPerson}`,
          createdAt: new Date(),
        },
      ],
    };

    const newTicket = await Ticket.create(ticketData);

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
