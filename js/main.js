(function () {

  const APP_VERSION = "1.3.01";    // change per release

  
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
    EXPOSE_DATA.heizung          = "Fernwärme (Gas)";
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

  /* ========= STEP 2: TABLE ========= */

  const comparisonBody = document.getElementById("comparison-body");
  const addTextRowBtn = document.getElementById("add-text-row-btn");
  const addPhotoRowBtn = document.getElementById("add-photo-row-btn");
  const resetExampleBtn = document.getElementById("reset-example-btn");
  const mockAutofillBtn = document.getElementById("mock-autofill-btn");
  const goStep3Btn = document.getElementById("go-step3-btn");

function addFieldRow(field) {
  const tr = document.createElement("tr");
  tr.dataset.rowType = "field";
  tr.dataset.fieldId = field.id;

  const isMandatory = MANDATORY_FIELDS.includes(field.id);
  if (isMandatory) tr.classList.add("mandatory-row");

  // Column 1: field label + optional delete button
  const descTd = document.createElement("td");
  descTd.dataset.label = "🧾 Field";

  const labelWrapper = document.createElement("div");
  labelWrapper.className = "field-label-wrapper";

  const labelSpan = document.createElement("span");
  labelSpan.className = "field-label-text";
  labelSpan.textContent = field.label;

  labelWrapper.appendChild(labelSpan);

  // Add red minus circle for NON-mandatory fields
  if (!isMandatory) {
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "trash-inline";
    delBtn.innerHTML = "x"; // red x in a circle via CSS
    delBtn.addEventListener("click", () => {
      if (confirm("Remove this field from the mask?")) {
        tr.remove();
      }
    });
    labelWrapper.appendChild(delBtn);
  }

  descTd.appendChild(labelWrapper);
  tr.appendChild(descTd);

  // Column 2: exposé (read-only)
  const exposeTd = document.createElement("td");
  exposeTd.className = "expose-cell";
  exposeTd.dataset.label = "🏢 Exposé";
  const exposeValue = EXPOSE_DATA[field.id] || "";
  exposeTd.textContent = exposeValue;
  tr.appendChild(exposeTd);

  // Column 3: reality (editable)
  const realityTd = document.createElement("td");
  realityTd.className = "editable";
  realityTd.dataset.label = "✅ Reality";

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy from exposé";

  if (field.type === "text") {
    const span = document.createElement("span");
    span.className = "cell-editable";
    span.contentEditable = "true";
    span.dataset.placeholder = "Write your inspection result…";
    span.innerHTML = '<span style="opacity:0.35;">Write your inspection result…</span>';

    span.addEventListener("focus", () => {
      if (span.querySelector("span")) span.textContent = "";
    });

    copyBtn.addEventListener("click", () => {
      span.textContent = exposeValue || "";
    });

    realityTd.appendChild(copyBtn);
    realityTd.appendChild(span);
  } else if (field.type === "select") {
    const select = document.createElement("select");
    select.style.width = "100%";
    select.style.padding = "3px 6px";
    select.style.borderRadius = "10px";
    select.style.border = "1px solid #dcd3ff";

    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = "Select…";
    select.appendChild(ph);

    field.options.forEach(o => {
      const opt = document.createElement("option");
      opt.value = o;
      opt.textContent = o;
      select.appendChild(opt);
    });

    copyBtn.addEventListener("click", () => {
      const val = (exposeValue || "").trim();
      if (!val) return;
      const opts = Array.from(select.options);
      let idx = opts.findIndex(o => o.value === val);
      if (idx === -1) {
        idx = opts.findIndex(o => val.toLowerCase().includes(o.value.toLowerCase()));
      }
      if (idx >= 0) select.selectedIndex = idx;
    });

    realityTd.appendChild(copyBtn);
    realityTd.appendChild(select);
  }

  tr.appendChild(realityTd);
  comparisonBody.appendChild(tr);
  makeRowDraggable(tr);  
}

function addCustomTextRow() {
  const tr = document.createElement("tr");
  tr.dataset.rowType = "custom-text";

  /* ----- FIELD TITLE (editable, blue) ----- */
  const descTd = document.createElement("td");
  descTd.dataset.label = "🧾 Field";

  const labelWrapper = document.createElement("div");
  labelWrapper.className = "field-label-wrapper custom-row-title";

  const fieldSpan = document.createElement("span");
  fieldSpan.className = "cell-editable custom-title";
  fieldSpan.contentEditable = "true";
  fieldSpan.textContent = "Custom note";

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "trash-inline";
  delBtn.innerHTML = "×";
  delBtn.addEventListener("click", () => {
    if (confirm("Remove this custom row?")) tr.remove();
  });

  labelWrapper.appendChild(fieldSpan);
  labelWrapper.appendChild(delBtn);
  descTd.appendChild(labelWrapper);

  /* ----- REALITY CELL (editable, spans Exposé + Reality) ----- */
  const realityTd = document.createElement("td");
  realityTd.className = "editable";
  realityTd.dataset.label = "✅ Reality";
  realityTd.colSpan = 2;    // 👈 spans Exposé + Reality columns

  const realityInner = document.createElement("div");
  realityInner.className = "editable-inner";
  
  const editableDiv = document.createElement("div");
  editableDiv.className = "cell-editable";
  editableDiv.contentEditable = "true";
  editableDiv.textContent = "";

  realityTd.appendChild(editableDiv);

  /* ----- append cells ----- */
  tr.appendChild(descTd);
  tr.appendChild(realityTd);

  document.querySelector("#comparison-table tbody").appendChild(tr);
    makeRowDraggable(tr); 

}

// --- Drag & drop rows in comparison table ---

let dragSrcRow = null;

function makeRowDraggable(tr) {
  tr.draggable = true;
  tr.classList.add("row-draggable");

  tr.addEventListener("dragstart", function (e) {
    dragSrcRow = tr;
    tr.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  });

  tr.addEventListener("dragend", function () {
    tr.classList.remove("dragging");
    dragSrcRow = null;
  });

  tr.addEventListener("dragover", function (e) {
    e.preventDefault();
    if (!dragSrcRow || dragSrcRow === tr) return;

    const tbody = tr.parentNode;
    const rect = tr.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const half = rect.height / 2;

    if (offset < half) {
      tbody.insertBefore(dragSrcRow, tr);
    } else {
      if (tr.nextSibling) {
        tbody.insertBefore(dragSrcRow, tr.nextSibling);
      } else {
        tbody.appendChild(dragSrcRow);
      }
    }
  });

  tr.addEventListener("drop", function (e) {
    e.preventDefault();
  });
}

function initRowDragging() {
  comparisonBody.querySelectorAll("tr").forEach(makeRowDraggable);
}



  /* ===== CAMERA / PHOTO ROW ===== */
  const cameraModal = document.getElementById("camera-modal");
  const cameraView = document.getElementById("camera--view");
  const cameraTrigger = document.getElementById("camera--trigger");
  const cameraClose = document.getElementById("camera-close");
  const cameraSensor = document.getElementById("camera--sensor");
  const cameraOutput = document.getElementById("camera--output");
  let cameraStream = null;
  let currentPhotoTargetImg = null;


  
  async function openCamera(targetImg) {
  currentPhotoTargetImg = targetImg;         // 👈 this is the critical part
  cameraModal.classList.add("active");

  try {
    // Try to force the back camera
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } },
      audio: false
    });
  } catch (err) {
    // Fallback: best-effort "environment" if exact fails
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
    } catch (err2) {
      alert("Camera not available / blocked.");
      closeCamera();
      return;
    }
  }

  cameraView.srcObject = cameraStream;
}


  function closeCamera() {
    cameraModal.classList.remove("active");
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    cameraView.srcObject = null;
  }

  cameraClose.addEventListener("click", closeCamera);
