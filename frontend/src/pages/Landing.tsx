import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit, Database, LineChart, Target, Server, Activity, 
  BarChart, Network, ChevronRight, Terminal, Gauge, Layers, Zap, TrendingUp,
  Users, Shield, Crosshair, Clock, ArrowDown, Sparkles, Github
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   PARTICLE CANVAS — floating dots connected by proximity lines
   ═══════════════════════════════════════════════════════════════ */
interface Particle {
  x: number; y: number; vx: number; vy: number; r: number; o: number;
}

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const raf = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const count = Math.min(80, Math.floor(window.innerWidth / 18));
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      o: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = particles.current;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse repulsion
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.vx += dx * 0.0008;
          p.vy += dy * 0.0008;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.o})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const ddx = p.x - q.x;
          const ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.08 * (1 - d / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    const handleMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

/* ═══════════════════════════════════════════════════
   GLITCH TEXT — periodic distortion on the title
   ═══════════════════════════════════════════════════ */
const GlitchText = ({ text, alternateText, className = '' }: { text: string; alternateText?: string; className?: string }) => {
  const [showAlt, setShowAlt] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [g, setG] = useState({ clip1: '', clip2: '', clip3: '', x1: 0, x2: 0, skew: 0, scale: 1, blur: 0 });

  useEffect(() => {
    if (!alternateText) return;

    let timeoutId: number;
    let glitchTimeoutId: number;
    let isShowingAlt = false;

    const runCycle = () => {
      // Trigger extreme glitch
      setGlitching(true);
      const h1 = Math.random() * 80;
      const h2 = Math.random() * 80;
      const h3 = Math.random() * 80;
      setG({
        clip1: `polygon(0 ${h1}%, 100% ${h1}%, 100% ${h1 + 15}%, 0 ${h1 + 15}%)`,
        clip2: `polygon(0 ${h2}%, 100% ${h2}%, 100% ${h2 + 20}%, 0 ${h2 + 20}%)`,
        clip3: `polygon(0 ${h3}%, 100% ${h3}%, 100% ${h3 + 10}%, 0 ${h3 + 10}%)`,
        x1: (Math.random() - 0.5) * 15,
        x2: (Math.random() - 0.5) * 15,
        skew: (Math.random() - 0.5) * 20,
        scale: 1 + Math.random() * 0.05, // zoom up to 1.05
        blur: Math.random() * 2
      });

      // End glitch and swap
      glitchTimeoutId = window.setTimeout(() => {
        setGlitching(false);

        isShowingAlt = !isShowingAlt;
        setShowAlt(isShowingAlt);

        // 'YOU' shows for 1.0s, 'CEO' for 5s
        const nextDuration = isShowingAlt ? 1000 : 5000;
        timeoutId = window.setTimeout(runCycle, nextDuration);

      }, 80 + Math.random() * 50);
    };

    // Initial wait on 'CEO'
    timeoutId = window.setTimeout(runCycle, 5000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(glitchTimeoutId);
    };
  }, [alternateText]);

  const currentText = showAlt && alternateText ? alternateText : text;

  return (
    <span className="relative inline-block">
      <span
        className={`relative z-10 inline-block transition-none ${className}`}
        style={{
          transform: glitching ? `skew(${g.skew}deg) scale(${g.scale})` : 'none',
          opacity: glitching ? 0.7 : 1,
          filter: glitching ? `blur(${g.blur}px) hue-rotate(${Math.random() * 90}deg)` : 'none'
        }}
      >
        {currentText}
      </span>
      {glitching && (
        <>
          <span
            className="absolute top-0 left-0 right-0 z-20 mix-blend-screen"
            style={{
              color: '#0ff', // cyan
              clipPath: g.clip1,
              transform: `translate(${g.x1}px, 4px) scale(${g.scale * 1.05})`,
              textShadow: '-4px 0 #f0f' // magenta
            }}
          >
            {currentText}
          </span>
          <span
            className="absolute top-0 left-0 right-0 z-20 mix-blend-screen"
            style={{
              color: '#f0f', // magenta
              clipPath: g.clip2,
              transform: `translate(${g.x2}px, -4px) skew(${g.skew * -1}deg)`,
              textShadow: '4px 0 #0ff' // cyan
            }}
          >
            {currentText}
          </span>
          <span
            className="absolute top-0 left-0 right-0 z-30 opacity-80 mix-blend-color-dodge text-yellow-300"
            style={{
              clipPath: g.clip3,
              transform: `translate(${(Math.random() - 0.5) * 50}px, 0px) scale(1.1)`,
              filter: 'blur(1px)'
            }}
          >
            {currentText}
          </span>
          <span
            className="absolute top-0 left-0 right-0 z-30 opacity-40 mix-blend-overlay text-white"
            style={{
              clipPath: `polygon(0 ${Math.random() * 100}%, 100% ${Math.random() * 100}%, 100% ${Math.random() * 100 + 10}%, 0 ${Math.random() * 100 + 10}%)`,
              transform: `translate(${(Math.random() - 0.5) * 60}px, 0px)`,
            }}
          >
            {currentText}
          </span>
        </>
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════════
   ANIMATED COUNTER — counts up on scroll-reveal
   ═══════════════════════════════════════════════════ */
const Counter = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
          setCount(Math.round(ease * end));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ═══════════════════════════════════════════════════
   SCROLL-REVEAL WRAPPER
   ═══════════════════════════════════════════════════ */
const Reveal = ({ children, className = '', delay = 0, threshold = 0.1 }: { children: React.ReactNode; className?: string; delay?: number; threshold?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold, rootMargin: '0px 0px -50px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1500 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   HUD CORNER BRACKETS
   ═══════════════════════════════════════════════════ */
const Corners = ({ color = 'rgba(34,211,238,0.5)' }: { color?: string }) => (
  <>
    <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: color }} />
    <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 rounded-tr-sm" style={{ borderColor: color }} />
    <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 rounded-bl-sm" style={{ borderColor: color }} />
    <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 rounded-br-sm" style={{ borderColor: color }} />
  </>
);

/* ═══════════════════════════════════════════════════
   PERSPECTIVE GRID FLOOR
   ═══════════════════════════════════════════════════ */
const GridFloor = () => (
  <div className="absolute bottom-0 inset-x-0 h-[50vh] z-0 pointer-events-none overflow-hidden" style={{ perspective: '300px' }}>
    <div
      className="absolute inset-x-[-60%] bottom-0 h-[250%] origin-bottom"
      style={{
        transform: 'rotateX(72deg)',
        backgroundImage:
          'linear-gradient(rgba(6,182,212,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.35) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent 70%)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent 70%)',
        animation: 'grid-pan 5s linear infinite',
      }}
    />
    <div className="absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t from-[#040610] to-transparent" />
  </div>
);

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: BrainCircuit, color: 'text-cyan-400', glow: 'rgba(6,182,212,0.35)',
    border: 'border-cyan-500/30', hoverBorder: 'hover:border-cyan-400/60',
    code: 'SYS.01', title: 'Live ML Predictions',
    body: 'XGBoost models predict revenue impact and productivity from real corporate AI-adoption data. Every move is scored.',
    stat: '~0.96 R²',
  },
  {
    icon: Target, color: 'text-indigo-400', glow: 'rgba(99,102,241,0.35)',
    border: 'border-indigo-500/30', hoverBorder: 'hover:border-indigo-400/60',
    code: 'SYS.02', title: '21 Strategic Plays',
    body: 'From basic RPA to autonomous agent swarms — 9 categories of real-world AI decisions that adapt to your company state.',
    stat: '9 Categories',
  },
  {
    icon: Zap, color: 'text-amber-400', glow: 'rgba(245,158,11,0.35)',
    border: 'border-amber-500/30', hoverBorder: 'hover:border-amber-400/60',
    code: 'SYS.03', title: 'Dynamic Events',
    body: 'Recessions, regulation shifts, GPU shortages, cyberattacks and viral hits inject real-world chaos each quarter.',
    stat: '∞ Scenarios',
  },
  {
    icon: LineChart, color: 'text-emerald-400', glow: 'rgba(16,185,129,0.35)',
    border: 'border-emerald-500/30', hoverBorder: 'hover:border-emerald-400/60',
    code: 'SYS.04', title: 'Executive Reports',
    body: 'Board decisions, A/B/C scenario comparisons, risk assessments and readiness scores — exportable to .docx.',
    stat: 'Full Audit',
  },
  {
    icon: Shield, color: 'text-rose-400', glow: 'rgba(244,63,94,0.35)',
    border: 'border-rose-500/30', hoverBorder: 'hover:border-rose-400/60',
    code: 'SYS.05', title: 'Risk & Survival Engine',
    body: 'A composite risk model tracks financial health, morale, automation debt and regulatory exposure every quarter.',
    stat: 'Real-Time',
  },
  {
    icon: Database, color: 'text-purple-400', glow: 'rgba(168,85,247,0.35)',
    border: 'border-purple-500/30', hoverBorder: 'hover:border-purple-400/60',
    code: 'SYS.06', title: 'Immutable Ledger',
    body: 'Every prediction, decision and outcome is logged to a local SQLite database for post-game historical analysis.',
    stat: 'Permanent',
  },
];

const STATS = [
  { value: 20, suffix: '+', label: 'Years of Simulation', icon: Clock },
  { value: 8, suffix: '', label: 'Distinct Endings', icon: Crosshair },
  { value: 200, suffix: 'K+', label: 'Training Rows', icon: Database },
  { value: 21, suffix: '', label: 'Strategic Plays', icon: Target },
];

const ENDINGS = [
  { emoji: '🦄', name: 'Unicorn Exit', desc: 'IPO with $3M+ budget', color: 'from-cyan-500 to-blue-500' },
  { emoji: '🏛️', name: 'IPO Listing', desc: '30+ staff, $2M+ budget', color: 'from-indigo-500 to-violet-500' },
  { emoji: '💼', name: 'Megacorp Acquisition', desc: '$1.5M+ or 100% ROI', color: 'from-emerald-500 to-teal-500' },
  { emoji: '🤖', name: 'Rogue AI Singularity', desc: 'Tech startup, 200%+ ROI', color: 'from-rose-500 to-pink-500' },
  { emoji: '👑', name: 'Bootstrap Legend', desc: 'Survive from nothing', color: 'from-amber-500 to-orange-500' },
  { emoji: '☕', name: 'Sustainable Lifestyle', desc: 'Small but profitable', color: 'from-lime-500 to-green-500' },
  { emoji: '🤝', name: 'Talent Acquisition', desc: 'Bankrupt but valued', color: 'from-purple-500 to-fuchsia-500' },
  { emoji: '💥', name: 'Crash & Burn', desc: 'Capital exhausted', color: 'from-red-600 to-red-400' },
];

const BOOT_LOG = [
  '> initializing inference core ........ OK',
  '> loading revenue_model.joblib ....... OK',
  '> loading productivity_model.joblib .. OK',
  '> binding FastAPI :: XGBoost 3.x ..... OK',
  '> dynamic event engine online ........ OK',
  '> board uplink established ........... READY',
];

const TECH_STACK = [
  { name: 'React 18', color: 'text-cyan-400' },
  { name: 'TypeScript', color: 'text-blue-400' },
  { name: 'XGBoost', color: 'text-amber-400' },
  { name: 'FastAPI', color: 'text-emerald-400' },
  { name: 'Three.js', color: 'text-purple-400' },
  { name: 'Zustand', color: 'text-rose-400' },
];



/* ═══════════════════════════════════════════════════
   MAIN LANDING COMPONENT
   ═══════════════════════════════════════════════════ */
export const Landing = () => {
  const navigate = useNavigate();
  const [logCount, setLogCount] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [typed, setTyped] = useState(12); // Skip typing effect
  const [heroReady, setHeroReady] = useState(false);
  const startedAt = useRef(Date.now());
  const TITLE = 'THE LAST CEO';

  // Uptime clock
  useEffect(() => {
    const id = setInterval(() => setUptime(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Type title
  useEffect(() => {
    if (typed >= TITLE.length) return;
    const id = setTimeout(() => setTyped(c => c + 1), 80);
    return () => clearTimeout(id);
  }, [typed]);

  // Boot log
  useEffect(() => {
    if (typed < TITLE.length || logCount >= BOOT_LOG.length) return;
    const id = setTimeout(() => setLogCount(c => c + 1), 300 + logCount * 180);
    return () => clearTimeout(id);
  }, [logCount, typed]);

  // Delay hero reveal
  useEffect(() => {
    const id = setTimeout(() => setHeroReady(true), 300);
    return () => clearTimeout(id);
  }, []);

  const clock = `${String(Math.floor(uptime / 60)).padStart(2, '0')}:${String(uptime % 60).padStart(2, '0')}`;
  const titleDone = typed >= TITLE.length;

  return (
    <div className="min-h-screen bg-[#040610] text-slate-100 overflow-x-hidden">
      <ParticleField />

      {/* ═══ TOP HUD BAR ═══ */}
      <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 md:px-8 py-3 text-[10px] font-mono tracking-[0.25em] uppercase border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <span className="text-slate-500 flex items-center gap-2">
          <span className="h-2 w-2 rounded bg-cyan-500/40 animate-pulse" />
          The Last CEO <span className="text-slate-700">//</span> Enterprise Sim
        </span>
        <span className="hidden md:flex items-center gap-4">
          {TECH_STACK.map(t => (
            <span key={t.name} className={`${t.color} opacity-50`}>{t.name}</span>
          ))}
        </span>
        <span className="flex items-center gap-2 text-emerald-400/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
          Online <span className="text-slate-700">//</span> {clock}
        </span>
      </div>

      {/* ═══════════════════════════════════════════
           SECTION 1 — HERO (Full Viewport)
           ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* City backdrop */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/cyberpunk_city.png')",
            opacity: 0.15,
            filter: 'saturate(1.4)',
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 z-[1]" style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 20%, #040610 75%)',
        }} />
        {/* Top radial glow */}
        <div className="absolute inset-0 z-[1]" style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(6,182,212,0.12), transparent 50%)',
        }} />

        <GridFloor />

        {/* Hero content */}
        <div className={`relative z-10 text-center max-w-5xl mx-auto px-6 pt-32 transition-all duration-1500 ${heroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Holographic ring logo */}
          <div className="relative inline-flex items-center justify-center w-36 h-36 md:w-44 md:h-44 mb-6 -mt-[70px]">
            <style>{`
              @keyframes shortPing {
                75%, 100% {
                  transform: scale(1.5);
                  opacity: 0;
                }
              }
            `}
            </style>
            <span className="absolute inset-0 rounded-full blur-3xl bg-cyan-500/10" />
            <span className="absolute inset-4 rounded-full blur-xl bg-indigo-500/8" />
            <div className="relative flex items-center justify-center p-5 bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 rounded-full border border-cyan-500/25 shadow-[0_0_40px_rgba(6,182,212,0.25)] hover:shadow-[0_0_60px_rgba(6,182,212,0.4)] hover:scale-110 transition-all duration-700">
              <span className="absolute rounded-full border border-cyan-500/50" style={{ width: '120px', height: '120px', animation: 'shortPing 3s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <span className="absolute rounded-full border border-indigo-500/40" style={{ width: '140px', height: '140px', animation: 'shortPing 3s cubic-bezier(0, 0, 0.2, 1) infinite 1s' }} />
              <span className="absolute rounded-full border border-cyan-400/30" style={{ width: '160px', height: '160px', animation: 'shortPing 3s cubic-bezier(0, 0, 0.2, 1) infinite 2s' }} />
              <img
                src="/Logo.png"
                alt="The Last CEO"
                className="relative z-10 w-32 h-32 md:w-24 md:h-24 object-contain"
              />
            </div>
          </div>

          {/* Subtitle badge */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-cyan-500/50" />
            <span className="text-[11px] font-mono uppercase tracking-[0.5em] text-cyan-400/70 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> AI Strategy Simulator
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-orbitron font-black tracking-tight text-white uppercase mb-6 leading-[0.9]">
            {titleDone ? (
              <>
                <span className="block text-glow-cyan text-transparent bg-clip-text bg-gradient-to-b from-sky-100 to-cyan-500">The Last</span>
                <GlitchText
                  text="CEO"
                  alternateText="YOU"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400"
                />
              </>
            ) : (
              <span className="block">
                {TITLE.slice(0, typed)}
                <span className="text-cyan-400 animate-pulse">_</span>
              </span>
            )}
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-space leading-relaxed mb-4">
            One CEO. Twenty years. Infinite consequences.
          </p>
          <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto font-space leading-relaxed mb-10">
            Lead a company through the AI revolution — every quarterly decision scored by a{' '}
            <span className="text-cyan-400 font-semibold">live XGBoost prediction engine</span>.
            Survive to 2035 or face the consequences.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <a
              href="#features"
              className="group px-8 py-4 font-space font-bold text-sm tracking-wider uppercase text-slate-300 border border-slate-700/80 bg-slate-900/40 backdrop-blur-sm rounded-xl hover:border-cyan-500/50 hover:text-cyan-300 hover:bg-slate-800/50 transition-all duration-300 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Explore Systems
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* System badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-slate-600 tracking-[0.2em] uppercase">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800/60 bg-slate-900/30">
              <Gauge className="w-3 h-3 text-cyan-500/50" /> XGBoost Core
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800/60 bg-slate-900/30">
              <Activity className="w-3 h-3 text-emerald-500/50" /> FastAPI Backend
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800/60 bg-slate-900/30">
              <Server className="w-3 h-3 text-purple-500/50" /> React + Three.js
            </span>
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════
           SECTION 2 — BOOT SEQUENCE + STATS
           ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Horizontal divider glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-20 blur-3xl bg-cyan-500/10 -translate-y-1/2" />

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          {/* Boot log terminal */}
          <Reveal>
            <div className="relative cyber-glass cyber-border-cyan rounded-2xl p-6 overflow-hidden">
              <Corners />
              <div className="cyber-sweep-overlay opacity-30" />
              <div className="relative z-10 space-y-4">
                <h3 className="font-orbitron font-bold text-cyan-400 text-xs tracking-[0.25em] uppercase flex items-center gap-2 text-glow-cyan">
                  <Terminal className="w-4 h-4" /> Inference Engine Boot
                </h3>
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 font-mono text-[11px] leading-relaxed min-h-[170px]">
                  {BOOT_LOG.slice(0, logCount).map((line, i) => (
                    <div key={i} className="text-slate-400 animate-in fade-in slide-in-from-left-2 duration-300">
                      {line.replace(/(OK|READY)$/, '')}
                      <span className={line.includes('READY') ? 'text-cyan-400 font-bold' : 'text-emerald-400'}>
                        {(line.match(/(OK|READY)$/) || [''])[0]}
                      </span>
                    </div>
                  ))}
                  {logCount >= BOOT_LOG.length && (
                    <div className="text-cyan-400/80 mt-2 typing-cursor">
                      awaiting CEO input
                    </div>
                  )}
                </div>
                {/* Mini status indicators */}
                <div className="flex items-center gap-4 text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Revenue Model
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-400/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                    Productivity Model
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-400/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Event Engine
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Stats grid */}
          <Reveal delay={200}>
            <div className="grid grid-cols-2 gap-5">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="group relative p-5 bg-slate-900/50 border border-slate-800/60 rounded-xl hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all duration-500"
                >
                  <Corners color="rgba(148,163,184,0.15)" />
                  <s.icon className="w-5 h-5 text-cyan-400/50 mb-3 group-hover:text-cyan-400 transition-colors" />
                  <div className="text-3xl md:text-4xl font-orbitron font-black text-white mb-1">
                    <Counter end={s.value} suffix={s.suffix} duration={1800 + i * 200} />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 3 — FEATURES
           ═══════════════════════════════════════════ */}
      <section id="features" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-[11px] font-mono uppercase tracking-[0.5em] text-indigo-400/60 flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-indigo-500/30" /> Core Systems <span className="h-px w-8 bg-indigo-500/30" />
              </span>
              <h2 className="text-4xl md:text-5xl font-orbitron font-black text-white tracking-tight mb-4">
                Six Engines.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  One Simulation.
                </span>
              </h2>
              <p className="text-slate-500 font-space max-w-xl mx-auto">
                Every subsystem works in concert to create the most realistic AI business strategy experience ever built.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.code} delay={i * 150}>
                <div
                  className={`group relative p-6 bg-slate-900/40 backdrop-blur-sm rounded-2xl border ${f.border} ${f.hoverBorder} hover:-translate-y-2 hover:shadow-lg transition-all duration-500 cursor-default overflow-hidden h-full`}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: f.glow }}
                  />
                  <Corners color="rgba(148,163,184,0.15)" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <f.icon className={`w-7 h-7 ${f.color} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`} />
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono ${f.color} opacity-60 px-2 py-0.5 rounded-full border border-current/20 bg-current/5`}>
                          {f.stat}
                        </span>
                        <span className="text-[10px] font-mono text-slate-600 tracking-widest">{f.code}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-orbitron font-bold text-white mb-2 tracking-wide">{f.title}</h3>
                    <p className="text-sm text-slate-400 font-space leading-relaxed">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 4 — ENDINGS MATRIX
           ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-24 blur-3xl bg-rose-500/8 -translate-y-1/2" />

        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-[11px] font-mono uppercase tracking-[0.5em] text-rose-400/60 flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-8 bg-rose-500/30" /> Outcomes <span className="h-px w-8 bg-rose-500/30" />
              </span>
              <h2 className="text-4xl md:text-5xl font-orbitron font-black text-white tracking-tight mb-4">
                8 Endings.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">
                  Your Legacy.
                </span>
              </h2>
              <p className="text-slate-500 font-space max-w-xl mx-auto">
                From Unicorn Exit to Crash & Burn — every decision chain leads to a distinct outcome.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ENDINGS.map((e, i) => (
              <Reveal key={e.name} delay={i * 100}>
                <div className="group relative p-5 bg-slate-900/50 border border-slate-800/60 rounded-xl hover:border-slate-600/80 hover:-translate-y-1 transition-all duration-500 text-center overflow-hidden cursor-default">
                  {/* Gradient glow on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${e.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <span className="text-3xl mb-3 block">{e.emoji}</span>
                    <h4 className="text-sm font-orbitron font-bold text-white mb-1">{e.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">{e.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 5 — ARCHITECTURE OVERVIEW
           ═══════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div className="relative cyber-glass rounded-2xl border border-emerald-500/20 p-8 md:p-12 overflow-hidden">
              <Corners color="rgba(16,185,129,0.4)" />
              <div className="cyber-sweep-overlay opacity-20" />

              <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                {/* Left: Architecture description */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.5em] text-emerald-400/60 flex items-center gap-3 mb-4">
                    <Network className="w-3 h-3" /> System Architecture
                  </span>
                  <h2 className="text-3xl md:text-4xl font-orbitron font-black text-white tracking-tight mb-6">
                    Built for{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      Real Inference
                    </span>
                  </h2>
                  <div className="space-y-4 text-sm text-slate-400 font-space">
                    <p>
                      Your decisions flow through a full-stack ML pipeline: React captures input → FastAPI normalizes features → XGBoost predicts outcomes → Business rules compute the next company state.
                    </p>
                    <p>
                      No mock data. No random dice rolls. Every revenue and productivity number comes from a gradient-boosted model trained on <span className="text-emerald-400">200K+ rows</span> of real corporate AI adoption data.
                    </p>
                  </div>
                </div>

                {/* Right: Tech flow visualization */}
                <div className="space-y-3">
                  {[
                    { label: 'Player Input', icon: Users, color: 'text-cyan-400', border: 'border-cyan-500/30' },
                    { label: 'React + Zustand', icon: Layers, color: 'text-blue-400', border: 'border-blue-500/30' },
                    { label: 'FastAPI Pipeline', icon: Server, color: 'text-emerald-400', border: 'border-emerald-500/30' },
                    { label: 'XGBoost Inference', icon: BrainCircuit, color: 'text-amber-400', border: 'border-amber-500/30' },
                    { label: 'Business Rules', icon: Shield, color: 'text-purple-400', border: 'border-purple-500/30' },
                    { label: 'Dashboard Update', icon: BarChart, color: 'text-rose-400', border: 'border-rose-500/30' },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg border ${step.border} bg-slate-900/60 flex items-center justify-center`}>
                        <step.icon className={`w-5 h-5 ${step.color}`} />
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
                      <span className={`text-xs font-mono ${step.color} tracking-wider`}>{step.label}</span>
                      {i < 5 && (
                        <ChevronRight className="w-3 h-3 text-slate-700 flex-shrink-0 rotate-90 md:rotate-0 opacity-0 md:opacity-100" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 6 — FINAL CTA
           ═══════════════════════════════════════════ */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        {/* Background elements */}
        <div className="absolute inset-0 z-0" style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08), transparent 60%)',
        }} />
        <div className="absolute bottom-0 inset-x-0 h-[40vh] z-0 pointer-events-none overflow-hidden" style={{ perspective: '300px' }}>
          <div
            className="absolute inset-x-[-60%] bottom-0 h-[250%] origin-bottom"
            style={{
              transform: 'rotateX(72deg)',
              backgroundImage:
                'linear-gradient(rgba(6,182,212,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.2) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 65%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 65%)',
              animation: 'grid-pan 5s linear infinite',
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                <Crosshair className="w-10 h-10 text-cyan-300" />
              </div>
              <h2 className="text-4xl md:text-6xl font-orbitron font-black text-white tracking-tight mb-6">
                Ready to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                  Lead?
                </span>
              </h2>
              <p className="text-lg text-slate-400 font-space mb-10 max-w-lg mx-auto">
                The board is assembled. The models are trained. The market won't wait.
                <br />
                <span className="text-slate-500">Your 20-year countdown starts now.</span>
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <button
              onClick={() => navigate('/auth')}
              className="group relative px-14 py-3 font-orbitron font-black text-sm tracking-[0.3em] text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.5),0_0_80px_rgba(6,182,212,0.2)] hover:shadow-[0_0_60px_rgba(6,182,212,0.8),0_0_120px_rgba(6,182,212,0.3)] hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto overflow-hidden"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Terminal className="w-5 h-5 relative z-10" />
              <span className="relative z-10 pt-1">ENTER SIMULATION</span>
              <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>
          </Reveal>

          <Reveal delay={400}>
            <p className="mt-8 text-[10px] font-mono text-slate-600 tracking-[0.3em] uppercase flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-cyan-500/40" /> XGBoost Inference</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-500/40" /> FastAPI</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-purple-500/40" /> React + Three.js</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500/40" /> Survive to 2035</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Footer strip */}
      <div className="relative border-t border-slate-800/60 py-8 text-center space-y-6">
        <p className="text-[10px] font-mono text-slate-600 tracking-[0.2em] uppercase">
          The Last CEO © 2024 — Built with React · TypeScript · XGBoost · FastAPI
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
           <span className="text-indigo-400/80 font-bold">SRM Insiders Club</span>
           <span className="hidden md:inline text-slate-700">•</span>
           <span className="text-cyan-400/80">Team 5</span>
           <span className="hidden md:inline text-slate-700">•</span>
           <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-rose-400/90 hover:text-rose-300 font-semibold transition-colors cursor-default">Khannak</span>
              <span className="text-slate-700">|</span>
              <span className="text-amber-400/90 hover:text-amber-300 font-semibold transition-colors cursor-default">Harishlal</span>
              <span className="text-slate-700">|</span>
              <span className="text-emerald-400/90 hover:text-emerald-300 font-semibold transition-colors cursor-default">Shreyas</span>
              <span className="text-slate-700">|</span>
              <span className="text-purple-400/90 hover:text-purple-300 font-semibold transition-colors cursor-default">Saif</span>
              <span className="text-slate-700">|</span>
              <span className="text-cyan-400/90 hover:text-cyan-300 font-semibold transition-colors cursor-default">Akshdeep</span>
              <span className="text-slate-700">|</span>
              <a href="https://github.com/shreyascode11/The-Last-CEO" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400/80 font-bold hover:text-indigo-300 transition-colors">
                <Github className="w-3 h-3" />
                <span>GitHub</span>
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};
