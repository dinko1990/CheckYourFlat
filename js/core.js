// core.js
// Global app configuration and shared behavior:
// - App version and jsPDF access
// - Sidebar + mobile navigation
// - Step gating (1 → 2 → 3→ 4)
// - Shared data structures (EXPOSE_DATA, inspection fields, mandatory fields, sample notes)
// Extracted from the original main.js to keep things organized.

const APP_VERSION = "2.5.2";    // change per release

  
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
    3: document.getElementById("step3-card"),
    4: document.getElementById("step4-card")
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

/**
 * EXPOSE_FIELDS:
 * - schema of all expected fields
 * - label: text shown in the table
 * - type: "text" | "select"
 * - options: only for select fields
 * - mandatory: whether Reality must be filled before continuing
 */
const EXPOSE_FIELDS = {
  adresse: {
    label: "Adresse",
    type: "text",
    mandatory: true
  },
  objekttyp: {
    label: "Objekttyp",
    type: "select",
    options: ["Etagenwohnung", "Wohnung", "Einfamilienhaus", "Gewerbe", "MFH"],
    mandatory: true
  },
  baujahr: {
    label: "Baujahr",
    type: "text",
    mandatory: true
  },
  wohnflaeche: {
    label: "Wohnfläche gemäß Expose",
    type: "text",
    mandatory: false
  },
  grundstueck: {
    label: "bei Haus Grundstücksfläche",
    type: "text",
    mandatory: false
  },
  etage: {
    label: "Etage",
    type: "text",
    mandatory: false
  },
  vollgeschosse: {
    label: "wieviele Vollgeschosse",
    type: "text",
    mandatory: false
  },
  keller: {
    label: "Keller",
    type: "text",
    mandatory: true
  },
  fassade_daemmung: {
    label: "Fassade – Dämmung",
    type: "select",
    options: ["unbekannt", "Dämmung", "keine Dämmung"],
    mandatory: true
  },
  dachgeschoss: {
    label: "Dachgeschoss",
    type: "select",
    options: ["unbekannt", "ausgebaut", "nicht ausgebaut", "Flachdach"],
    mandatory: false
  },
  straenge: {
    label: "Stränge erneuert",
    type: "select",
    options: ["unbekannt", "Ja", "Nein"],
    mandatory: false
  },
  fenster_material: {
    label: "Fenster Material",
    type: "select",
    options: ["unbekannt", "Holz", "Kunststoff", "Sonstiges"],
    mandatory: false
  },
  fenster_verglas: {
    label: "Fenster Verglasung",
    type: "select",
    options: ["unbekannt", "Einfach verglast", "Doppelt verglast", "Sonstiges"],
    mandatory: false
  },
  baujahr_fenster: {
    label: "Baujahr Fenster",
    type: "text",
    mandatory: false
  },
  heizung: {
    label: "Heizung",
    type: "select",
    options: [
      "unbekannt",
      "Ofenheizung",
      "Gas-Etagenheizung",
      "Gas-Zentralheizung",
      "Öl-Zentralheizung",
      "Fernwärme",
      "Fernwärme (Gas)",
      'Wärmepumpe',
      "Sonstiges"
    ],
    mandatory: false
  },
  baujahr_heizung: {
    label: "Baujahr Heizung",
    type: "text",
    mandatory: false
  },
  warmwasser: {
    label: "Warmwasser",
    type: "select",
    options: ["unbekannt", "zentral", "dezentral"],
    mandatory: false
  },
    energieklasse: {
    label: "Energieklasse",
    type: "text",
    mandatory: false
  },
  weg: {
    label: "WEG",
    type: "text",
    mandatory: false
  },
};



/**
 * EXPOSE_DATA:
 * - actual values for each field
 * - initially empty, filled by fake Berlin or future PDF wizard
 */
const EXPOSE_DATA = Object.fromEntries(
  Object.keys(EXPOSE_FIELDS).map((id) => [id, ""])
);

/**
 * MANDATORY_FIELDS:
 * - IDs of fields that must be filled in the Reality column
 * - currently derived from EXPOSE_FIELDS.mandatory
 *   (Adresse, Wohnfläche, Keller)
 */
const MANDATORY_FIELDS = Object.keys(EXPOSE_FIELDS).filter(
  (id) => EXPOSE_FIELDS[id].mandatory
);

/**
 * inspectionFields:
 * - template used by the current table engine
 * - built from EXPOSE_FIELDS so later the "engine" can replace it
 *   without changing the UI code
 */
const inspectionFields = Object.keys(EXPOSE_FIELDS).map((id) => {
  const cfg = EXPOSE_FIELDS[id];
  return {
    id,
    label: cfg.label,
    type: cfg.type,
    options: cfg.options || []
  };
});

/**
 * SAMPLE_NOTES:
 * - mock notes PER FIELD (German)
 * - used ONLY by the button: 🧪 Auto-fill sample notes (mock)
 * - we will fill ONLY empty Reality cells and not overwrite manual input
 */
const SAMPLE_NOTES = {
  adresse: "Adresse vor Ort geprüft, entspricht dem Exposé.",
  objekttyp: "Nutzung entspricht der Beschreibung im Exposé.",
  baujahr:
    "Baujahr laut Unterlagen plausibel, keine besonderen Auffälligkeiten.",
  wohnflaeche:
    "Wohnfläche überschlägig nachgemessen, Abweichungen im üblichen Rahmen.",
  grundstueck:
    "Grundstücksfläche nicht im Detail geprüft, Plausibilität gegeben.",
  etage: "Lage der Einheit im Gebäude bestätigt.",
  vollgeschosse:
    "Anzahl der Vollgeschosse entspricht dem sichtbaren Bestand.",
  keller: "Kellerabteil vorhanden, Zustand dem Alter entsprechend.",
  fassade_daemmung:
    "Fassade optisch geprüft, genaue Dämmqualität nicht geöffnet.",
  dachgeschoss:
    "Dachgeschoss von unten begutachtet, keine augenfälligen Mängel.",
  straenge: "Stränge soweit einsehbar in ordentlichem Zustand.",
  fenster_material:
    "Fensterrahmen optisch geprüft, keine gravierenden Beschädigungen.",
  fenster_verglas:
    "Verglasung ohne sichtbare Risse, übliche Gebrauchsspuren vorhanden.",
  baujahr_fenster:
    "Baujahr der Fenster laut Angaben, Plausibilitätsprüfung ohne Auffälligkeiten.",
  heizung:
    "Heizungsanlage in Betrieb, keine außergewöhnlichen Geräusche festgestellt.",
  baujahr_heizung:
    "Baujahr der Heizung gemäß Unterlagen, mittelfristiger Ersatz prüfen.",
  warmwasser:
    "Warmwasserversorgung funktionstüchtig, Temperaturverlauf plausibel.",
  energieklasse:
    "Energieeffizienz laut Unterlagen plausibel.",
  weg:
    "Angaben aus der WEG-Dokumentation übernommen.",
};

/**
 * Default text for fields that have no specific SAMPLE_NOTES entry.
 */
const SAMPLE_NOTE_DEFAULT =
  "Keine besonderen Auffälligkeiten festgestellt, Zustand dem Alter entsprechend.";

