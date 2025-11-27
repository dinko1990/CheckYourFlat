// core.js
// Global app configuration and shared behavior:
// - App version and jsPDF access
// - Sidebar + mobile navigation
// - Step gating (1 → 2 → 3)
// - Shared data structures (EXPOSE_DATA, inspection fields, mandatory fields, sample notes)
// Extracted from the original main.js to keep things organized.

const APP_VERSION = "2.2.1";    // change per release

  
  const { jsPDF } = window.jspdf;

  /* ========= SIDEBAR NAV ========= */
  const navItems = document.querySelectorAll(".nav-item");
  const sidebarEl = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const step1Card = document.getElementById("step1-card");
  const historyCard = document.getElementById("history-card");


  
  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      navItems.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.dataset.view;
      if (view === "new") {
        step1Card.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (view === "history") {
        historyCard.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (view === "logout") {
        alert("Logout is not wired yet – plug this into your auth flow.");
      }
    });
  });

  sidebarToggle.addEventListener("click", () => {
    sidebarEl.classList.toggle("collapsed");
    sidebarToggle.textContent = sidebarEl.classList.contains("collapsed") ? "»" : "«";
  });

  /* ========= MOBILE LEFT MENU ========= */
  const mobileMenu = document.getElementById("mobile-left-menu");
  const mobileToggle = document.getElementById("mobile-left-toggle");
  const navNewMobile = document.getElementById("nav-new-expose");
  const navHistMobile = document.getElementById("nav-history");
  const navLogoutMobile = document.getElementById("nav-logout-mobile");

  mobileToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });

  navNewMobile.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    if (confirm("Start a new exposé? This will reset the mask to defaults.")) {
      window.location.reload();
    }
  });
  navHistMobile.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    historyCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  navLogoutMobile.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    alert("Logout is not wired yet – plug this into your auth flow.");
  });

  /* ========= STEP GATING (1–2–3) ========= */
  let currentMaxStep = 1;
  const stepsFloating = document.getElementById("steps-floating");
  const stepButtons = stepsFloating.querySelectorAll("button");
  const stepCards = {
    1: document.getElementById("step1-card"),
    2: document.getElementById("step2-card"),
    3: document.getElementById("step3-card")
  };


  
function renderVersionInfo() {
  const el = document.getElementById("version-info");
  if (!el) return;

  let text = `Version ${APP_VERSION}`;


  el.textContent = text;
}

  
  function updateStepAccess() {
    stepButtons.forEach(btn => {
      const s = parseInt(btn.dataset.step, 10);
      btn.disabled = s > currentMaxStep;
      btn.classList.toggle("unlocked", s <= currentMaxStep);
      btn.classList.toggle("active", s === currentMaxStep);
    });
    Object.entries(stepCards).forEach(([n, card]) => {
      const num = parseInt(n, 10);
      if (num <= currentMaxStep) card.classList.remove("step-disabled");
      else card.classList.add("step-disabled");
    });
  }

  function unlockStep(step) {
    if (step > currentMaxStep) {
      currentMaxStep = step;
      updateStepAccess();
    }
  }

  stepButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const s = parseInt(btn.dataset.step, 10);
      if (s > currentMaxStep) return;
      const card = stepCards[s];
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
        stepButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });

  updateStepAccess();

  /* ========= DATA CONFIG ========= */

  // Exposé data (will be filled by fake Berlin or future PDF wizard)
  const EXPOSE_DATA = {
    adresse: "",
    objekttyp: "",
    baujahr: "",
    wohnflaeche: "",
    grundstueck: "",
    etage: "",
    vollgeschosse: "",
    keller: "",
    fassade_daemmung: "",
    dachgeschoss: "",
    straenge: "",
    fenster_material: "",
    fenster_verglas: "",
    baujahr_fenster: "",
    heizung: "",
    baujahr_heizung: "",
    warmwasser: ""
  };

  // Mandatory fields for Reality column
  const MANDATORY_FIELDS = ["adresse", "wohnflaeche", "keller"];

  // "Template" table structure
  const inspectionFields = [
    { id: "adresse",          label: "Adresse",                      type: "text" },
    { id: "objekttyp",        label: "Objekttyp",                    type: "select",
      options: ["Etagenwohnung","Wohnung","Einfamilienhaus","Gewerbe","MFH"] },
    { id: "baujahr",          label: "Baujahr",                      type: "text" },
    { id: "wohnflaeche",      label: "Wohnfläche",                   type: "text" },
    { id: "grundstueck",      label: "bei Haus Grundstücksfläche",   type: "text" },
    { id: "etage",            label: "Etage",                        type: "text" },
    { id: "vollgeschosse",    label: "wieviele Vollgeschosse",       type: "text" },
    { id: "keller",           label: "Keller",                       type: "text" }, // mandatory
    { id: "fassade_daemmung", label: "Fassade – Dämmung",            type: "select",
      options: ["unbekannt","Dämmung","keine Dämmung"] },
    { id: "dachgeschoss",     label: "Dachgeschoss",                 type: "select",
      options: ["unbekannt","ausgebaut","nicht ausgebaut","Flachdach"] },
    { id: "straenge",         label: "Stränge erneuert",             type: "select",
      options: ["unbekannt","Ja","Nein"] },
    { id: "fenster_material", label: "Fenster Material",             type: "select",
      options: ["unbekannt","Holz","Kunststoff","Sonstiges"] },
    { id: "fenster_verglas",  label: "Fenster Verglasung",           type: "select",
      options: ["unbekannt","Einfach verglast","Doppelt verglast","Sonstiges"] },
    { id: "baujahr_fenster",  label: "Baujahr Fenster",              type: "text" },
    { id: "heizung",          label: "Heizung",                      type: "select",
      options: ["unbekannt","Ofenheizung","Gas-Etagenheizung","Gas-Zentralheizung",
                "Öl-Zentralheizung","Fernwärme","Fernwärme (Gas)","Sonstiges"] },
    { id: "baujahr_heizung",  label: "Baujahr Heizung",              type: "text" },
    { id: "warmwasser",       label: "Warmwasser",                   type: "select",
      options: ["unbekannt","zentral","zentral (mit Warmwasser)","dezentral"] }
  ];

  const SAMPLE_NOTES = [
    "Looks as described, no visible defects.",
    "Walls freshly painted, minor scratches on floor.",
    "Windows close properly, no drafts felt.",
    "Bathroom ventilation needs checking.",
    "Heating seems older, might require service soon."
  ];
