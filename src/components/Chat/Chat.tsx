import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Send, Users, MessageCircle, Filter } from 'lucide-react';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { chatMessages, sendMessage, fetchMessages } = useApp();
  const [newMessage, setNewMessage] = useState('');
  const [selectedSection, setSelectedSection] = useState<'general' | 'engineering' | 'medical'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages on mount and when section changes
  useEffect(() => {
    setLoading(true);
    fetchMessages(selectedSection)
      .finally(() => setLoading(false));
  }, [selectedSection, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      await sendMessage({
        userId: user.id,
        userName: user.name,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        section: selectedSection
      });
      setNewMessage('');
    }
  };

  const filteredMessages = chatMessages; // Already filtered by backend

  const sections = [
    { id: 'general' as const, name: 'General', icon: MessageCircle },
    { id: 'engineering' as const, name: 'Engineering', icon: Users },
    { id: 'medical' as const, name: 'Medical', icon: Users }
  ];

  return (
    <div className="h-full max-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Student Chat</h1>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            {filteredMessages.length} messages
          </div>
        </div>

        {/* Section Filter */}
        <div className="flex space-x-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${selectedSection === section.id
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-4 w-4 mr-1" />
                {section.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white border-l border-r border-gray-200 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading messages...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500">
              Start the conversation by sending the first message!
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const isOwnMessage = message.userId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {!isOwnMessage && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {message.userName}
                    </p>
                  )}
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-gray-300' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white rounded-b-xl border border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Posting in: <span className="font-medium capitalize">{selectedSection}</span> section
        </p>
      </form>
    </div>
  );
};

export default Chat;