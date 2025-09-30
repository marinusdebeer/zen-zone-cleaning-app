import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessagesClient } from './messages-client';

export default async function MessagesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  
  if (!selectedOrgId) {
    return <div>No organization selected</div>;
  }

  // Mock messages data
  const conversations = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah@example.com',
      lastMessage: 'Thank you! The team did an amazing job. Can we schedule for next week?',
      timestamp: new Date('2025-01-29T14:30:00'),
      unread: 2,
      messages: [
        {
          id: '1',
          sender: 'client' as const,
          text: 'Hi, I would like to schedule a deep clean',
          timestamp: new Date('2025-01-29T10:00:00'),
        },
        {
          id: '2',
          sender: 'business' as const,
          text: 'Hello Sarah! We would be happy to help. What date works best for you?',
          timestamp: new Date('2025-01-29T10:15:00'),
        },
        {
          id: '3',
          sender: 'client' as const,
          text: 'This Friday afternoon would be perfect',
          timestamp: new Date('2025-01-29T10:20:00'),
        },
        {
          id: '4',
          sender: 'business' as const,
          text: 'Great! I have scheduled you for Friday at 2:00 PM',
          timestamp: new Date('2025-01-29T10:25:00'),
        },
        {
          id: '5',
          sender: 'client' as const,
          text: 'Thank you! The team did an amazing job. Can we schedule for next week?',
          timestamp: new Date('2025-01-29T14:30:00'),
        },
      ],
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      clientEmail: 'mike@example.com',
      lastMessage: 'Sounds good, see you then!',
      timestamp: new Date('2025-01-28T16:45:00'),
      unread: 0,
      messages: [],
    },
    {
      id: '3',
      clientName: 'Lisa Davis',
      clientEmail: 'lisa@example.com',
      lastMessage: 'Could we move the appointment to 3 PM instead?',
      timestamp: new Date('2025-01-27T09:15:00'),
      unread: 1,
      messages: [],
    },
  ];

  return <MessagesClient conversations={conversations} />;
}