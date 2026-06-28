# Internal IT Ticket Dashboard

A production-ready, highly-polished Internal IT Ticket Dashboard built with Next.js 15, React 19, Tailwind CSS, shadcn/ui, TanStack Table, TanStack Query, Zustand, and MongoDB.

## Features

- **Stats Cards**: Displays Total, Open, In Progress, and High Priority tickets. Automatically updates upon CRUD operations.
- **Search & Filter**: Global search on ticket title and assigned agent. Filters by category, priority, status, and custom weighted sorting.
- **Ticket Table**: Interactive table with quick actions to view details, update status, edit, and delete.
- **Detail View**: Interactive sidebar panel to view detailed metadata, view comments feed, add comments, and track the lifecycle audit history.
- **Form Modals**: Fully validated forms with React Hook Form and Zod validation.
- **Database Seeding**: Easily pre-populate the DB with 20 realistic IT tickets.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, Tailwind CSS, shadcn/ui
- **State Management**: Zustand (UI State), TanStack Query v5 (Server State)
- **Forms & Validation**: React Hook Form, Zod
- **Database**: MongoDB & Mongoose ODM

---

## Prerequisites

- Node.js >= 18.x
- MongoDB instance (local or Atlas)

---

## Getting Started

### 1. Clone & Set Up Directory

Ensure you are inside the project folder:
```bash
cd scratch/it-ticket-dashboard
```

### 2. Environment Variables

Create a `.env` (or `.env.local`) file in the root of the project:

```env
MONGODB_URI=mongodb://localhost:27017/it-tickets
```

> [!NOTE]
> Replace the connection string with your active MongoDB database credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Seed the Database

To populate your database with 20 realistic IT tickets:
```bash
npx tsx scripts/start-mongo.ts
```

### 5. Run Locally

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Documentation

### Ticket APIs

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/api/tickets` | Retrieve all tickets. Supports query parameters `search`, `status`, `priority`, `category`, `sort`. |
| **POST** | `/api/tickets` | Create a new ticket. |
| **GET** | `/api/tickets/:id` | Retrieve details for a single ticket. |
| **PUT** | `/api/tickets/:id` | Update all fields of a ticket. |
| **DELETE** | `/api/tickets/:id` | Delete a ticket. |
| **PATCH** | `/api/tickets/:id/status` | Update only the status of a ticket. |
| **PATCH** | `/api/tickets/:id/priority` | Update only the priority of a ticket. |
| **POST** | `/api/tickets/:id/comments` | Add a comment to a ticket. |

---

## Folder Structure

```text
it-ticket-dashboard/
├── app/
│   ├── api/                    # Route Handlers
│   │   └── tickets/
│   │       ├── [id]/
│   │       │   ├── comments/
│   │       │   │   └── route.ts
│   │       │   ├── priority/
│   │       │   │   └── route.ts
│   │       │   ├── status/
│   │       │   │   └── route.ts
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── dashboard/              # Dashboard page view
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx              # Global providers wrap
│   └── page.tsx                # Homepage redirect
├── components/
│   ├── dashboard/
│   │   └── StatsCards.tsx      # Stats counters
│   ├── ui/                     # shadcn UI components
│   └── Providers.tsx           # QueryClient & Toast wrap
├── features/
│   └── tickets/
│       └── components/
│           ├── TicketDetailModal.tsx
│           ├── TicketFormModal.tsx
│           └── TicketTable.tsx
├── hooks/
│   └── useTickets.ts           # TanStack Query query/mutation hooks
├── lib/
│   ├── models/
│   │   └── Ticket.ts           # Mongoose schemas
│   ├── mongodb.ts              # Cached DB connection
│   └── utils.ts                # Tailwind merge helper
├── scripts/
│   └── seed.ts                 # Database seed script
├── store/
│   └── useTicketStore.ts       # Zustand UI state store
├── validators/
│   └── ticket.ts               # Zod validations schemas
├── .env                        # Local variables config
├── tsconfig.json
└── package.json
```
