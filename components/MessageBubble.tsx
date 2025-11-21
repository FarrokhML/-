import React from 'react';
import { Message, Sender } from '../types';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
          isUser ? 'bg-indigo-600' : 'bg-teal-600'
        }`}>
          {isUser ? <User size={20} color="white" /> : <Bot size={20} color="white" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
          <div className={`relative px-5 py-3 rounded-2xl shadow-sm border ${
            isError 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : isUser 
                ? 'bg-white border-indigo-100 text-slate-800 rounded-tr-none' 
                : 'bg-teal-50 border-teal-100 text-slate-800 rounded-tl-none'
          }`}>
            <p className={`whitespace-pre-wrap leading-8 text-base md:text-lg ${!isError ? 'font-medium' : ''}`}>
              {message.text}
            </p>
          </div>
          
          {message.poet && !isError && (
            <span className="text-xs text-slate-400 mt-1 px-1">
              {message.poet}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;