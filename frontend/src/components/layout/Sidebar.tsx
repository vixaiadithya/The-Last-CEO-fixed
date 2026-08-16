import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Trophy, Database, Target, ChevronRight, PanelLeftClose } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const company = useGameStore((s) => s.company);
  const state = useGameStore((s) => s.state);

  const navItems = [
    { path: '/', icon: Home, label: 'Home Overview' },
    { path: '/enter', icon: Target, label: 'Corporate Game' },
    { path: '/engine', icon: BarChart3, label: 'Active Dashboard' },
    { path: '/outcome', icon: Trophy, label: 'Simulation Results' },
    { path: '/database', icon: Database, label: 'Prediction Database' },
  ];

  return (
    <aside className="relative w-56 h-screen flex flex-col z-50 font-space overflow-hidden border-r border-cyan-500/20 bg-gradient-to-b from-[#070b16] via-[#05070f] to-[#070b16]">
      {/* Animated scan sweep + grid texture */}
      <div className="cyber-sweep-overlay opacity-60" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      {/* Glowing right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/70 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.6)]" />

      {/* Brand */}
      <div className="relative z-10 px-5 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-1 flex items-center justify-center bg-cyan-500/10 rounded-lg border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.25)] w-11 h-11">
              <img src="/Logo.png" alt="The Last CEO" className="h-9 w-9 object-contain" />
            </div>
            <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#05070f] shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-[blink_2s_ease-in-out_infinite]" />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-[13px] text-slate-100 tracking-[0.18em] text-glow-cyan">THE LAST CEO</h1>
            <p className="text-[8px] text-cyan-500/70 tracking-[0.3em] uppercase">Enterprise Edition</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              title="Hide sidebar"
              className="ml-auto p-2 rounded-lg text-slate-400 bg-slate-900/40 border border-slate-700/50 hover:text-cyan-300 hover:bg-slate-800/80 hover:border-cyan-400/70 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.6),0_0_40px_rgba(6,182,212,0.3)] transition-all duration-200"
            >
              <PanelLeftClose className="h-4 w-4 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 py-5 px-3">
        <div className="flex items-center gap-2 px-2 mb-3">
          <span className="h-px flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
          <span className="font-semibold text-[8px] text-cyan-500/70 uppercase tracking-[0.3em]">Navigation</span>
        </div>

        <div className="space-y-1">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={cn(
                    'group relative flex items-center gap-3 pl-4 pr-2.5 py-2.5 text-[13px] transition-all duration-200 overflow-hidden',
                    isActive
                      ? 'text-cyan-200 bg-gradient-to-r from-cyan-500/[0.14] via-cyan-500/[0.05] to-transparent'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 hover:pl-5'
                  )}
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
                >
                  {/* Active neon bar + sweep */}
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all duration-300',
                      isActive ? 'h-7 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]' : 'h-0'
                    )}
                  />
                  {isActive && (
                    <span className="absolute inset-0 cyber-sweep-overlay opacity-40 pointer-events-none" />
                  )}

                  {/* Index number */}
                  <span className={cn('font-mono text-[9px] tabular-nums transition-colors', isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-500')}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <item.icon
                    className={cn('h-4 w-4 shrink-0 transition-all', isActive ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.7)]' : 'text-slate-500 group-hover:text-slate-300')}
                  />
                  <span className={cn('tracking-wide flex-1 relative z-10', isActive && 'font-semibold')}>{item.label}</span>

                  <ChevronRight
                    className={cn('h-3.5 w-3.5 shrink-0 transition-all duration-200', isActive ? 'text-cyan-400 opacity-100' : 'text-slate-600 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0')}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* System status / profile */}
      <div className="relative z-10 px-3 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2 px-2 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
          <span className="font-semibold text-[8px] text-emerald-400/80 uppercase tracking-[0.3em]">
            {company ? 'System Online' : 'Standby'}
          </span>
        </div>

        {company ? (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-3 py-2 rounded-md bg-slate-900/50 border border-slate-800/50">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Company</span>
              <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[95px]">{company.name || 'Unnamed'}</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2 rounded-md bg-slate-900/50 border border-slate-800/50">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Sector</span>
              <span className="text-[11px] font-semibold text-cyan-400">{company.industry}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="px-3 py-2 rounded-md bg-slate-900/50 border border-slate-800/50 text-center">
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Level</div>
                <div className="text-sm font-bold text-cyan-300 text-glow-cyan tabular-nums">{state.level}</div>
              </div>
              <div className="px-3 py-2 rounded-md bg-slate-900/50 border border-slate-800/50 text-center">
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">Year</div>
                <div className="text-sm font-bold text-purple-300 tabular-nums">{state.currentYear}</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="px-2 text-[10px] text-slate-600 font-mono leading-relaxed">
            No active simulation.<br />Launch a company to begin.
          </p>
        )}
      </div>
    </aside>
  );
};
