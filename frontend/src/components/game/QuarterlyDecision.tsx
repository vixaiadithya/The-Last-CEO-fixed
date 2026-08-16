import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useGameStore } from '@/store/gameStore';
import { DECISIONS, getDynamicCost } from '@/data/decisions';
import CEOModel from '@/components/CEOModel';
import { Joystick } from './Joystick';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Coins,
  TrendingUp,
  Smile,
  AlertTriangle,
  Terminal,
  Radio,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Info,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Rotating, escalating boardroom story beats so no two quarters feel the same.
const BOARD_BRIEFINGS = [
  { tag: 'CHAIRMAN', text: 'The boardroom dims. "Every quarter you hesitate, a rival ships. The market is watching, CEO — what is our move?"' },
  { tag: 'CFO', text: 'A tablet slides across the obsidian table. "Capital is finite. Spend it like the future depends on it — because it does."' },
  { tag: 'CTO', text: 'Your CTO bursts in, eyes wild. "The models are starving for compute. Feed them now, or we fall behind the curve forever."' },
  { tag: 'TRADING FLOOR', text: 'Static crackles over the comms. "Word from the street: the analysts are shorting every adopter who moves too slow."' },
  { tag: 'CHRO', text: 'The CHRO lowers her voice. "The workforce is restless. Whispers of automation are spreading through every floor below us."' },
  { tag: 'WAR ROOM', text: 'Red light pulses across the glass walls. "A competitor just demoed an autonomous agent. The clock is ticking."' },
  { tag: 'CRO', text: 'The Risk Officer steeples his fingers. "Bold bets win headlines. Reckless ones write obituaries. Choose with open eyes."' },
  { tag: 'CHAIRMAN', text: '"History remembers the bold and forgets the cautious," the Chairman says. "Which legacy will you leave?"' },
  { tag: 'ENCRYPTED', text: 'A memo decrypts on your private channel. "The singularity is not a question of if, but when. Put us at the front of it."' },
  { tag: 'CITY DESK', text: 'Neon rain streaks the windows of the 100th floor. A new quarter dawns over the skyline, and the board awaits your directive.' },
  { tag: 'CTO', text: '"Our last deployment is already paying for itself," your CTO grins. "Imagine what the next one does. Press the advantage."' },
  { tag: 'CFO', text: '"Shareholders convene in ninety days," the CFO warns. "Give them a number that silences the doubters."' },
];

const DIRECTIVE_PROMPTS = [
  'Walk the floor and decide where to strike next.',
  'Three initiatives await your signature. Choose your battlefield.',
  'The board defers to you. Approach a station to issue your order.',
  'Your move shapes the quarter. Step up to a console to begin.',
  'Power is leverage applied at the right moment. Pick yours.',
];

// Typewriter effect component for the CEO popup
const TypewriterText = ({ text, delay = 0, speed = 20 }: { text: string, delay?: number, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const startTyping = async () => {
      let currentText = "";
      for (let i = 0; i < text.length; i++) {
        if (!isMounted) break;
        currentText += text.charAt(i);
        setDisplayedText(currentText);
        await new Promise(r => { timer = setTimeout(r, speed); });
      }
    };

    const delayTimer = setTimeout(() => {
      startTyping();
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(delayTimer);
      clearTimeout(timer);
    };
  }, [text, delay, speed]);

  return <span>{displayedText}</span>;
};

