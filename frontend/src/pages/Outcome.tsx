import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Trophy, 
  XCircle, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Coins, 
  Users, 
  TrendingUp, 
  Heart,
  Zap,
  Activity,
  Terminal,
  Skull,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType, TableLayoutType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

interface Ending {
  id: string;
  title: string;
  description: string;
  badge: string;
  unlockedMsg: string;
  glowClass: string;
  hoverGlowClass: string;
  textColor: string;
  borderColor: string;
  icon: any;
}

const ALL_ENDINGS: Ending[] = [
  {
    id: 'unicorn',
    title: 'THE UNICORN EXIT',
    description: 'Reach 2035 with Budget ≥ $8M and ROI ≥ 15%.',
    badge: '🦄 UNICORN EXIT',
    unlockedMsg: 'You built a legendary high-growth behemoth that dominated the global markets!',
    glowClass: 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)] bg-yellow-500/5',
    hoverGlowClass: 'hover:border-yellow-400 hover:shadow-[0_0_35px_rgba(234,179,8,0.4)]',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/20',
    icon: Trophy
  },
  {
    id: 'ipo',
    title: 'IPO PUBLIC LISTING',
    description: 'Reach 2035 with ≥ 10 employees and Budget ≥ $2M.',
    badge: '🔔 IPO PUBLIC LISTING',
    unlockedMsg: 'You successfully listed your startup on the NASDAQ exchange with massive fanfare.',
    glowClass: 'border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.15)] bg-emerald-500/5',
    hoverGlowClass: 'hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(52,211,153,0.4)]',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    icon: Zap
  },
  {
    id: 'acquisition',
    title: 'MEGACORP ACQUISITION',
    description: 'Reach 2035 with Budget ≥ $5M or ROI ≥ 80%.',
    badge: '💼 ACQUIRED BY MEGACORP',
    unlockedMsg: 'A conglomerate purchased your company for a massive exit, rewarding your team.',
    glowClass: 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-purple-500/5',
    hoverGlowClass: 'hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    icon: Users
  },
  {
    id: 'bootstrap_legend',
    title: 'BOOTSTRAP LEGEND',
    description: 'Reach 2035 starting with Bootstrap capital.',
    badge: '👑 BOOTSTRAP LEGEND',
    unlockedMsg: 'No venture capital, pure grit. You built a self-sustaining empire from just $100K.',
    glowClass: 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-cyan-500/5',
    hoverGlowClass: 'hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.4)]',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
    icon: Coins
  },
  {
    id: 'lifestyle',
    title: 'SUSTAINABLE LIFESTYLE',
    description: 'Reach 2035 with < 10 employees and Budget ≤ $1.5M.',
    badge: '☕ LIFESTYLE BUSINESS',
    unlockedMsg: 'You prioritized longevity and work-life harmony over hyper-scaling.',
    glowClass: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-500/5',
    hoverGlowClass: 'hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    icon: Heart
  },
  {
    id: 'rogue_ai',
    title: 'ROGUE AI SINGULARITY',
    description: 'Survive in Technology sector with an ROI ≥ 150%.',
    badge: '🤖 AI SINGULARITY',
    unlockedMsg: 'Your automation routines achieved self-awareness. Humans are now corporate relics.',
    glowClass: 'border-pink-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-pink-500/5',
    hoverGlowClass: 'hover:border-pink-400 hover:shadow-[0_0_35px_rgba(244,63,94,0.4)]',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
    icon: Activity
  },
  {
    id: 'talent_acquired',
    title: 'TALENT ACQUISITION',
    description: 'Go bankrupt but finish with Morale ≥ 80% or ROI ≥ 50%.',
    badge: '🤝 TALENT ACQUIRED',
    unlockedMsg: 'Though capital ran dry, top-tier engineering firms bought your team for their skill.',
    glowClass: 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] bg-indigo-500/5',
    hoverGlowClass: 'hover:border-indigo-400 hover:shadow-[0_0_35px_rgba(99,102,241,0.4)]',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/20',
    icon: Users
  },
  {
    id: 'crash_burn',
    title: 'CRASH & BURN',
    description: 'Run out of capital before 2035.',
    badge: '💥 CRASH & BURN',
    unlockedMsg: 'Your runway collapsed. Your startup joins the historic graveyard of failed ventures.',
    glowClass: 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-rose-500/5',
    hoverGlowClass: 'hover:border-rose-400 hover:shadow-[0_0_35px_rgba(244,63,94,0.45)]',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/25',
    icon: Skull
  }
];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="cyber-glass cyber-border-cyan p-3 rounded-lg text-[10px] font-orbitron text-white space-y-1">
        <p className="text-slate-500 font-bold border-b border-slate-800 pb-1 mb-1">// {label}</p>
        <p className="text-cyan-400 font-black">ROI: +{payload[0].value}%</p>
        <p className="text-yellow-400 font-black">BUDGET: ${payload[1].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export const Outcome = () => {
  const state = useGameStore((s) => s.state);
  const company = useGameStore((s) => s.company);
  const actions = useGameStore((s) => s.actions);

  const isVictory = state.gameResult === 'victory';

  // State for animations
  const [valTicker, setValTicker] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showBoardroomEnding, setShowBoardroomEnding] = useState(false);
  const [boardroomStep, setBoardroomStep] = useState(0);

  // Determine achieved ending
  const getAchievedEndingId = (): string => {
    if (state.gameResult === 'victory') {
      if (company?.industry?.toLowerCase() === 'technology' && state.roi >= 150) {
        return 'rogue_ai';
      }
      if (company?.startingBudget === 100000) {
        return 'bootstrap_legend';
      }
      if (state.budget >= 8000000 && state.roi >= 15) {
        return 'unicorn';
      }
      if (state.employees >= 10 && state.budget >= 2000000) {
        return 'ipo';
      }
      if (state.budget >= 5000000 || state.roi >= 80) {
        return 'acquisition';
      }
      return 'lifestyle';
    } else {
      if (state.roi >= 50 || state.morale >= 80) {
        return 'talent_acquired';
      }
      return 'crash_burn';
    }
  };

  const achievedEndingId = getAchievedEndingId();
  const achievedEnding = ALL_ENDINGS.find(e => e.id === achievedEndingId) || ALL_ENDINGS[7];

  // Calculate corporate valuation metric
  const calculateValuation = () => {
    if (state.gameResult === 'victory') {
      return state.budget * 1.8 + (state.employees * 125000) * (1 + (state.roi / 100));
    }
    return 0;
  };
  const valuation = calculateValuation();

  // Calculations for UI
  const decisionsMade = state.history.length;
  const yearsSurvived = Math.floor(decisionsMade / 4) + (decisionsMade % 4 > 0 ? 0.5 : 0);
  const employeeTurnover = Math.floor(state.employees * 0.3); // estimated

  const maxRoiQ = [...state.history].sort((a,b) => b.roi - a.roi)[0];
  const minRoiQ = [...state.history].sort((a,b) => a.roi - b.roi)[0];
  const maxRevenueQ = [...state.history].sort((a,b) => (b.revenue || 0) - (a.revenue || 0))[0];
  
  const medals = [
    { title: "Highest Revenue", val: maxRevenueQ ? `$${((maxRevenueQ.revenue||0)/1000000).toFixed(1)}M (Q${maxRevenueQ.quarter})` : "N/A" },
    { title: "Best Quarter", val: maxRoiQ ? `+${maxRoiQ.roi}% (Q${maxRoiQ.quarter})` : "N/A" },
    { title: "Worst Quarter", val: minRoiQ ? `${minRoiQ.roi}% (Q${minRoiQ.quarter})` : "N/A" },
    { title: "Most Automation", val: `${company?.automationRate || 0}%` },
    { title: "Peak Morale", val: `${Math.max(...state.history.map(h => h.morale), state.morale)}%` },
  ];

  const getGrade = () => {
    if (state.gameResult === 'bankruptcy') return state.roi < -20 ? "F" : "D";
    if (achievedEndingId === 'unicorn') return "A+";
    if (achievedEndingId === 'ipo') return "A";
    if (achievedEndingId === 'acquisition') return "B+";
    if (achievedEndingId === 'rogue_ai') return "S";
    return "B";
  };

  const aiScore = Math.min(100, (company?.aiMaturityScore || 0) + 20);
  const finScore = state.gameResult === 'bankruptcy' ? 18 : Math.max(0, Math.min(100, 50 + (state.roi / 5) + (state.budget / 1000000)));
  const innScore = Math.min(100, (company?.automationRate || 0) + (state.gameResult === 'bankruptcy' ? 50 : 30));
  const opScore = state.gameResult === 'bankruptcy' ? 31 : Math.min(100, 40 + (state.level * 10));

  const timeline = [];
  timeline.push("2025: Startup Founded");
  if (state.history.length > 2) timeline.push("2025: First AI Deployment");
  if (state.history.length > 4) timeline.push("2026: Rapid Workforce Expansion");
  if (state.budget < 5000000 && state.history.length > 6) timeline.push(`${state.history[6]?.year}: Cash Flow Crisis`);
  if (isVictory) {
      timeline.push("2032: Market Dominance Established");
      timeline.push("2035: Final Simulation Target Achieved");
  } else {
      timeline.push(`${state.currentYear}: Operations Ceased (Q${state.currentQuarter})`);
  }

  const getBoardDebriefs = () => {
    const debriefs = [];
    if (achievedEndingId === 'unicorn') {
        debriefs.push({ role: "Chairman", text: "You built the empire we dreamed of. The legacy is secure." });
        debriefs.push({ role: "CFO", text: "Our valuation multiplier is astronomical. Masterful capital allocation." });
        debriefs.push({ role: "CTO", text: "We have achieved total market dominance in the AI sector." });
    } else if (achievedEndingId === 'ipo') {
        debriefs.push({ role: "Chairman", text: "A solid public debut. You've earned your golden parachute." });
        debriefs.push({ role: "CFO", text: "The roadshow was a success. Institutional investors are very happy." });
    } else if (achievedEndingId === 'acquisition') {
        debriefs.push({ role: "Chairman", text: "We've been absorbed by the megacorp, but the buyout premium was worth it." });
    } else if (achievedEndingId === 'lifestyle') {
        debriefs.push({ role: "Chairman", text: "Small, profitable, and quiet. Not what we envisioned, but you survived." });
        debriefs.push({ role: "CHRO", text: "The culture is fantastic. Remaining employees are very dedicated." });
    } else if (state.gameResult === 'bankruptcy') {
        debriefs.push({ role: "Chairman", text: "The market remembers winners, not excuses." });
        debriefs.push({ role: "CFO", text: "Cash reserves evaporated due to uncontrolled expansion." });
        debriefs.push({ role: "CTO", text: "Our AI stack succeeded technically, but business execution failed." });
        debriefs.push({ role: "CHRO", text: "Employee morale remained resilient despite financial collapse." });
        debriefs.push({ role: "CRO", text: "I warned against scaling without sustainable ROI." });
        debriefs.push({ role: "Analysts", text: "Investors abandoned confidence after continuous losses." });
    } else {
        debriefs.push({ role: "Chairman", text: "An unprecedented trajectory. History will remember this." });
    }
    return debriefs;
  };


  // 1. Count-up Valuation Ticker animation
  useEffect(() => {
    if (!state.isGameOver || valuation <= 0) {
      setValTicker(0);
      return;
    }
    let start = 0;
    const end = valuation;
    const duration = 2500; // 2.5 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setValTicker(Math.floor(easeProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [state.isGameOver, valuation]);

  // 2. Terminal Typewriter effect
  useEffect(() => {
    if (!state.isGameOver) return;
    const fullText = achievedEnding.unlockedMsg;
    let index = 0;
    setTypedText('');
    
    const interval = setInterval(() => {
      setTypedText((prev) => prev + fullText.charAt(index));
      index++;
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 20); // Type one character every 20ms
    
    return () => clearInterval(interval);
  }, [state.isGameOver, achievedEnding.unlockedMsg]);

  if (!state.isGameOver) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#060814] text-white font-orbitron">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 text-rose-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">DATA FLUX: SIMULATION IN PROGRESS</p>
          <Link to="/engine">
            <Button className="mt-4 text-xs">Return to Console</Button>
          </Link>
        </div>
      </div>
    );
  }

  const yearlyDataMap = new Map();
  state.history.forEach((entry) => {
    yearlyDataMap.set(entry.year, entry);
  });
  
  const chartData = Array.from(yearlyDataMap.values()).map((entry) => ({
    label: `'${String(entry.year).slice(-2)}`,
    roi: entry.roi,
    budget: entry.budget,
  }));

  const handleRestart = () => {
    actions.resetGame();
  };

  const handleDownloadReport = async () => {
    const ACCENT = "06B6D4"; // Cyan-500
    const MUTED = "64748B"; // Slate-500
    const POSITIVE = "10B981"; // Emerald-500
    const NEGATIVE = "F43F5E"; // Rose-500
    const BORDER = "334155"; // Slate-700
    const SCORE_FILLED = "█";
    const SCORE_EMPTY = "░";

    const heading = (text: string) =>
      new Paragraph({
        text: text.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        border: { bottom: { color: ACCENT, space: 1, style: BorderStyle.SINGLE, size: 12 } },
      });

    const kv = (key: string, value: string, valColor: string = "000000") =>
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `${key}: `, bold: true }),
          new TextRun({ text: value, color: valColor, bold: true }),
        ],
      });

    const para = (text: string, italics: boolean = false, bold: boolean = false, color: string = "000000", center: boolean = false) =>
      new Paragraph({ 
          spacing: { after: 140 }, 
          alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({ text, italics, bold, color })] 
      });

    const bullet = (text: string) =>
      new Paragraph({
        text: `• ${text}`,
        spacing: { after: 100 },
        indent: { left: 360 }
      });
      
    const monoBlock = (text: string, bold: boolean = false) => {
      const lines = text.split('\n');
      return new Paragraph({
        spacing: { before: 60, after: 60 },
        children: lines.map((line, i) => new TextRun({ text: line, break: i > 0 ? 1 : 0, font: "Courier New", size: 18, bold }))
      });
    };

    const divider = () =>
      new Paragraph({
        spacing: { before: 160, after: 160 },
        border: { bottom: { color: BORDER, space: 1, style: BorderStyle.SINGLE, size: 6 } },
        children: [],
      });

    const headerCell = (text: string, width: number) =>
      new TableCell({
        width: { size: width, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: ACCENT },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF" })] })],
      });

    const cell = (text: string, width: number, opts: { bold?: boolean; color?: string; fill?: string } = {}) =>
      new TableCell({
        width: { size: width, type: WidthType.DXA },
        shading: opts.fill ? { type: ShadingType.CLEAR, color: "auto", fill: opts.fill } : undefined,
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text, bold: opts.bold, color: opts.color })] })],
      });

    const METRIC_COLS = [3120, 6240];
    const HISTORY_COLS = [1000, 1100, 2000, 2000, 1350, 1350, 1800];

    const tableBorders = {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
    };

    const metrics: [string, string][] = [
      ["Final Budget", `$${(state.budget / 1000000).toFixed(2)}M`],
      ["Final ROI", `${state.roi}%`],
      ["Employees", `${state.employees}`],
      ["Morale", `${state.morale}%`],
      ["Company Level", `${state.level}`],
      ["Final Date", `${state.currentYear} Q${state.currentQuarter}`],
    ];

    const getInsights = () => {
       const insights = [];
       if (state.roi > 50) insights.push("AI investment accelerated revenue growth and generated high ROI.");
       else if (state.roi < 0) insights.push("ROI remained negative during the final years, indicating inefficient capital utilization.");
       else insights.push("ROI remained stable but lacked explosive growth.");

       if (state.budget < 5000000) insights.push("Excessive spending reduced long-term budget reserves.");
       else insights.push("Strong financial discipline preserved capital reserves.");

       if (state.morale < 50) insights.push("Employee morale fluctuated significantly and remained critically low during restructuring.");
       else insights.push("Workforce satisfaction remained high despite transitions.");

       if (isVictory) insights.push("Company survival was achieved through strategic adaptation and maintaining core operations.");
       else insights.push("Failure to pivot and control burn rate ultimately caused insolvency.");
       
       return insights;
    };

    const isBankrupt = state.gameResult === 'bankruptcy';

    const getGrade = () => {
      if (isBankrupt) return state.roi < -20 ? "F" : "D";
      if (achievedEndingId === 'unicorn') return "A+";
      if (achievedEndingId === 'ipo') return "A";
      if (achievedEndingId === 'acquisition') return "B+";
      if (achievedEndingId === 'rogue_ai') return "S";
      return "B";
    };

    const getBoardDebriefs = () => {
      const debriefs = [];
      if (achievedEndingId === 'unicorn') {
         debriefs.push(kv("Chairman", "You created a company history will remember."));
         debriefs.push(kv("CFO", "Our valuation multiplier is astronomical. Masterful capital allocation."));
         debriefs.push(kv("CTO", "We have achieved total market dominance in the AI sector."));
         debriefs.push(kv("Trading Floor", "The market has crowned a new king. We are issuing strong buy ratings across the board."));
      } else if (achievedEndingId === 'ipo') {
         debriefs.push(kv("Chairman", "The public markets have validated your vision."));
         debriefs.push(kv("CFO", "The roadshow was a success. Institutional investors are very happy."));
         debriefs.push(kv("Trading Floor", "We are seeing a 40% pop on opening day. Exceptional."));
      } else if (achievedEndingId === 'acquisition') {
         debriefs.push(kv("Chairman", "We've been absorbed by the megacorp, but the buyout premium was worth it."));
         debriefs.push(kv("Trading Floor", "M&A rumors confirmed. The acquisition premium is driving immense shareholder value."));
      } else if (achievedEndingId === 'lifestyle') {
         debriefs.push(kv("Chairman", "Small, profitable, and quiet. Not what we envisioned, but you survived."));
         debriefs.push(kv("CHRO", "The culture is fantastic. Remaining employees are very dedicated."));
         debriefs.push(kv("CFO", "Cash flow is stable. We aren't making headlines, but we aren't bankrupt either."));
      } else if (isBankrupt) {
         debriefs.push(kv("Chairman", "Your ambition exceeded your execution."));
         debriefs.push(kv("CFO", "Cash flow is oxygen. Excessive burn rate destroyed shareholder value."));
         debriefs.push(kv("CTO", "Our AI infrastructure achieved remarkable capabilities. However, technological excellence alone cannot compensate for poor financial management."));
         debriefs.push(kv("CHRO", "Automation accelerated productivity but employee morale steadily deteriorated."));
         debriefs.push(kv("CRO", "Multiple high-risk decisions compounded losses. Better risk diversification could have prevented collapse."));
         debriefs.push(kv("Trading Floor", "Investor confidence evaporated as losses mounted. The company's valuation collapsed alongside its cash reserves."));
      } else {
         debriefs.push(kv("Chairman", "An unprecedented trajectory. History will remember this."));
      }
      return debriefs;
    };

    let aiScore = Math.min(100, (company?.aiMaturityScore || 0) + 20);
    if (isBankrupt) aiScore = Math.min(aiScore, 78);
    
    const finScore = isBankrupt ? 18 : Math.max(0, Math.min(100, 50 + (state.roi / 5) + (state.budget / 1000000)));
    const innScore = Math.min(100, (company?.automationRate || 0) + (isBankrupt ? 50 : 30));
    const empScore = state.morale;
    const opScore = isBankrupt ? 31 : Math.min(100, 40 + (state.level * 10));
    
    // Create Timeline
    const timelineEvents = [];
    timelineEvents.push(`2024: Startup Founded - Seed Capital $${(company?.startingBudget||1000000)/1000000}M`);
    if (company?.aiInvestment && company.aiInvestment > 0) timelineEvents.push(`${state.history.length > 0 ? state.history[0].year : 2024}: Initial AI Investment Strategies Deployed`);
    if (state.history.length > 1) timelineEvents.push(`${state.history[1].year}: Initial Workforce Scaled`);
    if ((company?.automationRate||0) > 20) timelineEvents.push(`${state.history.length > 2 ? state.history[2].year : 2025}: Advanced Workflow Automation Achieved`);
    if (state.history.length > 4) timelineEvents.push(`${state.history[4].year}: Aggressive Operations Expansion Phase`);
    if (state.budget < 5000000 && state.history.length > 6) timelineEvents.push(`${state.history[6].year}: Critical Cash Flow Shortages Reported`);
    
    if (isVictory) {
       timelineEvents.push("2032: Market Dominance and Stabilization");
       timelineEvents.push("2035: Executive Objectives Completed");
    } else {
       timelineEvents.push(`${state.currentYear}: Chapter 11 Bankruptcy (Q${state.currentQuarter})`);
    }

    const strengths = [];
    const weaknesses = [];
    
    if (state.morale >= 60) strengths.push("Maintained strong employee morale during early growth.");
    else weaknesses.push("Low employee morale impacted productivity and retention.");

    if (state.budget > 5000000) strengths.push("Robust financial reserves and exceptional cash flow management.");
    else if (!isBankrupt) strengths.push("Controlled initial investment strategy reduced early risk.");
    else weaknesses.push("Uncontrollable burn rate and total budget depletion.");

    if (company?.aiInvestment && company.aiInvestment > 500000) strengths.push("Demonstrated strong willingness to adopt and scale AI technologies.");
    else weaknesses.push("Hesitant AI adoption led to competitive disadvantages.");
    
    if (isVictory) strengths.push("Resilient risk management through market fluctuations.");

    const renderBar = (percent: number) => {
        const p = Math.round(percent / 10);
        return SCORE_FILLED.repeat(p) + SCORE_EMPTY.repeat(10 - p) + ` ${Math.round(percent)}`;
    };

    const generateChart = async (config: any) => {
      try {
        const response = await fetch("https://quickchart.io/chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chart: config, width: 500, height: 300, format: "png", backgroundColor: "white" })
        });
        if (!response.ok) throw new Error(`QuickChart error: ${response.status}`);
        return await response.arrayBuffer();
      } catch (e) {
        console.error("Failed to generate chart", e);
        return null;
      }
    };

    const labels = state.history.map(h => `${h.year} Q${h.quarter || 1}`);
    const revenueData = state.history.map(h => h.revenue / 1000000);
    const budgetData = state.history.map(h => h.budget / 1000000);
    const roiData = state.history.map(h => h.roi);
    const moraleData = state.history.map(h => h.morale);
    const employeesData = state.history.map(h => h.employees || 0);

    const [finChartBuf, roiMoraleChartBuf, empChartBuf] = await Promise.all([
      generateChart({
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Revenue ($M)', data: revenueData, borderColor: '#06B6D4', fill: false },
            { label: 'Budget ($M)', data: budgetData, borderColor: '#EAB308', fill: false }
          ]
        },
        options: { title: { display: true, text: 'Financial Performance' } }
      }),
      generateChart({
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'ROI (%)', data: roiData, borderColor: '#10B981', fill: false },
            { label: 'Morale (%)', data: moraleData, borderColor: '#F43F5E', fill: false }
          ]
        },
        options: { title: { display: true, text: 'Health Metrics' } }
      }),
      generateChart({
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Employees', data: employeesData, borderColor: '#A855F7', fill: true, backgroundColor: 'rgba(168,85,247,0.2)' }
          ]
        },
        options: { title: { display: true, text: 'Workforce Capacity' } }
      })
    ]);

    const chartParagraphs = [];
    if (finChartBuf) {
      chartParagraphs.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new ImageRun({ data: finChartBuf, transformation: { width: 500, height: 300 } })]
      }));
    }
    if (roiMoraleChartBuf) {
      chartParagraphs.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new ImageRun({ data: roiMoraleChartBuf, transformation: { width: 500, height: 300 } })]
      }));
    }
    if (empChartBuf) {
      chartParagraphs.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new ImageRun({ data: empChartBuf, transformation: { width: 500, height: 300 } })]
      }));
    }

    const doc = new Document({
      styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { after: 40 },
            children: [new TextRun({ text: "THE LAST CEO", bold: true, size: 44, color: ACCENT })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { after: 60 },
            children: [new TextRun({ text: "Final Executive Report", bold: true, size: 28, color: MUTED })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { after: 80 },
            children: [new TextRun({ text: isVictory ? "✅ SIMULATION COMPLETE — VICTORY" : "❌ SIMULATION TERMINATED — BANKRUPTCY", bold: true, size: 32, color: isVictory ? POSITIVE : NEGATIVE })],
          }),
          divider(),

          heading("Executive Summary"),
          para(`Throughout the simulation, the company ${(company?.aiMaturityScore || 0) > 50 ? 'aggressively' : 'cautiously'} invested in AI transformation and operational expansion. While several growth phases produced revenue gains, ${state.roi < 0 ? 'inconsistent ROI' : 'steady ROI'} and ${state.morale < 50 ? 'declining' : 'stable'} employee morale affected long-term financial stability. Despite these challenges, the company ${isVictory ? 'survived until 2035 and achieved the Victory condition by maintaining operations and adapting to changing business conditions.' : 'was unable to sustain its burn rate and ultimately declared bankruptcy.'}`),
          divider(),

          heading("KPI Dashboard"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: METRIC_COLS,
            layout: TableLayoutType.FIXED,
            borders: tableBorders,
            rows: metrics.map(([k, v]) => new TableRow({ children: [cell(k, METRIC_COLS[0]), cell(v, METRIC_COLS[1], { bold: true })] })),
          }),
          divider(),

          heading("Executive Statistics"),
          monoBlock(`Total Decisions        ${state.history.length}
AI Investments         ${Math.floor((company?.aiInvestment || 0) / 100000)}
Deployments            ${company?.deploymentCount || 0}
Employees Hired        ${Math.max(0, state.employees - (company?.employees || 10))}
Employees Lost         ${Math.max(0, (company?.employees || 10) - state.employees + Math.floor(Math.random() * 5))}
Automation             ${company?.automationRate || 0}%
Training Hours         ${company?.trainingHours || 0}
Highest Revenue        $${(Math.max(0, ...revenueData)).toFixed(1)}M
Highest Budget         $${(Math.max(0, ...budgetData)).toFixed(1)}M
Best ROI               ${Math.max(0, ...roiData)}%
Worst ROI              ${Math.min(0, ...roiData)}%`, true),
          divider(),

          heading("Performance Graphs"),
          ...(chartParagraphs.length > 0 ? chartParagraphs : [para("Chart generation failed.", true, false, NEGATIVE)]),
          divider(),

          heading("AI Strategy Timeline"),
          ...timelineEvents.map(event => bullet(event)),
          divider(),

          heading("Board Member Debrief"),
          ...getBoardDebriefs(),
          divider(),

          heading("Business Insights"),
          ...getInsights().map(insight => bullet(insight)),
          divider(),

          heading("Player Strategy Selection"),
          monoBlock(`Initial Strategy Configuration:
AI Investment : ${(company?.aiMaturityScore || 0) > 70 ? "Aggressive" : (company?.aiMaturityScore || 0) > 40 ? "Moderate" : "Low"}
Hiring        : ${state.employees > 20 ? "Aggressive" : "Controlled"}
Automation    : ${(company?.automationRate || 0) > 60 ? "Aggressive" : "Moderate"}
Training      : ${(company?.trainingHours || 0) > 500 ? "High" : "Medium"}
Risk Appetite : ${state.roi < 0 || state.budget < 2000000 ? "High" : "Moderate"}`),
          divider(),

          heading("Company History Log"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: HISTORY_COLS,
            layout: TableLayoutType.FIXED,
            borders: tableBorders,
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  headerCell("Year", HISTORY_COLS[0]), headerCell("Qtr", HISTORY_COLS[1]), headerCell("Revenue", HISTORY_COLS[2]),
                  headerCell("Budget", HISTORY_COLS[3]), headerCell("ROI", HISTORY_COLS[4]), headerCell("Morale", HISTORY_COLS[5]),
                  headerCell("Decision", HISTORY_COLS[6]),
                ],
              }),
              ...state.history.map((h, i) =>
                new TableRow({
                  children: [
                    cell(`${h.year}`, HISTORY_COLS[0], { fill: i % 2 === 0 ? "F8FAFC" : "FFFFFF" }),
                    cell(`Q${h.quarter || 1}`, HISTORY_COLS[1], { fill: i % 2 === 0 ? "F8FAFC" : "FFFFFF" }),
                    cell(`$${((h.revenue || 0) / 1000000).toFixed(1)}M`, HISTORY_COLS[2], { color: "10B981", fill: i % 2 === 0 ? "F8FAFC" : "FFFFFF" }),
                    cell(`$${(h.budget / 1000000).toFixed(1)}M`, HISTORY_COLS[3], { color: h.budget < 0 ? "F43F5E" : "000000", fill: i % 2 === 0 ? "F8FAFC" : "FFFFFF" }),
                    cell(`${h.roi > 0 ? '+' : ''}${h.roi}%`, HISTORY_COLS[4], { color: h.roi > 0 ? POSITIVE : NEGATIVE, fill: i % 2 === 0 ? "F8FAFC" : "FFFFFF", bold: true }),
                    cell(`${h.morale}%`, HISTORY_COLS[5], { color: "06B6D4", fill: i % 2 === 0 ? "F8FAFC" : "FFFFFF" }),
                    cell(`${h.decision || "—"}`, HISTORY_COLS[6], { fill: i % 2 === 0 ? "F8FAFC" : "FFFFFF" }),
                  ],
                })
              ),
            ],
          }),
          divider(),
          
          heading("Strengths & Weaknesses"),
          para("Strengths:", false, true),
          ...strengths.map(s => bullet(s)),
          new Paragraph({ spacing: { before: 100 }, children: [] }),
          para("Weaknesses:", false, true),
          ...weaknesses.map(w => bullet(w)),
          divider(),

          heading("Achievement Medals"),
          monoBlock(medals.map(m => `🏅 ${m.title} — ${m.val}`).join('\n')),
          divider(),

          heading("CEO Legacy Score"),
          monoBlock(`Innovation        ${renderBar(innScore)}
Leadership        ${renderBar(isBankrupt ? 22 : 88)}
Financial Skill   ${renderBar(finScore)}
People Management ${renderBar(empScore)}
Risk Control      ${renderBar(opScore)}

Overall Grade:    ${getGrade()}
Title:            ${getGrade() === 'A+' ? 'Legendary Visionary' : getGrade() === 'A' ? 'Corporate Titan' : getGrade() === 'B+' ? 'Strategic Leader' : getGrade() === 'B' ? 'Ambitious Innovator' : 'Failed Visionary'}`),
          divider(),

          heading("Executive Letter"),
          para("FROM:", false, true),
          para("The Board of Directors"),
          para("Dear CEO,"),
          para(isVictory
             ? "History celebrates those who dare to lead through uncertainty. Your tenure as CEO exemplified strategic courage, decisive leadership, and an unwavering commitment to innovation."
             : "History rarely remembers companies that failed, but it always remembers the lessons they left behind. Your AI-first strategy demonstrated courage, yet financial discipline proved insufficient."),
          para("The Board hereby concludes this simulation."),
          para("Signed,"),
          para("The Board of Directors"),
          divider(),

          heading("Endings Collection"),
          monoBlock(ALL_ENDINGS.map(e => `${e.badge} ${e.id === achievedEndingId ? '✔' : ''}`).join('\n') + `

Unlocked ${ALL_ENDINGS.filter(e => e.id === achievedEndingId).length} / 8
Completion ${((ALL_ENDINGS.filter(e => e.id === achievedEndingId).length / 8) * 100).toFixed(1)}%`),
          divider(),

          para("══════════════════════════════", false, false, MUTED, true),
          para("FINAL BOARD SESSION", false, true, "000000", true),
          para(""),
          para("Chairman:", false, true, ACCENT, true),
          para("Meeting adjourned.", false, false, "000000", true),
          para(""),
          para("CFO:", false, true, ACCENT, true),
          para("The shareholders have spoken.", false, false, "000000", true),
          para(""),
          para("CTO:", false, true, ACCENT, true),
          para("The AI systems have been archived.", false, false, "000000", true),
          para(""),
          para("CHRO:", false, true, ACCENT, true),
          para("Employees have been notified.", false, false, "000000", true),
          para(""),
          para("CRO:", false, true, ACCENT, true),
          para("Risk assessment complete.", false, false, "000000", true),
          para(""),
          para("Trading Floor:", false, true, ACCENT, true),
          para("The market has closed.", false, false, "000000", true),
          para(""),
          para("══════════════════════════════", false, false, MUTED, true),
        ],
      }],
    });

    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${company?.name || 'Corporate'}_Final_Report.docx`);
    } catch (e: any) {
      console.error(e);
      alert('Failed to generate report: ' + e.message);
    }
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden py-12 px-6">
      
      {/* INJECTED CUSTOM IN-FILE ANIMATIONS & SMOOTH TRANSITIONS */}
      <style>{`
        /* Staggered entrance animations */
        .animate-fade-in-up {
          opacity: 0;
          transform: translateY(24px);
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-50  { animation-delay: 50ms; }
        .delay-100 { animation-delay: 100ms; }
        .delay-150 { animation-delay: 150ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Ambient panning cybergrid background */
        @keyframes grid-pan {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }
        .animated-grid-bg {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(6, 182, 212, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: grid-pan 12s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        /* Screen scanning overlay sweep */
        @keyframes scanline-sweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .scanline-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 140px;
          background: linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.07), transparent);
          animation: scanline-sweep 6s linear infinite;
          pointer-events: none;
          z-index: 999;
        }

        /* Card Shimmer / Glint Reflection Effect */
        .shimmer-card {
          position: relative;
          overflow: hidden;
          transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease;
        }
        .shimmer-card::after {
          content: '';
          position: absolute;
          top: 0; left: -150%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), rgba(6, 182, 212, 0.08), transparent);
          transform: skewX(-25deg);
          transition: none;
          pointer-events: none;
        }
        .shimmer-card:hover {
          transform: translateY(-4px) scale(1.01);
        }
        .shimmer-card:hover::after {
          left: 150%;
          transition: all 1.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Custom pulsing glows */
        @keyframes pulse-cyan-shadow {
          0%, 100% { box-shadow: 0 0 10px rgba(6, 182, 212, 0.15); }
          50% { box-shadow: 0 0 25px rgba(6, 182, 212, 0.4); }
        }
        @keyframes pulse-gold-shadow {
          0%, 100% { box-shadow: 0 0 12px rgba(234, 179, 8, 0.15); }
          50% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.45); }
        }
        @keyframes error-red-flash {
          0%, 100% { border-color: rgba(244, 63, 94, 0.4); box-shadow: 0 0 12px rgba(244, 63, 94, 0.1); }
          50% { border-color: rgba(244, 63, 94, 0.85); box-shadow: 0 0 25px rgba(244, 63, 94, 0.35); }
        }

        /* Staggered Matrix Text Entry */
        .neon-glitch-text {
          text-shadow: 0 0 5px rgba(255,255,255,0.7), 0 0 10px rgba(6,182,212,0.6);
          transition: text-shadow 0.3s ease;
        }
        .shimmer-card:hover .neon-glitch-text {
          text-shadow: 0 0 8px rgba(255,255,255,0.9), 0 0 18px rgba(6,182,212,0.95), 0 0 30px rgba(168,85,247,0.7);
        }
      `}</style>

      {/* Cyber Grid/Sweep Overlay */}
      <div className="scanline-bar" />
      <div className="animated-grid-bg" />

      {/* Massive diagonal background watermark (smooth scale-in entrance) */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
        <span className="font-orbitron font-black text-[12vw] tracking-[3vw] text-slate-900/10 uppercase -rotate-12 whitespace-nowrap transition-transform duration-1000 scale-[0.9] animate-[fadeInUp_1.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          {isVictory ? "SYSTEM // SECURED" : "SYS // TERMINATED"}
        </span>
      </div>

      <div className="container max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* HEADER: TERMINAL STATUS HUD */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-900 pb-5 gap-4 animate-fade-in-up delay-50">
          <div className="flex items-center space-x-3">
            <Terminal className="h-6 w-6 text-cyan-400 animate-pulse" />
            <span className="font-orbitron text-sm font-black tracking-widest text-cyan-400 text-glow-cyan">
              // ARCHIVE MEMORY MODULE LOADED // SECURE_LOG.BIN
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/40 px-3 py-1.5 rounded border border-slate-800">
            <span className={cn(
              "h-2.5 w-2.5 rounded-full animate-ping",
              isVictory ? "bg-yellow-400" : "bg-rose-500"
            )} />
            <span className={cn(
              "font-orbitron text-[10px] font-black uppercase tracking-wider",
              isVictory ? "text-yellow-400 text-glow-gold" : "text-rose-500 text-glow-magenta"
            )}>
              {isVictory ? "SIMULATION COMPLETE" : "SYSTEM FAILURE DIAGNOSIS"}
            </span>
          </div>
        </div>

        {/* TOP PANEL: COOPERATIVE HIGHLIGHT PANEL */}
        <div className={cn(
          "shimmer-card p-8 rounded-xl border relative flex flex-col md:flex-row justify-between items-center gap-8 group animate-fade-in-up delay-100",
          isVictory 
            ? "border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.15)] animate-[pulse-gold-shadow_3s_infinite_alternate]" 
            : "border-rose-500/50 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-[error-red-flash_2.5s_infinite_alternate]"
        )}>
          {/* Internal gradient ray */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.06),transparent_50%)] pointer-events-none" />
          
          <div className="space-y-4 text-center md:text-left relative z-10 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="font-orbitron text-[10px] font-black tracking-widest text-slate-300 bg-slate-950 px-3.5 py-1 rounded border border-slate-800/80 flex items-center gap-1.5 uppercase transition-colors group-hover:border-slate-700">
                <Trophy className={cn("h-3.5 w-3.5", achievedEnding.textColor)} />
                {achievedEnding.badge}
              </span>
              {!isVictory && (
                <span className="font-orbitron text-[10px] font-black tracking-widest text-rose-400 bg-rose-500/5 px-3.5 py-1 rounded border border-rose-500/20 uppercase animate-pulse">
                  CRITICAL SHUTDOWN
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black font-orbitron tracking-wider text-slate-100 neon-glitch-text">
              {achievedEnding.title}
            </h1>
            
            {/* Live typewriter output prompt */}
            <div className="min-h-[40px] bg-slate-950/80 p-4 rounded border border-slate-900 font-mono text-xs text-slate-400 leading-relaxed text-left flex items-start gap-2 group-hover:border-slate-800 transition-colors">
              <span className="text-cyan-400 animate-pulse flex-shrink-0">&gt;_</span>
              <span>
                {typedText}
                <span className="h-4 w-2 bg-slate-300 inline-block animate-pulse ml-0.5" />
              </span>
            </div>
          </div>

          {/* VALUATION CONSOLE */}
          <div className="text-center md:text-right font-orbitron bg-slate-950/90 p-6 rounded-lg border border-slate-850 shadow-[0_0_25px_rgba(0,0,0,0.6)] min-w-[280px] relative overflow-hidden group/val hover:border-slate-700 transition-colors duration-300">
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block transition-colors group-hover/val:text-slate-300">
              {isVictory ? "CAPITAL LIQUIDATION RATE" : "REMAINING SCRAP VALUE"}
            </span>
            
            <span className="text-4xl font-black block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-orange-400 tracking-wider transition-transform duration-300 group-hover/val:scale-105">
              {valuation > 0 ? `$${valTicker.toLocaleString()}` : "$0.00"}
            </span>

            <span className="text-[8px] text-slate-500 block mt-2 tracking-widest border-t border-slate-900 pt-2 uppercase">
              {valuation > 0 ? "LEDGER CONVERTED VALUE" : "CHAPTER 11 CORP TERMINATION"}
            </span>
          </div>
        </div>

        {/* VITALS & TRAJECTORY SPLIT PANEL */}
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Core Vitals Card */}
          <div className="lg:col-span-2 space-y-4 animate-fade-in-up delay-200">
            <Card className="shimmer-card cyber-glass border-slate-900/90 hover:border-slate-850 bg-slate-900/10 hover:bg-slate-900/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.08)] transition-all h-full flex flex-col justify-between overflow-hidden">
              <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <CardHeader className="border-b border-slate-900/80 pb-3">
                <CardTitle className="font-orbitron text-xs font-black text-cyan-400 tracking-widest flex items-center justify-between">
                  <span>// OPERATIONS METRIC LOG_</span>
                  <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-around">
                
                {/* Reserves */}
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-3 hover:translate-x-1 transition-transform duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-850 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.1)]">
                      <Coins className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-orbitron uppercase tracking-wider">NET RESERVES</p>
                      <p className="text-lg font-black font-orbitron text-slate-100">
                        ${state.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ROI */}
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-3 hover:translate-x-1 transition-transform duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-850 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-orbitron uppercase tracking-wider">CUMULATIVE ROI</p>
                      <p className="text-lg font-black font-orbitron text-cyan-400">
                        {state.roi}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employees */}
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-3 hover:translate-x-1 transition-transform duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-850 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.1)]">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-orbitron uppercase tracking-wider">WORKFORCE CAPACITY</p>
                      <p className="text-lg font-black font-orbitron text-purple-400">
                        {state.employees} Staff
                      </p>
                    </div>
                  </div>
                </div>

                {/* Morale */}
                <div className="flex items-center justify-between hover:translate-x-1 transition-transform duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-850 text-pink-400 shadow-[0_0_8px_rgba(244,63,94,0.1)]">
                      <Heart className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-orbitron uppercase tracking-wider">VITALITY MORALE</p>
                      <p className="text-lg font-black font-orbitron text-pink-400">
                        {state.morale}%
                      </p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Trajectory telemetry graph */}
          <div className="lg:col-span-3 animate-fade-in-up delay-300">
            <Card className="shimmer-card cyber-glass border-slate-900/95 hover:border-slate-855 bg-slate-900/10 hover:bg-slate-900/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.08)] transition-all">
              <CardHeader className="border-b border-slate-900 pb-3">
                <CardTitle className="font-orbitron text-xs font-black text-cyan-400 tracking-widest flex items-center justify-between">
                  <span>// TRAJECTORY TELEMETRY DIAGNOSTICS //</span>
                  <span className="text-[8px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-500 font-mono">LIVE_PLOT.TSX</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                <div style={{ width: '100%', height: 250 }} className="relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.02),transparent_60%)] pointer-events-none" />
                  
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#06b6d4" floodOpacity="0.85" />
                          </filter>
                          <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#eab308" floodOpacity="0.85" />
                          </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#12172a" vertical={false} />
                        <XAxis
                          dataKey="label"
                          stroke="#475569"
                          tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Orbitron' }}
                          tickLine={{ stroke: '#1e293b' }}
                          interval="preserveStartEnd"
                          minTickGap={18}
                        />
                        <YAxis 
                          yAxisId="left"
                          stroke="#475569"
                          tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Orbitron' }}
                          tickLine={{ stroke: '#1e293b' }}
                          tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#475569"
                          tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Orbitron' }}
                          tickLine={{ stroke: '#1e293b' }}
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#1e293b', strokeWidth: 1 }} />
                        
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="roi" 
                          stroke="#06b6d4" 
                          strokeWidth={3.5}
                          dot={{ fill: "#06b6d4", stroke: "#040610", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#fff" }}
                          filter="url(#glow-cyan)"
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="budget" 
                          stroke="#eab308" 
                          strokeWidth={2.5}
                          dot={{ fill: "#eab308", stroke: "#040610", strokeWidth: 1.5, r: 4 }}
                          activeDot={{ r: 6, fill: "#fff" }}
                          filter="url(#glow-yellow)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 font-orbitron">
                      NO HISTORICAL TELEMETRY GENERATED
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

                {/* ═══ BOARD MEMBER DEBRIEF ═══ */}
        <div className="animate-fade-in-up delay-300">
          <Card className="shimmer-card cyber-glass border-slate-900/90 bg-slate-900/10 overflow-hidden">
            <CardHeader className="border-b border-slate-900/80 pb-3">
              <CardTitle className="font-orbitron text-xs font-black text-cyan-400 tracking-widest flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                // BOARD MEMBER DEBRIEF //
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {getBoardDebriefs().map((d, i) => {
                const roleIcons: Record<string, string> = { Chairman: '🎩', CFO: '💰', CTO: '🤖', CHRO: '👥', CRO: '⚠️', Analysts: '📈', 'Trading Floor': '📊' };
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/50 hover:border-slate-700 transition-colors">
                    <span className="text-xl flex-shrink-0 mt-0.5">{roleIcons[d.role] || '👤'}</span>
                    <div>
                      <p className="text-[10px] font-orbitron font-black text-cyan-400 tracking-widest uppercase mb-1">{d.role}</p>
                      <p className="text-sm text-slate-300 font-space italic leading-relaxed">"{d.text}"</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* ═══ ENDING STATISTICS ═══ */}
        <div className="animate-fade-in-up delay-300">
          <Card className="shimmer-card cyber-glass border-slate-900/90 bg-slate-900/10 overflow-hidden">
            <CardHeader className="border-b border-slate-900/80 pb-3">
              <CardTitle className="font-orbitron text-xs font-black text-cyan-400 tracking-widest flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                // SESSION STATISTICS //
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Decisions Made', value: decisionsMade, icon: '📋' },
                  { label: 'AI Deployments', value: company?.deploymentCount || 0, icon: '🤖' },
                  { label: 'Employees Hired', value: state.employees, icon: '👥' },
                  { label: 'Employees Lost', value: employeeTurnover, icon: '📉' },
                  { label: 'Automation', value: `${company?.automationRate || 0}%`, icon: '⚙️' },
                  { label: 'Training Hours', value: company?.trainingHours || 0, icon: '📚' },
                  { label: 'AI Maturity', value: company?.aiMaturityScore || 0, icon: '🧠' },
                  { label: 'Years Survived', value: yearsSurvived, icon: '📅' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-950/60 border border-slate-800/50 rounded-lg p-3 text-center hover:border-cyan-500/30 transition-colors">
                    <span className="text-lg block mb-1">{stat.icon}</span>
                    <p className="text-lg font-black font-orbitron text-white">{stat.value}</p>
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ CORPORATE TIMELINE ═══ */}
        <div className="animate-fade-in-up delay-400">
          <Card className="shimmer-card cyber-glass border-slate-900/90 bg-slate-900/10 overflow-hidden">
            <CardHeader className="border-b border-slate-900/80 pb-3">
              <CardTitle className="font-orbitron text-xs font-black text-cyan-400 tracking-widest flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                // CORPORATE TIMELINE //
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-rose-500/50" />
                {timeline.map((event, i) => (
                  <div key={i} className="flex items-center gap-4 mb-4 last:mb-0 pl-8 relative">
                    <div className="absolute left-3 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    <p className="text-sm font-space text-slate-300">
                      <span className="text-cyan-400 font-bold font-orbitron">{event.split(':')[0]}:</span>
                      {event.split(':').slice(1).join(':')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ MEDALS ═══ */}
        <div className="animate-fade-in-up delay-400">
          <Card className="shimmer-card cyber-glass border-slate-900/90 bg-slate-900/10 overflow-hidden">
            <CardHeader className="border-b border-slate-900/80 pb-3">
              <CardTitle className="font-orbitron text-xs font-black text-cyan-400 tracking-widest flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                // PERFORMANCE MEDALS //
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {medals.map((medal, i) => (
                  <div key={i} className="bg-slate-950/60 border border-yellow-500/20 rounded-lg p-3 text-center hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-all">
                    <span className="text-2xl block mb-2">🏅</span>
                    <p className="text-[9px] font-orbitron font-black text-yellow-400 uppercase tracking-wider mb-1">{medal.title}</p>
                    <p className="text-xs font-mono text-slate-300">{medal.val}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ CEO LEGACY SCORE ═══ */}
        <div className="animate-fade-in-up delay-500">
          <Card className="shimmer-card cyber-glass border-slate-900/90 bg-slate-900/10 overflow-hidden">
            <CardHeader className="border-b border-slate-900/80 pb-3">
              <CardTitle className="font-orbitron text-xs font-black text-cyan-400 tracking-widest flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                // CEO LEGACY SCORE //
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { label: 'Innovation', score: innScore, color: 'bg-cyan-500' },
                { label: 'Leadership', score: isVictory ? 88 : 22, color: 'bg-emerald-500' },
                { label: 'Financial Control', score: finScore, color: 'bg-yellow-500' },
                { label: 'Employee Welfare', score: state.morale, color: 'bg-pink-500' },
                { label: 'Risk Management', score: opScore, color: 'bg-purple-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-orbitron font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-xs font-mono text-white font-bold">{Math.round(item.score)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                      style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="text-[10px] font-orbitron text-slate-500 tracking-widest uppercase mb-2">Overall Legacy</p>
                <p className="text-3xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-orange-400">
                  {(() => {
                    const avg = (innScore + (isVictory ? 88 : 22) + finScore + state.morale + opScore) / 5;
                    if (avg >= 80) return '★★★★★ "Legendary Visionary"';
                    if (avg >= 65) return '★★★★☆ "Corporate Titan"';
                    if (avg >= 50) return '★★★☆☆ "Strategic Leader"';
                    if (avg >= 35) return '★★☆☆☆ "Ambitious Innovator"';
                    return '★☆☆☆☆ "Cautionary Tale"';
                  })()}
                </p>
                <p className="text-xs font-mono text-slate-500 mt-2">CEO GRADE: {getGrade()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ EXECUTIVE LETTER ═══ */}
        <div className="animate-fade-in-up delay-500">
          <Card className="shimmer-card cyber-glass border-slate-900/90 bg-slate-900/10 overflow-hidden">
            <CardHeader className="border-b border-slate-900/80 pb-3">
              <CardTitle className="font-orbitron text-xs font-black text-cyan-400 tracking-widest flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                // EXECUTIVE LETTER //
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-6 space-y-4">
                <p className="text-[10px] font-orbitron text-slate-500 tracking-widest uppercase">From: The Board of Directors</p>
                <p className="text-sm text-slate-300 font-space leading-relaxed">
                  Dear CEO,
                </p>
                <p className="text-sm text-slate-400 font-space leading-relaxed">
                  {isVictory
                    ? "History celebrates those who dare to lead through uncertainty. Your tenure as CEO exemplified strategic courage, decisive leadership, and an unwavering commitment to innovation. The AI transformation you spearheaded will serve as a blueprint for future leaders."
                    : "History rarely remembers companies that failed, but it always remembers the lessons they left behind. Your bold AI-first strategy demonstrated vision, yet insufficient financial discipline ultimately led to insolvency."
                  }
                </p>
                <p className="text-sm text-slate-400 font-space leading-relaxed">
                  The Board hereby concludes this simulation.
                </p>
                <p className="text-xs text-slate-500 font-mono italic mt-4 border-t border-slate-800 pt-4">
                  "Every CEO writes a chapter in corporate history. {isVictory ? 'You built an empire that reshaped the industry.' : 'Some build empires, some build lessons.'}"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ BOARDROOM ENDING SEQUENCE ═══ */}
        <div className="animate-fade-in-up delay-600">
          <Card className="shimmer-card cyber-glass border-slate-900/90 bg-slate-900/10 overflow-hidden">
            <CardContent className="p-8 space-y-3">
              {[
                { role: 'Chairman', text: 'Meeting adjourned.' },
                { role: 'CFO', text: 'Shareholders have voted.' },
                { role: 'CTO', text: 'The AI systems have been archived.' },
                { role: 'CHRO', text: 'Employees have been notified.' },
                { role: 'CRO', text: 'Risk analysis complete.' },
                { role: 'Trading Floor', text: 'The market has closed.' },
              ].map((line, i) => (
                <p key={i} className="text-sm font-space text-slate-500" style={{ animationDelay: `${i * 200}ms` }}>
                  <span className="text-cyan-400 font-bold">{line.role}:</span> "{line.text}"
                </p>
              ))}
              <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-2">
                <p className="text-[10px] font-mono text-slate-600 tracking-[0.3em] uppercase">Archive Memory Module Complete</p>
                <p className="text-[10px] font-mono text-slate-600 tracking-[0.3em] uppercase">CEO Session Terminated</p>
                <p className="text-xs font-orbitron text-cyan-400/60 tracking-widest uppercase animate-pulse mt-4">Session Archived — {new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

{/* BOTTOM: STAGGERED MATRIX LOGS */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 gap-2 animate-fade-in-up delay-400">
            <h2 className="font-orbitron font-black text-sm tracking-widest text-slate-300 uppercase flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              // OUTCOME ARCHIVAL MATRIX // PROTOCOLS INDEXED
            </h2>
            <span className="text-[10px] font-orbitron text-slate-500 font-bold bg-slate-950 px-2 py-0.5 border border-slate-800 rounded">
              COMPILATION STABLE // {ALL_ENDINGS.filter(e => e.id === achievedEndingId).length}/8 UNLOCKED
            </span>
          </div>

          {/* Outcome Grid Badges (Staggered Entrance Animation) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_ENDINGS.map((ending, index) => {
              const isUnlocked = ending.id === achievedEndingId;
              const EndingIcon = ending.icon;

              return (
                <div 
                  key={ending.id}
                  style={{ animationDelay: `${(index * 100) + 400}ms` }}
                  className={cn(
                    "animate-fade-in-up shimmer-card p-5 rounded-xl border flex flex-col justify-between min-h-[170px] group cursor-default",
                    isUnlocked 
                      ? `${ending.glowClass} ${ending.hoverGlowClass} scale-[1.02] ring-2 ring-cyan-500/15` 
                      : "border-slate-900 bg-slate-950/40 opacity-40 hover:opacity-75 hover:border-slate-800/80 hover:bg-slate-950/60"
                  )}
                >
                  {/* Floating lock/unlock badge icons */}
                  <div className="absolute top-4 right-4 transition-transform duration-300 group-hover:scale-110">
                    {isUnlocked ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-sm animate-ping" />
                        <Unlock className={cn("h-4 w-4 relative z-10", ending.textColor)} />
                      </div>
                    ) : (
                      <Lock className="h-4 w-4 text-slate-700 group-hover:text-slate-500 transition-colors" />
                    )}
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center space-x-2">
                      <EndingIcon className={cn("h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-12", isUnlocked ? ending.textColor : "text-slate-600")} />
                      <span className={cn(
                        "text-[9px] font-orbitron font-black border px-2 py-0.5 rounded tracking-wide transition-colors", 
                        isUnlocked 
                          ? `${ending.textColor} border-slate-800/80 group-hover:border-slate-700` 
                          : "text-slate-600 border-slate-900/80"
                      )}>
                        {ending.badge}
                      </span>
                    </div>

                    <h3 className={cn(
                      "font-orbitron font-black text-xs tracking-wider transition-colors", 
                      isUnlocked ? "text-slate-100" : "text-slate-600 group-hover:text-slate-400"
                    )}>
                      {ending.title}
                    </h3>
                    
                    <p className="text-[10px] text-slate-400 font-space leading-relaxed transition-colors group-hover:text-slate-300">
                      {isUnlocked ? ending.unlockedMsg : ending.description}
                    </p>
                  </div>

                  {isUnlocked && (
                    <div className={cn(
                      "text-[8px] font-orbitron font-black text-right tracking-widest mt-3 uppercase animate-pulse", 
                      ending.textColor
                    )}>
                      [ LOG UNLOCKED ]
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM REDIRECT PROTOCOL ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-slate-900 animate-fade-in-up delay-600">
          <Button 
            onClick={handleDownloadReport}
            size="lg" 
            className="py-6 px-10 font-orbitron font-black text-xs tracking-widest bg-slate-900 text-cyan-400 border border-cyan-500/30 hover:bg-slate-800 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_35px_rgba(6,182,212,0.3)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          >
            <Download className="mr-2.5 h-4.5 w-4.5" />
            DOWNLOAD FULL LOG .DOCX
          </Button>

          <Link to="/">
            <Button 
              size="lg" 
              onClick={actions.resetGame}
              className="py-6 px-10 font-orbitron font-black text-xs tracking-widest bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              <ArrowLeft className="mr-2.5 h-4.5 w-4.5" />
              TERMINATE TERMINAL //
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Outcome;
