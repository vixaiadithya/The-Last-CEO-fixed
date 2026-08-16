import { Trophy, Zap, Users, Coins, Heart, Activity, Skull } from 'lucide-react';
import type { GameState, CompanyProfile } from '@/types';

export interface Ending {
  id: string;
  title: string;
  description: string;
  badge: string;
  unlockedMsg: string;
  glowClass: string;
  hoverGlowClass: string;
  textColor: string;
  borderColor: string;
  icon: any;
}

export const ALL_ENDINGS: Ending[] = [
  {
    id: 'unicorn',
    title: 'THE UNICORN EXIT',
    description: 'Reach 2035 with Budget ≥ $8M and ROI ≥ 15%.',
    badge: '🦄 UNICORN EXIT',
    unlockedMsg: 'You built a legendary high-growth behemoth that dominated the global markets!',
    glowClass: 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)] bg-yellow-500/5',
    hoverGlowClass: 'hover:border-yellow-400 hover:shadow-[0_0_35px_rgba(234,179,8,0.4)]',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/20',
    icon: Trophy
  },
  {
    id: 'ipo',
    title: 'IPO PUBLIC LISTING',
    description: 'Reach 2035 with ≥ 10 employees and Budget ≥ $2M.',
    badge: '🔔 IPO PUBLIC LISTING',
    unlockedMsg: 'You successfully listed your startup on the NASDAQ exchange with massive fanfare.',
    glowClass: 'border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.15)] bg-emerald-500/5',
    hoverGlowClass: 'hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(52,211,153,0.4)]',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    icon: Zap
  },
  {
    id: 'acquisition',
    title: 'MEGACORP ACQUISITION',
    description: 'Reach 2035 with Budget ≥ $5M or ROI ≥ 80%.',
    badge: '💼 ACQUIRED BY MEGACORP',
    unlockedMsg: 'A conglomerate purchased your company for a massive exit, rewarding your team.',
    glowClass: 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-purple-500/5',
    hoverGlowClass: 'hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    icon: Users
  },
  {
    id: 'bootstrap_legend',
    title: 'BOOTSTRAP LEGEND',
    description: 'Reach 2035 starting with Bootstrap capital.',
    badge: '👑 BOOTSTRAP LEGEND',
    unlockedMsg: 'No venture capital, pure grit. You built a self-sustaining empire from just $100K.',
    glowClass: 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-cyan-500/5',
    hoverGlowClass: 'hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.4)]',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
    icon: Coins
  },
  {
    id: 'lifestyle',
    title: 'SUSTAINABLE LIFESTYLE',
    description: 'Reach 2035 with < 10 employees and Budget ≤ $1.5M.',
    badge: '☕ LIFESTYLE BUSINESS',
    unlockedMsg: 'You prioritized longevity and work-life harmony over hyper-scaling.',
    glowClass: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-500/5',
    hoverGlowClass: 'hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    icon: Heart
  },
  {
    id: 'rogue_ai',
    title: 'ROGUE AI SINGULARITY',
    description: 'Survive in Technology sector with an ROI ≥ 150%.',
    badge: '🤖 AI SINGULARITY',
    unlockedMsg: 'Your automation routines achieved self-awareness. Humans are now corporate relics.',
    glowClass: 'border-pink-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-pink-500/5',
    hoverGlowClass: 'hover:border-pink-400 hover:shadow-[0_0_35px_rgba(244,63,94,0.4)]',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
    icon: Activity
  },
  {
    id: 'talent_acquired',
    title: 'TALENT ACQUISITION',
    description: 'Go bankrupt but finish with Morale ≥ 80% or ROI ≥ 50%.',
    badge: '🤝 TALENT ACQUIRED',
    unlockedMsg: 'Though capital ran dry, top-tier engineering firms bought your team for their skill.',
    glowClass: 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] bg-indigo-500/5',
    hoverGlowClass: 'hover:border-indigo-400 hover:shadow-[0_0_35px_rgba(99,102,241,0.4)]',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/20',
    icon: Users
  },
  {
    id: 'crash_burn',
    title: 'CRASH & BURN',
    description: 'Run out of capital before 2035.',
    badge: '💥 CRASH & BURN',
    unlockedMsg: 'Your runway collapsed. Your startup joins the historic graveyard of failed ventures.',
    glowClass: 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-rose-500/5',
    hoverGlowClass: 'hover:border-rose-400 hover:shadow-[0_0_35px_rgba(244,63,94,0.45)]',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/25',
    icon: Skull
  }
];

export const getAchievedEnding = (state: GameState, company: CompanyProfile | null): Ending => {
  if (state.budget < 0 || state.gameResult === 'bankruptcy') {
    if (state.roi >= 50 || state.morale >= 80) {
      return ALL_ENDINGS.find(e => e.id === 'talent_acquired')!;
    }
    return ALL_ENDINGS.find(e => e.id === 'crash_burn')!;
  }

  // Survived to 2035
  const isTech = (company?.industry || '').toLowerCase() === 'technology';
  
  if (isTech && state.roi >= 150) {
    return ALL_ENDINGS.find(e => e.id === 'rogue_ai')!;
  }

  if ((company?.startingBudget || 1000000) === 100000) {
    return ALL_ENDINGS.find(e => e.id === 'bootstrap_legend')!;
  }

  if (state.budget >= 8000000 && state.roi >= 15) {
    return ALL_ENDINGS.find(e => e.id === 'unicorn')!;
  }

  if (state.employees >= 10 && state.budget >= 2000000) {
    return ALL_ENDINGS.find(e => e.id === 'ipo')!;
  }

  if (state.budget >= 5000000 || state.roi >= 80) {
    return ALL_ENDINGS.find(e => e.id === 'acquisition')!;
  }

  return ALL_ENDINGS.find(e => e.id === 'lifestyle')!;
};
