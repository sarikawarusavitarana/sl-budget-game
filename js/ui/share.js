/* =======================
   SHARE RESULTS
   Lets players save the results page as an image or a PDF. The image and PDF
   libraries are only loaded when a player first uses one of these options.
======================= */
const SHARE_FILE_NAME = "sri-lanka-2027-budget-results";
let shareLibsPromise = null;

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
    let s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load " + src));
    document.head.appendChild(s);
  });
}

function loadShareLibs() {
  if (!shareLibsPromise) {
    shareLibsPromise = Promise.all([
      loadScriptOnce("js/vendor/html2canvas.min.js"),
      loadScriptOnce("js/vendor/jspdf.umd.min.js")
    ]).catch(err => { shareLibsPromise = null; throw err; });
  }
  return shareLibsPromise;
}

function toggleSharePanel() {
  let panel = document.getElementById("sharePanel");
  if (!panel) return;
  panel.hidden = !panel.hidden;
  setShareStatus("");
  if (!panel.hidden) {
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    loadShareLibs().catch(() => {});
  }
}

function setShareStatus(text) {
  let el = document.getElementById("shareStatus");
  if (el) el.innerText = text;
}

function setShareBusy(busy) {
  document.querySelectorAll("#sharePanel button").forEach(b => { b.disabled = busy; });
}

async function captureResults() {
  await loadShareLibs();
  let box = document.querySelector("#p13 .box");
  closeInfoTooltips();
  return window.html2canvas(box, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    // The results box normally scrolls inside the page; unfold it so the whole page is captured.
    onclone: doc => {
      let clone = doc.querySelector("#p13 .box");
      if (clone) { clone.style.maxHeight = "none"; clone.style.overflow = "visible"; }
    },
    ignoreElements: el => el.classList && (el.classList.contains("nav") || el.id === "sharePanel")
  });
}

function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

function downloadBlob(blob, fileName) {
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function runShareAction(action) {
  setShareBusy(true);
  setShareStatus("Preparing your results…");
  try {
    let canvas = await captureResults();
    let blob = await canvasToBlob(canvas);
    if (action === "image") {
      downloadBlob(blob, SHARE_FILE_NAME + ".png");
      setShareStatus("Your image has been downloaded.");
    } else if (action === "pdf") {
      let jsPDF = window.jspdf.jsPDF;
      let w = canvas.width / 2, h = canvas.height / 2;
      let pdf = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "px", format: [w, h], hotfixes: ["px_scaling"] });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save(SHARE_FILE_NAME + ".pdf");
      setShareStatus("Your PDF has been downloaded.");
    }
  } catch (e) {
    setShareStatus("Sorry, something went wrong. Please try again.");
  } finally {
    setShareBusy(false);
  }
}
