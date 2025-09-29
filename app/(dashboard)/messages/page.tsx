import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, Send, User, Clock } from 'lucide-react';

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
          sender: 'client',
          text: 'Hi, I would like to schedule a deep clean',
          timestamp: new Date('2025-01-29T10:00:00'),
        },
        {
          id: '2',
          sender: 'business',
          text: 'Hello Sarah! We would be happy to help. What date works best for you?',
          timestamp: new Date('2025-01-29T10:15:00'),
        },
        {
          id: '3',
          sender: 'client',
          text: 'This Friday afternoon would be perfect',
          timestamp: new Date('2025-01-29T10:20:00'),
        },
        {
          id: '4',
          sender: 'business',
          text: 'Great! I have scheduled you for Friday at 2:00 PM',
          timestamp: new Date('2025-01-29T10:25:00'),
        },
        {
          id: '5',
          sender: 'client',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with your clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{conversations.length}</p>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <MessageSquare className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {conversations.reduce((sum, conv) => sum + conv.unread, 0)}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <MessageSquare className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
              <p className="text-2xl font-bold text-[#4a7c59] mt-2">15m</p>
            </div>
            <div className="p-3 bg-[#f7faf7] rounded-lg">
              <Clock className="h-6 w-6 text-[#4a7c59]" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Conversations List */}
          <div className="border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>
            <div>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                    conv.unread > 0 ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-[#4a7c59] rounded-full flex items-center justify-center text-white font-semibold">
                        {conv.clientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conv.clientName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {conv.unread > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Conversation */}
          <div className="md:col-span-2 flex flex-col">
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4a7c59] rounded-full flex items-center justify-center text-white font-semibold">
                  SJ
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">sarah@example.com</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversations[0].messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'business' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender === 'business'
                        ? 'bg-[#4a7c59] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'business' ? 'text-gray-200' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                />
                <button className="px-4 py-2 bg-[#4a8c37] text-white rounded-lg hover:bg-[#4a7c59] transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
