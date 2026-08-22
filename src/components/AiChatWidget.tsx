'use client';

import React, { useState } from 'react';
import { X, Send, Bot } from 'lucide-react';

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'model', content: 'Hi there! I am comeBack AI. Ask me anything about re-appear exams, fee support, or how this platform works!' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'model', content: data.reply }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 transition active:scale-95"
        >
          <Bot className="w-6 h-6" />
          <span className="text-xs font-bold pr-1">comeBack AI</span>
        </button>
      ) : (
        <div className="bg-[#1C1C1E] border border-slate-800 w-80 sm:w-96 rounded-3xl shadow-2xl flex flex-col h-[450px] overflow-hidden">
          <div className="bg-[#121214] p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600/30 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white">comeBack AI Assistant</h3>
                <p className="text-[10px] text-emerald-400 font-medium">● Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#121214] text-slate-200 border border-slate-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-[10px] text-slate-500 italic">AI is typing...</div>}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-[#121214] border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-[#1C1C1E] border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}