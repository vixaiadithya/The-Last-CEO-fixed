import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { 
  Home, 
  BarChart3, 
  Terminal,
  Activity,
  Coins,
  Smile,
  LineChart
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export const Navbar = () => {
  const state = useGameStore((s) => s.state);
  const company = useGameStore((s) => s.company);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/50">
      <div className="flex h-16 items-center px-6">
        <Link to="/" className="flex items-center space-x-2 group">
          <Terminal className="h-6 w-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-200" />
          <span className="font-bold text-xl font-space tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-magenta-400">
            BIZ_RPG //
          </span>
        </Link>

        <div className="flex-1" />

        {/* Cyber Stats Panel */}
        {company && (
          <div className="hidden md:flex items-center space-x-6 text-xs font-space">
            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-400">TIMELINE:</span>
              <span className="text-cyan-400 font-bold">
                {state.currentYear} <span className="text-slate-500">//</span> Q{state.currentQuarter}
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
              <Coins className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-slate-400">REVENUE:</span>
              <span className="text-yellow-400 font-bold">
                ${state.budget.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
              <LineChart className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400">ROI:</span>
              <span className={`font-bold ${state.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {state.roi >= 0 ? '+' : ''}{state.roi}%
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
              <Smile className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-slate-400">MORALE:</span>
              <span className="text-purple-400 font-bold">
                {state.morale}%
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 md:flex-initial" />

        <div className="flex items-center space-x-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-cyan-400 hover:bg-slate-900">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          {company && (
            <Link to="/engine">
              <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-space text-xs">
                <BarChart3 className="h-3.5 w-3.5 mr-2" />
                CONSOLE
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
