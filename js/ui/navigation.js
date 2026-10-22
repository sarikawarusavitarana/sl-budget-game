/* =======================
   NAV + UI
======================= */
function syncHeaderSpace() {
  let bar = document.getElementById('budgetBar');
  if (!bar) return;
  document.documentElement.style.setProperty('--header-h', bar.offsetHeight + 'px');
}
if (window.ResizeObserver) {
  let headerBar = document.getElementById('budgetBar');
  if (headerBar) new ResizeObserver(syncHeaderSpace).observe(headerBar);
}
window.addEventListener('resize', syncHeaderSpace);
window.addEventListener('load', syncHeaderSpace);

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  let next = document.getElementById(id);
  if (next) next.classList.add('active');
  updateLiveDashboard();
  updatePageTracker(id);
  if (typeof recordPageView === "function") recordPageView(id);
  syncHeaderSpace();
  window.scrollTo(0, 0);
}

const pageTrackerMap = {
  p4: "Education", p5: "Health", p6: "Welfare", p9: "Defence", p10: "Energy",
  p12: "Infra", p14: "Agri", p15: "Admin", p18: "Digital", p16: "Enviro", p13: "Results"
};

// The furthest area the player has reached. Players can jump back (or forward again)
// to any area up to this point, but cannot skip ahead to areas they have not answered yet.
let furthestTrackerIndex = -1;

function updatePageTracker(pageId) {
  let tracker = document.getElementById("pageTracker");
  if (!tracker) return;
  let currentLabel = pageTrackerMap[pageId];
  if (!currentLabel) { tracker.style.display = "none"; return; }
  tracker.style.display = "block";
  let steps = Array.from(tracker.querySelectorAll(".tracker-step"));
  let lines = Array.from(tracker.querySelectorAll(".tracker-line"));
  let currentIndex = steps.findIndex(s => s.dataset.label === currentLabel);
  if (currentIndex > furthestTrackerIndex) furthestTrackerIndex = currentIndex;
  steps.forEach((s, i) => {
    s.classList.remove("completed", "current", "reachable");
    let reachable = i <= furthestTrackerIndex && i !== currentIndex;
    if (i === currentIndex) s.classList.add("current");
    else if (reachable) s.classList.add("completed", "reachable");
    if (reachable) {
      s.setAttribute("role", "button");
      s.setAttribute("tabindex", "0");
      s.setAttribute("title", "Go to " + s.dataset.label);
    } else {
      s.removeAttribute("role");
      s.removeAttribute("tabindex");
      s.removeAttribute("title");
    }
  });
  lines.forEach((l, i) => { l.classList.toggle("completed", i < furthestTrackerIndex); });
}

function jumpToArea(label) {
  let pageId = Object.keys(pageTrackerMap).find(k => pageTrackerMap[k] === label);
  if (!pageId) return;
  if (pageId === "p13") {
    go("p13");
    if (window.showFinalResult) showFinalResult();
    return;
  }
  let stepperId = "stepper-" + pageId;
  if (document.getElementById(stepperId)) {
    hideStepWarning(stepperId);
    showStep(stepperId, 0);
  }
  go(pageId);
}

(function initTrackerClicks() {
  let tracker = document.getElementById("pageTracker");
  if (!tracker) return;
  tracker.addEventListener("click", function (e) {
    let step = e.target.closest(".tracker-step.reachable");
    if (step) jumpToArea(step.dataset.label);
  });
  tracker.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    let step = e.target.closest(".tracker-step.reachable");
    if (!step) return;
    e.preventDefault();
    jumpToArea(step.dataset.label);
  });
})();

function closeInfoTooltips() {
  document.querySelectorAll('.info-icon.open').forEach(i => i.classList.remove('open'));
}

function toggleInfoTooltip(el, ev) {
  ev?.stopPropagation?.();
  let wasOpen = el.classList.contains('open');
  closeInfoTooltips();
  if (!wasOpen) el.classList.add('open');
}

document.addEventListener('click', function (e) {
  if (e.target.closest('.info-icon')) return;
  closeInfoTooltips();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeInfoTooltips();
    return;
  }
  if (e.key !== 'Enter' && e.key !== ' ') return;
  let icon = e.target.closest('.info-icon');
  if (!icon) return;
  if ((icon.getAttribute('onclick') || '').includes('openTip(')) return;
  e.preventDefault();
  toggleInfoTooltip(icon, e);
});

