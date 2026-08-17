import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/apiClient';
import { useGameStore } from '@/store/gameStore';
import type { LLMReport } from '@/types';
import { DECISIONS, EVENTS, getDynamicCost } from '@/data/decisions';

const GAME_QUARTERS_PER_YEAR = 2;

export const useGameLoop = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { actions, state, company } = useGameStore();

  const rollDecisions = () => {
    const snapshot = useGameStore.getState();
    const freshState = snapshot.state;
    const c = snapshot.company;
    const prev = freshState.currentDecisions;

    const available = DECISIONS.filter(d => {
      if (freshState.level < d.requiredLevel) return false;
      // Do not offer firing options if the company has less than 5 employees
      if ((d.id === 'minor-layoffs' || d.id === 'aggressive-downsizing') && freshState.employees < 5) return false;
      return true;
    });

    // Current vitals — these were shaped by the player's PREVIOUS decisions,
    // so scoring against them makes the hand respond to how the game is going.
    const morale = freshState.morale;
    const budget = freshState.budget;
    const employees = freshState.employees;
    const maturity = c?.aiMaturityScore ?? 50;
    const automation = c?.automationRate ?? 40;
    const training = c?.trainingHours ?? 120;

    const score = (d: typeof DECISIONS[number]) => {
      let sc = Math.random() * 5; // keep some surprise
      const dynamicCost = getDynamicCost(d.cost, freshState.revenue);

      // Crisis Mode: Losing money & low budget
      const profit = (freshState.revenue / 4) - freshState.expenses;
      if (profit < 0 && freshState.budget < 500_000) {
        if (dynamicCost > 150_000) sc -= 20; // ban expensive expansions
        if (d.category === 'defense' || d.category === 'automation') sc += 15; // favor recovery
      }

      // Struggling morale → surface options that lift the team
      if (morale < 45 && d.moraleImpact > 0) sc += 7;
      // Tight on cash → favor cheap plays, punish big spends
      if (budget < 1_000_000) sc += dynamicCost < 500_000 ? 5 : -4;
      // Thin headcount → favor hiring/acquisition
      if (employees < 6 && d.employeeGain > 0) sc += 5;
      // Weak AI maturity → favor capability builders
      if (maturity < 55) sc += d.aiMaturityGain * 0.35;
      // Low automation → favor automation plays
      if (automation < 45) sc += d.automationGain * 0.25;
      // Under-trained workforce → favor upskilling
      if (training < 150) sc += d.trainingGain * 0.06;
      // Healthy company → chase growth/ROI
      if (morale >= 45 && budget >= 1_000_000) sc += d.roiImpact * 0.12;
      // Avoid repeating last quarter's exact hand
      if (prev.includes(d.id)) sc -= 6;

      return sc;
    };

    const ranked = [...available].sort((a, b) => score(b) - score(a));

    // Pick the 3 strongest, but keep category variety so the hand feels distinct
    let picked: string[] = [];
    const usedCats = new Set<string>();
    for (const d of ranked) {
      if (picked.length >= 3) break;
      if (usedCats.has(d.category)) continue;
      picked.push(d.id);
      usedCats.add(d.category);
    }
    // Fallback: if category-diversity left us short, fill from the ranked list
    if (picked.length < 3) {
      for (const d of ranked) {
        if (picked.length >= 3) break;
        if (!picked.includes(d.id)) picked.push(d.id);
      }
    }

    // RIG FIRST YEAR: Ensure highest ROI is placed at specific indices
    const startYear = c?.foundedYear || 2024;
    if (freshState.currentYear === startYear) {
      const pickedDecisions = DECISIONS.filter(d => picked.includes(d.id));
      const maxRoi = Math.max(...pickedDecisions.map(d => d.roiImpact));
      const bestId = pickedDecisions.find(d => d.roiImpact === maxRoi)?.id;
      
      if (bestId) {
        const others = picked.filter(id => id !== bestId);
        if (freshState.currentQuarter === 1) {
          // Q1: Place best at the right (index 2)
          picked = [others[0] || picked[0], others[1] || picked[1], bestId];
        } else if (freshState.currentQuarter === 2) {
          // Q2: Place best at the left (index 0)
          picked = [bestId, others[0] || picked[0], others[1] || picked[1]];
        }
      }
    }

    actions.updateGameState({ currentDecisions: picked });
  };

  const triggerRandomEvent = () => {
    // 25% chance of event each quarter
    if (Math.random() < 0.25) {
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      actions.setCurrentEvent(event);
      
      const freshState = useGameStore.getState().state;
      // Scale event impact based on company revenue so startups don't get instantly bankrupted
      // Assuming 2M is a "standard" scaling point for the raw event values
      const revenueScale = Math.max(0.05, Math.min(2.0, freshState.revenue / 2000000));
      const scaledBudget = event.impact.budget * revenueScale;
      const scaledRevenue = (event.impact.revenue || 0) * revenueScale;

      actions.updateGameState({
        budget: freshState.budget + scaledBudget,
        roi: freshState.roi + event.impact.roi,
        morale: Math.max(Math.min(freshState.morale + event.impact.morale, 100), 0),
        revenue: freshState.revenue + scaledRevenue
      });
      return event;
    }
    actions.setCurrentEvent(null);
    return null;
  };

  const fetchQuarterReport = async (chosenDecision?: any, unpickedDecisions: any[] = [], preCompanyState?: any, preQuarter?: number, preYear?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const freshState = useGameStore.getState().state;
      const freshCompany = useGameStore.getState().company;

      const payload = {
        industry: freshCompany?.industry || "Technology",
        country: freshCompany?.country || "United States",
        year: preYear || freshState.currentYear,
        quarter: preQuarter || freshState.currentQuarter,
        ai_adoption_level: freshCompany?.aiAdoptionLevel || 3.5,
        ai_investment_usd: freshCompany?.aiInvestment || 500000,
        automation_rate: freshCompany?.automationRate || 45.0,
        employee_ai_training_hours: freshCompany?.trainingHours || 120.0,
        ai_maturity_score: freshCompany?.aiMaturityScore || 75.0,
        deployment_count: freshCompany?.deploymentCount || 10,
        save_to_db: true,
        player_decision: chosenDecision ? chosenDecision.title : "None",
        player_result: chosenDecision ? `Cost: $${chosenDecision.cost.toLocaleString()}, ROI Impact: ${chosenDecision.roiImpact}%` : "None"
      };

      const response = await api.getQuarterReport(payload);
      
      const newPayloads = [...freshState.quarterlyPayloads, payload];
      actions.updateGameState({ quarterlyPayloads: newPayloads });

      const metrics = response.data.metrics;
      const scenarios = response.data.scenarios;
      
      let recommendations = [];
      if (chosenDecision && unpickedDecisions.length > 0 && preCompanyState) {
          const altOptions = await Promise.all(unpickedDecisions.map(async (dec) => {
             const altPayload = {
                industry: preCompanyState.industry || "Technology",
                country: preCompanyState.country || "United States",
                year: preYear || freshState.currentYear,
                ai_adoption_level: preCompanyState.aiAdoptionLevel || 3.5,
                ai_investment_usd: (preCompanyState.aiInvestment || 500000) + dec.cost,
                automation_rate: Math.min((preCompanyState.automationRate || 45.0) + dec.automationGain, 100),
                employee_ai_training_hours: (preCompanyState.trainingHours || 120.0) + dec.trainingGain,
                ai_maturity_score: Math.min((preCompanyState.aiMaturityScore || 75.0) + dec.aiMaturityGain, 100),
                deployment_count: (preCompanyState.deploymentCount || 10) + dec.deploymentGain,
                save_to_db: false
             };
              try {
                 const altRes = await api.getQuarterReport(altPayload);
                 return { title: dec.title, roi: Math.round(altRes.data.metrics.roi), rev: altRes.data.metrics.revenue_impact };
              } catch (e) {
                 return { title: dec.title, roi: -999, rev: 0, failed: true };
              }
           }));

           const allOptions = [
              { isChosen: true, title: chosenDecision.title, roi: Math.round(metrics.roi), rev: metrics.revenue_impact, failed: false },
              ...altOptions.map(o => ({ isChosen: false, ...o }))
           ];

          recommendations.push(`Chosen: ${chosenDecision.title}: Projected AI ROI ${allOptions[0].roi}%, AI Rev Impact $${(allOptions[0].rev/1000000).toFixed(2)}M/yr`);
          recommendations.push(...allOptions.slice(1).map(opt => 
             opt.failed ? `If Chose: ${opt.title}: (Prediction Failed)` : `If Chose: ${opt.title}: Projected AI ROI ${opt.roi}%, AI Rev Impact $${(opt.rev/1000000).toFixed(2)}M/yr`
          ));
      } else {
         recommendations = [
            `Scenario A (Maintain): Projected AI ROI ${Math.round(scenarios.A.roi)}%, AI Rev Impact $${(scenarios.A.revenue/1000000).toFixed(2)}M/yr`,
            `Scenario B (+20%): Projected AI ROI ${Math.round(scenarios.B.roi)}%, AI Rev Impact $${(scenarios.B.revenue/1000000).toFixed(2)}M/yr`,
            `Scenario C (+50%): Projected AI ROI ${Math.round(scenarios.C.roi)}%, AI Rev Impact $${(scenarios.C.revenue/1000000).toFixed(2)}M/yr`
         ];
      }
      
      // INDUSTRY SPECIFIC ECONOMICS
      const industry = (freshCompany?.industry || 'technology').toLowerCase();
      let expectedRevenuePerEmployee = 1000000;
      let organicBase = 12500; // Realistic seed quarter revenue ($50k annual)
      if (industry === 'healthcare') { expectedRevenuePerEmployee = 400000; organicBase = 10000; }
      else if (industry === 'manufacturing') { expectedRevenuePerEmployee = 250000; organicBase = 7500; }
      else if (industry === 'retail') { expectedRevenuePerEmployee = 150000; organicBase = 5000; }
      else if (industry === 'logistics') { expectedRevenuePerEmployee = 300000; organicBase = 6000; }
      
      // Base revenue grows organically. Startups don't get full expected revenue instantly.
      const previousQuarterRevenue = freshState.revenue / GAME_QUARTERS_PER_YEAR; 
      const pmfMultiplier = previousQuarterRevenue > 1000000 ? 1 : (previousQuarterRevenue > 0 ? 0.25 : 0.05);
      
      const employeeRevenueContribution = freshState.employees * (expectedRevenuePerEmployee / 8) * pmfMultiplier;
      const organicRevenue = (previousQuarterRevenue > 0 ? previousQuarterRevenue : organicBase) + employeeRevenueContribution;
      
      // 1. RAW ML PREDICTION: Annual incremental revenue impact predicted by the XGBoost model.
      const rawAnnualMlRevenueImpact = metrics.revenue_impact || 0;
      const rawQuarterlyMlRevenueImpact = rawAnnualMlRevenueImpact / GAME_QUARTERS_PER_YEAR;
      
      // 2. GAME BUSINESS RULE (Startup Pacing Governor):
      // The XGBoost model was trained on mature enterprise dataset records ($4.8M average AI investment).
      // For Day-1 / pre-revenue startups ($0 revenue base), applying raw enterprise millions overnight
      // would be unrealistic. We enforce an initial pacing cap ($50k max quarterly AI impact for pre-revenue quarters,
      // or up to 50% of existing quarterly revenue once operating) to simulate real-world rollout ramp-up.
      const maxQuarterlyAiGain = previousQuarterRevenue > 0 ? Math.max(previousQuarterRevenue * 0.5, 50000) : 50000;
      const appliedQuarterlyAiRevenue = Math.min(Math.max(-50000, rawQuarterlyMlRevenueImpact), maxQuarterlyAiGain);
      
      // 3. TOTAL QUARTERLY TOP-LINE: Organic Revenue + Applied Quarterly AI Revenue Impact
      let quarterlyRevenue = Math.max(10000, organicRevenue + appliedQuarterlyAiRevenue);

      // REVENUE GROWTH RATE & SATURATION CAPS
      let growthRate = previousQuarterRevenue > 0 ? ((quarterlyRevenue - previousQuarterRevenue) / previousQuarterRevenue) * 100 : 0;
      
      let maxGrowth = 25; // 0-20M
      if (previousQuarterRevenue > 25000000) maxGrowth = 8; // 100M+
      else if (previousQuarterRevenue > 12500000) maxGrowth = 12; // 50-100M
      else if (previousQuarterRevenue > 5000000) maxGrowth = 18; // 20-50M
      
      // Allow a flat safety net for tiny startups so they can grow from 0
      const maxAllowedRevenue = Math.max(previousQuarterRevenue * (1 + (maxGrowth / 100)), previousQuarterRevenue + 100000, 50000);
      if (quarterlyRevenue > maxAllowedRevenue) {
          quarterlyRevenue = maxAllowedRevenue;
          growthRate = previousQuarterRevenue > 0 ? ((quarterlyRevenue - previousQuarterRevenue) / previousQuarterRevenue) * 100 : 0;
      }

      const annualizedRevenue = quarterlyRevenue * GAME_QUARTERS_PER_YEAR;
      const revenuePerEmployee = annualizedRevenue / Math.max(1, freshState.employees);

      // Enterprise Tax
      let enterpriseCostMultiplier = 1;
      if (freshState.employees > 200) {
          if (revenuePerEmployee < expectedRevenuePerEmployee * 0.8) enterpriseCostMultiplier = 3.0;
          else enterpriseCostMultiplier = 1.5; 
      } else if (freshState.employees > 50) {
          if (revenuePerEmployee < expectedRevenuePerEmployee * 0.8) enterpriseCostMultiplier = 2.0;
          else enterpriseCostMultiplier = 1.2;
      }

      const scalingCosts = quarterlyRevenue * 0.40; // 40% COGS
      const baseFixedCosts = 50000 + (freshState.employees * 5000); // Startup-friendly base costs
      const costs = (baseFixedCosts * enterpriseCostMultiplier) + scalingCosts; 
      // Fixed salary bug: $45,000 annual per employee -> quarterly equivalent
      const salaries = (freshState.employees * 45000) / GAME_QUARTERS_PER_YEAR;

      const totalAiInvestment = freshCompany?.aiInvestment || 1;
      const amortizedInvestment = totalAiInvestment * 0.20;
      const quarterAiInvestment = 0; // Removed double-counting of AI Investment since it's paid upfront in cash
      
      const quarterExpenses = costs + salaries;
      const quarterProfit = quarterlyRevenue - quarterExpenses;
      
      // STRICT BUDGET EQUATION
      const nextBudget = freshState.budget + quarterProfit;

      const totalAnnualExpenses = quarterExpenses * GAME_QUARTERS_PER_YEAR;
      
      // ROI CALCULATIONS
      const quarterRoi = Math.round((quarterProfit / quarterExpenses) * 100);
      const startingBudget = freshCompany?.startingBudget || 1000000;
      const totalCapitalInvested = startingBudget + totalAiInvestment;
      const cumulativeProfit = nextBudget - startingBudget;
      const cumulativeRoi = Math.round((cumulativeProfit / totalCapitalInvested) * 100);

      let nextEmployees = freshState.employees;
      let nextMorale = freshState.morale;
      let employeesLost = 0;
      let employeesHired = 0;

      // WORKFORCE & MORALE (Dynamic Penalties)
      if ((freshCompany?.automationRate || 0) > 60) {
         if (nextEmployees > 0) {
             const automationFactor = (freshCompany.automationRate - 60) / 2000; 
             const laidOff = Math.ceil(nextEmployees * automationFactor);
             const layoffPercentage = (laidOff / Math.max(1, nextEmployees)) * 100;
             nextEmployees -= laidOff;
             employeesLost = laidOff;
             
             if (layoffPercentage >= 30) nextMorale -= 35;
             else if (layoffPercentage >= 15) nextMorale -= 20;
             else if (layoffPercentage >= 5) nextMorale -= 10;
             else if (layoffPercentage > 0) nextMorale -= 5;
         }
      }

      // STRICT AUTO-HIRING: Max Auto Hire = Available Cash / Annual Cost Per Employee
      if (annualizedRevenue > nextEmployees * expectedRevenuePerEmployee && (freshCompany?.automationRate || 0) < 95) {
          const neededStaff = Math.floor((annualizedRevenue / expectedRevenuePerEmployee) - nextEmployees);
          
          const annualCostPerEmployee = 45000 + (5000 * GAME_QUARTERS_PER_YEAR); // Salary + fixed cost scaling
          const maxAffordableHires = Math.max(0, Math.floor(nextBudget / annualCostPerEmployee));
          
          const actualHires = Math.min(Math.ceil(neededStaff * 0.10), maxAffordableHires);
          nextEmployees += actualHires;
          employeesHired = actualHires;
      }

      if (nextEmployees <= 0) nextEmployees = 0;

      let rawMoraleImpact = ((metrics.productivity_gain || 50) - 50) / 5; 
      let finalMoraleChange = Math.round(rawMoraleImpact * 0.5);
      if (finalMoraleChange > 5) finalMoraleChange = 5;
      if (finalMoraleChange < -5) finalMoraleChange = -5;
      
      nextMorale = Math.round(nextMorale + finalMoraleChange);
      nextMorale = Math.max(0, Math.min(100, nextMorale));

      // DYNAMIC RISK SCORE
      let calculatedRisk = 50;
      calculatedRisk -= (nextBudget / 1000000) * 1.5; 
      calculatedRisk -= (quarterProfit / 1000000) * 3;
      calculatedRisk -= (freshCompany?.aiMaturityScore || 0) / 4;
      calculatedRisk -= (freshCompany?.automationRate || 0) / 4;
      calculatedRisk += (100 - nextMorale) / 2;
      if (growthRate > 20) calculatedRisk += 10; 
      calculatedRisk = Math.max(5, Math.min(95, calculatedRisk));

      // VALUATION DEPENDENT ON GROWTH
      let growthMultiple = 4;
      if (growthRate > 30) growthMultiple = 10;
      else if (growthRate > 15) growthMultiple = 7;
      
      const aiMultiple = 1 + ((freshCompany?.aiMaturityScore || 0) / 50); // 1x to 3x
      const riskMultiplier = 1 - (calculatedRisk / 200); // 0.525 to 0.975
      
      let valuation = nextBudget + (annualizedRevenue * growthMultiple * aiMultiple * riskMultiplier);
      
      // If the company is actively bankrupt (negative cash, high risk), crush the valuation to a fraction of revenue
      if (nextBudget < 0 && calculatedRisk > 80) {
          valuation = Math.max(10000, annualizedRevenue * 0.2); 
      }

      // EVOLVING BOARD RECOMMENDATIONS
      let finalRecommendation = "Maintain steady operational growth.";
      let boardDecision = "CONTINUE OPERATIONS";

      if (quarterProfit < 0 && nextBudget < 2000000) {
         finalRecommendation = "CRITICAL WARNING: Severe negative cash flow. Immediate cost reduction, automation, and operational efficiency are required. Halt aggressive expansion.";
         boardDecision = "MANDATE COST REDUCTION";
      } else if (nextMorale < 40) {
         finalRecommendation = "Employee morale is critically low. High turnover threatens operations. Address company culture immediately before scaling further.";
         boardDecision = "IMPROVE CULTURE & RETENTION";
      } else if (calculatedRisk > 80) {
         finalRecommendation = "The company is over-leveraged with excessive operational risk. Focus on stabilizing infrastructure and paying down technical debt.";
         boardDecision = "MITIGATE OPERATIONAL RISKS";
      } else if (valuation > 5_000_000_000) {
         finalRecommendation = "Valuation exceeds $5B. Board officially recommends initiating IPO proceedings or exploring mega-merger opportunities.";
         boardDecision = "PREPARE FOR IPO";
      } else if (valuation > 1_000_000_000) {
         finalRecommendation = "Unicorn status achieved. Board advises focusing on market defense and global enterprise scaling.";
         boardDecision = "DEFEND MARKET SHARE";
      } else if (valuation > 100_000_000) {
         finalRecommendation = "Mid-market dominance reached. Shift strategy toward capturing enterprise contracts and scaling strategic acquisitions.";
         boardDecision = "SCALE ENTERPRISE SALES";
      } else if (quarterProfit > 2000000) {
         finalRecommendation = "Cash flow is strongly positive. Reinvest profits into aggressive talent acquisition and cutting-edge R&D.";
         boardDecision = "AUTHORIZE AGGRESSIVE EXPANSION";
      } else {
         finalRecommendation = "Focus on achieving product-market fit and establishing sustainable initial revenue streams.";
         boardDecision = "FIND PRODUCT-MARKET FIT";
      }

      const reportPayload: LLMReport = {
        quarter: preQuarter || freshState.currentQuarter,
        year: preYear || freshState.currentYear,
        summary: `Board Decision: ${boardDecision} - ${finalRecommendation}`,
        revenue: Math.round(quarterlyRevenue),
        expenses: Math.round(quarterExpenses),
        expenseBreakdown: {
           salaries: Math.round(salaries),
           operations: Math.round(costs),
           aiInvestment: Math.round(quarterAiInvestment)
        },
        roi: quarterRoi,
        cumulativeRoi: cumulativeRoi,
        moraleChange: finalMoraleChange,
        recommendations,
        risks: [
          `Company Valuation: $${Math.round(valuation).toLocaleString()}`,
          `Quarter Revenue Growth: ${growthRate.toFixed(1)}%`,
          `Cumulative ROI: ${cumulativeRoi}%`
        ],
        riskScore: metrics.risk_score || 0,
        readinessScore: metrics.ai_transformation_score || 0
      };

      actions.setReport(reportPayload);
      actions.addXp(Math.round(metrics.ai_transformation_score * 10));

      actions.updateGameState({
        revenue: annualizedRevenue,
        budget: nextBudget, 
        roi: cumulativeRoi,
        growthRate: growthRate,
        morale: nextMorale,
        employees: nextEmployees,
        valuation: valuation
      });
      
      return { nextBudget, calculatedRoi: cumulativeRoi, annualizedRevenue, nextEmployees, nextMorale, employeesLost, employeesHired, decisionRoi: quarterRoi, appliedRevenue: appliedQuarterlyAiRevenue, riskScore: metrics.risk_score || 0, opCosts: costs, payroll: salaries };
    } catch (err) {
      console.warn('Backend API offline. Could not fetch XGBoost prediction.', err);
      setError('Failed to connect to ML Backend.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const makeQuarterDecision = async (decisionId: string) => {
    setIsLoading(true);
    setError(null);

    const freshState = useGameStore.getState().state;
    const freshCompany = useGameStore.getState().company;

    const baseDecision = DECISIONS.find(d => d.id === decisionId);
    if (!baseDecision) return;
    const dynamicCost = getDynamicCost(baseDecision.cost, freshState.revenue);
    const decision = { ...baseDecision, cost: dynamicCost };

    actions.setLastDecisionOutcome({
      id: decision.id,
      title: decision.title,
      cost: decision.cost,
      roiImpact: decision.roiImpact,
      moraleImpact: decision.moraleImpact,
      employeeGain: decision.employeeGain,
      aiMaturityGain: decision.aiMaturityGain,
      automationGain: decision.automationGain,
      trainingGain: decision.trainingGain,
      deploymentGain: decision.deploymentGain
    });

    try {
      const preBudget = freshState.budget - decision.cost;
      const nextEmployees = Math.max(0, freshState.employees + decision.employeeGain);

      let decisionMoraleImpact = decision.moraleImpact;
      if (decisionMoraleImpact > 10) decisionMoraleImpact = 10;
      if (decisionMoraleImpact < -10) decisionMoraleImpact = -10;
      const preMorale = Math.max(0, Math.min(freshState.morale + decisionMoraleImpact, 100));

      const preCompanyState = { ...freshCompany };

      let currentMaturity = freshCompany?.aiMaturityScore || 0;
      let maturityMultiplier = 1;
      if (currentMaturity > 95) maturityMultiplier = 0.1;
      else if (currentMaturity > 85) maturityMultiplier = 0.25;
      else if (currentMaturity > 70) maturityMultiplier = 0.5;
      else if (currentMaturity > 50) maturityMultiplier = 0.8;

      let currentAutomation = company?.automationRate || 0;
      let automationMultiplier = 1;
      if (currentAutomation > 95) automationMultiplier = 0.1;
      else if (currentAutomation > 85) automationMultiplier = 0.25;
      else if (currentAutomation > 70) automationMultiplier = 0.5;
      else if (currentAutomation > 50) automationMultiplier = 0.8;

      actions.updateCompany({
        aiInvestment: (freshCompany?.aiInvestment || 0) + decision.cost,
        aiMaturityScore: Math.min(currentMaturity + (decision.aiMaturityGain * maturityMultiplier), 100),
        automationRate: Math.min(currentAutomation + (decision.automationGain * automationMultiplier), 100),
        trainingHours: (freshCompany?.trainingHours || 0) + decision.trainingGain,
        deploymentCount: (freshCompany?.deploymentCount || 0) + decision.deploymentGain
      });

      const nextQuarter = freshState.currentQuarter + 1;
      const willYearChange = nextQuarter > 2; // FIXED to exactly 2 quarters
      const nextYear = willYearChange ? freshState.currentYear + 1 : freshState.currentYear;

      const allCurrentOptions = DECISIONS.filter(d => freshState.currentDecisions.includes(d.id));
      const maxRoi = Math.max(...allCurrentOptions.map(d => d.roiImpact));
      const isBest = decision.roiImpact === maxRoi;
      
      let nextStreak = isBest ? freshState.bestDecisionStreak + 1 : 0;
      let nextCeoHelpTriggered = false;
      if (nextStreak === 2) {
        nextCeoHelpTriggered = true;
        nextStreak = 0;
      }

      actions.updateGameState({
        budget: preBudget,
        morale: preMorale,
        employees: nextEmployees,
        currentQuarter: willYearChange ? 1 : nextQuarter,
        currentYear: nextYear,
        bestDecisionStreak: nextStreak,
      });

      const unpickedDecisions = DECISIONS.filter(d => freshState.currentDecisions.includes(d.id) && d.id !== decisionId);

      // 3. Fetch simulated report representing quarter metrics first
      const reportResults = await fetchQuarterReport(decision, unpickedDecisions, preCompanyState, freshState.currentQuarter, freshState.currentYear);
      
      const postReportState = useGameStore.getState().state;
      const finalBudget = reportResults?.nextBudget ?? preBudget;
      const finalRoi = reportResults?.calculatedRoi ?? freshState.roi;
      const finalRevenue = reportResults?.annualizedRevenue ?? freshState.revenue;

      let isGameOver = false;
      let gameResult: 'victory' | 'bankruptcy' | null = null;
      let newEmergencyQuarters = freshState.emergencyQuarters || 0;

      // Bankruptcy logic: 
      // 1. Immediate game over if cash drops below -$500k
      // 2. Emergency quarter triggered if cash is <= 0
      // 3. Two consecutive emergency quarters = bankruptcy
      if (finalBudget <= -500000) {
        isGameOver = true;
        gameResult = 'bankruptcy';
      } else if (finalBudget <= 0) {
        newEmergencyQuarters += 1;
        if (newEmergencyQuarters >= 2) {
          isGameOver = true;
          gameResult = 'bankruptcy';
        }
      } else {
        newEmergencyQuarters = 0;
      }

      if (!isGameOver && nextYear >= 2035) {
        isGameOver = true;
        gameResult = 'victory';
      }

      // History tracking: log a data point for EVERY quarter that just completed
      // (freshState.* here is the pre-advance closure, i.e. the quarter we just played)
      // Check to prevent duplicate quarter entries
      const updatedHistory = [...freshState.history];
      const isDuplicate = updatedHistory.some(h => h.year === freshState.currentYear && h.quarter === freshState.currentQuarter);
      
      if (!isDuplicate) {
        updatedHistory.push({
          year: freshState.currentYear,
          quarter: freshState.currentQuarter,
          openingBudget: preBudget + decision.cost, // before anything is subtracted
          openingRevenue: freshState.revenue,
          openingEmployees: freshState.employees,
          aiInvestment: decision.cost,
          opCosts: reportResults?.opCosts || 0,
          payroll: reportResults?.payroll || 0,
          revenue: finalRevenue, // This is closing revenue
          budget: finalBudget,   // This is closing budget
          roi: finalRoi,
          decisionRoi: reportResults?.decisionRoi,
          appliedRevenue: reportResults?.appliedRevenue,
          riskScore: reportResults?.riskScore ?? 50,
          morale: postReportState.morale,
          employees: reportResults?.nextEmployees ?? nextEmployees,
          employeesHired: (decision.employeeGain > 0 ? decision.employeeGain : 0) + (reportResults?.employeesHired ?? 0),
          employeesLost: (decision.employeeGain < 0 ? Math.abs(decision.employeeGain) : 0) + (reportResults?.employeesLost ?? 0),
          decision: decision.title
        });
      }

      actions.updateGameState({
        history: updatedHistory,
        emergencyQuarters: newEmergencyQuarters,
        isGameOver,
        gameResult,
        ceoHelpTriggered: nextCeoHelpTriggered ? true : freshState.ceoHelpTriggered
      });

      if (isGameOver) {
        try {
          await api.saveGameHistory(useGameStore.getState().state.quarterlyPayloads);
        } catch (e) {
          console.error("Failed to save game history", e);
        }
      }

      // 4. Roll a fresh, state-aware hand for the next quarter
      rollDecisions();
      
      // 5. Trigger Random Event for next quarter
      triggerRandomEvent();

    } finally {
      setIsLoading(false);
    }
  };

  const advanceQuarter = async () => {
    setIsLoading(true);
    try {
      actions.nextQuarter();
      triggerRandomEvent();
      await fetchQuarterReport();
    } catch (err) {
      actions.nextQuarter();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchQuarterReport,
    makeQuarterDecision,
    advanceQuarter,
    rollDecisions,
  };
};
