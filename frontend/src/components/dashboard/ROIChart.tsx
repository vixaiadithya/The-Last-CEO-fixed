import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useGameStore } from '@/store/gameStore';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="cyber-glass cyber-border-cyan p-3 rounded-lg text-[10px] font-orbitron text-white space-y-1">
        <p className="text-slate-500 font-bold border-b border-slate-800 pb-1 mb-1">// {label}</p>
        <p className="text-cyan-400 font-black">ROI: +{payload[0].value}%</p>
        {payload[0].payload.revenue !== undefined && (
          <p className="text-yellow-400 font-black">REV: ${payload[0].payload.revenue.toLocaleString()}</p>
        )}
      </div>
    );
  }
  return null;
};

export const ROIChart = () => {
  const state = useGameStore((s) => s.state);

  const data = state.history.map((entry) => ({
    label: entry.quarter ? `H${entry.quarter} '${String(entry.year).slice(-2)}` : `'${String(entry.year).slice(-2)}`,
    roi: entry.roi,
    revenue: entry.revenue,
  }));

  return (
    <Card className="cyber-glass cyber-border-cyan overflow-hidden relative">
      {/* Scanner laser overlay sweep */}
      <div className="cyber-sweep-overlay" />

      <CardHeader className="border-b border-slate-900 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="font-orbitron text-sm font-black tracking-widest text-cyan-400 text-glow-cyan">
          // ROI_TELEMETRY_STREAM_
        </CardTitle>
        <span className="text-2xl font-bold font-space text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
          {state.roi}%
        </span>
      </CardHeader>

      <CardContent className="pt-6">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              {/* Define glowing drop shadow filters */}
              <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.8" />
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
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e293b', strokeWidth: 1 }} />

              <Line
                type="monotone"
                dataKey="roi"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: "#06b6d4", stroke: "#040610", strokeWidth: 1.5, r: 4 }}
                activeDot={{ fill: "#06b6d4", stroke: "#fff", strokeWidth: 2, r: 6 }}
                filter="url(#neon-glow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graph Inference Instructions */}
        <div className="mt-5 rounded-xl border border-cyan-500/20 bg-slate-950/60 p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <img src="/Logo.png" alt="logo" className="w-4 h-4" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/80 uppercase">
              Data Inference <span className="text-slate-600">//</span> ROI
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-space relative z-10">
            <strong className="text-cyan-400">X-Axis:</strong> Time (Half-Years) | <strong className="text-cyan-400">Y-Axis:</strong> Return on Investment (%)<br/>
            An upward curve indicates that AI integration is generating profitable returns. A downward curve signals rising operational costs and inefficient spending.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
