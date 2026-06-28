import mongoose from 'mongoose';
import Ticket from '../lib/models/Ticket';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in .env or .env.local');
  process.exit(1);
}

const mockTickets = [
  {
    title: 'Laptop screen flickering after system update',
    issueCategory: 'Hardware',
    priority: 'Medium',
    status: 'In Progress',
    assignedPerson: 'Alex Johnson',
    comments: [
      {
        message: 'Updated graphics driver, but flickering persists. Testing external monitor.',
        author: 'Alex Johnson',
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 24) },
      { message: 'Assigned to Alex Johnson', createdAt: new Date(Date.now() - 3600000 * 20) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 18) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 24),
  },
  {
    title: 'VPN connection failing with Gateway Timeout',
    issueCategory: 'Network',
    priority: 'High',
    status: 'Open',
    assignedPerson: 'Jane Smith',
    comments: [],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 2) },
      { message: 'Assigned to Jane Smith', createdAt: new Date(Date.now() - 3600000 * 1.5) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    title: 'Adobe Creative Cloud license expired',
    issueCategory: 'Software',
    priority: 'Low',
    status: 'Resolved',
    assignedPerson: 'Michael Brown',
    comments: [
      {
        message: 'License renewed and provisioned to the user. User verified Adobe is working.',
        author: 'Michael Brown',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 6) },
      { message: 'Assigned to Michael Brown', createdAt: new Date(Date.now() - 3600000 * 5) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 4) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 2) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 6),
  },
  {
    title: 'Password reset requested for payroll portal',
    issueCategory: 'Account',
    priority: 'Medium',
    status: 'Closed',
    assignedPerson: 'Emily Davis',
    comments: [
      {
        message: 'Temp password shared via secure channel. User confirmed password changed.',
        author: 'Emily Davis',
        createdAt: new Date(Date.now() - 3600000 * 20),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 24) },
      { message: 'Assigned to Emily Davis', createdAt: new Date(Date.now() - 3600000 * 23) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 22) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 20) },
      { message: 'Status updated from Resolved to Closed', createdAt: new Date(Date.now() - 3600000 * 10) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 24),
  },
  {
    title: 'Phishing email reported by marketing manager',
    issueCategory: 'Security',
    priority: 'High',
    status: 'In Progress',
    assignedPerson: 'Sarah Wilson',
    comments: [
      {
        message: 'Analyzing email headers. Domain is blocked at gateway. Scanning recipient workstation.',
        author: 'Sarah Wilson',
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 5) },
      { message: 'Assigned to Sarah Wilson', createdAt: new Date(Date.now() - 3600000 * 4.5) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 3) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    title: 'Broken office printer on the 3rd floor',
    issueCategory: 'Hardware',
    priority: 'Low',
    status: 'Open',
    assignedPerson: 'Alex Johnson',
    comments: [],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 8) },
      { message: 'Assigned to Alex Johnson', createdAt: new Date(Date.now() - 3600000 * 7) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 8),
  },
  {
    title: 'Slow Wi-Fi connection in Meeting Room B',
    issueCategory: 'Network',
    priority: 'Medium',
    status: 'Resolved',
    assignedPerson: 'Jane Smith',
    comments: [
      {
        message: 'Rebooted AP-04. Signal strength and throughput are back to normal.',
        author: 'Jane Smith',
        createdAt: new Date(Date.now() - 3600000 * 8),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 12) },
      { message: 'Assigned to Jane Smith', createdAt: new Date(Date.now() - 3600000 * 11) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 10) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 8) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
  {
    title: 'Keyboard replacement for new developer workstation',
    issueCategory: 'Hardware',
    priority: 'Low',
    status: 'Closed',
    assignedPerson: 'Michael Brown',
    comments: [
      {
        message: 'MX Keys keyboard delivered to user desk.',
        author: 'Michael Brown',
        createdAt: new Date(Date.now() - 3600000 * 40),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 48) },
      { message: 'Assigned to Michael Brown', createdAt: new Date(Date.now() - 3600000 * 45) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 44) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 40) },
      { message: 'Status updated from Resolved to Closed', createdAt: new Date(Date.now() - 3600000 * 30) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 48),
  },
  {
    title: 'Request to grant access to repository "core-billing"',
    issueCategory: 'Account',
    priority: 'Medium',
    status: 'Open',
    assignedPerson: 'Sarah Wilson',
    comments: [],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 1) },
      { message: 'Assigned to Sarah Wilson', createdAt: new Date(Date.now() - 3600000 * 0.8) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 1),
  },
  {
    title: 'Suspicious login attempt from unknown IP (Security Alert)',
    issueCategory: 'Security',
    priority: 'High',
    status: 'Resolved',
    assignedPerson: 'Sarah Wilson',
    comments: [
      {
        message: 'User confirmed they were traveling and using a VPN during the login attempt. Confirmed safe.',
        author: 'Sarah Wilson',
        createdAt: new Date(Date.now() - 3600000 * 15),
      },
    ],
    history: [
      { message: 'Ticket created by system', createdAt: new Date(Date.now() - 3600000 * 18) },
      { message: 'Assigned to Sarah Wilson', createdAt: new Date(Date.now() - 3600000 * 17) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 16) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 15) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 18),
  },
  {
    title: 'Request memory upgrade to 32GB for dev machine',
    issueCategory: 'Hardware',
    priority: 'Medium',
    status: 'In Progress',
    assignedPerson: 'Michael Brown',
    comments: [
      {
        message: 'RAM stock is available. Waiting for user to bring laptop to the IT bar.',
        author: 'Michael Brown',
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 36) },
      { message: 'Assigned to Michael Brown', createdAt: new Date(Date.now() - 3600000 * 30) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 12) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 36),
  },
  {
    title: 'Unable to access shared drive (Permission Denied)',
    issueCategory: 'Account',
    priority: 'Medium',
    status: 'Open',
    assignedPerson: 'Emily Davis',
    comments: [],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 3) },
      { message: 'Assigned to Emily Davis', createdAt: new Date(Date.now() - 3600000 * 2.8) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 3),
  },
  {
    title: 'Anti-virus flag on local developer tool helper.exe',
    issueCategory: 'Security',
    priority: 'High',
    status: 'Closed',
    assignedPerson: 'Sarah Wilson',
    comments: [
      {
        message: 'Analyzed binary in sandbox. It is a false positive. Added file to security exception list.',
        author: 'Sarah Wilson',
        createdAt: new Date(Date.now() - 3600000 * 22),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 30) },
      { message: 'Assigned to Sarah Wilson', createdAt: new Date(Date.now() - 3600000 * 28) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 25) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 22) },
      { message: 'Status updated from Resolved to Closed', createdAt: new Date(Date.now() - 3600000 * 12) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 30),
  },
  {
    title: 'Configure new employee laptop (MacBook Pro 16")',
    issueCategory: 'Hardware',
    priority: 'High',
    status: 'Resolved',
    assignedPerson: 'Alex Johnson',
    comments: [
      {
        message: 'Installed base developer tooling and configured Jamf MDM profile. Shipped to employee address.',
        author: 'Alex Johnson',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
    history: [
      { message: 'Ticket created by HR', createdAt: new Date(Date.now() - 3600000 * 15) },
      { message: 'Assigned to Alex Johnson', createdAt: new Date(Date.now() - 3600000 * 14) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 10) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 2) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 15),
  },
  {
    title: 'Microsoft Teams audio cutting out during video calls',
    issueCategory: 'Software',
    priority: 'Medium',
    status: 'Open',
    assignedPerson: 'Michael Brown',
    comments: [],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 7) },
      { message: 'Assigned to Michael Brown', createdAt: new Date(Date.now() - 3600000 * 6) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 7),
  },
  {
    title: 'Docking station not charging laptop or detecting monitor',
    issueCategory: 'Hardware',
    priority: 'Low',
    status: 'In Progress',
    assignedPerson: 'Alex Johnson',
    comments: [
      {
        message: 'Need user to run system BIOS updates. USB-C firmware update might resolve the dock negotiation bug.',
        author: 'Alex Johnson',
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 10) },
      { message: 'Assigned to Alex Johnson', createdAt: new Date(Date.now() - 3600000 * 9) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 5) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 10),
  },
  {
    title: 'Request to restore deleted folder on team drive',
    issueCategory: 'Other',
    priority: 'High',
    status: 'Closed',
    assignedPerson: 'Jane Smith',
    comments: [
      {
        message: 'Restored the folder "Q4-Projections" from the daily backup dated 2026-06-25.',
        author: 'Jane Smith',
        createdAt: new Date(Date.now() - 3600000 * 30),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 32) },
      { message: 'Assigned to Jane Smith', createdAt: new Date(Date.now() - 3600000 * 31.5) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 31) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 30) },
      { message: 'Status updated from Resolved to Closed', createdAt: new Date(Date.now() - 3600000 * 20) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 32),
  },
  {
    title: 'Office guest Wi-Fi portal redirect loop',
    issueCategory: 'Network',
    priority: 'Medium',
    status: 'Resolved',
    assignedPerson: 'Jane Smith',
    comments: [
      {
        message: 'Fixed DNS wildcard forwarding rule. Portal successfully redirects now.',
        author: 'Jane Smith',
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 8) },
      { message: 'Assigned to Jane Smith', createdAt: new Date(Date.now() - 3600000 * 7.5) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 6) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 4) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 8),
  },
  {
    title: 'Port forwarding request for testing local API webhooks',
    issueCategory: 'Other',
    priority: 'Low',
    status: 'In Progress',
    assignedPerson: 'Emily Davis',
    comments: [
      {
        message: 'Checking if ngrok or cloudflare tunnels can be used instead of open ports to avoid security risk.',
        author: 'Emily Davis',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 4) },
      { message: 'Assigned to Emily Davis', createdAt: new Date(Date.now() - 3600000 * 3.5) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 2) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 4),
  },
  {
    title: 'Slack App installation request for Github Integration',
    issueCategory: 'Software',
    priority: 'Low',
    status: 'Closed',
    assignedPerson: 'Michael Brown',
    comments: [
      {
        message: 'Approved and whitelisted the Github Slack App for enterprise workspace.',
        author: 'Michael Brown',
        createdAt: new Date(Date.now() - 3600000 * 40),
      },
    ],
    history: [
      { message: 'Ticket created by user', createdAt: new Date(Date.now() - 3600000 * 45) },
      { message: 'Assigned to Michael Brown', createdAt: new Date(Date.now() - 3600000 * 44) },
      { message: 'Status updated from Open to In Progress', createdAt: new Date(Date.now() - 3600000 * 43) },
      { message: 'Status updated from In Progress to Resolved', createdAt: new Date(Date.now() - 3600000 * 40) },
      { message: 'Status updated from Resolved to Closed', createdAt: new Date(Date.now() - 3600000 * 35) },
    ],
    createdAt: new Date(Date.now() - 3600000 * 45),
  },
];

async function seed() {
  console.log('Seeding database with sample IT tickets...');
  try {
    const opts = {
      bufferCommands: false,
    };
    await mongoose.connect(MONGODB_URI!, opts);
    console.log('Connected to MongoDB.');

    // Clear existing tickets
    const deleteResult = await Ticket.deleteMany({});
    console.log(`Cleared existing tickets. Deleted ${deleteResult.deletedCount} items.`);

    // Insert mock tickets
    const inserted = await Ticket.insertMany(mockTickets);
    console.log(`Successfully seeded ${inserted.length} realistic IT tickets!`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
