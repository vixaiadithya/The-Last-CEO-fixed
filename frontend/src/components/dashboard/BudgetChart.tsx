import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useGameStore } from '@/store/gameStore';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="cyber-glass cyber-border-emerald p-3 rounded-lg text-[10px] font-orbitron text-white space-y-1">
        <p className="text-slate-500 font-bold border-b border-slate-800 pb-1 mb-1">// {label}</p>
        <p className="text-emerald-400 font-black">BUDGET: ${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export const BudgetChart = () => {
  const state = useGameStore((s) => s.state);

  const data = state.history.map((entry) => ({
    label: entry.quarter ? `H${entry.quarter} '${String(entry.year).slice(-2)}` : `'${String(entry.year).slice(-2)}`,
    budget: entry.budget,
  }));

  return (
    <Card className="cyber-glass cyber-border-emerald overflow-hidden relative w-full h-full">
      {/* Scanner laser overlay sweep */}
      <div className="cyber-sweep-overlay" />

      <CardHeader className="border-b border-slate-900 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="font-orbitron text-sm font-black tracking-widest text-emerald-400 text-glow-emerald">
          // CAPITAL_RESERVES_
        </CardTitle>
        <span className="text-2xl font-bold font-space text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
          ${state.budget.toLocaleString()}
        </span>
      </CardHeader>

      <CardContent className="pt-6">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              {/* Define glowing drop shadow filters */}
              <defs>
                <filter id="neon-glow-budget" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.8" />
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
                stroke="#475569"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Orbitron' }}
                tickLine={{ stroke: '#1e293b' }}
                tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e293b', strokeWidth: 1 }} />

              <Line
                type="monotone"
                dataKey="budget"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", stroke: "#040610", strokeWidth: 1.5, r: 4 }}
                activeDot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 2, r: 6 }}
                filter="url(#neon-glow-budget)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graph Inference Instructions */}
        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-slate-950/60 p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <img src="/Logo.png" alt="logo" className="w-4 h-4" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-emerald-400/80 uppercase">
              Data Inference <span className="text-slate-600">//</span> Capital
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-space relative z-10">
            <strong className="text-emerald-400">X-Axis:</strong> Time (Half-Years) | <strong className="text-emerald-400">Y-Axis:</strong> Capital Reserves ($ Millions)<br/>
            A downward trend indicates a high burn rate exceeding revenue. An upward trend indicates strong cash generation and sustainable enterprise growth.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
