import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Mic, Send, MicOff, Globe, Stethoscope, Landmark, ShoppingCart, Factory, Truck, ChevronRight, Download } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';
import type { CompanyProfile } from '@/types';
import CEOModel from '@/components/CEOModel';
import { SKINS } from '@/data/skins';

const QUESTIONS = [
  { id: 'q1', speakerId: 'chairman', text: "What is your name?", type: 'text', field: 'founderName', stage: 'IDENTITY' },
  { id: 'q2', speakerId: 'chairman', text: "What should we call your company?", type: 'text', field: 'name', stage: 'IDENTITY' },
  { id: 'q3', speakerId: 'strategy', text: "Which industry will your company operate in?", type: 'cards', field: 'industry', options: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Logistics'], stage: 'STRATEGY' },
  { id: 'q4', speakerId: 'strategy', text: "Which country will serve as headquarters?", type: 'cards', field: 'country', options: ['United States', 'China', 'Germany', 'Japan', 'United Kingdom', 'India'], stage: 'STRATEGY' },
  { id: 'q5', speakerId: 'cfo', text: "How much starting capital should the Board allocate?", type: 'slider', field: 'startingBudget', min: 500000, max: 50000000, step: 500000, prefix: '$', suffix: '', stage: 'FINANCE' },
  { id: 'q6', speakerId: 'cfo', text: "How much should we invest in Artificial Intelligence?", type: 'slider', field: 'aiInvestment', min: 100000, max: 10000000, step: 100000, prefix: '$', suffix: '', stage: 'FINANCE' },
  { id: 'q7', speakerId: 'chro', text: "How many employees do you need in the beginning?", type: 'slider', field: 'employees', min: 1, max: 50, step: 1, suffix: '', stage: 'WORKFORCE' }
];

const BOARD_MEMBERS = [
  { id: 'chairman', name: 'CHAIRMAN', title: 'Leader of the Board', avatar: '/picsforcompany/Chairman.jpg', color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_100px_rgba(251,191,36,0.6)]', react: 'OBSERVING', x: 0, y: -250 },
  { id: 'strategy', name: 'CSO', title: 'Chief Strategy Officer', avatar: '/picsforcompany/Chief Strategy Officer (CSO).jpg', color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-500/10', glow: 'shadow-[0_0_100px_rgba(6,182,212,0.6)]', react: 'ANALYZING', x: 350, y: -100 },
  { id: 'cfo', name: 'CFO', title: 'Chief Financial Officer', avatar: '/picsforcompany/Chief Financial Officer (CFO).jpg', color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_100px_rgba(16,185,129,0.6)]', react: 'CALCULATING', x: -350, y: -100 },
  { id: 'cto', name: 'CTO', title: 'Chief Technology Officer', avatar: '/picsforcompany/Chief Technology Officer (CTO).jpg', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10', glow: 'shadow-[0_0_100px_rgba(59,130,246,0.6)]', react: 'PROCESSING', x: 300, y: 150 },
  { id: 'chro', name: 'CHRO', title: 'Chief Human Resources', avatar: '/picsforcompany/Chief Human Resources Officer (CHRO).jpg', color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10', glow: 'shadow-[0_0_100px_rgba(168,85,247,0.6)]', react: 'EVALUATING', x: -300, y: 150 },
  { id: 'risk', name: 'CRO', title: 'Chief Risk Officer', avatar: '/picsforcompany/Chief Risk Officer (CRO).jpg', color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_100px_rgba(244,63,94,0.6)]', react: 'MONITORING', x: 0, y: 250 }
];

let audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch(e) {}
  }
  return audioCtx;
};

const playTypingClick = () => {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200 + Math.random() * 400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.02);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.02);
};

