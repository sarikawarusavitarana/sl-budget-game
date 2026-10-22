/* =======================
   RESULTS PAGE
======================= */
function showFinalResult() {
  let s = computeFiscalSnapshot();
  let rules = s.rules, marketConfidence = s.marketConfidence, fiscalOutcome = s.fiscalOutcome;
  let rulesMetCount = Object.values(rules).filter(r => r.met).length;
  if (typeof recordFinished === "function") recordFinished(s);

  document.getElementById("revValue").innerText = "LKR " + Math.round(s.revenue).toLocaleString() + " bn";
  document.getElementById("expValue").innerText = "LKR " + Math.round(s.expenditure).toLocaleString() + " bn";
  document.getElementById("balanceValue").innerText = "LKR " + Math.round(s.balance).toLocaleString() + " bn";
  document.getElementById("deficitValue").innerText = "LKR " + Math.round(s.drivers.deficitAbs).toLocaleString() + " bn (" + s.deficitPercent.toFixed(2) + "%)";
  document.getElementById("confidenceValue").innerText = marketConfidence.toFixed(0) + " / 100";

  // Neutral wording: state how many targets are met, never a verdict on the Budget.
  document.getElementById("headlineText").innerText =
    "Your Budget meets " + rulesMetCount + " of the 5 targets";

  document.getElementById("summaryText").innerText =
    "Market confidence, a simple game indicator, is " + marketConfidence.toFixed(0) +
    " out of 100. The 1-year Treasury bill rate ends at " + s.tbill.toFixed(1) + "% and the rupee depreciates by " + s.fxDepreciation.toFixed(1) +
    "%, so interest costs Rs. " + Math.round(s.interest).toLocaleString() + " bn (" + s.interestToGDP.toFixed(1) + "% of GDP).";


  let whyEl = document.getElementById("whyList");
  if (whyEl) whyEl.innerHTML = explainOutcome(s).map(t => "<p>" + t + "</p>").join("");

  function fillRule(prefix, rule, op) {
    document.getElementById("ruleTarget" + prefix).innerText = (op || "") + rule.target.toFixed(1) + "%";
    // Show 2 decimals when 1 decimal would make the actual look equal to the target.
    let dp = rule.actual.toFixed(1) === rule.target.toFixed(1) ? 2 : 1;
    document.getElementById("ruleActual" + prefix).innerText = rule.actual.toFixed(dp) + "%";
    document.getElementById("ruleStatus" + prefix).innerHTML = rule.met
      ? "<span class='rule-status met'>Met</span>"
      : "<span class='rule-status notmet'>Not met</span>";
  }
  fillRule("Revenue", rules.revenue, "≥ ");
  fillRule("Primary", rules.primaryBalance, "≥ ");
  fillRule("Investment", rules.publicInvestment, "≥ ");
  fillRule("Deficit", rules.deficit, "≤ ");
  fillRule("PrimExp", rules.primaryExpenditure, "≤ ");

  function setCard(id, status) {
    let el = document.getElementById(id).parentElement;
    el.classList.remove("green", "yellow", "red"); el.classList.add(status);
  }
  const base = baselineSnapshot();
  const rs = n => "Rs. " + Math.abs(n).toFixed(1) + " bn";
  const sg = (n, d) => (n >= 0 ? "+" : "\u2212") + Math.abs(n).toFixed(d);
  function fillCard(id, status, title, detail, risk, vals) {
    setCard(id, status);
    document.getElementById(id).innerHTML = "<strong>" + title + "</strong><br>" + detail +
      "<div class='card-vals'>" + vals + "</div><div class='risk'><strong>Key risk:</strong> " + risk + "</div>";
  }
  // Public services
  let social = s.D.social;
  let sv = social > 5 ? "green" : social >= -5 ? "yellow" : "red";
  fillCard("servicesText", sv,
    sv === "green" ? "More room to improve services" : sv === "yellow" ? "Limited room to improve services" : "Pressure on public services",
    sv === "green" ? "Social spending has increased compared with the starting Budget." : sv === "yellow" ? "Social spending has changed little, or the Budget leaves limited room for additional services." : "Social spending has fallen compared with the starting Budget.",
    "If spending is reduced, services may have less room to respond to people\u2019s needs. If spending increases, you must make sure the Budget can afford it.",
    "Change in social spending: " + (social >= 0 ? "+" : "\u2212") + rs(social));
  // Prices
  let di = s.inflation - base.inflation;
  let pc = di < -0.1 ? "green" : di <= 0.5 ? "yellow" : "red";
  fillCard("subsidyText", pc,
    pc === "green" ? "Price pressures are easing" : pc === "yellow" ? "Prices remain under pressure" : "Rising price pressures",
    pc === "green" ? "Inflation is below the starting assumption." : pc === "yellow" ? "Inflation is close to or slightly above the starting assumption." : "Inflation is significantly above the starting assumption.",
    "If inflation rises or the rupee weakens further, households and businesses may face additional costs.",
    "Inflation " + s.inflation.toFixed(1) + "% (start " + base.inflation.toFixed(1) + "%) \u00B7 Rupee depreciation " + s.fxDepreciation.toFixed(1) + "% (start " + base.fxDepreciation.toFixed(1) + "%)");
  // Growth
  let dg = s.growth - base.growth;
  let gc = dg > 0.1 ? "green" : dg >= -0.1 ? "yellow" : "red";
  fillCard("growthText", gc,
    gc === "green" ? "Growth outlook is improving" : gc === "yellow" ? "Growth outlook is steady" : "Growth outlook is weakening",
    gc === "green" ? "The projected real growth rate has increased." : gc === "yellow" ? "The projected growth rate is close to its starting assumption." : "The projected real growth rate has fallen.",
    "Cutting investment too far may limit future opportunities, while increasing allocations without considering the spending limit can put pressure on the Budget.",
    "Real growth " + s.growth.toFixed(1) + "% (start " + base.growth.toFixed(1) + "%) \u00B7 Public investment " + rules.publicInvestment.actual.toFixed(1) + "% of GDP");
  // Markets
  let dm = marketConfidence - base.marketConfidence;
  let mc = dm > 2 ? "green" : dm >= -2 ? "yellow" : "red";
  fillCard("reactionText", mc,
    mc === "green" ? "Confidence is strengthening" : mc === "yellow" ? "Confidence remains cautious" : "Confidence is weakening",
    mc === "green" ? "The confidence score is rising." : mc === "yellow" ? "The score is close to its starting level." : "The score is falling.",
    "A weaker fiscal position can reduce the confidence score and put additional pressure on borrowing costs and the rupee.",
    "Confidence " + marketConfidence.toFixed(0) + " (start " + base.marketConfidence.toFixed(0) + ") \u00B7 Primary balance " + sg(s.primaryBalance, 1) + "% \u00B7 Deficit " + s.deficitPercent.toFixed(1) + "% of GDP");
}

