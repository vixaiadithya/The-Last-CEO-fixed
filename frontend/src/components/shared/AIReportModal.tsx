import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper component for counting up numbers
const AnimatedNumber = ({ value, prefix = "", suffix = "", isNegative = false }: { value: number, prefix?: string, suffix?: string, isNegative?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.abs(value);
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>{isNegative ? '-' : ''}{prefix}{displayValue.toLocaleString()}{suffix}</span>
  );
};

// Typewriter effect component
const TypewriterText = ({ text, delay = 0, speed = 20 }: { text: string, delay?: number, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    let timer: NodeJS.Timeout;
    
    const startTyping = () => {
      timer = setInterval(() => {
        if (i < text.length) {
          i++;
          setDisplayedText(text.substring(0, i));
        } else {
          clearInterval(timer);
        }
      }, speed);
    };

    const delayTimer = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(timer);
    };
  }, [text, delay, speed]);

  return <span>{displayedText}</span>;
};

export const AIReportModal = () => {
  const state = useGameStore((s) => s.state);
  const actions = useGameStore((s) => s.actions);
  const report = useGameStore((s) => s.currentReport);
  const outcome = useGameStore((s) => s.lastDecisionOutcome);
  const company = useGameStore((s) => s.company);
  
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (report) {
      const timer = setTimeout(() => setShowButton(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [report]);

  if (!report) return null;

  const handleClose = () => {
    actions.setReport(null as any);
    actions.setLastDecisionOutcome(null);
  };

  const netQuarterChange = report.revenue - report.expenses;
  
  const summaryText = report.summary || "";
  const [statusRaw, ...rationaleParts] = summaryText.split(" - ");
  let status = statusRaw.replace("Board Decision: ", "").toUpperCase();
  const rationale = rationaleParts.join(" - ") || "Strategic shift required to meet operational targets.";

  // Backward compatibility for old saves
  const fallbackRisk = parseInt(report.risks?.[1]?.match(/(\d+)/)?.[1] || "0");
  const fallbackReadiness = parseInt(report.risks?.[2]?.match(/(-?\d+)/)?.[1] || "0");

  const riskScore = Math.max(0, Math.min(100, report.riskScore ?? fallbackRisk));
  const readiness = Math.max(0, Math.min(100, report.readinessScore ?? fallbackReadiness));

  if (netQuarterChange < 0 && report.roi < 0) {
    status = "EMERGENCY COST REDUCTION";
  }

  // Dynamic board recommendations
  let boardRecs = [
    company && company.aiMaturityScore < 50 ? "Increase AI capability" : "Maintain AI dominance",
    company && company.trainingHours < 200 ? "Improve workforce training" : "Optimize human-AI collaboration",
    company && company.automationRate < 60 ? "Optimize automation" : "Monitor automation stability",
    "Re-evaluate next quarter"
  ];

  if (netQuarterChange < 0 && report.roi < 0) {
    boardRecs = [
      "Freeze AI expansion",
      "Reduce operating expenses",
      "Optimize workforce",
      "Improve cash flow",
      "Review investments next quarter"
    ];
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 overflow-hidden">
      {/* Holographic background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-3000" />
      
      <Card className="max-w-4xl w-full text-cyan-500 font-mono relative animate-in zoom-in-95 duration-500 cyber-glass border-slate-800/80 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Neon top border glow */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
        <div className="cyber-sweep-overlay opacity-20 pointer-events-none" />
        
        {/* Top Header Fixed */}
        <div className="p-4 border-b border-cyan-900/30 bg-slate-950/80 shrink-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-sm tracking-[0.2em] text-white font-black drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-cyan-400" />
              AI BOARD ANALYSIS COMPLETE
            </h1>
          </div>
          <h2 className="text-xs tracking-[0.3em] font-bold text-cyan-600">
            Q{report.quarter} • YEAR {report.year}
          </h2>
        </div>

        <div className="p-6 overflow-y-auto z-10 flex-1 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: Financials & Outcomes */}
            <div className="space-y-6">
              
              {/* Financials Section */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-cyan-900/30 animate-in slide-in-from-left-4 duration-700 delay-100 fill-mode-both">
                <div className="text-[10px] tracking-[0.3em] text-cyan-600/80 font-bold uppercase mb-2">Net Quarterly Profit</div>
                <div className={cn(
                  "text-3xl font-black tracking-wider mb-4 flex items-center gap-3",
                  netQuarterChange >= 0 ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                )}>
                  <AnimatedNumber value={Math.abs(netQuarterChange)} prefix="$" isNegative={netQuarterChange < 0} />
                  <span>{netQuarterChange >= 0 ? "🟢" : "🔴"}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-cyan-900/30 pt-3">
                  <div>
                    <div className="text-cyan-600/80 tracking-widest text-[9px] mb-1">REVENUE</div>
                    <div className="text-emerald-400 font-bold"><AnimatedNumber value={report.revenue} prefix="$" /></div>
                  </div>
                  <div className="text-right group relative cursor-help">
                    <div className="text-cyan-600/80 tracking-widest text-[9px] mb-1 border-b border-cyan-900/30 border-dashed inline-block pb-0.5">TOTAL EXPENSES</div>
                    <div className="text-rose-400 font-bold">-<AnimatedNumber value={report.expenses} prefix="$" /></div>
                    
                    {report.expenseBreakdown && (
                      <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 min-w-[200px] text-left">
                        <div className="text-[10px] tracking-widest text-cyan-600 mb-2 border-b border-cyan-900/50 pb-1">EXPENSE BREAKDOWN</div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">Salaries:</span>
                          <span className="text-white">${report.expenseBreakdown.salaries.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">Operations:</span>
                          <span className="text-white">${report.expenseBreakdown.operations.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">AI Amortization:</span>
                          <span className="text-white">${report.expenseBreakdown.aiInvestment.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between gap-2 text-[10px] font-bold tracking-wider pt-4">
                  <span className={report.roi >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    ROI {report.roi >= 0 ? "▲" : "▼"} <AnimatedNumber value={Math.abs(report.roi)} suffix="%" />
                  </span>
                  <span className={report.moraleChange >= 0 ? "text-cyan-400" : "text-rose-400"}>
                    MORALE {report.moraleChange >= 0 ? "▲" : "▼"} <AnimatedNumber value={Math.abs(report.moraleChange)} suffix="%" />
                  </span>
                  <span className={outcome?.employeeGain && outcome.employeeGain >= 0 ? "text-purple-400" : "text-rose-400"}>
                    STAFF {outcome?.employeeGain && outcome.employeeGain >= 0 ? "+" : ""}<AnimatedNumber value={Math.abs(outcome?.employeeGain || 0)} isNegative={outcome?.employeeGain && outcome.employeeGain < 0} />
                  </span>
                </div>
              </div>

              {/* Projected Outcomes */}
              <div className="animate-in slide-in-from-left-4 duration-700 delay-500 fill-mode-both">
                <div className="text-cyan-700 text-[10px] tracking-widest mb-3">PROJECTED OUTCOMES</div>
                <div className="space-y-1.5 text-xs">
                  {report.recommendations?.map((rec, i) => {
                    const matchOld = rec.match(/Scenario \w \((.*?)\): ROI (-?\d+)%, Revenue (.*)/);
                    const matchNew = rec.match(/(Chosen|If Chose): (.*?): ROI (-?\d+)%, Revenue (.*)/);
                    
                    if (matchNew) {
                      const isChosen = matchNew[1] === 'Chosen';
                      const roiValue = parseInt(matchNew[3]);
                      const isNegative = roiValue < 0;
                      return (
                        <div key={i} className={cn(
                          "flex justify-between items-center px-3 py-1.5 border rounded",
                          isChosen ? "bg-cyan-500/10 border-cyan-500/50" : (isNegative ? "bg-rose-950/20 border-rose-900/30" : "bg-slate-900/40 border-slate-700/50")
                        )}>
                          <span className={cn("truncate flex-1 min-w-[100px]", isChosen ? "text-cyan-300 font-bold" : (isNegative ? "text-rose-400/70" : "text-slate-400"))}>
                            {isChosen ? ">> " : (isNegative ? "⚠ " : "")}{matchNew[2]}
                          </span>
                          <span className={cn("font-bold text-[10px] w-16 text-center", isChosen ? "text-white" : (isNegative ? "text-rose-500" : "text-slate-400"))}>
                            ROI {matchNew[3]}%
                          </span>
                          <span className={cn("text-right w-16 truncate", isChosen ? "text-emerald-400" : (isNegative ? "text-rose-500/50" : "text-slate-500"))}>
                            {matchNew[4]}
                          </span>
                        </div>
                      );
                    }
                    
                    if (matchOld) {
                      const roiValue = parseInt(matchOld[2]);
                      const isNegative = roiValue < 0;
                      return (
                        <div key={i} className={cn("flex justify-between items-center px-3 py-1.5 border rounded", isNegative ? "bg-rose-950/20 border-rose-900/30" : "bg-cyan-950/20 border-cyan-900/30")}>
                          <span className={cn("w-24 truncate", isNegative ? "text-rose-400/70" : "text-cyan-300")}>{matchOld[1]}</span>
                          <span className={cn("font-bold text-[10px]", isNegative ? "text-rose-500" : "text-white")}>ROI {matchOld[2]}%</span>
                          <span className={cn("text-right w-20 truncate", isNegative ? "text-rose-500/50" : "text-emerald-400")}>{matchOld[3]}</span>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={i} className="flex justify-between bg-cyan-950/20 px-3 py-1.5 border border-cyan-900/30 rounded">
                        <span className="text-cyan-300 truncate">{rec}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Resolution & Risk */}
            <div className="space-y-6">
              
              {/* Board Resolution */}
              <div className="animate-in slide-in-from-right-4 duration-700 delay-300 fill-mode-both">
                <h3 className="flex items-center gap-2 text-rose-500 font-bold tracking-widest mb-3 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  BOARD RESOLUTION
                </h3>
                
                <div className="pl-4 border-l-2 border-cyan-900/50 space-y-4">
                  <div>
                    <div className="text-cyan-700 text-[9px] tracking-widest mb-0.5">STATUS:</div>
                    <div className="text-white font-bold tracking-widest text-sm">
                      <TypewriterText text={status} delay={500} speed={20} />
                    </div>
                  </div>

                  <div>
                    <div className="text-cyan-700 text-[9px] tracking-widest mb-0.5">RATIONALE:</div>
                    <div className="text-cyan-100 text-xs leading-relaxed">
                      <TypewriterText text={rationale} delay={800} speed={10} />
                    </div>
                  </div>

                  <div className="pt-2 animate-in fade-in duration-1000 delay-2000 fill-mode-both">
                    <div className="text-cyan-700 text-[9px] tracking-widest mb-2">THE BOARD RECOMMENDS:</div>
                    <ul className="space-y-1 text-[11px] text-cyan-300 tracking-wide">
                      {boardRecs.map((rec, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-emerald-500">■</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI Risk Analysis */}
              <div className="animate-in slide-in-from-right-4 duration-700 delay-500 fill-mode-both bg-slate-900/30 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-cyan-700 text-[9px] tracking-widest">AI RISK ANALYSIS</div>
                  <div className="text-white font-bold tracking-widest text-xs">
                    <AnimatedNumber value={riskScore} suffix="%" />
                  </div>
                </div>
                
                <div className="h-2.5 bg-slate-950 border border-slate-800 relative overflow-hidden mb-2 rounded-full">
                  <div 
                    className={cn(
                      "absolute top-0 left-0 bottom-0 transition-all duration-2000 ease-out rounded-full",
                      riskScore > 75 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : riskScore > 40 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    )}
                    style={{ width: `${riskScore}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px]">
                  <span className="text-cyan-700 tracking-widest">AI READINESS</span>
                  <span className={cn(
                    "font-bold tracking-widest",
                    readiness < 30 ? "text-rose-500" : readiness < 70 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {readiness.toFixed(0)}%
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 border-t border-cyan-900/30 bg-slate-950/90 shrink-0 z-10 flex justify-center">
          <Button 
            className={cn(
              "bg-slate-900 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 font-bold tracking-[0.2em] px-8 py-4 text-xs uppercase transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] group relative overflow-hidden w-full md:w-auto",
              showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
            onClick={handleClose}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Play className="w-4 h-4 mr-2 group-hover:text-cyan-300" />
            {state.currentQuarter === 1 ? "AUTHORIZE NEXT YEAR" : `CONTINUE TO QUARTER ${state.currentQuarter}`}
          </Button>
        </div>

      </Card>
    </div>
  );

  const container = document.fullscreenElement || document.body;
  return createPortal(modalContent, container);
};
