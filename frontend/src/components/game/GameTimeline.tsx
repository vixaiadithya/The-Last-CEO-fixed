import { cn } from '@/lib/utils';

interface GameTimelineProps {
  currentYear: number;
}

export const GameTimeline = ({ currentYear }: GameTimelineProps) => {
  const startYear = 2024;
  const endYear = 2035;
  const totalYears = endYear - startYear;
  
  // Calculate percentage progress toward 2035
  const progressPercent = Math.min(
    Math.max(((currentYear - startYear) / totalYears) * 100, 0),
    100
  );

  const milestones = [
    { year: 2024, label: 'FOUNDATION' },
    { year: 2027, label: 'EARLY TRACTION' },
    { year: 2030, label: 'SCALE UP' },
    { year: 2033, label: 'EXPANSION' },
    { year: 2035, label: 'VICTORY GATE' },
  ];

  return (
    <div className="cyber-glass cyber-border-cyan rounded-lg p-6 w-full relative overflow-hidden">
      {/* Background scanline simulation */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

      <div className="flex flex-col space-y-4 relative z-10">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="font-orbitron font-bold text-sm tracking-wider text-cyan-400 text-glow-cyan">
              // OPERATIONS TIMELINE_
            </h3>
            <p className="text-[11px] text-slate-400">Survival parameters set to Year 2035</p>
          </div>
          <div className="text-right font-orbitron">
            <span className="text-xs text-slate-400 uppercase tracking-widest block">YEAR DISTANCE</span>
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              {Math.max(endYear - currentYear, 0)} YEARS REMAINING
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="h-8 w-full bg-slate-950/80 rounded-lg border border-slate-800 p-1 flex items-center relative">
          {/* Animated Neon glowing progress */}
          <div 
            style={{ width: `${progressPercent}%` }}
            className="h-full rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-700 ease-out animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          />

          {/* Dots indicating milestone years */}
          <div className="absolute inset-x-4 inset-y-0 flex justify-between items-center pointer-events-none">
            {milestones.map((milestone) => {
              const isActive = currentYear >= milestone.year;
              const isCurrent = currentYear === milestone.year;

              return (
                <div key={milestone.year} className="flex flex-col items-center justify-center relative">
                  <span className={cn(
                    "h-3 w-3 rounded-full border transition-all duration-300",
                    isCurrent 
                      ? "bg-cyan-400 border-cyan-300 scale-125 shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
                      : isActive 
                        ? "bg-indigo-500 border-indigo-400 shadow-[0_0_5px_rgba(99,102,241,0.5)]" 
                        : "bg-slate-900 border-slate-700"
                  )} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Labels under track */}
        <div className="flex justify-between px-2 text-[10px] font-orbitron font-semibold text-slate-500">
          {milestones.map((milestone) => {
            const isCurrent = currentYear === milestone.year;
            return (
              <div key={milestone.year} className={cn(
                "text-center flex flex-col items-center w-16",
                isCurrent ? "text-cyan-400 text-glow-cyan font-bold" : currentYear >= milestone.year ? "text-indigo-400" : ""
              )}>
                <span>{milestone.year}</span>
                <span className="hidden sm:inline text-[8px] opacity-80 uppercase mt-0.5 tracking-wider">
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
