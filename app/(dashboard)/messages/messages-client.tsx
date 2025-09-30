'use client';

import { MessageSquare, Send, Clock } from 'lucide-react';
import { FullPageWrapper } from '@/ui/components/full-page-wrapper';

interface Conversation {
  id: string;
  clientName: string;
  clientEmail: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  messages: {
    id: string;
    sender: 'client' | 'business';
    text: string;
    timestamp: Date;
  }[];
}

interface MessagesClientProps {
  conversations: Conversation[];
}

export function MessagesClient({ conversations }: MessagesClientProps) {
  return (
    <FullPageWrapper>
      <div className="flex flex-col h-full bg-brand-bg-secondary">
        {/* Header & Stats Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <MessageSquare className="w-7 h-7 mr-2 text-brand" />
                Messages
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Communicate with your clients</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-brand-bg border border-brand-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Conversations</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{conversations.length}</p>
                </div>
                <div className="p-2 bg-brand/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-brand" />
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Unread</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {conversations.reduce((sum, conv) => sum + conv.unread, 0)}
                  </p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-brand-bg border border-brand-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg. Response Time</p>
                  <p className="text-xl font-bold text-brand mt-1">15m</p>
                </div>
                <div className="p-2 bg-brand/10 rounded-lg">
                  <Clock className="h-5 w-5 text-brand" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Interface */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full bg-white dark:bg-gray-800">
            {/* Conversations List */}
            <div className="border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
              </div>
              <div>
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      conv.unread > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white font-semibold">
                          {conv.clientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {conv.clientName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#4a7c59] rounded-full flex items-center justify-center text-white font-semibold">
                    SJ
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sarah Johnson</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">sarah@example.com</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {conversations[0].messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'business' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === 'business'
                          ? 'bg-brand text-white'
                          : 'bg-brand-bg-tertiary'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'business' ? 'text-gray-200' : 'text-gray-500 dark:text-gray-300'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                  <button className="bg-brand text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:bg-brand-dark">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullPageWrapper>
  );
}
