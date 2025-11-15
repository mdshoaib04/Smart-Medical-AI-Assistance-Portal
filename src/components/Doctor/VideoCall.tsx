import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, MessageSquare, X } from 'lucide-react';

interface VideoCallProps {
  patientName: string;
  onEndCall: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({ patientName, onEndCall }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'doctor' | 'patient'; time: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate incoming messages
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const patientMessages = [
          "Can you hear me clearly?",
          "I have been experiencing these symptoms for about 3 days.",
          "Should I take any medication?",
          "Thank you for your advice doctor."
        ];
        const randomMessage = patientMessages[Math.floor(Math.random() * patientMessages.length)];
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: randomMessage,
          sender: 'patient',
          time: new Date().toLocaleTimeString()
        }]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'doctor',
      time: new Date().toLocaleTimeString()
    }]);
    setNewMessage('');
  };

  const generateMeetLink = () => {
    const meetCode = Math.random().toString(36).substring(2, 15);
    return `https://meet.google.com/${meetCode}`;
  };

  const meetLink = generateMeetLink();

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* Video Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Remote Video (Patient) */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-white text-center">
            <div className="w-32 h-32 rounded-full bg-blue-600 mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl font-bold">{patientName.charAt(0)}</span>
            </div>
            <p className="text-lg font-semibold">{patientName}</p>
            <p className="text-sm text-gray-400">Connected</p>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mx-auto mt-2"></div>
          </div>
        </div>

        {/* Local Video (Doctor) */}
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-gray-700 rounded-lg border-2 border-white overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-white">
            <span className="text-lg font-bold">You</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-3 rounded-full ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`p-3 rounded-full ${
              isVideoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <a
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2"
          >
            <Video className="w-5 h-5" />
            Join Meet
          </a>
          <button
            onClick={onEndCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {isChatOpen && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Chat with {patientName}</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'doctor'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'doctor' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

