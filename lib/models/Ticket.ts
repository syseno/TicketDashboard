import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment {
  message: string;
  author: string;
  createdAt: Date;
}

export interface IHistory {
  message: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  title: string;
  issueCategory: 'Hardware' | 'Software' | 'Network' | 'Security' | 'Account' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedPerson: string;
  comments: IComment[];
  history: IHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  message: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

const HistorySchema = new Schema<IHistory>({
  message: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

const TicketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true, trim: true },
    issueCategory: {
      type: String,
      required: true,
      enum: ['Hardware', 'Software', 'Network', 'Security', 'Account', 'Other'],
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    assignedPerson: { type: String, required: true, trim: true },
    comments: [CommentSchema],
    history: [HistorySchema],
  },
  {
    timestamps: true,
  }
);

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