export const QuarterlyDecision = () => {
  const state = useGameStore((s) => s.state);
  const company = useGameStore((s) => s.company);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const [showDossier, setShowDossier] = useState(false);
  const { isLoading, makeQuarterDecision, error } = useGameLoop();
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBoundaryMessage, setShowBoundaryMessage] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showCeoHelp, setShowCeoHelp] = useState(false);
  const [ceoHelpData, setCeoHelpData] = useState<{name: string, description: string, hintOption: string} | null>(null);

  useEffect(() => {
    if (state.ceoHelpTriggered && state.currentDecisions.length > 0) {
      const ceos = [
        { name: "Satya Nadella (Microsoft)", description: "Praised for his transformative leadership, pivoted Microsoft heavily into cloud computing (Azure) and artificial intelligence, steering the company to a valuation well over $3 trillion." },
        { name: "Jensen Huang (NVIDIA)", description: "A visionary leader who turned NVIDIA into the global powerhouse of AI hardware, accelerated computing, and data center technologies." },
        { name: "Tim Cook (Apple)", description: "Recognized for supreme supply chain management and expanding Apple’s services ecosystem, while returning hundreds of billions to shareholders." },
        { name: "Mark Zuckerberg (Meta Platforms)", description: "Leading Meta’s massive investment in AI integration, virtual reality, and heavily refined ad-targeting to sustain long-term growth." },
        { name: "Andy Jassy (Amazon)", description: "Known for driving customer obsession and scaling Amazon Web Services (AWS) into the premier global cloud platform." }
      ];
      const randomCeo = ceos[Math.floor(Math.random() * ceos.length)];
      
      const unlockedDecisions = DECISIONS.filter(d => state.currentDecisions.includes(d.id));
      const best = [...unlockedDecisions].sort((a, b) => b.roiImpact - a.roiImpact)[0];
      
      setCeoHelpData({ ...randomCeo, hintOption: best?.title.replace(/_/g, ' ') || 'an option' });
      setShowCeoHelp(true);
      
      useGameStore.getState().actions.updateGameState({ ceoHelpTriggered: false });
    }
  }, [state.ceoHelpTriggered, state.currentDecisions]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isMusicOn) {
        audio.play().catch(err => console.error("Audio playback failed", err));
      } else {
        audio.pause();
      }
    }
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [isMusicOn]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (showCeoHelp) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const playRing = (startTime: number) => {
           const osc1 = ctx.createOscillator();
           const osc2 = ctx.createOscillator();
           const gain = ctx.createGain();
           osc1.type = 'sine';
           osc1.frequency.value = 440;
           osc2.type = 'sine';
           osc2.frequency.value = 480;
           osc1.connect(gain);
           osc2.connect(gain);
           gain.connect(ctx.destination);
           gain.gain.setValueAtTime(0, startTime);
           gain.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
           gain.gain.setValueAtTime(0.15, startTime + 1.0);
           gain.gain.linearRampToValueAtTime(0, startTime + 1.1);
           osc1.start(startTime);
           osc2.start(startTime);
           osc1.stop(startTime + 1.1);
           osc2.stop(startTime + 1.1);
        };
        playRing(ctx.currentTime);
        playRing(ctx.currentTime + 2.0);
      } catch (e) {
        console.error('AudioContext not supported', e);
      }
    }
  }, [showCeoHelp]);

  const toggleFullscreen = () => {
    const el = document.getElementById('game-container');
    if (!document.fullscreenElement && el) {
      el.requestFullscreen().catch(err => console.error(err));
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  // Filter decisions based on current decisions hand
  const unlockedDecisions = DECISIONS.filter(d => state.currentDecisions.includes(d.id)).map(d => ({
    ...d,
    cost: getDynamicCost(d.cost, state.revenue)
  }));

  // Monotonic quarter counter drives an escalating story so each turn reads fresh.
  const turn = state.currentYear * 4 + state.currentQuarter;
  const briefing = BOARD_BRIEFINGS[turn % BOARD_BRIEFINGS.length];
  const directivePrompt = DIRECTIVE_PROMPTS[turn % DIRECTIVE_PROMPTS.length];

  const handleDecision = async (decisionId: string) => {
    setSelectedDecision(decisionId);
    try {
      await makeQuarterDecision(decisionId);
      // We clear the selection so that when the player returns, the terminal asks to walk to a station
      setSelectedDecision(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="cyber-glass border-slate-800 shadow-xl overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40 animate-pulse" />
      <div className="cyber-sweep-overlay" />

      <CardHeader className="border-b border-slate-900 pb-4 relative z-10">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-space text-sm font-black tracking-widest text-cyan-400 text-glow-cyan">
            // BOARD MEETING // STRATEGY DIRECTIVE
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDossier(true)}
              title="View your company dossier (board-meeting choices)"
              className="flex items-center justify-center w-7 h-7 rounded border border-slate-800 bg-slate-950 text-cyan-400 hover:border-cyan-500/60 hover:text-cyan-300 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
            <span className="text-xs font-space font-semibold bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-purple-400">
              QUARTER: Q{state.currentQuarter} <span className="text-slate-600">//</span> YEAR: {state.currentYear}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      {/* CEO Help Modal via Portal */}
      {showCeoHelp && ceoHelpData && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setShowCeoHelp(false)}
        >
          <div
            className="relative w-full max-w-lg cyber-glass border border-emerald-500/50 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-500 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-950 border-2 border-emerald-500 mb-6 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse">
               <span className="text-2xl">👑</span>
            </div>
            <h2 className="text-2xl font-space font-black tracking-widest text-emerald-400 uppercase mb-2 min-h-[2rem]">
              <TypewriterText text={`Incoming Call: ${ceoHelpData.name}`} speed={40} />
            </h2>
            <p className="text-xs font-mono text-emerald-500/80 mb-6 uppercase tracking-widest min-h-[3rem]">
              <TypewriterText text={ceoHelpData.description} delay={1000} speed={20} />
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 min-h-[3rem]">
              <p className="text-sm text-emerald-300 font-space italic">
                <TypewriterText text={`"Based on my experience, I'd recommend '${ceoHelpData.hintOption}' — it might be the way to go right now."`} delay={4000} speed={30} />
              </p>
            </div>
            <Button
              onClick={() => setShowCeoHelp(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-space uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300"
            >
              Acknowledge
            </Button>
          </div>
        </div>,
        document.body
      )}

      {/* Company Dossier — recap of board-meeting choices */}
      {showDossier && company && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowDossier(false)}
        >
          <div
            className="relative w-full max-w-md cyber-glass cyber-border-cyan rounded-2xl p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDossier(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-space font-black tracking-widest text-cyan-400 text-glow-cyan uppercase mb-1">
              Company Dossier
            </h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.25em] mb-5">
              Your board-meeting mandate
            </p>
            <div className="space-y-2.5">
              {([
                ['Founder', company.founderName || '—'],
                ['Company', company.name || '—'],
                ['Industry', company.industry || '—'],
                ['Headquarters', company.country || '—'],
                ['Starting Budget', `$${(company.startingBudget || 0).toLocaleString()}`],
                ['AI Investment', `$${(company.aiInvestment || 0).toLocaleString()}`],
                ['Initial Workforce', `${company.employees ?? '—'} employees`],
                ['Founded', `${company.foundedYear ?? '—'}`],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-800/70 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 shrink-0">{label}</span>
                  <span className="text-sm font-space font-semibold text-slate-200 text-right truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CardContent className="pt-6 relative z-10">
        {/* Story briefing — rotates and escalates each quarter */}
        <div className="mb-6 relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-r from-slate-950/90 via-slate-900/50 to-slate-950/90 p-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="absolute inset-0 cyber-sweep-overlay opacity-30" />
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/80 uppercase">
              Incoming Transmission <span className="text-slate-600">//</span> {briefing.tag}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-space leading-relaxed italic relative z-10">
            {briefing.text}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-center gap-3 text-xs font-mono">
            <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            <span>ERROR_CODE: {error}</span>
          </div>
        )}

        {currentEvent && (
          <div className="mb-6 p-5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex flex-col gap-2 relative overflow-hidden animate-pulse">
             <div className="absolute inset-0 cyber-sweep-overlay opacity-50" />
             <div className="flex items-center gap-2 text-rose-400 relative z-10">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-space font-bold uppercase tracking-widest text-sm">{currentEvent.title}</h3>
             </div>
             <p className="text-xs text-rose-300 relative z-10 font-space">{currentEvent.description}</p>
          </div>
        )}

        {(() => {
          const actionCard = (
            <div className={`flex flex-col transition-all duration-300 ${isFullscreen ? 'absolute bottom-6 right-6 w-80 z-40 shadow-2xl' : ''}`}>
              <div className={`bg-slate-950/90 border border-slate-800 rounded-xl p-6 flex flex-col relative overflow-hidden cyber-glass shadow-xl ${isFullscreen ? 'max-h-[80vh] overflow-y-auto' : 'flex-1'}`}>
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-40" />
                
                <h3 className="text-sm font-space font-bold text-cyan-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Terminal Uplink
                </h3>

                {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
                    <span className="text-cyan-400 font-space font-bold tracking-widest animate-pulse text-sm">IMPLEMENTING...</span>
                  </div>
                ) : !selectedDecision ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center animate-pulse">
                      <img src="/Logo.png" alt="logo" className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-300 font-space font-bold uppercase tracking-widest text-sm">Awaiting CEO Directive</p>
                      <p className="text-slate-500 text-xs font-mono">
                        {directivePrompt}<br/><br/>
                        <span className="text-emerald-400">← LEFT: {unlockedDecisions[0]?.title.replace(/_/g, ' ')}</span><br/>
                        <span className="text-yellow-400">↑ STRAIGHT: {unlockedDecisions[1]?.title.replace(/_/g, ' ')}</span><br/>
                        <span className="text-cyan-400">→ RIGHT: {unlockedDecisions[2]?.title.replace(/_/g, ' ')}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                    {(() => {
                      const decision = unlockedDecisions.find(d => d.id === selectedDecision);
                      if (!decision) return null;
                      
                      return (
                        <>
                          <h4 className="text-xl font-space font-bold text-white mb-4 tracking-wide leading-tight">
                            {decision.title.replace(/_/g, ' ')}
                          </h4>
                          
                          <p className="text-sm text-slate-400 leading-relaxed font-space mb-6 flex-1">
                            {decision.description}
                          </p>

                          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mb-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Coins className="h-4 w-4 text-rose-400" />
                                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Cost</span>
                              </div>
                              <span className="font-bold text-rose-400 text-lg">-${decision.cost.toLocaleString()}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleDecision(decision.id)}
                            className="w-full h-12 font-space font-black tracking-widest bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all uppercase"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirm Action
                          </Button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <div className={`grid gap-6 ${isFullscreen ? 'block' : 'lg:grid-cols-[2fr,1fr]'}`}>
              {/* Left side: 3D CEO Game */}
              <div id="game-container" className={`w-full relative rounded-xl overflow-hidden border border-slate-800 cyber-glass bg-[#020617] ${isFullscreen ? 'h-screen border-none rounded-none' : 'h-[500px]'}`}>
                
                {isLoading && (
                  <div className="absolute inset-0 z-30 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  </div>
                )}

                <Joystick />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMusicOn(!isMusicOn)}
                  className="absolute top-4 right-16 z-20 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white"
                >
                  {isMusicOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="absolute top-4 right-4 z-20 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>

                {/* Hidden Audio Element */}
                <audio ref={audioRef} src="/gamesound.mp3" loop />

                <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
                  <span className="bg-black/50 px-4 py-1 rounded text-[10px] text-white tracking-widest font-mono">USE WASD / ARROW KEYS OR THE JOYSTICK TO WALK TO A STATION{isFullscreen ? ' (ESC TO EXIT FULLSCREEN)' : ''}</span>
                </div>

                {showBoundaryMessage && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/95 border border-rose-500 p-6 rounded-xl z-50 animate-in zoom-in-95 duration-200 text-center shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                    <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-3 animate-pulse" />
                    <p className="text-rose-400 font-bold font-orbitron tracking-widest text-sm mb-1 uppercase">Restricted Area</p>
                    <p className="text-slate-300 font-space text-xs">Hey CEO! Lot of work to do.</p>
                    <p className="text-slate-400 font-space text-[10px] mt-1">Go back and make this company big!</p>
                  </div>
                )}

                <CEOModel
                  playable={true}
                  archetype={company?.skin || 'researcher'}
                  quarter={state.currentQuarter}
                  selectedStation={selectedDecision ? 
                    (selectedDecision === unlockedDecisions[0]?.id ? 'hr' : 
                     selectedDecision === unlockedDecisions[1]?.id ? 'boardroom' : 
                     selectedDecision === unlockedDecisions[2]?.id ? 'ml' : 'none') 
                    : 'none'}
                  onStationChange={(station) => {
                    if (isLoading) return;
                    if (station === 'none') {
                      setSelectedDecision(null);
                      return;
                    }
                    if (station === 'boundary') {
                      if (!showBoundaryMessage) {
                        setShowBoundaryMessage(true);
                        setTimeout(() => setShowBoundaryMessage(false), 2500);
                      }
                      return;
                    }
                    
                    let dec = null;
                    if (station === 'hr' && unlockedDecisions[0]) dec = unlockedDecisions[0].id;
                    if (station === 'boardroom' && unlockedDecisions[1]) dec = unlockedDecisions[1].id;
                    if (station === 'ml' && unlockedDecisions[2]) dec = unlockedDecisions[2].id;
                    
                    if (dec !== selectedDecision) {
                      setSelectedDecision(dec);
                    }
                  }}
                />
                
                {/* Render action card overlay in fullscreen */}
                {isFullscreen && actionCard}
              </div>

              {/* Render normal side action card when not fullscreen */}
              {!isFullscreen && actionCard}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};

export default QuarterlyDecision;
