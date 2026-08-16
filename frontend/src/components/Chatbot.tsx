import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello CEO, I am NOVA. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Build context-aware prompt
      const historyText = messages.map(m => `${m.role === 'ai' ? 'NOVA' : 'User'}: ${m.content}`).join('\n');
      
      const fullPrompt = `You are NOVA, the AI Executive Assistant for "The Last CEO" simulation. You act as the player's personal business consultant.
Current Context:
- Current App Page: ${location.pathname}

Conversation History:
${historyText}
User: ${userMsg}

Please respond to the User's last message. Keep it concise, professional, and directly helpful. If applicable, suggest 1 or 2 follow-up topics at the end.`;

      const response = await api.getAdvisorInsights(fullPrompt);
      const data = response.data;

      let aiResponse = "";
      if (data?.error || !data?.choices?.[0]?.message?.content) {
        // Offline Fallback Logic
        const lowerInput = userMsg.toLowerCase();
        
        if (lowerInput.includes('name') || lowerInput.includes('who are you')) {
          aiResponse = "I am NOVA, your personal AI Executive Assistant. I'm here to provide strategic guidance, analyze simulation data, and help you navigate The Last CEO.";
        } else if (lowerInput.includes('do you do') || lowerInput.includes('your job')) {
          aiResponse = "I assist you in making high-stakes decisions. I analyze market trends, predict outcomes using XGBoost models, and offer strategic advice to ensure your company survives the AI revolution.";
        } else if (lowerInput.includes('start') || lowerInput.includes('how to play') || lowerInput.includes('how to work')) {
          aiResponse = "To begin, you first need to register an Executive Account. Once logged in, proceed to the Boardroom (Dashboard) where you will review your company metrics and make quarterly strategic decisions.";
        } else if (lowerInput.includes('create an account') || lowerInput.includes('register') || lowerInput.includes('sign up')) {
          aiResponse = "You can create an account by clicking the 'Create Executive Account' option on the authentication portal. Enter your name, corporate email, and set a secure password.";
        } else if (lowerInput.includes('login') || lowerInput.includes('sign in')) {
          aiResponse = "Use the credentials you created during registration to access the secure boardroom interface.";
        } else if (lowerInput.includes('roi') || lowerInput.includes('return on investment')) {
          aiResponse = "ROI (Return on Investment) measures the profitability of your expenditures. In this simulation, positive ROI indicates your tech initiatives are generating more revenue than they cost.";
        } else if (lowerInput.includes('ai') || lowerInput.includes('automation')) {
          aiResponse = "AI and Automation drive efficiency in your company. Higher AI investment can increase your valuation, but only if your workforce is adequately trained to handle the transition.";
        } else if (lowerInput.includes('training') || lowerInput.includes('employee')) {
          aiResponse = "Employee training is crucial. High AI adoption without sufficient workforce training will lead to massive productivity drops, unrest, and increased corporate risk.";
        } else if (lowerInput.includes('hello') || lowerInput.includes('hi ') || lowerInput === 'hi') {
          aiResponse = "Hello again, CEO! I am NOVA. What strategic metrics would you like to review today?";
        } else {
          aiResponse = "I'm currently processing offline data. I recommend checking the What-If Simulator on your dashboard for live predictive insights, or you can ask me about ROI, how to start the game, or how to create an account!";
        }
      } else {
        aiResponse = data.choices[0].message.content;
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "System Offline: I recommend checking the What-If Simulator for live predictive insights." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[100] w-14 h-14 bg-slate-950 border-2 border-cyan-400/80 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.6),inset_0_0_20px_rgba(34,211,238,0.4)] transition-all duration-700 group overflow-hidden ${
          isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 hover:scale-[1.15] hover:shadow-[0_0_50px_rgba(34,211,238,0.9),inset_0_0_30px_rgba(34,211,238,0.7)] pointer-events-auto'
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {/* Cyan-dominant animated background aura */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 animate-[spin_3s_linear_infinite] opacity-90 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
        <Sparkles className="w-7 h-7 relative z-10 animate-pulse text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)]" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-[100] w-[340px] sm:w-[380px] h-[480px] bg-slate-950 border border-cyan-500/40 shadow-[0_0_60px_rgba(34,211,238,0.3)] flex flex-col overflow-hidden transition-all duration-700 ${
          isOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-[0.05]'
        }`}
        style={{ 
          transformOrigin: "calc(100% - 28px) calc(100% - 28px)",
          borderRadius: isOpen ? "16px" : "100%",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {/* Header */}
      <div className="bg-slate-900/90 border-b border-cyan-500/40 p-4 flex items-center justify-between backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 animate-pulse" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-full bg-slate-950 border-2 border-cyan-400/80 flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.6),inset_0_0_10px_rgba(34,211,238,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 animate-[spin_4s_linear_infinite]" />
            <Sparkles className="w-5 h-5 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
          </div>
          <div>
            <h3 className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400 font-black font-orbitron text-[15px] tracking-[0.15em] drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">NOVA</h3>
            <p className="text-[10px] text-emerald-400 font-mono uppercase flex items-center gap-1 font-bold tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 font-space text-[13px] scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`text-[11px] font-black tracking-widest uppercase mb-1.5 ${msg.role === 'user' ? 'text-blue-400 mr-1 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 ml-1 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]'}`}>
              {msg.role === 'user' ? 'YOU' : 'NOVA'}
            </span>
            <div className={`max-w-[85%] p-3.5 rounded-xl leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-400/30' 
                : 'bg-slate-900/80 border border-cyan-500/40 text-slate-100 rounded-tl-sm shadow-[0_0_15px_rgba(34,211,238,0.15)] backdrop-blur-sm'
            }`}>
              {msg.role === 'ai' && (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 inline-block mr-2 -mt-0.5 animate-pulse drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/80 border border-cyan-500/40 p-3.5 rounded-xl rounded-tl-sm flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Processing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/80 border-t border-cyan-500/30 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask NOVA..."
            className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg py-3 pl-4 pr-12 text-[13px] text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-500 font-space shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-md hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_10px_rgba(34,211,238,0.4)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

