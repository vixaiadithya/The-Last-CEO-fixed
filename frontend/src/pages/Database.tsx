import { useGameStore } from '@/store/gameStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Database as DbIcon, Activity, TrendingUp, AlertTriangle, Users, Heart } from 'lucide-react';

export const Database = () => {
  const { state, company } = useGameStore();
  const history = state.history || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
        <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
          <DbIcon className="w-6 h-6 text-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-space font-bold text-slate-100">Executive Decision Log</h1>
          <p className="text-sm text-slate-500 font-space">Official Corporate Action History</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center p-12 text-slate-500 font-space bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
          No decisions recorded yet. Play through a quarter to log an executive action.
        </div>
      ) : (
        <div className="grid gap-4">
          {[...history].reverse().map((h, idx) => (
            <Card key={idx} className="bg-slate-900/60 border-slate-800 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="space-y-2 w-full md:w-1/2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-space mb-1">
                    <span className="uppercase text-cyan-400 font-bold">{company?.name || 'Company'}</span>
                    <span>•</span>
                    <span>Q{h.quarter} {h.year}</span>
                  </div>
                  <h3 className="font-space font-bold text-slate-100 text-lg">
                    {h.decision || 'No Action Taken'}
                  </h3>
                </div>

                <div className="flex gap-4 w-full md:w-auto flex-wrap md:flex-nowrap">
                  <div className="flex flex-col items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800/60 min-w-[100px] flex-1">
                    <TrendingUp className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-[10px] text-slate-500 font-space uppercase">Revenue</span>
                    <span className="font-bold text-cyan-400">${(h.revenue / 1000000).toFixed(2)}M</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800/60 min-w-[100px] flex-1">
                    <Activity className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-slate-500 font-space uppercase">Budget</span>
                    <span className="font-bold text-emerald-400">${(h.budget / 1000000).toFixed(2)}M</span>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800/60 min-w-[100px] flex-1">
                    <Heart className="w-4 h-4 text-pink-400 mb-1" />
                    <span className="text-[10px] text-slate-500 font-space uppercase">Morale</span>
                    <span className="font-bold text-pink-400">{h.morale}%</span>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800/60 min-w-[100px] flex-1">
                    <Users className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="text-[10px] text-slate-500 font-space uppercase">Staff</span>
                    <span className="font-bold text-amber-400">{h.employees}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
