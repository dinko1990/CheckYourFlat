// step1.js
// Logic for STEP 1 (upload + example):
// - Handles drag-and-drop area and file input
// - Tracks the selected PDF filename
// - Provides the fake Berlin exposé helper
// - Unlocks STEP 2 and triggers initial table build when data is ready

/* ========= STEP 1: FILE / EXAMPLE ========= */
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const fileInfo = document.getElementById("file-info");
  const selectFileBtn = document.getElementById("select-file-btn");
  const loadExampleBtn = document.getElementById("load-example-btn");

  let currentFileName = "";

  function handleFiles(files) {
    if (!files || !files.length) return;
    const file = files[0];
    currentFileName = file.name;
    fileInfo.textContent = `Loaded file: ${file.name}`;
    // Future: PDF parser will fill EXPOSE_DATA here.
    // For now: only unlock step 2, but EXPOSE_DATA stays blank until example is used.
    unlockStep(2);
  }

  selectFileBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", e => handleFiles(e.target.files));

  ["dragenter","dragover"].forEach(evt => {
    dropZone.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("dragover");
    });
  });
  ["dragleave","drop"].forEach(evt => {
    dropZone.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove("dragover");
    });
  });
  dropZone.addEventListener("drop", e => {
    handleFiles(e.dataTransfer.files);
  });

  // Fake Berlin exposé fills EXPOSE_DATA + table
  function fillFakeBerlinExpose() {
    EXPOSE_DATA.adresse          = "Kantstraße 123, 10625 Berlin";
    EXPOSE_DATA.objekttyp        = "Etagenwohnung";
    EXPOSE_DATA.baujahr          = "1960";
    EXPOSE_DATA.wohnflaeche      = "ca. 67 m²";
    EXPOSE_DATA.grundstueck      = "";
    EXPOSE_DATA.etage            = "2";
    EXPOSE_DATA.vollgeschosse    = "5";
    EXPOSE_DATA.keller           = "Kellerabteil vorhanden";
    EXPOSE_DATA.fassade_daemmung = "";
    EXPOSE_DATA.dachgeschoss     = "";
    EXPOSE_DATA.straenge         = "";
    EXPOSE_DATA.fenster_material = "";
    EXPOSE_DATA.fenster_verglas  = "";
    EXPOSE_DATA.baujahr_fenster  = "";
    EXPOSE_DATA.heizung          = "Fernwärme   (Gas)";
    EXPOSE_DATA.baujahr_heizung  = "";
    EXPOSE_DATA.warmwasser       = "zentral (mit Warmwasser)";
  }

  loadExampleBtn.addEventListener("click", () => {
    fillFakeBerlinExpose();
    fileInfo.textContent = "Using example exposé: Kantstraße 123, 10625 Berlin";
    buildTable();
    unlockStep(2);
    stepCards[2].scrollIntoView({ behavior: "smooth", block: "start" });
    stepsFloating.querySelector('button[data-step="2"]').classList.add("active");
  });
