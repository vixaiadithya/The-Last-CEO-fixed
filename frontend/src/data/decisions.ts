export type DecisionCategory =
  | 'talent'
  | 'training'
  | 'infra'
  | 'automation'
  | 'product'
  | 'growth'
  | 'defense'
  | 'morale'
  | 'moonshot';

export interface GameDecision {
  id: string;
  title: string;
  description: string;
  cost: number;
  roiImpact: number;
  moraleImpact: number;
  employeeGain: number;
  aiMaturityGain: number;
  automationGain: number;
  trainingGain: number;
  deploymentGain: number;
  requiredLevel: number;
  category: DecisionCategory;
  riskLevel: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
}

export function getDynamicCost(baseCost: number, revenue: number): number {
  let cost = baseCost;
  if (revenue < 250000) cost = Math.min(baseCost, Math.floor(Math.random() * 30000) + 10000);
  else if (revenue < 1000000) cost = Math.min(baseCost, Math.floor(Math.random() * 100000) + 50000);
  else if (revenue < 5000000) cost = Math.min(baseCost, Math.floor(Math.random() * 350000) + 150000);
  
  return Math.round(cost / 1000) * 1000;
}

export const DECISIONS: GameDecision[] = [
  // ───────────────────────── LEVEL 1: Foundations ─────────────────────────
  {
    id: 'hire-ai-engineers',
    title: 'HIRE_AI_ENGINEERS',
    description: 'Recruit a strike team of top-tier ML engineers. Legacy developers may feel threatened.',
    cost: 150000,
    roiImpact: 5,
    moraleImpact: -5,
    employeeGain: 5,
    aiMaturityGain: 5,
    automationGain: 2,
    trainingGain: 0,
    deploymentGain: 1,
    requiredLevel: 1,
    category: 'talent',
    riskLevel: 'LOW_RISK'
  },
  {
    id: 'employee-training',
    title: 'EMPLOYEE_UPSKILL_PROGRAM',
    description: 'Company-wide AI upskilling. Costs cash and short-term productivity, but builds future muscle.',
    cost: 50000,
    roiImpact: -8,
    moraleImpact: 15,
    employeeGain: 0,
    aiMaturityGain: 2,
    automationGain: 0,
    trainingGain: 40,
    deploymentGain: 0,
    requiredLevel: 1,
    category: 'training',
    riskLevel: 'LOW_RISK'
  },
  {
    id: 'cloud-migration',
    title: 'CLOUD_INFRASTRUCTURE_MIGRATION',
    description: 'Rip out the legacy stack. Extremely painful short-term transition, legacy ops jobs eliminated.',
    cost: 100000,
    roiImpact: -12,
    moraleImpact: -15,
    employeeGain: -3,
    aiMaturityGain: 4,
    automationGain: 5,
    trainingGain: 0,
    deploymentGain: 0,
    requiredLevel: 1,
    category: 'infra',
    riskLevel: 'MEDIUM_RISK'
  },
  {
    id: 'data-lake',
    title: 'BUILD_ENTERPRISE_DATA_LAKE',
    description: 'Unify fragmented company data. Expensive and tedious, but necessary for future AI models.',
    cost: 200000,
    roiImpact: -15,
    moraleImpact: -5,
    employeeGain: 2,
    aiMaturityGain: 8,
    automationGain: 0,
    trainingGain: 0,
    deploymentGain: 1,
    requiredLevel: 1,
    category: 'infra',
    riskLevel: 'MEDIUM_RISK'
  },
  {
    id: 'wellness-program',
    title: 'AI_WELLNESS_INITIATIVE',
    description: 'Roll out personalized wellbeing perks. Bleeds cash, produces zero tech maturity, but teams love it.',
    cost: 80000,
    roiImpact: -10,
    moraleImpact: 30,
    employeeGain: 1,
    aiMaturityGain: 0,
    automationGain: 0,
    trainingGain: 10,
    deploymentGain: 0,
    requiredLevel: 1,
    category: 'morale',
    riskLevel: 'LOW_RISK'
  },
  {
    id: 'data-privacy-vault',
    title: 'ZERO_TRUST_DATA_VAULT',
    description: 'Lock customer data behind a zero-trust vault. Slows down R&D access, but prevents catastrophes.',
    cost: 180000,
    roiImpact: -5,
    moraleImpact: -5,
    employeeGain: 0,
    aiMaturityGain: 6,
    automationGain: 2,
    trainingGain: 0,
    deploymentGain: 1,
    requiredLevel: 1,
    category: 'defense',
    riskLevel: 'LOW_RISK'
  },
  {
    id: 'minor-layoffs',
    title: 'EXECUTE_STAFF_LAYOFFS',
    description: 'Fire a segment of your workforce to immediately recover capital. Saves cash, but remaining staff will be severely demoralized.',
    cost: -150000,
    roiImpact: -5,
    moraleImpact: -30,
    employeeGain: -15,
    aiMaturityGain: 0,
    automationGain: 5,
    trainingGain: -10,
    deploymentGain: 0,
    requiredLevel: 1,
    category: 'talent',
    riskLevel: 'HIGH_RISK'
  },

  // ───────────────────────── LEVEL 2: Expansion ─────────────────────────
  {
    id: 'buy-gpus',
    title: 'ACQUIRE_GPU_CLUSTER',
    description: 'Secure a fleet of H100s. Massive capital drain and deprecation risk, but raw compute is power.',
    cost: 1500000,
    roiImpact: -20,
    moraleImpact: 5,
    employeeGain: 5,
    aiMaturityGain: 12,
    automationGain: 5,
    trainingGain: 0,
    deploymentGain: 2,
    requiredLevel: 2,
    category: 'infra',
    riskLevel: 'HIGH_RISK'
  },
  {
    id: 'automate-hr',
    title: 'AUTOMATE_HR_AND_OPS',
    description: 'Hand payroll and scheduling to LLMs. Efficient and ruthless. Human resources are eliminated.',
    cost: 500000,
    roiImpact: 15,
    moraleImpact: -30,
    employeeGain: -15,
    aiMaturityGain: 6,
    automationGain: 20,
    trainingGain: 0,
    deploymentGain: 3,
    requiredLevel: 2,
    category: 'automation',
    riskLevel: 'MEDIUM_RISK'
  },
  {
    id: 'ai-marketing',
    title: 'AI_DRIVEN_MARKETING',
    description: 'Let predictive AI run the ad budget. High initial spend, and creative teams will protest.',
    cost: 800000,
    roiImpact: 25,
    moraleImpact: -10,
    employeeGain: -2,
    aiMaturityGain: 5,
    automationGain: 10,
    trainingGain: 0,
    deploymentGain: 2,
    requiredLevel: 2,
    category: 'growth',
    riskLevel: 'MEDIUM_RISK'
  },
  {
    id: 'customer-support-bot',
    title: 'LAUNCH_SUPPORT_CHATBOT',
    description: 'Replace Tier-1 support with a fine-tuned agent. The queue vanishes; so do the support jobs.',
    cost: 400000,
    roiImpact: 20,
    moraleImpact: -25,
    employeeGain: -25,
    aiMaturityGain: 10,
    automationGain: 25,
    trainingGain: 0,
    deploymentGain: 4,
    requiredLevel: 2,
    category: 'automation',
    riskLevel: 'HIGH_RISK'
  },
  {
    id: 'poach-rival-team',
    title: 'POACH_RIVAL_RESEARCH_TEAM',
    description: 'A midnight raid on a competitor lab. High cost, massive culture clash, but instant tech gain.',
    cost: 1800000,
    roiImpact: 10,
    moraleImpact: -15,
    employeeGain: 18,
    aiMaturityGain: 18,
    automationGain: 3,
    trainingGain: 20,
    deploymentGain: 2,
    requiredLevel: 2,
    category: 'talent',
    riskLevel: 'HIGH_RISK'
  },
  {
    id: 'predictive-supply-chain',
    title: 'PREDICTIVE_SUPPLY_CHAIN',
    description: 'Wire forecasting AI through logistics. Leaner inventory, but heavily dependent on model accuracy.',
    cost: 700000,
    roiImpact: 15,
    moraleImpact: -5,
    employeeGain: -5,
    aiMaturityGain: 8,
    automationGain: 18,
    trainingGain: 0,
    deploymentGain: 3,
    requiredLevel: 2,
    category: 'growth',
    riskLevel: 'MEDIUM_RISK'
  },
  {
    id: 'four-day-week',
    title: 'AI_AUGMENTED_FOUR_DAY_WEEK',
    description: 'Give everyone Fridays back. Morale skyrockets, but short-term output and ROI take a hit.',
    cost: 250000,
    roiImpact: -15,
    moraleImpact: 45,
    employeeGain: 3,
    aiMaturityGain: 3,
    automationGain: 8,
    trainingGain: 15,
    deploymentGain: 1,
    requiredLevel: 2,
    category: 'morale',
    riskLevel: 'MEDIUM_RISK'
  },
  {
    id: 'ai-brand-campaign',
    title: 'GLOBAL_AI_BRAND_CAMPAIGN',
    description: 'Bet the marketing war chest on a worldwide campaign. Massive cash burn for future leverage.',
    cost: 1200000,
    roiImpact: -10,
    moraleImpact: 12,
    employeeGain: 5,
    aiMaturityGain: 2,
    automationGain: 0,
    trainingGain: 0,
    deploymentGain: 1,
    requiredLevel: 2,
    category: 'growth',
    riskLevel: 'HIGH_RISK'
  },
  {
    id: 'aggressive-downsizing',
    title: 'AGGRESSIVE_DOWNSIZING',
    description: 'Slash the workforce by 40% and force the remaining staff to use AI to cover the gap. Massive capital recovery, massive panic.',
    cost: -500000,
    roiImpact: 15,
    moraleImpact: -60,
    employeeGain: -40,
    aiMaturityGain: 0,
    automationGain: 15,
    trainingGain: -20,
    deploymentGain: 0,
    requiredLevel: 2,
    category: 'talent',
    riskLevel: 'HIGH_RISK'
  },

  // ───────────────────────── LEVEL 3: Dominance ─────────────────────────
  {
    id: 'launch-ai-search',
    title: 'LAUNCH_AI_PRODUCT_FEATURE',
    description: 'Bake generative AI natively into flagship product. Expensive compute, high integration risk.',
    cost: 2500000,
    roiImpact: 25,
    moraleImpact: -10,
    employeeGain: 15,
    aiMaturityGain: 15,
    automationGain: 5,
    trainingGain: 0,
    deploymentGain: 5,
    requiredLevel: 3,
    category: 'product',
    riskLevel: 'HIGH_RISK'
  },
  {
    id: 'autonomous-agents',
    title: 'DEPLOY_AUTONOMOUS_AGENTS',
    description: 'Unleash agents that run workflows with zero humans. High setup cost, massive layoffs, pure fear.',
    cost: 3000000,
    roiImpact: 40,
    moraleImpact: -45,
    employeeGain: -60,
    aiMaturityGain: 25,
    automationGain: 40,
    trainingGain: 0,
    deploymentGain: 10,
    requiredLevel: 3,
    category: 'automation',
    riskLevel: 'HIGH_RISK'
  },
  {
    id: 'acquire-ai-startup',
    title: 'ACQUIRE_AI_STARTUP',
    description: 'Swallow a rising AI lab whole. Severe integration pains and culture shock, huge cash drain.',
    cost: 5000000,
    roiImpact: -15,
    moraleImpact: -20,
    employeeGain: 40,
    aiMaturityGain: 25,
    automationGain: 15,
    trainingGain: 50,
    deploymentGain: 8,
    requiredLevel: 3,
    category: 'talent',
    riskLevel: 'MEDIUM_RISK'
  },
  {
    id: 'open-source-model',
    title: 'OPEN_SOURCE_FLAGSHIP_MODEL',
    description: 'Give your best model to the world for free. Burns millions in compute, zero immediate revenue.',
    cost: 1500000,
    roiImpact: -25,
    moraleImpact: 35,
    employeeGain: 8,
    aiMaturityGain: 20,
    automationGain: 5,
    trainingGain: 10,
    deploymentGain: 6,
    requiredLevel: 3,
    category: 'defense',
    riskLevel: 'MEDIUM_RISK'
  },
  {
    id: 'robotics-division',
    title: 'SPIN_UP_ROBOTICS_DIVISION',
    description: 'Push AI into physical robotics. Hardware requires massive hiring and bleeds immense capital.',
    cost: 4000000,
    roiImpact: -30,
    moraleImpact: -15,
    employeeGain: 50,
    aiMaturityGain: 18,
    automationGain: 45,
    trainingGain: 0,
    deploymentGain: 12,
    requiredLevel: 3,
    category: 'automation',
    riskLevel: 'HIGH_RISK'
  },
  {
    id: 'quantum-lab',
    title: 'FUND_QUANTUM_AI_MOONSHOT',
    description: 'Pour capital into a quantum-AI moonshot. A decade from payoff. Extremely risky capital burn.',
    cost: 4500000,
    roiImpact: -40,
    moraleImpact: 10,
    employeeGain: 15,
    aiMaturityGain: 40,
    automationGain: 5,
    trainingGain: 20,
    deploymentGain: 3,
    requiredLevel: 3,
    category: 'moonshot',
    riskLevel: 'HIGH_RISK'
  },

  // ───────────────────────── LEVEL 4: Endgame ─────────────────────────
  {
    id: 'ai-board-member',
    title: 'APPOINT_AI_BOARD_MEMBER',
    description: 'Hand a voting seat to an AI. Generates global press, but humans feel entirely obsolete.',
    cost: 500000,
    roiImpact: 20,
    moraleImpact: -70,
    employeeGain: -5,
    aiMaturityGain: 30,
    automationGain: 10,
    trainingGain: 0,
    deploymentGain: 1,
    requiredLevel: 4,
    category: 'moonshot',
    riskLevel: 'HIGH_RISK'
  }
];

