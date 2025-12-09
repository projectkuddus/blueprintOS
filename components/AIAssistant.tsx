import React, { useState, useRef, useEffect } from 'react';
import { Project, ChatMessage } from '../types';
import { generateProjectAssistantResponse } from '../services/geminiService';
import { Send, Bot, User, Sparkles, Loader2, X, MessageSquare, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  project: Project;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ project }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I am your guide for **${project.name}**.  
      I have access to the BOQ, timeline, and drawings. How can I help?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateProjectAssistantResponse(input, project);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Interface */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-white border-2 border-black shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="p-3 bg-black text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">Project Guide</h3>
                <p className="text-[10px] text-zinc-400">Connected to {project.name}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`
                  w-6 h-6 flex items-center justify-center flex-shrink-0 border text-[10px]
                  ${msg.role === 'user' ? 'bg-white border-black text-black' : 'bg-black border-black text-white'}
                `}>
                  {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                </div>
                
                <div className={`
                  max-w-[85%] p-3 text-xs leading-relaxed border shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-white text-black border-black/10' 
                    : 'bg-white text-slate-800 border-emerald-500/30'}
                `}>
                  <ReactMarkdown 
                     components={{
                      p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-black" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 my-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-1" {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-black text-white flex items-center justify-center">
                  <Bot size={12} />
                </div>
                <div className="bg-white border border-slate-200 px-3 py-2 flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="Ask about BOQ, drawings..."
                className="w-full bg-zinc-50 border border-slate-300 pl-3 pr-10 py-2.5 text-xs focus:border-black outline-none placeholder:text-slate-400"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 p-1 bg-black text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 flex items-center justify-center shadow-xl transition-all duration-300 border-2
          ${isOpen ? 'bg-white text-black border-black' : 'bg-black text-white border-black hover:scale-105'}
        `}
      >
        {isOpen ? <X size={24} /> : <Bot size={28} />}
      </button>
    </div>
  );
};

export default AIAssistant;