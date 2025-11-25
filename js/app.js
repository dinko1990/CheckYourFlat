// Minimal modular JS for index10.html
// Keep DOM updates unobtrusive and accessible

const dom = {
  demoOutput: document.getElementById('demo-output'),
  openDemoBtn: document.getElementById('open-demo'),
  year: document.getElementById('year'),
};

function setYear() {
  if (dom.year) dom.year.textContent = new Date().getFullYear();
}

function showDemoMessage(msg) {
  if (!dom.demoOutput) return;
  dom.demoOutput.textContent = msg;
  // small visual hint
  dom.demoOutput.classList.add('flash');
  setTimeout(() => dom.demoOutput.classList.remove('flash'), 500);
}

function initEventHandlers() {
  if (dom.openDemoBtn) {
    dom.openDemoBtn.addEventListener('click', () => {
      showDemoMessage('Demo opened — replace this with actual functionality.');
    });
  }
}

/* Init function (called on module load) */
function init() {
  setYear();
  initEventHandlers();
  // any other initialization or feature detection can go here
}

init();

// Exports (if other modules are added later)
export { showDemoMessage, setYear };