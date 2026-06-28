import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, CircleDot, Clock, AlertTriangle } from 'lucide-react';

interface TicketSummary {
  status: string;
  priority: string;
}

interface StatsCardsProps {
  tickets: TicketSummary[];
}

export default function StatsCards({ tickets = [] }: StatsCardsProps) {
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === 'Open').length;
  const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
  const highPriority = tickets.filter((t) => t.priority === 'High').length;

  const cards = [
    {
      title: 'Total Tickets',
      value: total,
      icon: Ticket,
      description: 'All tickets in system',
      color: 'text-zinc-400',
    },
    {
      title: 'Open',
      value: open,
      icon: CircleDot,
      description: 'Awaiting triage / assignment',
      color: 'text-blue-400',
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      description: 'Currently being resolved',
      color: 'text-orange-400',
    },
    {
      title: 'High Priority',
      value: highPriority,
      icon: AlertTriangle,
      description: 'Urgent issues needing attention',
      color: 'text-red-400',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm shadow-md transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight text-zinc-100">{card.value}</div>
              <p className="text-xs text-zinc-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
