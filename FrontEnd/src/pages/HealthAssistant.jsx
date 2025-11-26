import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { api } from '../services/api';

export default function HealthAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "Hello! I'm your AI Health Assistant. I can help analyze your health data and provide personalized insights. How can I assist you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "How is my sleep this week?",
    "What habits should I improve?",
    "Any signs of stress?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      message: message.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.chatWithAI(message.trim());
      const aiMessage = {
        id: Date.now() + 1,
        message: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-neon-blue to-neon-purple p-6 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Health Assistant</h1>
            <p className="text-blue-100">Get personalized health insights and recommendations</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col card-gradient rounded-b-xl">
        <div className="p-4 border-b dark:border-slate-700 border-slate-200">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(suggestion)}
                className="px-3 py-1 text-sm dark:bg-slate-700 bg-slate-100 dark:text-gray-300 text-slate-700 rounded-full hover:bg-neon-blue hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.message}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full dark:bg-slate-700 bg-slate-200 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="dark:bg-slate-700 bg-white border dark:border-slate-600 border-slate-200 rounded-lg px-4 py-2">
                  <p className="text-sm dark:text-gray-300 text-slate-600">AI is thinking...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t dark:border-slate-700 border-slate-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your health data..."
              className="flex-1 dark:bg-slate-800 bg-white dark:border-slate-600 border-slate-300 rounded-lg px-4 py-2 dark:text-white text-slate-900 focus:outline-none focus:border-neon-blue"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-neon-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}