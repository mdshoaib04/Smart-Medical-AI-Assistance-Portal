import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader } from 'lucide-react';
import { Appointment } from '../../types';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isSender: boolean;
}

interface AppointmentChatProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentChat: React.FC<AppointmentChatProps> = ({
  appointment,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatKey = `appointment_chat_${appointment.id}`;
  const quickPrescriptions = [
    "Paracetamol 500mg - after food - 3 days",
    "ORS solution - sip frequently - 24 hours",
    "Cetirizine 10mg - at night - 5 days",
    "Omeprazole 20mg - before breakfast - 7 days",
    "Azithromycin 500mg - once daily - 3 days",
  ];

  const sanitizeText = (value: string) => value.replace(/[^A-Za-z\s,\.\-\'()\/]/g, '').replace(/\s{2,}/g, ' ').trimStart();

  useEffect(() => {
    if (!isOpen) return;

    // Load chat history
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
    // Disable random simulation; rely on real messages only
  }, [isOpen, appointment.id, appointment.patient_id, chatKey, appointment.patient]);

  // Manual scroll only: disable auto-scroll on new messages

  const handleSendMessage = () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: appointment.doctor_id,
      senderName: 'Dr. Doctor',
      message: newMessage,
      timestamp: new Date(),
      isSender: true,
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    setNewMessage('');
    setIsLoading(false);
  };

  // Theme toggle for chat, persisted
  const [dark, setDark] = useState(() => localStorage.getItem('chat_theme') === 'dark');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: appointment.doctor_id,
        senderName: 'Dr. Doctor',
        message: newMessage || file.name,
        timestamp: new Date(),
        isSender: true,
      };
      const updated = [...messages, message];
      setMessages(updated);
      localStorage.setItem(chatKey, JSON.stringify(updated));
      setNewMessage('');
    };
    reader.readAsDataURL(file);
  };

  const savePrescriptionToRecords = (prescription: string) => {
    try {
      const key = 'patient_medical_records';
      const saved = localStorage.getItem(key);
      const records = saved ? JSON.parse(saved) : [];
      const today = new Date();
      const record = {
        id: String(Date.now()),
        date: today.toISOString().slice(0, 10),
        doctorName: 'Dr. Doctor',
        diagnosis: '',
        symptoms: '',
        prescription: String(prescription),
        notes: '',
        visitType: 'consultation',
      };
      const next = [record, ...records];
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };

  const handleQuickPrescription = (text: string) => {
    const msgText = `Prescription: ${sanitizeText(text)}`;
    setNewMessage(msgText);
    // send immediately
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: appointment.doctor_id,
      senderName: 'Dr. Doctor',
      message: msgText,
      timestamp: new Date(),
      isSender: true,
    };
    const updated = [...messages, message];
    setMessages(updated);
    localStorage.setItem(chatKey, JSON.stringify(updated));
    savePrescriptionToRecords(text);
    setNewMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 w-96 rounded-lg shadow-2xl border flex flex-col max-h-[600px] min-h-0 z-50 ${dark ? 'bg-gray-900 text-gray-100 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className="bg-teal-600 text-white p-4 flex justify-between items-center relative">
        <div>
          <h3 className="font-semibold">Chat with Patient</h3>
          <p className="text-sm text-teal-100">{appointment.patient?.full_name || 'Patient'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { const next = !dark; setDark(next); localStorage.setItem('chat_theme', next ? 'dark' : 'light'); }}
            className="px-2 py-1 bg-white/20 rounded text-sm"
          >
            {dark ? 'Light' : 'Dark'}
          </button>
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
                  // For appointment chat we store a single key; removing clears for everyone on this device.
                  localStorage.removeItem(chatKey);
                  setMessages([]);
                  setShowDeleteMenu(false);
                }}
              >
                Delete for everyone
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className={`flex-1 min-h-0 overflow-y-auto p-4 space-y-3 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.isSender
                      ? 'bg-teal-600 text-white'
                      : `${dark ? 'bg-gray-900 text-gray-100 border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'}`
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">{msg.senderName}</p>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border px-4 py-2 rounded-lg`}>
                  <div className="text-xs opacity-70 mb-1">Patient is typing…</div>
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

      {/* Input */}
      <div className={`p-4 border-t ${dark ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
        <div className="flex flex-wrap gap-2 mb-2">
          {quickPrescriptions.map((q) => (
            <button
              key={q}
              onClick={() => handleQuickPrescription(q)}
              className="px-3 py-1.5 bg-green-50 text-green-800 border border-green-200 rounded-full text-xs hover:bg-green-100"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(sanitizeText(e.target.value))}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${dark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'border-gray-300'}`}
            disabled={isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && e.target.files[0] && handleFileSelected(e.target.files[0])}
            className="hidden"
            accept="image/*,audio/*,.pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">Attach</button>
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};




