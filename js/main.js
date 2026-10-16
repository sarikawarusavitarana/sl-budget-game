/* =======================
   INIT
======================= */
function reload() {
   window.location.reload();
}

SECTORS.forEach(s => placeSectorMarkers(s.id));
updateBudgetDisplay();
["stepper-p17"].concat(SECTORS.map(s => "stepper-" + s.page)).forEach(id => initStepper(id));
updatePageTracker('p2');

