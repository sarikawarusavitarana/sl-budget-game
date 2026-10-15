/* =======================
   BUDGET ENGINE
======================= */
// Sources: 2027 Appropriation Bill (tabled 7 Oct 2026); IMF Country Report 26/111
// (5th & 6th EFF reviews, May 2026); CBSL; game assumptions are labelled.
const macro = {
  gdp2026: 35835,            // IMF CR 26/111: nominal GDP 2026, Rs bn
  realGrowth: 3.2,           // IMF CR 26/111: real GDP growth 2027, %
  inflation: 5.3,            // IMF CR 26/111: average inflation 2027, %
  fxDepreciation: 4.0,       // game assumption: rupee depreciation over the year, % (spot ~Rs 330.7/US$ on 1 Oct 2026, CBSL)
  tbill: 9.25,               // 1-year (364-day) T-bill yield, % (CBSL daily indicators, 1 Oct 2026)
  revenue2026Pct: 15.2,      // IMF CR 26/111: revenue and grants 2026, % of GDP
  billPrimary: 4992.773388,  // 2027 Appropriation Bill: total expenditure (recurrent 3,240.2 + capital 1,752.5), Rs bn
  billCapital: 1752.531,     // 2027 Appropriation Bill: capital expenditure, Rs bn
  interestPct2027: 6.0,      // IMF CR 26/111: interest payments 2027, % of GDP
  gdp2027IMF: 38891,         // IMF CR 26/111: nominal GDP 2027, Rs bn
  debt2026Pct: 100.1,        // IMF: public debt 2026, % of GDP
  primaryExpCap: 13.0,       // ceiling on primary expenditure, % of GDP (Public Financial Management Act, No. 44 of 2024; Fiscal Strategy Statement 2026)
  foreignInterestShare: 0.25,// game assumption
  tbillRepriceShare: 0.30,   // game assumption
  borderTaxShare: 0.30,      // game assumption
  borderTaxPassThrough: 0.5, // game assumption
  execRate: 0.80             // game assumption: share of capital allocation actually spent (used for explanation only)
};
const targets = { revenue: 15.1, primary: 2.3, capital: 4.0, deficit: 3.7 }; // IMF CR 26/111 projections for 2027

function baselineRevenue() { return macro.gdp2026 * macro.revenue2026Pct / 100 * (1 + nominalBase()); }
function baselineInterest() { return macro.interestPct2027 / 100 * macro.gdp2027IMF; }

function fiscalPosition(revenue, primary, interest) {
  let total = primary + interest;
  return {
    revenue, primaryExpenditure: primary, interest, totalExpenditure: total,
    primaryBalance: revenue - primary, overallBalance: revenue - total, deficit: Math.max(0, total - revenue)
  };
}
function updateDebt(stock0, gdp, nominalGrowth, fiscal) {
  let nominalGDP = gdp * (1 + nominalGrowth);
  let newDebt = stock0 - fiscal.overallBalance;
  return { debtStock: newDebt, nominalGDP, debtToGDP: newDebt / nominalGDP * 100 };
}

function calculateRevenueEffects(rp) {
  const APPROACH_EFFECTS = { income: 80, consumption: 110, compliance: 50, unchanged: 0 };
  const APPROACH_INFLATION = { income: 0.1, consumption: 0.8, compliance: 0, unchanged: 0 };
  const BALANCE_EFFECTS = { revenue: 30, relief: -20, expand: 35 };
  const BALANCE_GROWTH = { revenue: -0.3, relief: 0.3, expand: 0.1 };
  let approachEffect = APPROACH_EFFECTS[rp.revenueApproach] || 0;
  let balanceEffect = BALANCE_EFFECTS[rp.balanceApproach] || 0;
  return {
    approachEffect, balanceEffect,
    taxInflationEffect: APPROACH_INFLATION[rp.revenueApproach] || 0,
    taxGrowthEffect: BALANCE_GROWTH[rp.balanceApproach] || 0,
    taxRevenueChange: approachEffect + balanceEffect
  };
}

function evaluateFiscalRules(r) {
  return {
    revenue: { label: "Revenue / GDP", target: targets.revenue, actual: r.revenueToGDP, met: r.revenueToGDP >= targets.revenue },
    primaryBalance: { label: "Primary Balance / GDP", target: targets.primary, actual: r.primaryBalanceToGDP, met: r.primaryBalanceToGDP >= targets.primary },
    publicInvestment: { label: "Public Investment / GDP", target: targets.capital, actual: r.publicInvestmentToGDP, met: r.publicInvestmentToGDP >= targets.capital },
    deficit: { label: "Overall Deficit / GDP", target: targets.deficit, actual: r.deficitToGDP, met: r.deficitToGDP <= targets.deficit },
    primaryExpenditure: { label: "Primary Expenditure / GDP (ceiling)", target: macro.primaryExpCap, actual: r.primaryExpToGDP, met: r.primaryExpToGDP <= macro.primaryExpCap }
  };
}

