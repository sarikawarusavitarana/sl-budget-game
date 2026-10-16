/* =======================
   LIVE DASHBOARD
======================= */
const pageWeekMap = { p1: 0, p2: 0, p3: 0, p17: 0, p4: 1, p5: 2, p6: 3, p9: 4, p10: 5, p12: 6, p14: 7, p15: 8, p18: 9, p16: 10, p13: 10 };

function updateLiveDashboard() {
  let s = computeFiscalSnapshot();
  let activeScreen = document.querySelector(".screen.active");
  let activeId = activeScreen ? activeScreen.id : "p2";
  let week = pageWeekMap[activeId] !== undefined ? pageWeekMap[activeId] : 0;
  let weekEl = document.getElementById("fiscalWeek");
  if (weekEl) weekEl.innerText = "WEEK " + week + " / 10";

  let setText = (id, text) => { let el = document.getElementById(id); if (el) el.innerText = text; };
  let setSign = (id, val, decimals) => {
    let el = document.getElementById(id); if (!el) return;
    el.innerText = (val > 0 ? "+" : "") + val.toFixed(decimals) + "%";
    el.classList.remove("negative", "positive");
    el.classList.add(val < 0 ? "negative" : "positive");
  };
  setText("fdRevenue", "LKR " + (s.revenue / 1000).toFixed(1) + " tn");
  setText("fdSpending", "LKR " + (s.expenditure / 1000).toFixed(1) + " tn");
  let deficitEl = document.getElementById("fdDeficit");
  if (deficitEl) {
    deficitEl.innerText = (s.balance >= 0 ? "+" : "") + "LKR " + (s.balance / 1000).toFixed(1) + " tn";
    deficitEl.classList.remove("negative", "positive");
    deficitEl.classList.add(s.balance < 0 ? "negative" : "positive");
  }
  setText("fdDebt", s.debtToGDP.toFixed(1) + "%");
  setText("fdGrowth", s.growth.toFixed(1) + "%");
  setSign("fdPrimary", s.primaryBalance, 1);
  setText("fdInflation", s.inflation.toFixed(1) + "%");
  setText("fdConfidence", s.marketConfidence.toFixed(0) + " / 100");
}

