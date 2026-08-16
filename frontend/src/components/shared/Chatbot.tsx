import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/apiClient';
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';

interface Msg { role: 'user' | 'assistant'; content: string; }

const GREETING: Msg = {
  role: 'assistant',
  content: "Hi! I'm your AI Business Advisor. Ask me anything about AI strategy, your decisions, or how to play The Last CEO.",
};

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await api.chat(next.filter((m) => m !== GREETING).map((m) => ({ role: m.role, content: m.content })));
      const reply = res.data?.reply || "Sorry, I couldn't get a response right now.";
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'I lost the connection to the server — please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="AI Advisor chat"
        className="fixed bottom-5 right-5 z-[70] flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-110 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[70] w-[92vw] max-w-sm h-[28rem] max-h-[70vh] flex flex-col rounded-2xl overflow-hidden cyber-glass cyber-border-cyan shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-space font-bold text-cyan-300">AI Business Advisor</div>
              <div className="text-[9px] font-mono text-emerald-400/80 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${m.role === 'user' ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 rounded-br-sm' : 'bg-slate-900/80 text-slate-200 border border-slate-800 rounded-bl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-slate-900/80 border border-slate-800 text-slate-400 flex items-center gap-2 text-[13px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 focus-within:border-cyan-500 transition-all">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                placeholder="Ask the advisor…"
                className="w-full bg-transparent py-2.5 text-[13px] text-white placeholder:text-slate-600 focus:outline-none"
              />
              <button onClick={send} disabled={loading || !input.trim()} className="text-cyan-400 hover:text-cyan-300 disabled:opacity-40 shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
