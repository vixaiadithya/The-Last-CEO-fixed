import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { api } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SlidersHorizontal, TrendingUp, Gauge, ShieldAlert, Cpu, RotateCcw, Loader2, BrainCircuit, Lightbulb, MessageSquare, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

const AnimatedMetric = ({ 
  value, 
  format, 
  trendMode 
}: { 
  value: number | null; 
  format: (v: number) => string; 
  trendMode: 'higher-is-better' | 'lower-is-better';
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [trend, setTrend] = useState<'up' | 'down' | 'none'>('none');
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === null) {
      setDisplayValue(null);
      setTrend('none');
      prevValueRef.current = null;
      return;
    }

    if (prevValueRef.current === null) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    if (value === prevValueRef.current) return;

    const startValue = displayValue !== null ? displayValue : prevValueRef.current;
    const endValue = value;

    if (endValue > prevValueRef.current) setTrend('up');
    else if (endValue < prevValueRef.current) setTrend('down');

    prevValueRef.current = value;

    const duration = 1500;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(startValue + (endValue - startValue) * ease);

      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayValue(endValue);
    };

    requestAnimationFrame(animate);
  }, [value]);

  if (displayValue === null) return <span>—</span>;

  let isGood = true;
  if (trendMode === 'higher-is-better') isGood = trend === 'up';
  else if (trendMode === 'lower-is-better') isGood = trend === 'down';

  const trendColor = isGood ? 'text-emerald-400' : 'text-rose-400';

  return (
    <span className="flex items-center">
      {format(displayValue)}
      {trend === 'up' && <ArrowUpRight className={`ml-1.5 w-5 h-5 ${trendColor}`} />}
      {trend === 'down' && <ArrowDownRight className={`ml-1.5 w-5 h-5 ${trendColor}`} />}
    </span>
  );
};

// Plain-English phrasing + whether the player can change it with a slider.
const PHRASES: Record<string, { text: string; controllable: boolean }> = {
  'AI Investment': { text: 'your AI investment', controllable: true },
  'AI Adoption': { text: 'your AI adoption level', controllable: true },
  'Automation': { text: 'your automation rate', controllable: true },
  'AI Maturity': { text: 'your AI maturity', controllable: true },
  'Training Hours': { text: 'employee training', controllable: true },
  'Deployments': { text: 'your number of deployments', controllable: true },
  'Industry': { text: 'your industry', controllable: false },
  'Country': { text: 'your market', controllable: false },
  'Year': { text: 'the time period', controllable: false },
};
const phraseOf = (f: string) => PHRASES[f]?.text ?? `"${f}"`;
const isControllable = (f: string) => PHRASES[f]?.controllable ?? false;
const money = (v: number) => `$${Math.abs(v / 1000).toFixed(0)}k`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Lever {
  key: string;
  label: string;
  field: keyof Defaults;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
}

interface Defaults {
  ai_investment_usd: number;
  ai_adoption_level: number;
  automation_rate: number;
  ai_maturity_score: number;
  employee_ai_training_hours: number;
  deployment_count: number;
}

const LEVERS: Lever[] = [
  { key: 'adopt', label: 'AI Adoption', field: 'ai_adoption_level', min: 0, max: 5, step: 0.1, fmt: (v) => v.toFixed(1) },
  { key: 'auto', label: 'Automation Rate', field: 'automation_rate', min: 0, max: 100, step: 1, fmt: (v) => `${v.toFixed(0)}%` },
  { key: 'mat', label: 'AI Maturity', field: 'ai_maturity_score', min: 0, max: 100, step: 1, fmt: (v) => `${v.toFixed(0)}` },
  { key: 'train', label: 'Training Hours', field: 'employee_ai_training_hours', min: 0, max: 200, step: 5, fmt: (v) => `${v.toFixed(0)}h` },
  { key: 'dep', label: 'Deployments', field: 'deployment_count', min: 0, max: 40, step: 1, fmt: (v) => `${v.toFixed(0)}` },
];

