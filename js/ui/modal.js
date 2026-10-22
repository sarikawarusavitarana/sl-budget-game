/* About / FAQ pop-up (buttons sit in the header so they never cover Next) */
let modalOpener = null;
const modalTitles = {
  about: "About the Budget Game",
  faq: "Frequently asked questions",
  sources: "Sources"
};

function openModal(which) {
  modalOpener = document.activeElement;
  let m = document.getElementById("infoModal");
  let title = modalTitles[which] || "Information";
  let body = document.getElementById("modalBody");
  document.getElementById("modalTitle").innerText = title;
  let html = MODAL_CONTENT[which] || "<p>Content unavailable.</p>";
  // Mention anonymous recording in About, at the end of "Why make it public?", only when it is switched on.
  if (which === "about" && typeof analyticsEnabled === "function" && analyticsEnabled())
    html = html.replace("<h4>Acknowledgements</h4>", "<p>" + RECORDING_NOTICE + "</p><h4>Acknowledgements</h4>");
  body.innerHTML = html;

  m.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("modalClose").focus();
}
function openInfo(title, html) {
  modalOpener = document.activeElement;
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalBody").innerHTML = html;
  document.getElementById("infoModal").hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("modalBody").scrollTop = 0;
  document.getElementById("modalClose").focus();
}
function openTip(el, title) {
  openInfo(title, "<p>" + el.querySelector(".info-tooltip").innerHTML + "</p>");
}
function closeModal() {
  let modal = document.getElementById("infoModal");
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  if (modalOpener && typeof modalOpener.focus === "function") modalOpener.focus();
  modalOpener = null;
}
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
    return;
  }
  if (e.key !== "Enter" && e.key !== " ") return;
  let trigger = e.target?.closest?.(".info-icon");
  if (!trigger || !(trigger.getAttribute("onclick") || "").includes("openTip(")) return;
  e.preventDefault();
  trigger.click();
});
document.addEventListener("click", function (e) { if (e.target?.id === "infoModal") closeModal(); });
