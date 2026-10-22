/**
 * Sri Lanka Budget Game: anonymous gameplay recording.
 *
 * Paste this whole file into Extensions > Apps Script in the Google Sheet that should
 * receive the records, then deploy it as a web app (see docs/anonymous-recording.md).
 *
 * One row per play-through. A row is added when a player leaves the first page and is
 * filled in with their choices when they reach the results page. No personal details
 * are received or stored.
 */

const SHEET_NAME = "Plays";

// Column order in the sheet: [heading, key sent by the game].
const COLUMNS = [
  ["Play ID", "playId"],
  ["Started (Sri Lanka time)", "_started"],
  ["Finished", "_finished"],
  ["Finished at (Sri Lanka time)", "_finishedAt"],
  ["Revenue approach", "revenueApproach"],
  ["Tax priority", "taxPriority"],
  ["Education %", "eduPct"],
  ["Education priority", "eduPriority"],
  ["Health %", "healthPct"],
  ["Health priority", "healthPriority"],
  ["Welfare %", "welfarePct"],
  ["Welfare priority", "welfarePriority"],
  ["Welfare indexed to inflation", "welfareIndexed"],
  ["Defence %", "defPct"],
  ["Defence priority", "defPriority"],
  ["Energy %", "energyPct"],
  ["Energy priority", "energyPriority"],
  ["Infrastructure %", "infraPct"],
  ["Infrastructure priority", "infraPriority"],
  ["Agriculture %", "agriPct"],
  ["Agriculture priority", "agriPriority"],
  ["Public administration %", "adminPct"],
  ["Public administration priority", "adminPriority"],
  ["Digital %", "digitalPct"],
  ["Digital priority", "digitalPriority"],
  ["Emergency reserve (Rs bn)", "emergencyReserve"],
  ["Environment priority", "envPriority"],
  ["Targets met (of 5)", "targetsMet"],
  ["Deficit (% of GDP)", "deficitPct"],
  ["Debt (% of GDP)", "debtPct"],
  ["Real growth (%)", "growthPct"],
  ["Inflation (%)", "inflationPct"],
  ["Market confidence", "confidence"]
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const raw = (e && e.postData && e.postData.contents) || "";
    if (raw.length > 5000) return ok_();
    const data = JSON.parse(raw);
    if (!/^[a-z0-9]{6,20}$/.test(String(data.playId || ""))) return ok_();
    if (data.event !== "started" && data.event !== "finished") return ok_();

    const sheet = getSheet_();
    const now = Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm:ss");
    const row = findRow_(sheet, data.playId);

    if (data.event === "started") {
      if (row) return ok_();
      const values = COLUMNS.map(c => c[1] === "playId" ? data.playId : c[1] === "_started" ? now : c[1] === "_finished" ? "No" : "");
      sheet.appendRow(values);
      return ok_();
    }

    // "finished": fill in (or update) this play-through's row with its latest choices.
    let rowNum = row;
    if (!rowNum) {
      sheet.appendRow(COLUMNS.map(c => c[1] === "playId" ? data.playId : ""));
      rowNum = sheet.getLastRow();
    }
    const current = sheet.getRange(rowNum, 1, 1, COLUMNS.length).getValues()[0];
    const values = COLUMNS.map((c, i) => {
      const key = c[1];
      if (key === "playId") return data.playId;
      if (key === "_started") return current[i];
      if (key === "_finished") return "Yes";
      if (key === "_finishedAt") return now;
      const v = data[key];
      if (typeof v === "number" && isFinite(v)) return v;
      if (typeof v === "string") return v.slice(0, 120);
      return "";
    });
    sheet.getRange(rowNum, 1, 1, COLUMNS.length).setValues([values]);
    return ok_();
  } catch (err) {
    return ok_();
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(c => c[0]));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold");
  }
  return sheet;
}

function findRow_(sheet, playId) {
  const cell = sheet.getRange("A:A").createTextFinder(playId).matchEntireCell(true).findNext();
  return cell ? cell.getRow() : null;
}

function ok_() {
  return ContentService.createTextOutput("ok");
}