export const WhatIfSimulator = () => {
  const company = useGameStore((s) => s.company);
  const state = useGameStore((s) => s.state);

  const baseline = (): Defaults => ({
    ai_investment_usd: company?.aiInvestment ?? 500000,
    ai_adoption_level: company?.aiAdoptionLevel ?? 3.5,
    automation_rate: company?.automationRate ?? 45,
    ai_maturity_score: company?.aiMaturityScore ?? 75,
    employee_ai_training_hours: company?.trainingHours ?? 120,
    deployment_count: company?.deploymentCount ?? 10,
  });

  const [vals, setVals] = useState<Defaults>(baseline);
  const [result, setResult] = useState<any>(null);
  const [explain, setExplain] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [geminiAdvice, setGeminiAdvice] = useState<string | null>(null);
  const [geminiShap, setGeminiShap] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync simulator values when company stats update (after the CEO makes a decision)
  useEffect(() => {
    setVals({
      ai_investment_usd: company?.aiInvestment ?? 500000,
      ai_adoption_level: company?.aiAdoptionLevel ?? 3.5,
      automation_rate: company?.automationRate ?? 45,
      ai_maturity_score: company?.aiMaturityScore ?? 75,
      employee_ai_training_hours: company?.trainingHours ?? 120,
      deployment_count: company?.deploymentCount ?? 10,
    });
  }, [
    company?.aiInvestment,
    company?.aiAdoptionLevel,
    company?.automationRate,
    company?.aiMaturityScore,
    company?.trainingHours,
    company?.deploymentCount
  ]);

  // Debounced live prediction + SHAP explanation whenever a slider moves
  useEffect(() => {
    setLoading(true);
    setGeminiLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const payload = {
          industry: company?.industry || 'Technology',
          country: company?.country || 'United States',
          year: state.currentYear,
          quarter: state.currentQuarter,
          ...vals,
          save_to_db: false,
        };
        const [predRes, explRes] = await Promise.all([
          api.getQuarterReport(payload),
          api.explainPrediction(payload),
        ]);
        setResult(predRes.data);
        setExplain(explRes.data);

        // Fetch Gemini Insights
        const prompt = `You are an elite corporate AI Advisor in a business simulation game.
Analyze the user's AI strategy inputs and the ML model predictions.
Provide exactly 3-4 sentences of strategic advice based on the data. Do not use markdown, do not use headers. Just the paragraph of advice.

Current Inputs:
- Investment: $${(vals.ai_investment_usd/1000000).toFixed(1)}M
- Adoption: ${vals.ai_adoption_level}/5
- Automation: ${vals.automation_rate}%
- Maturity: ${vals.ai_maturity_score}/100
- Training Hours: ${vals.employee_ai_training_hours}
- Deployments: ${vals.deployment_count}

Model Outputs:
- Predicted Revenue Impact: $${(predRes.data.metrics.revenue_impact/1000000).toFixed(2)}M
- ROI: ${Math.round(predRes.data.metrics.roi)}%
- Risk: ${predRes.data.metrics.risk_score.toFixed(0)}%`;

        const tryFetchAdvisor = async () => {
          let adviceText = 'The company should improve AI maturity and workforce training before increasing investment. Current conditions indicate high operational risk with limited returns.';
          
          const readiness = predRes.data.metrics.readiness_level;
          if (readiness === 'HIGH') {
              adviceText = 'The company is well-positioned for aggressive AI expansion. Focus on maximizing deployment count to capture peak ROI.';
          } else if (readiness === 'MEDIUM') {
              adviceText = 'The company has a stable foundation. Gradual increases in AI investment while maintaining high training hours will yield the best long-term results.';
          }

          try {
            const res = await api.getAdvisorInsights(prompt);
            const data = res.data;
            if (data.choices && data.choices[0]) {
               adviceText = data.choices[0].message.content.trim();
            }
          } catch (err) {
            console.warn("Advisor API network error, using fallback advice.", err);
          }
          
          // Build the final formatted string for the UI parser
          const roi = predRes.data.metrics.roi;
          const risk = predRes.data.metrics.risk_score;
          
          const revPotential = roi > 20 ? 'Outstanding' : roi > 10 ? 'Strong' : roi > 0 ? 'Moderate' : roi > -10 ? 'Weak' : 'Critical';
          const riskLevel = risk > 80 ? 'Severe' : risk > 60 ? 'High' : risk > 40 ? 'Elevated' : risk > 20 ? 'Moderate' : 'Low';
          const roiOutlook = roi > 15 ? 'Excellent' : roi > 0 ? 'Positive' : roi > -15 ? 'Weak' : 'Negative';
          
          const cleanFeature = (f: string) => f.replace(/_|-|x|\*/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();

          const topPos = explRes.data?.contributions?.filter((c: any) => c.impact > 0).slice(0, 4) || [];
          const topNeg = explRes.data?.contributions?.filter((c: any) => c.impact < 0).slice(0, 4) || [];
          
          const posText = topPos.length > 0 ? topPos.map((c: any) => `+ ${cleanFeature(c.feature)} [+$${Math.abs(c.impact/1000).toFixed(0)}k]`).join('\n') : "+ Balanced Strategy";
          const negText = topNeg.length > 0 ? topNeg.map((c: any) => `- ${cleanFeature(c.feature)} [-$${Math.abs(c.impact/1000).toFixed(0)}k]`).join('\n') : "- No Major Risks";
          const topFeature = explRes.data?.contributions?.[0]?.feature ? cleanFeature(explRes.data.contributions[0].feature) : "AI Maturity";

          const dynamicAdvice = `Current AI Readiness : ${readiness}\n\nRevenue Potential : ${revPotential}\nRisk Level : ${riskLevel} (${Math.round(risk)}%)\nROI Outlook : ${roiOutlook} (${Math.round(roi)}%)\n\n${adviceText}|||FEATURE IMPACT ANALYSIS\n\nTop Positive Drivers\n${posText}\n\nTop Negative Drivers\n${negText}\n\nMost Influential Factor\n⭐ ${topFeature}\n\nModel Accuracy (R²)\nRevenue: 70% | Productivity: 96%`;

          return { 
            success: true, 
            data: {
              choices: [{
                message: {
                  content: dynamicAdvice
                }
              }]
            }
          };
        };

        tryFetchAdvisor()
          .then(result => {
            if (result.success) {
              const text = result.data.choices[0].message.content as string;

              // The small LLM doesn't reliably place the "|||" delimiter (it sometimes
              // leads with it or omits it), so route the two sections by CONTENT.
              const SHAP_MARK = /FEATURE IMPACT ANALYSIS|Top Positive Drivers|Section\s*2/i;
              const stripLabels = (s: string) =>
                s.replace(/\*/g, '')
                 .replace(/^[\s|]+/, '')
                 .replace(/^Section\s*\d+\s*:?\s*(AI Advisor|SHAP Interpretation)?/i, '')
                 .trim();

              let advice = "";
              let shap = "";
              for (const seg of text.split("|||").map(s => s.trim()).filter(Boolean)) {
                if (SHAP_MARK.test(seg)) shap += (shap ? "\n\n" : "") + seg;
                else advice += (advice ? "\n\n" : "") + seg;
              }
              // A single blob may hold both sections — split it on the SHAP marker.
              if (advice && !shap) {
                const i = advice.search(SHAP_MARK);
                if (i > 0) { shap = advice.slice(i); advice = advice.slice(0, i); }
              }
              if (!advice && shap) {
                const i = shap.search(SHAP_MARK);
                if (i > 0) { advice = shap.slice(0, i); shap = shap.slice(i); }
              }

              // Always give the SHAP panel real data, even if the LLM skipped that section.
              if (!stripLabels(shap)) {
                const c: any[] = explRes.data?.contributions || [];
                const pos = c.filter(x => x.impact >= 0).slice(0, 3).map(x => `+ ${x.feature}`).join('\n');
                const neg = c.filter(x => x.impact < 0).slice(0, 3).map(x => `- ${x.feature}`).join('\n');
                shap = `FEATURE IMPACT ANALYSIS\n\nTop Positive Drivers\n${pos || '—'}\n\nTop Negative Drivers\n${neg || '—'}`;
              }

              setGeminiAdvice(stripLabels(advice) || "No advice available.");
              setGeminiShap(stripLabels(shap) || "No SHAP insights available.");
            } else {
              setGeminiAdvice("System Error: Unable to reach AI Advisor.");
              setGeminiShap("System Error: Unable to generate SHAP insights.");
            }
          })
          .finally(() => setGeminiLoading(false));

      } catch (e) {
        setResult(null);
        setExplain(null);
        setGeminiLoading(false);
      } finally {
        setLoading(false);
      }
    }, 400); // Decreased debounce to respond faster
    return () => clearTimeout(debounceRef.current);
  }, [vals, company?.industry, company?.country, state.currentYear, state.currentQuarter]);

  const m = result?.metrics;
  const roi = m ? Math.round(m.roi) : null;
  const roiColor = roi === null ? 'text-slate-400' : roi >= 0 ? 'text-emerald-400' : 'text-rose-400';

  const metricTiles = [
    { icon: TrendingUp, label: 'Predicted Revenue', value: m ? m.revenue_impact : null, format: (v: number) => `$${(v / 1000000).toFixed(2)}M`, trendMode: 'higher-is-better' as const, color: 'text-cyan-400' },
    { icon: Gauge, label: 'Quarterly ROI', value: roi, format: (v: number) => `${Math.round(v)}%`, trendMode: 'higher-is-better' as const, color: roiColor },
    { icon: Cpu, label: 'Productivity Gain', value: m ? m.productivity_gain : null, format: (v: number) => `${v.toFixed(1)}%`, trendMode: 'higher-is-better' as const, color: 'text-purple-400' },
    { icon: ShieldAlert, label: 'Risk Score', value: m ? m.risk_score : null, format: (v: number) => {
        if (v < 30) return `🟢 LOW ${v.toFixed(0)}%`;
        if (v < 70) return `🟡 MEDIUM ${v.toFixed(0)}%`;
        return `🔴 HIGH ${v.toFixed(0)}%`;
    }, trendMode: 'lower-is-better' as const, color: 'text-amber-400' },
  ];

  return (
    <Card className="cyber-glass cyber-border-cyan relative overflow-hidden">
      <div className="cyber-sweep-overlay opacity-20" />
      <CardHeader className="relative z-10 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-cyan-400 text-sm tracking-[0.2em] uppercase text-glow-cyan">
            <SlidersHorizontal className="w-4 h-4" /> ML Strategy Simulator
            <button 
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="text-cyan-500/50 hover:text-cyan-400 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
            {(loading || geminiLoading) && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500/70 ml-2" />}
          </CardTitle>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Drag the levers — the live XGBoost model re-forecasts in real time. (Sandbox: does not affect your game.)
          </p>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Top row: sliders + live prediction */}
        <div className="grid md:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="space-y-4 relative">
          {/* Baseline Values Tooltip Overlay */}
          <div className={`absolute top-0 left-0 w-full h-full z-20 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 p-6 rounded-xl shadow-2xl transition-all duration-200 flex flex-col justify-center ${showInfo ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}`}>
            <div className="text-sm font-mono text-cyan-400 mb-6 uppercase tracking-widest border-b border-cyan-500/20 pb-3">Current Baseline Values</div>
            <div className="space-y-4 text-xs font-mono uppercase tracking-wider text-slate-300">
              {LEVERS.map(lv => (
                <div key={lv.key} className="flex justify-between items-center">
                  <span className="text-slate-500">{lv.label}:</span>
                  <span className="text-cyan-300 font-bold text-sm">{lv.fmt(baseline()[lv.field])}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-3 border-t border-cyan-500/10 text-[10px] text-slate-400 italic font-space text-center leading-relaxed opacity-80">
              Note: These are the actual live parameters currently driving your real game results.
            </div>
          </div>

          {LEVERS.map((lv) => (
            <div key={lv.key} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest">
                <span className="text-slate-400">{lv.label}</span>
                <span className="text-cyan-300 tabular-nums">{lv.fmt(vals[lv.field])}</span>
              </div>
              <input
                type="range"
                min={lv.min}
                max={lv.max}
                step={lv.step}
                value={vals[lv.field]}
                onChange={(e) => setVals((v) => ({ ...v, [lv.field]: Number(e.target.value) }))}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer relative z-10"
              />
            </div>
          ))}
        </div>

        {/* Live prediction */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {metricTiles.map((t) => (
              <div key={t.label} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">
                  <t.icon className="w-3 h-3" /> {t.label}
                </div>
                <div className={`text-xl font-black tracking-tight ${t.color} ${(loading) ? 'opacity-50' : ''}`}>
                  <AnimatedMetric value={t.value} format={t.format} trendMode={t.trendMode} />
                </div>
              </div>
            ))}
          </div>

          {/* Board verdict from the model */}
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-cyan-500/70 mb-1">
                <BrainCircuit className="w-3 h-3" /> Model Verdict
              </div>
              <div className="text-sm font-bold text-cyan-300">
                {m ? m.board_decision : '—'}
              </div>
            </div>
            {m && <div className="text-[10px] font-mono text-slate-500 border border-slate-700 bg-slate-900 px-2 py-1 rounded">[{m.readiness_level} readiness]</div>}
          </div>

          {/* A/B/C scenario ROI from the model */}
          {result?.scenarios && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">Expected Revenue</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { k: 'A', label: 'Maintain Investment' },
                  { k: 'B', label: 'Increase +20%' },
                  { k: 'C', label: 'Increase +50%' },
                ].map((s) => {
                  const sc = result.scenarios[s.k];
                  const rev = sc.revenue;
                  return (
                    <div key={s.k} className="rounded border border-slate-800 bg-slate-900/50 py-1.5">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">{s.label}</div>
                      <div className={`text-sm font-black text-cyan-400`}>${(rev / 1000000).toFixed(2)}M</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
        </div>

        {/* Explanation row — Gemini AI Advisor (left) + Gemini SHAP (right) */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Gemini AI Advisor (LEFT) */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-4 min-h-[120px] flex flex-col justify-start">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-400/80 mb-3">
              🧠 AI Strategic Advisor
            </div>
            {geminiLoading ? (
              <div className="flex items-center gap-2 text-amber-400/50 text-xs font-mono animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Synthesizing strategy...
              </div>
            ) : (
              (() => {
                const text = geminiAdvice || "";
                const readinessMatch = text.match(/Current AI Readiness : (.*)/);
                const revMatch = text.match(/Revenue Potential : (.*)/);
                const riskMatch = text.match(/Risk Level : (.*)/);
                const roiMatch = text.match(/ROI Outlook : (.*)/);
                const adviceMatch = text.match(/ROI Outlook : .*\n\n([\s\S]*)/);

                if (!readinessMatch || !revMatch || !riskMatch || !roiMatch) {
                   return <p className="text-xs text-slate-300 leading-relaxed font-space whitespace-pre-line">{text || "Adjust the sliders to generate AI insights."}</p>;
                }

                const readiness = readinessMatch[1].trim();
                const rev = revMatch[1].trim();
                const risk = riskMatch[1].trim();
                const roi = roiMatch[1].trim();
                const advice = adviceMatch ? adviceMatch[1].trim() : "";

                return (
                  <div className="flex flex-col gap-3 relative z-10 text-xs text-slate-300 leading-relaxed font-space w-full mt-1">
                    <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
                       <span className="text-slate-400 uppercase tracking-widest text-[10px] font-mono">Current AI Readiness</span>
                       <span className={`font-black tracking-widest ${readiness === 'HIGH' ? 'text-emerald-400' : readiness === 'LOW' ? 'text-rose-400' : 'text-amber-400'}`}>{readiness}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[9px] uppercase tracking-widest font-mono">
                       <div className="bg-slate-950/40 rounded py-1.5 border border-amber-500/10">
                          <div className="text-slate-500 mb-0.5">Revenue</div>
                          <div className={rev.includes('Strong') || rev.includes('Outstanding') ? 'text-emerald-400 font-bold' : rev.includes('Weak') || rev.includes('Critical') ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>{rev}</div>
                       </div>
                       <div className="bg-slate-950/40 rounded py-1.5 border border-amber-500/10">
                          <div className="text-slate-500 mb-0.5">Risk</div>
                          <div className={risk.includes('Low') ? 'text-emerald-400 font-bold' : risk.includes('High') || risk.includes('Severe') ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>{risk}</div>
                       </div>
                       <div className="bg-slate-950/40 rounded py-1.5 border border-amber-500/10">
                          <div className="text-slate-500 mb-0.5">ROI</div>
                          <div className={roi.includes('Positive') || roi.includes('Excellent') ? 'text-emerald-400 font-bold' : roi.includes('Weak') || roi.includes('Negative') ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>{roi}</div>
                       </div>
                    </div>
                    <div className="mt-1 text-slate-300 leading-relaxed border-l-2 border-amber-500/30 pl-3 italic text-[11px]">
                       {advice}
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Gemini SHAP Impact (RIGHT) */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-4 min-h-[120px] flex flex-col justify-start relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <BrainCircuit className="w-32 h-32 text-amber-500" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-400/80 mb-3 relative z-10">
              📈 SHAP Feature Impact & Scenario Simulator
            </div>
            {geminiLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-mono animate-pulse relative z-10">
                <Loader2 className="w-3 h-3 animate-spin" /> Analyzing features...
              </div>
            ) : (
              (() => {
                const text = geminiShap || "";
                const posMatch = text.match(/Top Positive Drivers\n([\s\S]*?)(?=\n\nTop Negative Drivers)/);
                const negMatch = text.match(/Top Negative Drivers\n([\s\S]*?)(?=\n\nMost Influential Factor)/);
                const factorMatch = text.match(/Most Influential Factor\n([\s\S]*?)(?=\n\nModel Confidence)/);
                const confMatch = text.match(/Model Confidence\n([\s\S]*?)$/);

                if (!posMatch || !negMatch) {
                   return <p className="text-xs text-slate-300 leading-relaxed font-space whitespace-pre-line relative z-10">{text || "Waiting for data..."}</p>;
                }

                return (
                  <div className="flex gap-3 relative z-10 text-xs text-slate-300 leading-relaxed font-space w-full mt-1">
                    <div className="flex-1 space-y-3">
                      <div>
                         <span className="text-amber-500/70 font-mono uppercase text-[9px] tracking-widest block mb-0.5">Top Positive Drivers</span>
                         <div className="whitespace-pre-line text-emerald-400/80">{posMatch[1].trim()}</div>
                      </div>
                      <div>
                         <span className="text-amber-500/70 font-mono uppercase text-[9px] tracking-widest block mb-0.5">Top Negative Drivers</span>
                         <div className="whitespace-pre-line text-rose-400/80">{negMatch[1].trim()}</div>
                      </div>
                    </div>
                    <div className="w-[45%] border-l border-amber-500/20 pl-3 space-y-4 flex flex-col justify-center">
                       {factorMatch && (
                         <div>
                           <span className="text-amber-500/70 font-mono uppercase text-[9px] tracking-widest block mb-1">Most Influential</span>
                           <div className="text-amber-300 font-bold text-sm leading-tight">{factorMatch[1].trim()}</div>
                         </div>
                       )}
                       {confMatch && (
                         <div>
                           <span className="text-amber-500/70 font-mono uppercase text-[9px] tracking-widest block mb-1">Model Confidence</span>
                           <div className="text-cyan-400 font-black text-xl tracking-widest">{confMatch[1].trim()}</div>
                         </div>
                       )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
        

      </CardContent>
    </Card>
  );
};

export default WhatIfSimulator;
