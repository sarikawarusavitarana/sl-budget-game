/* =======================
   ANONYMOUS GAMEPLAY RECORDING
   Sends the player's choices to a Google Sheet so we can see how many people start
   and finish the game, and which choices they make. No names, emails, IP addresses
   or other personal details are sent. Each play-through gets a random ID so its
   "started" and "finished" records can be matched; the ID is not linked to the person.

   Paste the Google Apps Script web app URL below (see docs/anonymous-recording.md).
   While it is empty, nothing is recorded and the notice about recording stays hidden.
======================= */
const ANALYTICS_URL = "";

const RECORDING_NOTICE =
  "To help improve the game, your choices are recorded anonymously. No names, emails or other personal details are collected.";

const analyticsPlayId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
let analyticsStarted = false;

function analyticsEnabled() {
  return !!ANALYTICS_URL && window.location.protocol !== "file:";
}

function sendAnalytics(data) {
  if (!analyticsEnabled()) return;
  data.playId = analyticsPlayId;
  let body = JSON.stringify(data);
  try {
    // text/plain avoids a CORS preflight, which Google Apps Script does not answer.
    fetch(ANALYTICS_URL, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain" }, body: body })
      .catch(function () { });
  } catch (e) { /* recording must never break the game */ }
}

// Called from go() in navigation.js. The game counts as started when the player
// leaves the first page.
function recordPageView(pageId) {
  if (pageId === "p17" && !analyticsStarted) {
    analyticsStarted = true;
    sendAnalytics({ event: "started" });
  }
}

// Called each time the results page is shown. The sheet keeps one row per play-through,
// so going back, changing choices and returning updates that row with the final choices.
function recordFinished(s) {
  try {
    let rulesMet = Object.values(s.rules).filter(r => r.met).length;
    let data = {
      event: "finished",
      revenueApproach: taxOptionLabels[revenuePolicy.revenueApproach] || "",
      taxPriority: taxOptionLabels[revenuePolicy.balanceApproach] || "",
      welfareIndexed: welfareIndex === "yes" ? "Yes" : welfareIndex === "no" ? "No" : "",
      emergencyReserve: envReserve,
      targetsMet: rulesMet,
      deficitPct: +s.deficitPercent.toFixed(2),
      debtPct: +s.debtToGDP.toFixed(1),
      growthPct: +s.growth.toFixed(2),
      inflationPct: +s.inflation.toFixed(2),
      confidence: Math.round(s.marketConfidence)
    };
    SECTORS.forEach(sec => {
      if (sec.kind !== "reserve") data[sec.id + "Pct"] = sectorPct[sec.id];
      data[sec.id + "Priority"] = sectorPriority[sec.id] ? sectorPriority[sec.id].label : "";
    });
    sendAnalytics(data);
  } catch (e) { /* recording must never break the game */ }
}

(function showRecordingNotice() {
  if (!analyticsEnabled()) return;
  let el = document.getElementById("recordingNotice");
  if (el) { el.textContent = RECORDING_NOTICE; el.hidden = false; }
})();