function computeFiscalSnapshot() {
  const D = sectorDeltas();
  const nomB = nominalBase();
  const gdpB = macro.gdp2026 * (1 + nomB);
  const revBase = baselineRevenue();
  const intBase = baselineInterest();
  const stock0 = macro.gdp2026 * macro.debt2026Pct / 100;

  const revenueEffects = calculateRevenueEffects(revenuePolicy);
  const primary = macro.billPrimary + D.total;
  const capital = macro.billCapital + D.capital;

  // Baseline (no choices at all) primary balance, for the rates and rupee gap
  const pbBase = (revBase - macro.billPrimary) / gdpB * 100;

  // Pass 1: provisional position at baseline interest
  const rev1 = revBase + revenueEffects.taxRevenueChange;
  const f1 = fiscalPosition(rev1, primary, intBase);
  const pb1 = f1.primaryBalance / gdpB * 100;
  const def1 = f1.deficit / gdpB * 100;

  let marketConfidence = 50 + (pb1 - targets.primary) * 8 - Math.max(0, def1 - targets.deficit) * 4;
  marketConfidence = Math.max(0, Math.min(100, marketConfidence));

  // Macro responses (game assumptions). The emergency reserve is excluded: it is only spent if a disaster occurs.
  const dp = (D.total - D.by.reserve) / gdpB * 100, dCap = D.capital / gdpB * 100, dSoc = D.social / gdpB * 100;
  let inflation = Math.max(1, Math.min(15, macro.inflation + 0.25 * dp + revenueEffects.taxInflationEffect));
  const crowd = def1 > 6 ? 0.5 : 0;
  let growth = macro.realGrowth + 0.4 * dp + 0.5 * dCap + 0.3 * dSoc + (marketConfidence - 50) * 0.01 - crowd + revenueEffects.taxGrowthEffect;
  growth = Math.max(0.5, Math.min(7, growth));

  // Rates and rupee follow the primary balance and inflation
  const primaryGap = pbBase - pb1;
  const inflGap = inflation - macro.inflation;
  const extraDeficit = Math.max(0, def1 - targets.deficit);
  const tbill = Math.max(2, macro.tbill + primaryGap * 0.6 + inflGap * 0.5 + extraDeficit * 0.3);
  const fxDepreciation = macro.fxDepreciation + primaryGap * 1.0 + inflGap * 0.5 + extraDeficit * 0.5;

  // Interest: domestic part follows the T-bill rate, foreign part follows the rupee
  const domestic = intBase * (1 - macro.foreignInterestShare) * (1 + macro.tbillRepriceShare * (tbill - macro.tbill) / macro.tbill);
  const foreign = intBase * macro.foreignInterestShare * (1 + (fxDepreciation - macro.fxDepreciation) / 100);
  const interest = domestic + foreign;

  // Revenue feedbacks: realised nominal GDP vs baseline, and border taxes with the rupee
  const realisedNominal = (1 + growth / 100) * (1 + inflation / 100) - 1;
  const gdpGapEffect = revBase * (realisedNominal - nomB);
  const borderEffect = revBase * macro.borderTaxShare * macro.borderTaxPassThrough * (fxDepreciation - macro.fxDepreciation) / 100;

  const revenue = rev1 + gdpGapEffect + borderEffect;
  const fiscal = fiscalPosition(revenue, primary, interest);
  const debtResult = updateDebt(stock0, macro.gdp2026, realisedNominal, fiscal);
  const nGDP = debtResult.nominalGDP;

  const revenueToGDP = fiscal.revenue / nGDP * 100;
  const primaryBalanceToGDP = fiscal.primaryBalance / nGDP * 100;
  const publicInvestmentToGDP = capital / nGDP * 100;
  const deficitToGDP = fiscal.deficit / nGDP * 100;
  const deficitPercent = fiscal.deficit / nGDP * 100;
  // The ceiling is fixed against GDP projected when the Budget is set, so extra spending cannot loosen it.
  const primaryExpToGDP = fiscal.primaryExpenditure / gdpB * 100;
  const interestToGDP = interest / nGDP * 100;

  const rules = evaluateFiscalRules({ revenueToGDP, primaryBalanceToGDP, publicInvestmentToGDP, deficitToGDP, primaryExpToGDP });
  const rulesMetCount = Object.values(rules).filter(r => r.met).length;
  const fiscalOutcome = rulesMetCount >= 4 ? "YES_STRICT" : (rulesMetCount >= 3 && marketConfidence >= 45) ? "YES_ALT" : "NO";

  return {
    total: D.total, revenue: fiscal.revenue, expenditure: fiscal.totalExpenditure, balance: fiscal.overallBalance,
    deficitPercent, marketConfidence, debtToGDP: debtResult.debtToGDP, growth, inflation,
    primaryBalance: primaryBalanceToGDP, rules, fiscalOutcome,
    tbill, fxDepreciation, interest, interestToGDP, primaryExpToGDP, nominalGrowth: realisedNominal * 100,
    headroom: macro.primaryExpCap / 100 * gdpB - primary,
    D, gdp: nGDP,
    drivers: {
      revBase, taxChange: revenueEffects.taxRevenueChange, gdpGapEffect, borderEffect, intBase,
      demand: 0.25 * dp, taxInflation: revenueEffects.taxInflationEffect || 0,
      spendEffect: 0.4 * dp, capEffect: 0.5 * dCap, socEffect: 0.3 * dSoc,
      confEffect: (marketConfidence - 50) * 0.01, taxGrowth: revenueEffects.taxGrowthEffect || 0,
      primaryGap, inflGap, startDebt: macro.debt2026Pct, deficitAbs: fiscal.deficit, capital, pbBase
    }
  };
}
