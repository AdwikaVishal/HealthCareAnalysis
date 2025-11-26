import { User, Bot } from 'lucide-react';

export default function ChatBubble({ message, isUser, timestamp }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-neon-blue' : 'dark:bg-slate-700 bg-slate-200'
        }`}>
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 dark:text-gray-300 text-slate-600" />}
        </div>
        <div className={`rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-neon-blue text-white' 
            : 'dark:bg-slate-700 bg-white border dark:border-slate-600 border-slate-200 dark:text-white text-slate-900'
        }`}>
          <p className="text-sm">{message}</p>
          <span className={`text-xs mt-1 block ${isUser ? 'text-blue-100' : 'dark:text-gray-400 text-slate-500'}`}>
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}