export const EVENTS = [
  {
    id: 'competitor-launch',
    title: '🔥 COMPETITOR LAUNCHES AI',
    description: 'A major rival just released an AI Copilot. The board is nervous, and market share is slipping.',
    impact: { morale: -20, roi: -15, budget: -500000, revenue: -1500000 }
  },
  {
    id: 'gpu-shortage',
    title: '⚡ GLOBAL GPU SHORTAGE',
    description: 'Hardware prices spiked 300%. Compute resources are limited, halting R&D.',
    impact: { morale: -10, roi: -10, budget: -1000000, revenue: 0 }
  },
  {
    id: 'open-source-release',
    title: '🤖 OPEN SOURCE BREAKTHROUGH',
    description: 'A massive open-source model was released for free, radically reducing R&D compute costs.',
    impact: { morale: 25, roi: 30, budget: 1500000, revenue: 500000 }
  },
  {
    id: 'regulation',
    title: '🏛 NEW EU AI ACT ENFORCED',
    description: 'Strict new data privacy laws demand massive compliance overhauls across all data lakes.',
    impact: { morale: -15, roi: -5, budget: -2000000, revenue: -500000 }
  },
  {
    id: 'data-breach',
    title: '🛡 CYBERATTACK DETECTED',
    description: 'Hackers targeted your autonomous agent API. Emergency protocols engaged. Brand damage is severe.',
    impact: { morale: -35, roi: -25, budget: -3000000, revenue: -4000000 }
  },
  {
    id: 'viral-marketing',
    title: '📈 AI PRODUCT GOES VIRAL',
    description: 'Your recent generative AI product went viral on social media! Massive influx of enterprise contracts.',
    impact: { morale: 40, roi: 50, budget: 2500000, revenue: 8000000 }
  },
  {
    id: 'union-strike',
    title: '✊ WORKFORCE STRIKE',
    description: 'Employees are protesting rapid automation. Operations have ground to a halt.',
    impact: { morale: -50, roi: -20, budget: -500000, revenue: -2000000 }
  },
  {
    id: 'megacorp-partnership',
    title: '🤝 MEGACORP PARTNERSHIP',
    description: 'A trillion-dollar tech giant agreed to co-develop models with your team.',
    impact: { morale: 30, roi: 40, budget: 5000000, revenue: 3000000 }
  }
];
