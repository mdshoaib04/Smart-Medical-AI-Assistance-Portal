import React, { useState, useEffect, useRef } from 'react';
import { startVoiceRecognition } from '../../utils/aiService';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isSender: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
}

interface ChatInterfaceProps {
  recipientId: string;
  recipientName: string;
  currentUserId: string;
  currentUserName: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  recipientId,
  recipientName,
  currentUserId,
  currentUserName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  // Emojis/attachments removed per requirements; keep UI minimal
  const [dark, setDark] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [isVoiceTyping, setIsVoiceTyping] = useState(false);
  const voiceStopRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatKey = `chat_${currentUserId}_${recipientId}`;
  const customerCarePhone = localStorage.getItem('customer_care_phone') || '+91 7975558181';

  useEffect(() => {
    // Load chat history and theme from localStorage
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
    const savedTheme = localStorage.getItem('chat_theme');
    if (savedTheme === 'dark') setDark(true);
    setIsConnected(true);
  }, [currentUserId, recipientId, chatKey]);

  // No random auto-messages; we will auto-reply with customer care info upon patient send

  // Manual scroll only: disable auto-scroll on new messages

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 48; // px from bottom considered as bottom
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    setIsAtBottom(atBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Removed emoji functionality as requested

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      message: newMessage,
      timestamp: new Date(),
      isSender: true,
      status: 'sent',
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    // Save to localStorage
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

    setNewMessage('');
    
    // Show typing indicator briefly
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);

    // Mark as delivered shortly and send realistic auto-reply from doctor
    setTimeout(() => {
        setMessages(prev => {
          const next = prev.map(m => m.id === message.id ? { ...m, status: 'delivered' as const } : m);
          localStorage.setItem(chatKey, JSON.stringify(next));
          return next;
        });

      // typing indicator
      setIsTyping(true);
      const lower = newMessage.toLowerCase();
      let reply = '';
      if (/(^|\b)hi|hello|hey(\b|!|\.)/i.test(newMessage)) {
        reply = 'Yes, how can I help you? If needed, I can help you book a consultation.';
      } else if (/(fever|cough|cold)/.test(lower)) {
        reply = `Please stay hydrated and take Paracetamol 500mg after food if fever persists. I recommend booking a consultation so a doctor can assess you. You can book an appointment now, call customer care at ${customerCarePhone}, or dial 108 for emergencies.`;
      } else if (/(headache|pain|stomach)/.test(lower)) {
        reply = `You may rest and consider a mild analgesic. For proper evaluation, please book a consultation. Need help scheduling? You can book now, call customer care at ${customerCarePhone}, or dial 108 for emergencies.`;
      } else if (/(chest pain|severe breath|unconscious|heavy bleeding)/.test(lower)) {
        reply = 'Please contact emergency helpline 108 immediately. After you are safe, you may also book a consultation for follow-up.';
      } else {
        reply = `Thanks for sharing. I recommend booking a consultation so a doctor can assist you properly. Would you like to book an appointment now, call customer care at ${customerCarePhone}, or if urgent, dial 108?`;
      }

      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: recipientId,
          senderName: recipientName,
          message: reply,
          timestamp: new Date(),
          isSender: false,
          status: 'delivered',
        };
        setMessages(prev => {
          const next = [...prev, autoReply];
          localStorage.setItem(chatKey, JSON.stringify(next));
          return next;
        });
        setIsTyping(false);
        // simulate read receipt for last sent message
        setTimeout(() => {
        setMessages(prev => {
          const next = prev.map(m => m.isSender ? { ...m, status: 'read' as const } : m);
          localStorage.setItem(chatKey, JSON.stringify(next));
          return next;
        });
        }, 600);
      }, 900);
    }, 1000);
  };

  // Removed file upload functionality as requested

  const handleStartVoiceTyping = () => {
    if (isVoiceTyping) {
      voiceStopRef.current?.();
      setIsVoiceTyping(false);
      return;
    }
    setIsVoiceTyping(true);
    voiceStopRef.current = startVoiceRecognition('english', (transcript) => {
      setNewMessage((prev) => prev ? prev + ' ' + transcript : transcript);
    }, () => setIsVoiceTyping(false));
  };

  // Removed quick replies as requested

  return (
    <div className={`flex flex-col h-full min-h-0 rounded-lg shadow-lg overflow-hidden ${dark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Chat Header */}
      <div className="bg-teal-600 text-white p-4 flex items-center gap-3 relative">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
          {getInitials(recipientName)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{recipientName}</h3>
          <p className="text-xs text-teal-100">{isConnected ? 'Online' : 'Offline'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteMenu((s) => !s)}
            className="px-2 py-1 bg-white/20 rounded text-sm"
          >
            Delete Chat
          </button>
          {showDeleteMenu && (
            <div className="absolute right-4 top-14 bg-white text-gray-800 rounded shadow-lg border w-48 z-10">
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                onClick={() => {
                  if (!confirm('Delete chat for me?')) return;
                  localStorage.removeItem(chatKey);
                  setMessages([]);
                  setShowDeleteMenu(false);
                }}
              >
                Delete for me
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-red-600"
                onClick={() => {
                  if (!confirm('Delete chat for everyone?')) return;
                  const otherKey = `chat_${recipientId}_${currentUserId}`;
                  localStorage.removeItem(chatKey);
                  localStorage.removeItem(otherKey);
                  setMessages([]);
                  setShowDeleteMenu(false);
                }}
              >
                Delete for everyone
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gray-50"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.isSender
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  {msg.attachmentUrl && (
                    <div className="mt-2">
                      {msg.attachmentType === 'image' ? (
                        <img src={msg.attachmentUrl} alt="attachment" className="max-h-48 rounded" />
                      ) : (
                        <a href={msg.attachmentUrl} download className="underline">Download file</a>
                      )}
                    </div>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString()}
                    {msg.isSender && (
                      <span className="ml-2">
                        {msg.status === 'read' ? '✓✓ Read' : msg.status === 'delivered' ? '✓✓ Delivered' : '✓ Sent'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{recipientName} is typing…</div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to bottom FAB */}
      {!isAtBottom && (
        <div className="absolute bottom-24 right-6">
          <button
            onClick={scrollToBottom}
            className="px-3 py-2 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 text-sm"
          >
            Jump to latest
          </button>
        </div>
      )}

      {/* Text + Voice Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Type your message..."
            disabled={isVoiceTyping}
          />
          <button
            type="button"
            onClick={handleStartVoiceTyping}
            className={`px-3 py-2 rounded ${isVoiceTyping ? 'bg-red-500 text-white' : 'bg-teal-100 text-teal-600 hover:bg-teal-200'}`}
            title={isVoiceTyping ? 'Stop voice typing' : 'Voice type'}
          >
            {isVoiceTyping ? '🛑' : '🎤'}
          </button>
          <button
            type="button"
            onClick={handleSendMessage}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};


