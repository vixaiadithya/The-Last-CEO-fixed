import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameLoop } from '@/hooks/useGameLoop';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { AIReportModal } from '@/components/shared/AIReportModal';
import { GameOverModal } from '@/components/shared/GameOverModal';
import { QuarterlyDecision } from '@/components/game/QuarterlyDecision';
import { GameTimeline } from '@/components/game/GameTimeline';
import { ROIChart } from '@/components/dashboard/ROIChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { WhatIfSimulator } from '@/components/dashboard/WhatIfSimulator';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Heart,
  Terminal,
  Cpu
} from 'lucide-react';

export const Engine = () => {
  const state = useGameStore((s) => s.state);
  const company = useGameStore((s) => s.company);
  const currentReport = useGameStore((s) => s.currentReport);
  const { isLoading, rollDecisions } = useGameLoop();

  useEffect(() => {
    if (company) {
      if (state.currentDecisions.length === 0) {
        rollDecisions();
      }
    }
  }, [company]);

  if (!company) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#060814] text-white">
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060814] text-white scanlines">
      <LoadingOverlay isLoading={isLoading} />
      
      <div className="container py-5 sm:py-8 px-3 sm:px-6 mx-auto max-w-7xl space-y-5 sm:space-y-8">
        

        {/* Visual Progress Timeline */}
        <div className="animate-in fade-in slide-in-from-left-8 duration-700 delay-200 fill-mode-both">
          <GameTimeline currentYear={state.currentYear} />
        </div>

        {/* Simulation operations board - MOVED UP */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <QuarterlyDecision />
        </div>

        {/* HUD Vitals stats & charts split view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500 fill-mode-both">
          <div className="flex flex-col h-full">
            <BudgetChart />
          </div>
          <div className="flex flex-col h-full">
            <ROIChart />
          </div>
        </div>

        {/* ML What-If Simulator */}
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-700 fill-mode-both">
          <WhatIfSimulator />
        </div>
      </div>

      {currentReport && <AIReportModal />}
      <GameOverModal />
    </div>
  );
};

export default Engine;
