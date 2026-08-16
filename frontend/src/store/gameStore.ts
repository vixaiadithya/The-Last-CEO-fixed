import { create } from 'zustand';
import type { GameState, CompanyProfile, LLMReport } from '@/types';

export interface DecisionOutcome {
  id: string;
  title: string;
  cost: number;
  roiImpact: number;
  moraleImpact: number;
  employeeGain: number;
  aiMaturityGain?: number;
  automationGain?: number;
  trainingGain?: number;
  deploymentGain?: number;
}

const initialState: GameState & { quarterlyPayloads: any[] } = {
  currentYear: 2024,
  currentQuarter: 1,
  budget: 1000000,
  morale: 75,
  roi: 0,
  revenue: 0,
  expenses: 0,
  valuation: 0,
  growthRate: 0,
  employees: 10,
  bestDecisionStreak: 0,
  ceoHelpTriggered: false,
  xp: 0,
  level: 1,
  unlockedTech: [],
  currentDecisions: [],
  isGameOver: false,
  gameResult: null,
  history: [],
  quarterlyPayloads: [],
  emergencyQuarters: 0,
};

export const useGameStore = create<{
  state: GameState & { quarterlyPayloads: any[] };
  company: CompanyProfile | null;
  currentReport: LLMReport | null;
  lastDecisionOutcome: DecisionOutcome | null;
  currentEvent: any | null;
  actions: {
    initializeGame: (company: CompanyProfile) => void;
    nextQuarter: () => void;
    makeDecision: (decisionId: string) => void;
    updateGameState: (state: Partial<GameState & { quarterlyPayloads: any[] }>) => void;
    updateCompany: (updates: Partial<CompanyProfile>) => void;
    setReport: (report: LLMReport) => void;
    setLastDecisionOutcome: (outcome: DecisionOutcome | null) => void;
    setCurrentEvent: (event: any | null) => void;
    addXp: (amount: number) => void;
    resetGame: () => void;
  };
}>((set) => ({
  state: initialState,
  company: null,
  currentReport: null,
  lastDecisionOutcome: null,
  currentEvent: null,
  actions: {
    initializeGame: (company) => {
      // The chosen skin is purely cosmetic — it grants no stats, bonuses, or abilities.
      const updatedCompany = { ...company };

      const startYear = updatedCompany.foundedYear || 2024;
      const initialBudget = updatedCompany.startingBudget || 1000000;
      const initialEmployees = updatedCompany.employees || 10;
      
      set({
        company: updatedCompany,
        state: {
          ...initialState,
          currentYear: startYear,
          currentQuarter: 1,
          budget: initialBudget,
          employees: initialEmployees,
          roi: 0,
          history: [],
        },
        lastDecisionOutcome: null,
        currentEvent: null,
      });
    },
    nextQuarter: () => {
      set((prev) => {
        const { currentQuarter, currentYear } = prev.state;
        const newQuarter = currentQuarter + 1;
        const newYear = newQuarter > 2 ? currentYear + 1 : currentYear;
        return {
          state: {
            ...prev.state,
            currentQuarter: newQuarter > 2 ? 1 : newQuarter,
            currentYear: newYear,
          },
        };
      });
    },
    makeDecision: (decisionId) => {
      set((prev) => ({ state: prev.state }));
    },
    updateGameState: (newState) => {
      set((prev) => {
        // Base Company Level completely on raw Valuation (Budget + Revenue*5) to reflect true company size
        const currentBudget = newState.budget ?? prev.state.budget;
        const currentRevenue = newState.revenue ?? prev.state.revenue;
        const currentGrowthRate = newState.growthRate ?? prev.state.growthRate ?? 0;
        
        let growthMultiple = 4;
        if (currentGrowthRate > 30) growthMultiple = 10;
        else if (currentGrowthRate > 15) growthMultiple = 7;
        
        const aiMultiple = 1 + ((prev.company?.aiMaturityScore || 0) / 50); 
        // For gameStore we assume risk is roughly 50 if we don't have it explicitly since we don't calculate it here.
        const riskMultiplier = 1 - (50 / 200); 
        
        const valuation = newState.valuation ?? (currentBudget + (currentRevenue * growthMultiple * aiMultiple * riskMultiplier));
        
        let calculatedLevel = 1;
        if (valuation > 1_000_000_000) calculatedLevel = 10; // $1B Unicorn
        else if (valuation > 500_000_000) calculatedLevel = 9;
        else if (valuation > 250_000_000) calculatedLevel = 8;
        else if (valuation > 100_000_000) calculatedLevel = 7;
        else if (valuation > 50_000_000) calculatedLevel = 6;
        else if (valuation > 20_000_000) calculatedLevel = 5;
        else if (valuation > 10_000_000) calculatedLevel = 4;
        else if (valuation > 5_000_000) calculatedLevel = 3;
        else if (valuation > 2_000_000) calculatedLevel = 2;

        return {
          state: { ...prev.state, ...newState, level: calculatedLevel, valuation },
        };
      });
    },
    updateCompany: (updates) => {
      set((prev) => ({
        company: prev.company ? { ...prev.company, ...updates } : null,
      }));
    },
    setReport: (report) => {
      set({ currentReport: report });
    },
    setLastDecisionOutcome: (outcome) => {
      set({ lastDecisionOutcome: outcome });
    },
    setCurrentEvent: (event) => {
      set({ currentEvent: event });
    },
    addXp: (amount) => {
      // Legacy XP system disabled to enforce Valuation-based leveling. Keeps signature to avoid breaking changes.
    },
    resetGame: () => {
      set({
        state: initialState,
        company: null,
        currentReport: null,
        lastDecisionOutcome: null,
        currentEvent: null,
      });
    },
  },
}));
