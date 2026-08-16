import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  trend?: number;
  icon: React.ReactNode;
  color: string;
}

export const StatCard = ({ label, value, trend, icon, color }: StatCardProps) => {
  const isBudget = label.toLowerCase() === 'budget';
  const isMorale = label.toLowerCase() === 'morale';
  const isRoi = label.toLowerCase() === 'roi';
  const isEmployees = label.toLowerCase() === 'employees';

  let borderGlowClass = "cyber-border-cyan";
  let textColorClass = "text-cyan-400";
  let glowColorClass = "text-glow-cyan";
  if (isBudget) {
    borderGlowClass = "cyber-border-gold";
    textColorClass = "text-yellow-400";
    glowColorClass = "text-glow-gold";
  } else if (isMorale) {
    borderGlowClass = "cyber-border-purple";
    textColorClass = "text-purple-400";
    glowColorClass = "text-glow-purple";
  } else if (isRoi) {
    const valStr = String(value);
    const isNegative = valStr.includes('-') || (trend !== undefined && trend < 0);
    borderGlowClass = isNegative ? "cyber-border-magenta" : "cyber-border-cyan";
    textColorClass = isNegative ? "text-rose-400" : "text-cyan-400";
    glowColorClass = isNegative ? "text-glow-magenta" : "text-glow-cyan";
  }

  // Morale SVG ring metrics
  const moralePercent = isMorale ? parseInt(String(value)) || 0 : 0;
  const radius = 26;
  const strokeDash = 2 * Math.PI * radius;
  const strokeOffset = strokeDash - (moralePercent / 100) * strokeDash;

  return (
    <Card className={cn("cyber-glass relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group", borderGlowClass)}>
      {/* Scanner laser overlay sweep inside cards */}
      <div className="cyber-sweep-overlay" />
      
      <CardContent className="p-5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-orbitron block">
              // HUD_METRIC::{label}
            </span>

            {/* Custom RPG HUD Elements */}
            {isMorale ? (
              <div className="flex items-center space-x-3.5">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Concentric detail scanner track (Outer dashed) */}
                    <circle
                      cx="32"
                      cy="32"
                      r="30"
                      stroke="rgba(168, 85, 247, 0.15)"
                      strokeWidth="1"
                      fill="transparent"
                      strokeDasharray="4 2"
                    />
                    {/* Concentric detail scanner track (Inner solid background) */}
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="rgba(168, 85, 247, 0.08)"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    {/* Outer animated indicator dot */}
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="rgb(168, 85, 247)"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={strokeDash}
                      strokeDashoffset={strokeOffset}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-orbitron font-black text-sm text-purple-400 text-glow-purple">
                    {value}%
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-orbitron bg-purple-500/5 block text-center uppercase tracking-widest">
                    SYNC_STABLE
                  </span>
                  <p className="text-[9px] text-slate-500 font-mono">COHESION STATE</p>
                </div>
              </div>
            ) : isBudget ? (
              <div className="space-y-2">
                <div className="font-orbitron text-2xl font-black text-yellow-400 tracking-tight text-glow-gold">
                  {value}
                </div>
                {/* Credits status bar */}
                <div className="h-2 w-full bg-slate-950/80 rounded border border-slate-800/80 p-[1px] overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 w-3/4 animate-pulse rounded-sm shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                </div>
              </div>
            ) : (
              <div className={cn("font-orbitron text-2xl font-black tracking-tight", textColorClass, glowColorClass)}>
                {value}
              </div>
            )}

            {/* Delta Status values */}
            {trend !== undefined && !isMorale && (
              <div className="flex items-center space-x-1.5 mt-2">
                <span className={cn(
                  "text-[9px] font-orbitron px-1.5 py-0.5 rounded border font-bold tracking-wider",
                  trend > 0 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : trend < 0 
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                      : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                )}>
                  {trend > 0 ? '▲' : trend < 0 ? '▼' : '■'} Q_DELTA::{Math.abs(trend)}%
                </span>
              </div>
            )}

            {/* Employees visually rendered as dots */}
            {isEmployees && (
              <div className="flex items-center space-x-1 mt-2.5">
                {Array.from({ length: Math.min(Number(value) || 0, 10) }).map((_, idx) => (
                  <span key={idx} className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.8)] border border-cyan-300" />
                ))}
                {Number(value) > 10 && (
                  <span className="text-[9px] text-cyan-400 font-orbitron font-black pl-1 text-glow-cyan">
                    +{Number(value) - 10}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right visual icon */}
          <div className={cn("p-3.5 rounded-xl border bg-slate-950/80 group-hover:scale-110 transition-transform duration-300", 
            isBudget ? "border-yellow-500/30 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.1)]" :
            isMorale ? "border-purple-500/30 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.1)]" :
            "border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