const playLineBeep = () => {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

const Typewriter = ({ text, delay = 0, speed = 40, className, onComplete }: any) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    let timeoutId = setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        const char = text.charAt(i);
        setDisplayed(text.substring(0, i + 1));
        
        if (char !== ' ' && char !== '\n') {
          playTypingClick();
        } else if (char === '\n') {
          playLineBeep();
        }
        
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          playLineBeep();
          onComplete?.();
        }
      }, speed);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [text, delay, speed]);

  return (
    <div className={className}>
      {displayed.split('\n').map((line: string, i: number) => (
        <React.Fragment key={i}>
          {line}
          {i !== displayed.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

export const Home = () => {
  const navigate = useNavigate();
  const actions = useGameStore((s) => s.actions);
  const [qIndex, setQIndex] = useState(0);
  const [inputValue, setInputValue] = useState<string | number>('');
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    foundedYear: 2025
  });

  const [displayedBotText, setDisplayedBotText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [introStage, setIntroStage] = useState(-2);
  const [pendingSkin, setPendingSkin] = useState<string>(SKINS[0].id);
  const [hoveredSkin, setHoveredSkin] = useState<string | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [showAvatarCinematic, setShowAvatarCinematic] = useState(true);
  const [avatarIntroStage, setAvatarIntroStage] = useState(0);

  useEffect(() => {
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesLoaded(true);
    }
    const handleVoices = () => setVoicesLoaded(true);
    window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoices);
  }, []);

  const currentQ = QUESTIONS[qIndex];
  const activeSpeaker = BOARD_MEMBERS.find(m => m.id === currentQ?.speakerId);

  useEffect(() => {
    if (showIntro) return;

    if (!currentQ) {
      return;
    }

    setDisplayedBotText('');
    setIsTyping(true);
    setValidationError('');
    setInputValue(currentQ.type === 'slider' ? currentQ.min! : '');

    let i = 0;
    const speed = 25;
    const text = currentQ.text;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const voiceDavid = voices.find(v => v.name.includes('David'));
    const voiceMark = voices.find(v => v.name.includes('Mark'));
    const maleFallback = voices.find(v => v.name.includes('Male')) || voices[0];
    const femaleVoice = voices.find(v => v.name.includes('Zira') || v.name.includes('Hazel') || v.name.includes('Female')) || voices[0];
    
    const v1 = voiceDavid || maleFallback;
    const v2 = voiceMark || maleFallback;
    
    switch(currentQ.speakerId) {
      case 'chairman':
        utterance.pitch = 0.3;
        utterance.rate = 0.8;
        if (v1) utterance.voice = v1;
        break;
      case 'strategy':
        utterance.pitch = 1.2;
        utterance.rate = 1.1;
        if (v2) utterance.voice = v2;
        break;
      case 'cfo':
        utterance.pitch = 0.8;
        utterance.rate = 0.95;
        if (v2) utterance.voice = v2;
        break;
      case 'cto':
        utterance.pitch = 1.4;
        utterance.rate = 1.2;
        if (v1) utterance.voice = v1;
        break;
      case 'chro':
        utterance.pitch = 1.1;
        utterance.rate = 1.0;
        if (femaleVoice) utterance.voice = femaleVoice;
        break;
      case 'risk':
        utterance.pitch = 0.8;
        utterance.rate = 0.9;
        if (femaleVoice) utterance.voice = femaleVoice;
        break;
      default:
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
    }
    
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);

    const timer = setInterval(() => {
      setDisplayedBotText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => {
      clearInterval(timer);
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, showIntro]);

  const validateInput = (val: string | number) => {
    const q = QUESTIONS[qIndex];
    if (q.type === 'text') {
      const s = String(val).trim();
      if (s === '') return "The board awaits your answer.";
    }
    return null;
  };

  const handleAnswer = (val: string | number) => {
    if (!val && val !== 0) return;
    const error = validateInput(val);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    setIsScanning(true);
    
    setTimeout(() => {
      setFormData(prev => ({ ...prev, [QUESTIONS[qIndex].field]: val }));
      setIsScanning(false);
      setQIndex(prev => prev + 1);
    }, 1500);
  };

  const toggleRecording = async () => {
    if (isRecording) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setValidationError("Microphone permission denied. Please allow microphone access in your browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setValidationError("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setInputValue(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const generateDocx = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: "Global Corporate AI Council", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: "Executive Setup Report", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: `Date: ${new Date().toLocaleDateString()}` }),
          new Paragraph({ text: "" }),
          
          ...Object.entries(formData).map(([key, val]) => {
            return new Paragraph({
              children: [
                new TextRun({ text: `${key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}: `, bold: true }),
                new TextRun({ text: String(val) })
              ]
            })
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Executive_Setup_Report.docx");
  };

  if (!currentQ && formData.skin) {
    const entries = Object.entries(formData).filter(([key]) => key !== 'skin');
    return (
      <div className="min-h-screen w-full bg-black text-white font-space flex flex-col items-center justify-center p-8 scanlines overflow-y-auto">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 items-stretch justify-center">
          
          {/* Left: Report Summary */}
          <div className="w-full lg:w-1/2 bg-slate-900/80 border border-cyan-500/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl animate-in fade-in slide-in-from-left-8 duration-700 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-black text-cyan-400 mb-6 tracking-widest uppercase border-b border-slate-700 pb-4 text-center">Executive Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                {entries.map(([key, val], index) => (
                  <div 
                    key={key} 
                    className="flex flex-col border-b border-slate-800 pb-2"
                  >
                    <span className="text-slate-500 tracking-wider text-[10px] uppercase mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Typewriter 
                      text={String(val)} 
                      delay={index * 400 + 200} 
                      speed={30} 
                      className="font-bold text-[#00D9FF] text-sm drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center my-4 animate-in fade-in" style={{ animationDelay: `${entries.length * 400}ms`, animationFillMode: 'both' }}>
              <Typewriter 
                text="The Future of This Company Is in Your Hands." 
                delay={entries.length * 400 + 200} 
                speed={30} 
                className="text-center text-sm md:text-base font-black tracking-[0.25em] uppercase text-[#00D9FF] drop-shadow-[0_0_20px_rgba(0,217,255,0.8)] animate-pulse" 
              />
            </div>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${entries.length * 400 + 500}ms`, animationFillMode: 'both' }}
            >
              <button onClick={generateDocx} className="px-6 py-3 bg-slate-800 border border-slate-600 text-slate-300 font-bold rounded-xl hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <Download className="w-4 h-4" /> Download .docx
              </button>
              <button onClick={() => { actions.initializeGame(formData as CompanyProfile); navigate('/engine'); }} className="px-6 py-3 bg-[#00D9FF]/20 border border-[#00D9FF] text-[#00D9FF] font-bold rounded-xl hover:bg-[#00D9FF] hover:text-slate-950 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(0,217,255,0.3)]">
                Commence Operations <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Selected Avatar Preview */}
          <div className="w-full lg:w-1/2 rounded-3xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700" style={{ minHeight: '600px' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 100px rgba(0,217,255,0.05)` }} />
            
            <div className="w-full h-full absolute inset-0">
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-500 animate-pulse font-space tracking-widest text-sm">INITIALIZING MODEL...</div>}>
                <CEOModel archetype={formData.skin || 'researcher'} mood="default" playable={false} />
              </Suspense>
            </div>

            <div className="absolute bottom-12 z-20 flex flex-col items-center text-center pointer-events-none">
              <h2 className="text-3xl font-black tracking-widest text-[#00D9FF] uppercase drop-shadow-[0_0_15px_rgba(0,217,255,0.6)]">
                {formData.founderName ? formData.founderName : 'CEO'}
              </h2>
              <div className="px-4 py-1 mt-2 rounded-full border border-[#00D9FF]/30 bg-slate-950/80 text-[10px] tracking-[0.2em] text-slate-300 uppercase">
                AUTHORIZED PERSONNEL
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="h-screen w-full bg-black text-white font-space flex items-center justify-center p-8 scanlines cursor-pointer" onClick={() => { getAudioContext()?.resume(); setShowIntro(false); }}>
        <div className="max-w-3xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-3000">
          
          {introStage === -2 && (
            <Typewriter 
              text="ASCENDING TO 100TH FLOOR..." 
              speed={60}
              className="text-xl md:text-2xl font-mono tracking-[0.2em] text-slate-500 mb-8 uppercase"
              onComplete={() => setTimeout(() => setIntroStage(-1), 1000)}
            />
          )}

          {introStage === -1 && (
            <Typewriter 
              text="ENTERING BOARDROOM..." 
              speed={60}
              className="text-xl md:text-2xl font-mono tracking-[0.2em] text-slate-400 mb-8 uppercase"
              onComplete={() => setTimeout(() => setIntroStage(0), 1000)}
            />
          )}

          {introStage >= 0 && (
            <Typewriter 
              text="GLOBAL CORPORATE AI COUNCIL" 
              speed={50}
              className="text-4xl md:text-6xl font-black tracking-[0.2em] text-cyan-500 mb-8 text-glow-cyan min-h-[120px] md:min-h-[80px]"
              onComplete={() => setIntroStage(1)}
              isTitle={true}
            />
          )}
          
          {introStage >= 1 && (
            <Typewriter 
              text={"After months of evaluation,\nthe Board of Directors has reached\na unanimous decision."}
              speed={30}
              className="text-xl md:text-2xl text-slate-300 leading-loose tracking-widest uppercase min-h-[100px]"
              onComplete={() => setTimeout(() => setIntroStage(2), 500)}
            />
          )}

          {introStage >= 2 && (
            <Typewriter 
              text={"You have been appointed as the\nChief Executive Officer"}
              speed={40}
              className="text-2xl md:text-3xl font-bold text-white tracking-widest mt-12 animate-pulse uppercase min-h-[80px]"
              onComplete={() => {
                getAudioContext()?.resume();
                setTimeout(() => setShowIntro(false), 2000);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  if (!currentQ && !formData.skin) {
    if (showAvatarCinematic) {
      return (
        <div className="h-screen w-full bg-black text-white font-space flex items-center justify-center p-8 scanlines cursor-pointer" onClick={() => setShowAvatarCinematic(false)}>
          <div className="max-w-3xl text-center space-y-8 animate-in fade-in duration-1500">
            {avatarIntroStage >= 0 && (
              <Typewriter 
                text="EXECUTIVE PROFILE ACCEPTED" 
                speed={50}
                className="text-xl md:text-2xl font-mono tracking-[0.2em] text-slate-500 mb-8 uppercase"
                onComplete={() => setTimeout(() => setAvatarIntroStage(1), 1000)}
              />
            )}
            
            {avatarIntroStage >= 1 && (
              <Typewriter 
                text="GO AHEAD AND FORGE YOUR AVATAR AND BEGIN YOUR JOURNEY TO 2035" 
                speed={40}
                className="text-2xl md:text-4xl font-black tracking-[0.1em] text-cyan-400 mb-8 text-glow-cyan"
                onComplete={() => setTimeout(() => setShowAvatarCinematic(false), 2500)}
              />
            )}
          </div>
        </div>
      );
    }

    const activeId = hoveredSkin || pendingSkin;
    const active = SKINS.find((s) => s.id === activeId) || SKINS[0];
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0712] via-[#0d0a18] to-[#06040c] text-white font-space relative overflow-hidden flex flex-col">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 28% 18%, #a855f7 0, transparent 42%), radial-gradient(circle at 82% 72%, #f59e0b 0, transparent 46%)' }}
        />
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

        <div className="relative z-10 text-center pt-2 pb-1 px-6 animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="inline-block px-3 py-0.5 mb-0.5 border-y-2 border-amber-500/40">
            <span className="text-amber-400/80 tracking-[0.4em] text-[16px] uppercase">Character Select</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-widest uppercase bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 text-transparent bg-clip-text drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
            Forge Your Avatar
          </h1>
          <p className="text-slate-400 text-[10px] mt-0.5 tracking-wide">
            Choose how your CEO looks.{' '}
            <span className="text-amber-500/80">Appearance only - no bonuses or abilities</span>
          </p>
        </div>

        <div className="relative z-10 flex-1 grid lg:grid-cols-[1fr,1.1fr] gap-3 px-4 md:px-8 pb-4 max-w-7xl mx-auto w-full items-stretch">
          <div
            className="relative rounded-3xl border-2 overflow-hidden flex flex-col transition-all duration-500"
            style={{ borderColor: active.accent + '66', boxShadow: `0 0 60px ${active.accent}22, inset 0 0 80px ${active.accent}11` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 to-black/80 pointer-events-none" />
            <div className="relative flex-1 min-h-[220px]">
              <CEOModel archetype={activeId} />
            </div>
            <div className="relative z-10 text-center pb-4 px-4">
              <div className="h-px w-2/3 mx-auto mb-2" style={{ background: `linear-gradient(90deg, transparent, ${active.accent}, transparent)` }} />
              <h2 className="text-lg md:text-xl font-black tracking-widest uppercase" style={{ color: active.accent }}>
                {active.name}
              </h2>
              <div
                className="inline-block mt-1 px-2 py-0.5 rounded-full border text-[9px] tracking-[0.25em] uppercase text-slate-300"
                style={{ borderColor: active.accent + '55' }}
              >
                {active.theme}
              </div>
              <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto">{active.blurb}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="grid sm:grid-cols-2 gap-1.5 flex-1">
              {SKINS.map((s) => {
                const selected = pendingSkin === s.id;
                return (
                  <button
                    key={s.id}
                    onMouseEnter={() => setHoveredSkin(s.id)}
                    onMouseLeave={() => setHoveredSkin(null)}
                    onClick={() => setPendingSkin(s.id)}
                    className={cn(
                      'group relative text-left rounded-xl border-2 p-3 flex flex-col justify-center transition-all duration-300 overflow-hidden bg-slate-950/60 backdrop-blur-sm',
                      selected ? 'scale-[1.01]' : 'border-slate-800/80 hover:border-slate-600 hover:-translate-y-0.5'
                    )}
                    style={selected ? { borderColor: s.accent, boxShadow: `0 0 25px ${s.accent}44` } : {}}
                  >
                    <div
                      className="absolute -right-6 -top-6 w-16 h-16 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity"
                      style={{ background: s.accent }}
                    />
                    <div className="flex items-center gap-1.5 mb-1 relative z-10">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.accent, boxShadow: `0 0 8px ${s.accent}` }} />
                      <span className="font-black tracking-wide uppercase text-[15px]" style={{ color: selected ? s.accent : '#e2e8f0' }}>
                        {s.name}
                      </span>
                    </div>
                    <div className="text-[11px] tracking-[0.2em] uppercase text-slate-500 mb-1 relative z-10">{s.theme}</div>
                    <p className="text-[13px] text-slate-400 leading-tight relative z-10">{s.blurb}</p>
                    {selected && (
                      <div
                        className="absolute top-2 right-2 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded z-10"
                        style={{ background: s.accent, color: '#0a0a0a' }}
                      >
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { getAudioContext()?.resume(); setFormData((prev) => ({ ...prev, skin: pendingSkin })); }}
              className="w-full py-2.5 mt-1 rounded-xl font-black tracking-[0.3em] uppercase text-sm transition-all duration-300 border-2 hover:scale-[1.01] bg-slate-950/40"
              style={{ borderColor: active.accent, color: active.accent, boxShadow: `0 0 30px ${active.accent}33` }}
            >
              ▸ Confirm Appearance
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const camX = activeSpeaker ? -activeSpeaker.x : 0;
  const camY = activeSpeaker ? -activeSpeaker.y - 250 : 0; 

  let GlobeIcon = Globe;
  let globeColor = "text-cyan-500";
  if (formData.industry === 'Healthcare') { GlobeIcon = Stethoscope; globeColor = "text-emerald-500"; }
  else if (formData.industry === 'Finance') { GlobeIcon = Landmark; globeColor = "text-amber-500"; }
  else if (formData.industry === 'Retail') { GlobeIcon = ShoppingCart; globeColor = "text-rose-500"; }
  else if (formData.industry === 'Manufacturing') { GlobeIcon = Factory; globeColor = "text-orange-500"; }
  else if (formData.industry === 'Logistics') { GlobeIcon = Truck; globeColor = "text-purple-500"; }

  return (
    <div className="min-h-screen w-full bg-black text-white font-space relative overflow-x-hidden overflow-y-auto scanlines">
      {/* Dynamic Background */}
      <div 
        className={cn("absolute inset-0 bg-cover bg-center transition-all duration-2000 ease-in-out opacity-30 z-0", 
          activeSpeaker?.id === 'cfo' ? "brightness-110 hue-rotate-90" : 
          activeSpeaker?.id === 'cto' ? "brightness-110 hue-rotate-180" : 
          activeSpeaker?.id === 'risk' ? "brightness-75 hue-rotate-[-30deg]" : ""
        )}
        style={{ backgroundImage: "url('/cyberpunk_city.png')" }} 
      />
      
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '1px 200px', animation: 'rain 0.3s linear infinite' }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#040610] via-transparent to-[#040610] pointer-events-none z-0 opacity-90" />

      {/* Holographic Table */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-0 opacity-70 pointer-events-none">
        <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border border-cyan-500/10 bg-cyan-950/10 shadow-[0_0_100px_rgba(6,182,212,0.05)] flex items-center justify-center relative">
          <GlobeIcon className={cn("w-28 h-28 sm:w-40 sm:h-40 opacity-50 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]", globeColor, formData.industry ? "animate-[spin_20s_linear_infinite]" : "animate-pulse")} />
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[spin_10s_linear_infinite] scale-75" />
          <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-[spin_15s_linear_infinite_reverse] scale-90" />
          <div className="absolute bottom-[-30px] text-[10px] text-cyan-500/30 uppercase tracking-widest bg-black px-4 py-1 border border-cyan-900/50 rounded-full">
            HOLO-CORE ACTIVE
          </div>
        </div>
      </div>

      {/* THE 360 CIRCULAR BOARDROOM */}
      <div 
        className="absolute top-1/2 left-1/2 w-0 h-0 transition-transform duration-2000 ease-in-out z-10"
        style={{ transform: `translate(${camX}px, ${camY}px)` }}
      >
        {BOARD_MEMBERS.map((member) => {
          const isActive = member.id === activeSpeaker?.id;
          
          return (
            <div 
              key={member.id} 
              className={cn(
                "absolute flex flex-col items-center transition-all duration-2000 ease-in-out",
                isActive ? "z-50 scale-110 -translate-y-8" : "z-20 scale-90 opacity-40 blur-[1px]"
              )}
              style={{ top: `${member.y}px`, left: `${member.x}px`, transform: `translate(-50%, -50%)` }}
            >
              {/* Profile Card */}
              <div className={cn(
                "p-4 rounded-xl border backdrop-blur-2xl flex flex-col items-center justify-center transition-all duration-700 relative overflow-hidden w-48 md:w-56 translate-y-[25px]",
                isActive 
                  ? `${member.border} bg-slate-950/95 ${member.glow}` 
                  : "border-slate-800/50 bg-slate-950/80"
              )}>
                {isActive && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-1/2 animate-[scanline-sweep_2s_linear_infinite]" />}
                
                <div className={cn(
                  "rounded-full border flex items-center justify-center mb-4 transition-all overflow-hidden relative bg-slate-900 shrink-0", 
                  isActive ? `w-20 h-20 md:w-24 md:h-24 ${member.border} shadow-[0_0_30px_currentColor] ${member.color.replace('text', 'shadow')} ${isSpeaking ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}` : "w-16 h-16 border-slate-700"
                )}>
                  <img src={member.avatar} className={cn("w-full h-full object-cover", isActive ? "" : "grayscale")} alt={member.name} />
                </div>
                
                <div className={cn("font-black tracking-widest uppercase text-center", isActive ? `text-lg ${member.color}` : "text-sm text-slate-400")}>
                  {member.name}
                </div>
                <div className={cn("uppercase tracking-wider text-center mt-1", isActive ? "text-xs text-white" : "text-[10px] text-slate-500")}>
                  {member.title}
                </div>
              </div>

              {/* Holographic Question Console */}
              {isActive && currentQ && (
                <div className="absolute top-[105%] left-1/2 -translate-x-1/2 translate-y-[5px] w-[90vw] max-w-[600px] flex flex-col items-center animate-in fade-in slide-in-from-top-8 duration-700">
                  
                  <div className={cn("w-[2px] h-8 bg-gradient-to-b to-transparent mb-2", member.color.replace('text', 'from'))} />

                  <div className="w-full bg-slate-950/90 border border-cyan-500/30 p-5 md:p-6 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-50" />
                    
                    <div className="w-full font-mono text-[10px] text-cyan-500/50 flex flex-col items-center mb-6 tracking-widest">
                      <span>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
                    </div>
                    
                    <div className="text-lg md:text-xl font-medium leading-relaxed text-center text-slate-100 min-h-[50px] max-w-2xl mx-auto text-glow-white mb-6">
                      {displayedBotText}
                      {isTyping && <span className="inline-block w-4 h-6 ml-2 bg-slate-400 animate-pulse align-middle" />}
                    </div>
                    
                    <div className="w-full font-mono text-[10px] text-cyan-500/50 flex flex-col items-center mb-8 tracking-widest">
                      <span>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
                    </div>

                    {validationError && (
                      <div className="mb-6 text-rose-400 font-bold tracking-widest animate-pulse border border-rose-500/50 bg-rose-500/10 px-6 py-3 rounded-lg text-sm text-center uppercase">
                        ⚠️ Board Validation Failed: {validationError}
                      </div>
                    )}

                    {isScanning && (
                      <div className="mb-6 flex flex-col items-center text-emerald-400 font-bold tracking-widest font-mono p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-center">
                        <span className="animate-pulse text-lg md:text-xl mb-2">EXECUTIVE PROFILE SYNCHRONIZED</span>
                        <span className="text-emerald-500/70">██████████████████ BOARD APPROVAL GRANTED</span>
                      </div>
                    )}

                    {!isScanning && (
                      <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                        {currentQ.type === 'text' && (
                          <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-center">
                            <button onClick={toggleRecording} className={cn("p-4 rounded-xl border backdrop-blur-md transition-all duration-300 shrink-0 flex justify-center items-center", isRecording ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse" : "bg-slate-900/80 border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400")}>
                              {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                            </button>
                            <input
                              type="text"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              disabled={isTyping}
                              placeholder={isRecording ? "Listening..." : "Speak or type your answer..."}
                              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2 text-base text-white font-space focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-md transition-all text-center shadow-inner"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAnswer(inputValue);
                              }}
                            />
                            <button onClick={() => handleAnswer(inputValue)} disabled={isTyping} className="px-6 py-3 bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500 hover:text-slate-950 disabled:opacity-50 transition-all flex items-center justify-center shrink-0">
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        )}

                        {currentQ.type === 'slider' && (
                          <div className="p-5 bg-slate-900/80 border border-slate-700 rounded-xl backdrop-blur-md space-y-6 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all">
                            <div className="text-center text-3xl font-black text-cyan-400 text-glow-cyan tracking-tight">
                              {currentQ.prefix || ''}{inputValue.toLocaleString()}{currentQ.suffix || ''}
                            </div>
                            <input
                              type="range"
                              min={currentQ.min}
                              max={currentQ.max}
                              step={currentQ.step}
                              value={inputValue || currentQ.min}
                              onChange={(e) => setInputValue(Number(e.target.value))}
                              className="w-full accent-cyan-500 h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <button onClick={() => handleAnswer(inputValue)} disabled={isTyping} className="w-full py-3 text-xs border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-bold rounded-xl disabled:opacity-50 transition-all tracking-widest uppercase">
                              CONFIRM SELECTION
                            </button>
                          </div>
                        )}

                        {currentQ.type === 'cards' && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {currentQ.options?.map((opt: any) => {
                              const label = typeof opt === 'string' ? opt : opt.label;
                              const val = typeof opt === 'string' ? opt : opt.value;
                              return (
                                <button
                                  key={label}
                                  onClick={() => handleAnswer(val)}
                                  disabled={isTyping}
                                  className={cn(
                                    "relative px-3 py-3 bg-slate-900/80 border backdrop-blur-xl rounded-xl overflow-hidden group transition-all duration-300 flex items-center justify-center",
                                    "border-slate-700 hover:border-cyan-400 hover:bg-cyan-500/10",
                                    "hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:-translate-y-1",
                                    "text-[10px] font-bold tracking-widest text-slate-300 hover:text-cyan-300 disabled:opacity-50 uppercase text-center"
                                  )}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent h-[200%] -translate-y-full group-hover:animate-[scanline-sweep_1.5s_linear_infinite]" />
                                  <span className="relative z-10">{label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* AI Assistant Help */}
      <div className="absolute bottom-6 left-6 text-slate-500 flex items-center gap-2 text-xs font-mono opacity-50 hover:opacity-100 transition-opacity cursor-pointer z-50" style={{ cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath d='M4 2v19l6-5 4 8 3-1-4-8h6z' fill='%2306b6d4' stroke='white' stroke-width='1'/%3E%3C/svg%3E\") 2 1, auto" }}>
        🤖 NeuralForge AI Active
      </div>
    </div>
  );
};

export default Home;