cameraTrigger.addEventListener("click", () => {
  if (!cameraStream || !currentPhotoTargetImg) return;

  const trackSettings = cameraStream.getVideoTracks()[0].getSettings();
  cameraSensor.width = trackSettings.width || 640;
  cameraSensor.height = trackSettings.height || 480;

  const ctx = cameraSensor.getContext("2d");
  ctx.drawImage(cameraView, 0, 0, cameraSensor.width, cameraSensor.height);

  const dataURL = cameraSensor.toDataURL("image/jpeg");
  currentPhotoTargetImg.src = dataURL;
  currentPhotoTargetImg.style.display = "block";

  closeCamera();
});


 function addPhotoRow() {
  const tr = document.createElement("tr");
  tr.dataset.rowType = "photo";

  /* ----- FIELD TITLE (editable, blue – like custom row) ----- */
  const descTd = document.createElement("td");
  descTd.dataset.label = "🧾 Field";

  const labelWrapper = document.createElement("div");
  // use same style as custom text row
  labelWrapper.className = "field-label-wrapper custom-row-title";

  const titleSpan = document.createElement("span");
  // editable, same classes as custom text row
  titleSpan.className = "cell-editable custom-title";
  titleSpan.contentEditable = "true";
  titleSpan.textContent = "Photo / comment";

  const trash = document.createElement("button");
  trash.type = "button";
  trash.className = "trash-inline";
  trash.innerHTML = "×";
  trash.addEventListener("click", () => {
    if (confirm("Remove this photo row?")) tr.remove();
  });

  labelWrapper.appendChild(titleSpan);
  labelWrapper.appendChild(trash);
  descTd.appendChild(labelWrapper);

  /* ----- REALITY CELL (NO exposé, spans 2 cols like custom row) ----- */
  const realityTd = document.createElement("td");
  realityTd.dataset.label = "✅ Reality";
  realityTd.className = "editable";
  realityTd.colSpan = 2; // 👈 hide Exposé column for this row

  const wrapper = document.createElement("div");
  wrapper.className = "photo-wrapper";

  const img = document.createElement("img");
  img.className = "photo-preview";
  img.style.display = "none";

  const actions = document.createElement("div");
  actions.className = "photo-actions";

  const uploadBtn = document.createElement("button");
  uploadBtn.type = "button";
  uploadBtn.textContent = "Upload photo";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";

  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      img.src = ev.target.result;
      img.style.display = "block";
    };
    reader.readAsDataURL(f);
    
  });

  const cameraBtn = document.createElement("button");
  cameraBtn.type = "button";
  cameraBtn.textContent = "Use camera";
  cameraBtn.addEventListener("click", () => openCamera(img));

  /* ----- ROTATE BUTTON (rotates underlying image data) ----- */
  const rotateBtn = document.createElement("button");
  rotateBtn.type = "button";
  rotateBtn.textContent = "Rotate 90°";

  rotateBtn.addEventListener("click", () => {
    if (!img.src || img.style.display === "none") return;

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.height;
      canvas.height = image.width;
      const ctx = canvas.getContext("2d");

      // rotate 90 degrees clockwise
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);

      // overwrite the image data so PDF gets rotated version too
      img.src = canvas.toDataURL("image/jpeg");
    };
    image.src = img.src;
  });

  actions.appendChild(uploadBtn);
  actions.appendChild(cameraBtn);
  actions.appendChild(rotateBtn);
  actions.appendChild(fileInput);

  const textarea = document.createElement("textarea");
  textarea.className = "photo-comment";
  textarea.placeholder = "Comment (optional)…";

  wrapper.appendChild(img);
  wrapper.appendChild(actions);
  wrapper.appendChild(textarea);
  realityTd.appendChild(wrapper);

  tr.appendChild(descTd);
  tr.appendChild(realityTd);
  comparisonBody.appendChild(tr);
  makeRowDraggable(tr);  
}


  
  function buildTable() {
    comparisonBody.innerHTML = "";
    inspectionFields.forEach(addFieldRow);
  }

  addTextRowBtn.addEventListener("click", addCustomTextRow);
  addPhotoRowBtn.addEventListener("click", addPhotoRow);

  resetExampleBtn.addEventListener("click", () => {
    if (!confirm("Reset to template rows & fake Berlin exposé?")) return;
    fillFakeBerlinExpose();
    buildTable();
  });

  mockAutofillBtn.addEventListener("click", () => {
    const spans = comparisonBody.querySelectorAll("tr[data-row-type='field'] td.editable .cell-editable");
    spans.forEach((span, idx) => {
      const note = SAMPLE_NOTES[idx % SAMPLE_NOTES.length];
      span.textContent = note;
    });
  });

  function validateMandatoryFields() {
    let ok = true;
    comparisonBody.querySelectorAll("tr.mandatory-row").forEach(tr => {
      const realityCell = tr.querySelector("td.editable");
      if (!realityCell) return;
      let hasValue = false;
      const span = realityCell.querySelector(".cell-editable");
      const select = realityCell.querySelector("select");
      if (span) {
        const txt = span.textContent.replace(/\s+/g, " ").trim();
        if (txt && txt !== "Write your inspection result…") hasValue = true;
      }
      if (select) {
        if (select.value && select.value.trim() !== "") hasValue = true;
      }

      tr.classList.remove("row-error");
      realityCell.classList.remove("field-error");
      if (!hasValue) {
        ok = false;
        tr.classList.add("row-error");
        realityCell.classList.add("field-error");
      }
    });
    return ok;
  }

  goStep3Btn.addEventListener("click", () => {
    if (!validateMandatoryFields()) {
      const firstError = comparisonBody.querySelector(".row-error");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    unlockStep(3);
    stepCards[3].scrollIntoView({ behavior: "smooth", block: "start" });
    stepsFloating.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    stepsFloating.querySelector('button[data-step="3"]').classList.add("active");
  });

  /* ========= STEP 3: SIGNATURE ========= */
  const signatureCanvas = document.getElementById("signature-pad");
  const clearSigBtn = document.getElementById("clear-signature-btn");
  const validatorInput = document.getElementById("validator");

  function resizeSignatureCanvas() {
    const rect = signatureCanvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    signatureCanvas.width = rect.width * ratio;
    signatureCanvas.height = rect.height * ratio;
    const ctx = signatureCanvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#22123f";
    ctx.fillStyle = "#fdfcff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }
  resizeSignatureCanvas();
  window.addEventListener("resize", resizeSignatureCanvas);

  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function getPos(e) {
    const rect = signatureCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    const { x, y } = getPos(e);
    lastX = x; lastY = y;
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = signatureCanvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
  }

  function endDraw(e) {
    if (!drawing) return;
    e.preventDefault();
    drawing = false;
  }

  signatureCanvas.addEventListener("mousedown", startDraw);
  signatureCanvas.addEventListener("mousemove", draw);
  signatureCanvas.addEventListener("mouseup", endDraw);
  signatureCanvas.addEventListener("mouseleave", endDraw);
  signatureCanvas.addEventListener("touchstart", startDraw, { passive: false });
  signatureCanvas.addEventListener("touchmove", draw, { passive: false });
  signatureCanvas.addEventListener("touchend", endDraw, { passive: false });

  clearSigBtn.addEventListener("click", () => {
    resizeSignatureCanvas();
  });

  /* ========= PDF GENERATION & MODAL ========= */
  const generateBtn = document.getElementById("generate-pdf-btn");
  const modalBackdrop = document.getElementById("pdf-modal-backdrop");
  const pdfFrame = document.getElementById("pdf-preview-frame");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const cancelDownloadBtn = document.getElementById("cancel-download-btn");
  const approveDownloadBtn = document.getElementById("approve-download-btn");
  const modalValidatorLabel = document.getElementById("modal-validator-label");
  const modalValidatorFooter = document.getElementById("modal-validator-footer");

  let lastPdfBlob = null;
  let lastPdfFilename = null;
  let lastValidatorName = "";
  let logoImageData = null;

  // Try loading Logo.png for header (optional)
  (function loadLogo() {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      logoImageData = canvas.toDataURL("image/png");
    };
    img.onerror = function () {
      logoImageData = null;
    };
    img.src = "Logo.png";
  })();

  function clearValidationErrors() {
    validatorInput.classList.remove("field-error");
    comparisonBody.querySelectorAll("tr.mandatory-row").forEach(tr => {
      tr.classList.remove("row-error");
      const cell = tr.querySelector("td.editable");
      if (cell) cell.classList.remove("field-error");
    });
  }

  generateBtn.addEventListener("click", () => {
    clearValidationErrors();
    let hasError = false;

    const validator = validatorInput.value.trim();
    if (!validator) {
      hasError = true;
      validatorInput.classList.add("field-error");
      validatorInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (!validateMandatoryFields()) {
      hasError = true;
    }

    if (hasError) return;

    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0");
    const baseName = (EXPOSE_DATA.adresse || "Flat").replace(/[^\w]+/g, "_") || "Flat";
    lastPdfFilename = baseName + "_" + timeStr + ".pdf";
    lastValidatorName = validator;

    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // HEADER
    doc.setFillColor(30, 12, 60);
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Check Your Flat", 12, 12);
    doc.setFontSize(15);
    doc.text("Inspection report", 12, 20);

    if (logoImageData) {
      doc.addImage(logoImageData, "PNG", 178, 4, 24, 17);
    } else {
      doc.setDrawColor(255, 184, 92);
      doc.circle(188, 12, 8);
      doc.setFontSize(9);
      doc.text("CYF", 184.5, 14);
    }

    // META
    doc.setTextColor(20, 12, 40);
    doc.setFontSize(11);
    let metaY = 38;

    function addMeta(label, value) {
      if (!value) return;
      doc.setFont("helvetica", "bold");
      doc.text(label, 12, metaY);
      doc.setFont("helvetica", "normal");
      doc.text(value, 20, metaY + 5);
      metaY += 11;
    }

    const dateStr = now.toLocaleString();
    const addressLine = EXPOSE_DATA.adresse || "";

    addMeta("Address:", addressLine);
    addMeta("Generated:", dateStr);
    if (currentFileName) addMeta("Source exposé:", currentFileName);
    addMeta("Validator (inspector):", validator);

    metaY += 4;

    // TABLE HEADING
    doc.setFontSize(12);
    doc.setTextColor(30, 12, 60);
    doc.setFont("helvetica", "bold");
    doc.text("Maske Inspektion – inspector notes", 12, metaY);
    doc.setLineWidth(0.3);
    doc.setDrawColor(180, 170, 230);
    doc.line(12, metaY + 2, 198, metaY + 2);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 20, 60);
    let y = metaY + 9;
    const lineHeight = 5;

    // Collect rows
    const rows = [];
    comparisonBody.querySelectorAll("tr").forEach(tr => {
      const type = tr.dataset.rowType || "field";
      const cells = tr.querySelectorAll("td");

      let desc = "";
      if (cells[0]) {
        const firstNode = cells[0].childNodes[0];
        desc = (firstNode && firstNode.textContent ? firstNode.textContent : "").trim();
      }

      let reality = "";
      let photoData = null;

      if (type === "photo") {
        const img = tr.querySelector(".photo-preview");
        const textarea = tr.querySelector(".photo-comment");
        if (textarea) reality = (textarea.value || "").trim();
        if (img && img.src && img.style.display !== "none") {
          photoData = img.src;
        }
      } else {
        const span = tr.querySelector("td.editable .cell-editable");
        const select = tr.querySelector("td.editable select");
        if (span) reality = (span.textContent || "").replace(/\s+/g, " ").trim();
        if (select && select.value) {
          reality = select.value;
        }
      }

      if (!desc && !reality && !photoData) return;
      rows.push({ type, desc, reality, photoData });
    });

    rows.forEach(row => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text("• " + row.desc, 12, y);
      y += lineHeight;

      if (row.reality) {
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(row.reality, 180);
        doc.text(textLines, 18, y);
        y += lineHeight + (textLines.length - 1) * lineHeight;
      }

      if (row.photoData) {
        const imgWidth = 60;
        const imgHeight = 45;
        if (y + imgHeight > 270) {
          doc.addPage();
          y = 20;
        }
        doc.addImage(row.photoData, "JPEG", 18, y, imgWidth, imgHeight);
        y += imgHeight + lineHeight;
      }
    });

    // Signature
    const sigData = signatureCanvas.toDataURL("image/png");
    if (sigData) {
      if (y + 30 > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Signature:", 12, y);
      doc.addImage(sigData, "PNG", 40, y - 10, 40, 20);
      y += 26;
    }

    const pdfBlob = doc.output("blob");
    lastPdfBlob = pdfBlob;

    const url = URL.createObjectURL(pdfBlob);
    pdfFrame.src = url;
    modalValidatorLabel.textContent = validator;
    modalValidatorFooter.textContent = "Check the PDF. If OK, approve & download.";
    modalBackdrop.classList.add("visible");
  });

  function closeModal() {
    modalBackdrop.classList.remove("visible");
    pdfFrame.src = "";
    if (lastPdfBlob) {
      URL.revokeObjectURL(lastPdfBlob);
      lastPdfBlob = null;
    }
  }

  closeModalBtn.addEventListener("click", closeModal);
  cancelDownloadBtn.addEventListener("click", closeModal);

  approveDownloadBtn.addEventListener("click", () => {
    if (!lastPdfBlob || !lastPdfFilename) return;
    const url = URL.createObjectURL(lastPdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = lastPdfFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    saveHistoryEntry({
      filename: lastPdfFilename,
      when: new Date().toLocaleString(),
      address: EXPOSE_DATA.adresse || "",
      validator: lastValidatorName || ""
    });

    closeModal();
    renderHistory();
    renderVersionInfo();
    initRowDragging();

  });

// HISTORY ELEMENT
const historyListEl = document.getElementById("history-list");

/* Load history array from localStorage */
function loadHistory() {
  try {
    const raw = localStorage.getItem("cyf-history-v3");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to parse history:", err);
    return [];
  }
}

/* Render history UI */
function renderHistory() {
  const list = loadHistory();
  historyListEl.innerHTML = "";

  if (!list.length) {
    const p = document.createElement("p");
    p.style.fontSize = "11px";
    p.style.color = "#7a719d";
    p.textContent = "No reports exported yet.";
    historyListEl.appendChild(p);
    return;
  }

  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";

    const main = document.createElement("div");
    main.className = "history-main";

    const title = document.createElement("div");
    title.textContent = item.filename;

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.textContent =
      (item.address || "") +
      " • " +
      item.when +
      (item.validator ? " • " + item.validator : "");

    main.appendChild(title);
    main.appendChild(meta);

    const tag = document.createElement("span");
    tag.className = "history-tag";
    tag.textContent = "PDF";

    div.appendChild(main);
    div.appendChild(tag);
    historyListEl.appendChild(div);
  });
}

/* Clear all history entries */
function clearHistory() {
  if (confirm("Clear all history entries from this browser?")) {
    localStorage.removeItem("cyf-history-v3");
    renderHistory();
  }
}

/* Wire Clear button safely */
const clearHistoryBtn = document.getElementById("clear-history-btn");
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", clearHistory);
}

/* Initial render */
renderHistory();
renderVersionInfo && renderVersionInfo(); 

})();
