// js/main.js

// ---------- Small helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

let exposeData = {};          // from data/expose.txt
let mandatoryFields = [];     // from data/mandatory.txt
let sampleNotes = [];         // from data/sampleTexts.txt
let currentPdfDoc = null;     // jsPDF instance for current preview
let currentPhotoRow = null;   // <tr> that will receive captured photo

const HISTORY_KEY = "cyf_history_v1";

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initMobileNav();
  initViewSwitching();
  initSteps();
  initFileUpload();
  initStepNavigation();
  initSignaturePad();
  initPdfModal();
  initCameraModal();
  initHistory();
  loadDataFiles();
});

// ---------- Load text data files ----------
async function loadDataFiles() {
  // Exposé example
  try {
    const res = await fetch("./data/expose.txt");
    const text = await res.text();
    exposeData = parseExposeText(text);
  } catch (e) {
    console.warn("Could not load expose.txt", e);
  }

  // Mandatory fields (comma-separated)
  try {
    const res = await fetch("./data/mandatory.txt");
    const text = await res.text();
    mandatoryFields = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (e) {
    console.warn("Could not load mandatory.txt", e);
  }

  // Sample notes (one per line)
  try {
    const res = await fetch("./data/sampleTexts.txt");
    const text = await res.text();
    sampleNotes = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (e) {
    console.warn("Could not load sampleTexts.txt", e);
  }
}

function parseExposeText(text) {
  const lines = text.split("\n");
  const obj = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").trim();
    obj[key.trim()] = value;
  }
  return obj;
}

// ---------- Sidebar + view switching ----------
function initSidebar() {
  const sidebar = $("#sidebar");
  const toggle = $("#sidebar-toggle");
  if (!sidebar || !toggle) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

function initViewSwitching() {
  const historyCard = $("#history-card");
  const stepCards = ["#step1-card", "#step2-card", "#step3-card"].map((id) =>
    $(id)
  );

  // initial state
  if (historyCard) historyCard.style.display = "none";

  function showView(view) {
    if (view === "history") {
      if (historyCard) historyCard.style.display = "block";
      stepCards.forEach((c) => c && (c.style.display = "none"));
    } else {
      if (historyCard) historyCard.style.display = "none";
      stepCards.forEach((c) => c && (c.style.display = ""));
    }

    $$(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });

    if (view === "logout") {
      alert("Logout clicked (no backend attached yet).");
    }
  }

  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view || "new";
      showView(view);
    });
  });

  // mobile menu
  $("#nav-new-expose")?.addEventListener("click", () => showView("new"));
  $("#nav-history")?.addEventListener("click", () => showView("history"));
  $("#nav-logout-mobile")?.addEventListener("click", () => showView("logout"));
}

// ---------- Mobile nav ----------
function initMobileNav() {
  const toggle = $("#mobile-left-toggle");
  const menu = $("#mobile-left-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

// ---------- Steps bar ----------
function initSteps() {
  const stepButtons = $$("#steps-floating .steps-inner button");
  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const step = parseInt(btn.dataset.step, 10);
      goToStep(step);
    });
  });
}

function goToStep(step) {
  const cards = {
    1: $("#step1-card"),
    2: $("#step2-card"),
    3: $("#step3-card"),
  };

  Object.entries(cards).forEach(([s, card]) => {
    if (!card) return;
    // visually highlight only the current step
    if (parseInt(s, 10) === step) {
      card.classList.remove("step-disabled");
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  $$("#steps-floating .steps-inner button").forEach((btn) => {
    const s = parseInt(btn.dataset.step, 10);
    btn.classList.toggle("active", s === step);
  });
}

// ---------- Step 1: file upload / example ----------
function initFileUpload() {
  const dropArea = $("#drop-area");
  const fileInput = $("#file-input");
  const fileInfo = $("#file-info");
  const browseBtn = $("#select-file-btn");
  const loadExampleBtn = $("#load-example-btn");

  if (!dropArea || !fileInput || !fileInfo || !browseBtn) return;

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropArea.addEventListener(
      eventName,
      () => dropArea.classList.add("highlight"),
      false
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(
      eventName,
      () => dropArea.classList.remove("highlight"),
      false
    );
  });

  dropArea.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  browseBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    handleFile(file);
  });

  loadExampleBtn?.addEventListener("click", () => {
    // we already loaded exposeData & mandatoryFields on startup
    if (!Object.keys(exposeData).length) {
      alert("Example exposé not available.");
      return;
    }
    fileInfo.textContent = "Using example exposé: Kantstraße 123, 10625 Berlin";
    buildComparisonTableFromExample();
    unlockStep2();
  });

  function handleFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    fileInfo.textContent = `Loaded: ${file.name}`;
    // You can parse the PDF here with pdf.js if you want.
    // For now we just unlock step 2.
    unlockStep2();
  }

  function unlockStep2() {
    const step2Card = $("#step2-card");
    if (step2Card) step2Card.classList.remove("step-disabled");

    const step2Button = document.querySelector(
      '#steps-floating .steps-inner button[data-step="2"]'
    );
    if (step2Button) {
      step2Button.disabled = false;
      step2Button.classList.add("unlocked");
    }

    // If coming from example, build table
    if ($("#comparison-body").children.length === 0) {
      buildComparisonTableFromExample();
    }
  }
}

function buildComparisonTableFromExample() {
  const tbody = $("#comparison-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  // mandatory fields as base rows
  mandatoryFields.forEach((key) => {
    const label = key;
    const exposeValue = exposeData[key] || "";
    const tr = createTextRow(label, exposeValue, true);
    tbody.appendChild(tr);
  });
}

// ---------- Step 2: table controls ----------
function initStepNavigation() {
  const addTextBtn = $("#add-text-row-btn");
  const addPhotoBtn = $("#add-photo-row-btn");
  const resetBtn = $("#reset-example-btn");
  const mockBtn = $("#mock-autofill-btn");
  const goStep3Btn = $("#go-step3-btn");

  addTextBtn?.addEventListener("click", () => {
    const label = prompt("Name of the new field:", "Custom note");
    const tbody = $("#comparison-body");
    if (!tbody) return;
    const tr = createTextRow(label || "Custom note", "", false);
    tbody.appendChild(tr);
  });

  addPhotoBtn?.addEventListener("click", () => {
    const tbody = $("#comparison-body");
    if (!tbody) return;
    const tr = createPhotoRow();
    tbody.appendChild(tr);
  });

  resetBtn?.addEventListener("click", () => {
    if (!Object.keys(exposeData).length) {
      alert("Example data not loaded yet.");
      return;
    }
    buildComparisonTableFromExample();
  });

  mockBtn?.addEventListener("click", () => {
    const tbody = $("#comparison-body");
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    let i = 0;
    rows.forEach((row) => {
      const realityField = row.querySelector(".reality-input");
      if (realityField && sampleNotes[i]) {
        realityField.value = sampleNotes[i];
        i++;
      }
    });
  });

  goStep3Btn?.addEventListener("click", () => {
    const step3Card = $("#step3-card");
    if (step3Card) step3Card.classList.remove("step-disabled");

    const step3Button = document.querySelector(
      '#steps-floating .steps-inner button[data-step="3"]'
    );
    if (step3Button) {
      step3Button.disabled = false;
      step3Button.classList.add("unlocked");
    }
    goToStep(3);
  });
}

function createTextRow(label, exposeValue, mandatory) {
  const tr = document.createElement("tr");
  tr.classList.add("row-text");

  const tdField = document.createElement("td");
  tdField.textContent = label + (mandatory ? " *" : "");
  tr.appendChild(tdField);

  const tdExpose = document.createElement("td");
  const exposeInput = document.createElement("input");
  exposeInput.type = "text";
  exposeInput.className = "expose-input";
  exposeInput.value = exposeValue || "";
  tdExpose.appendChild(exposeInput);
  tr.appendChild(tdExpose);

  const tdReality = document.createElement("td");
  const realityInput = document.createElement("textarea");
  realityInput.className = "reality-input";
  realityInput.rows = 2;
  tdReality.appendChild(realityInput);
  tr.appendChild(tdReality);

  return tr;
}

function createPhotoRow() {
  const tr = document.createElement("tr");
  tr.classList.add("row-photo");

  const tdField = document.createElement("td");
  tdField.textContent = "Photo";
  tr.appendChild(tdField);

  const tdExpose = document.createElement("td");
  tdExpose.textContent = "";
  tr.appendChild(tdExpose);

  const tdReality = document.createElement("td");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Add photo (camera)";
  btn.className = "btn-chip";
  const img = document.createElement("img");
  img.style.display = "block";
  img.style.maxWidth = "140px";
  img.style.marginTop = "4px";

  btn.addEventListener("click", () => {
    openCameraForRow(tr);
  });

  tdReality.appendChild(btn);
  tdReality.appendChild(img);
  tr.appendChild(tdReality);

  return tr;
}

// ---------- Signature pad ----------
function initSignaturePad() {
  const canvas = $("#signature-pad");
  const clearBtn = $("#clear-signature-btn");
  if (!canvas || !clearBtn) return;

  const ctx = canvas.getContext("2d");
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = rect.width || 600;
    canvas.height = 200;
    ctx.putImageData(imgData, 0, 0);
  };

  // initial size
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = 200;

  const startDraw = (x, y) => {
    drawing = true;
    lastX = x;
    lastY = y;
  };

  const moveDraw = (x, y) => {
    if (!drawing) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
  };

  const stopDraw = () => {
    drawing = false;
  };

  // Mouse
  canvas.addEventListener("mousedown", (e) =>
    startDraw(e.offsetX, e.offsetY)
  );
  canvas.addEventListener("mousemove", (e) =>
    moveDraw(e.offsetX, e.offsetY)
  );
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);

  // Touch
  canvas.addEventListener(
    "touchstart",
    (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      startDraw(t.clientX - rect.left, t.clientY - rect.top);
      e.preventDefault();
    },
    { passive: false }
  );
  canvas.addEventListener(
    "touchmove",
    (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      moveDraw(t.clientX - rect.left, t.clientY - rect.top);
      e.preventDefault();
    },
    { passive: false }
  );
  canvas.addEventListener(
    "touchend",
    (e) => {
      stopDraw();
      e.preventDefault();
    },
    { passive: false }
  );

  clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  window.addEventListener("resize", resizeCanvas);
}

// ---------- PDF modal + jsPDF ----------
function initPdfModal() {
  const generateBtn = $("#generate-pdf-btn");
  const modalBackdrop = $("#pdf-modal-backdrop");
  const closeBtn = $("#close-modal-btn");
  const cancelBtn = $("#cancel-download-btn");
  const approveBtn = $("#approve-download-btn");
  const validatorInput = $("#validator");
  const validatorLabel = $("#modal-validator-label");
  const validatorFooter = $("#modal-validator-footer");
  const iframe = $("#pdf-preview-frame");

  if (!generateBtn || !modalBackdrop || !iframe) return;

  const openModal = () => {
    const validatorName = validatorInput?.value.trim();
    if (!validatorName) {
      alert("Please enter a validator name.");
      return;
    }

    if (validatorLabel) validatorLabel.textContent = validatorName;
    if (validatorFooter)
      validatorFooter.textContent = `Validator: ${validatorName}`;

    // build pdf
    const pdfDoc = buildPdfDocument(validatorName);
    currentPdfDoc = pdfDoc;

    const blobUrl = pdfDoc.output("bloburl");
    iframe.src = blobUrl;

    modalBackdrop.classList.add("open");
  };

  const closeModal = () => {
    modalBackdrop.classList.remove("open");
    iframe.src = "about:blank";
    currentPdfDoc = null;
  };

  generateBtn.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  approveBtn?.addEventListener("click", () => {
    if (!currentPdfDoc) {
      alert("No PDF generated.");
      return;
    }
    const validatorName = validatorInput?.value.trim() || "inspector";
    const address = exposeData.adresse || "Unknown address";
    const filename = `CheckYourFlat_${address.replace(/\s+/g, "_")}_${validatorName}.pdf`;

    currentPdfDoc.save(filename);

    // store in history
    addEntryToHistory({
      validator: validatorName,
      address,
      date: new Date().toISOString(),
    });
    renderHistory();

    closeModal();
  });
}

function buildPdfDocument(validatorName) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("jsPDF not loaded.");
    throw new Error("jsPDF missing");
  }

  const doc = new jsPDF();
  const now = new Date();
  const address = exposeData.adresse || "Unknown address";

  let y = 20;
  doc.setFontSize(16);
  doc.text("Check Your Flat – Inspection Report", 10, y);
  y += 8;

  doc.setFontSize(11);
  doc.text(`Address: ${address}`, 10, y);
  y += 6;
  doc.text(`Validator: ${validatorName}`, 10, y);
  y += 6;
  doc.text(`Date: ${now.toLocaleString()}`, 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Summary of fields:", 10, y);
  y += 6;

  // table rows
  const tbody = $("#comparison-body");
  if (tbody) {
    const rows = Array.from(tbody.querySelectorAll("tr"));
    doc.setFontSize(10);

    rows.forEach((row) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const label = (row.querySelector("td:nth-child(1)")?.textContent || "")
        .trim();
      const exposeVal =
        row.querySelector(".expose-input")?.value?.trim() || "";
      const realityVal =
        row.querySelector(".reality-input")?.value?.trim() || "";

      if (row.classList.contains("row-photo")) {
        doc.text(`Field: ${label}`, 10, y);
        y += 5;
        doc.text(`Photo attached (see app screenshot)`, 10, y);
        y += 7;
      } else {
        doc.text(`Field: ${label}`, 10, y);
        y += 4;
        if (exposeVal) {
          doc.text(`Exposé: ${exposeVal}`, 10, y);
          y += 4;
        }
        if (realityVal) {
          doc.text(`Reality: ${realityVal}`, 10, y);
          y += 5;
        } else {
          y += 3;
        }
        y += 2;
      }
    });
  }

  // signature
  const canvas = $("#signature-pad");
  if (canvas) {
    const imgData = canvas.toDataURL("image/png");
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Signature", 10, 20);
    doc.addImage(imgData, "PNG", 10, 25, 80, 30);
    doc.setFontSize(10);
    doc.text(`Validator: ${validatorName}`, 10, 65);
  }

  return doc;
}

// ---------- Camera modal ----------
function initCameraModal() {
  const cameraModal = $("#camera-modal");
  const closeBtn = $("#camera-close");
  const triggerBtn = $("#camera--trigger");
  const view = $("#camera--view");
  const sensor = $("#camera--sensor");
  const output = $("#camera--output");

  if (!cameraModal || !closeBtn || !triggerBtn || !view || !sensor || !output)
    return;

  let stream = null;

  async function openCamera() {
    cameraModal.classList.add("open");
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      view.srcObject = stream;
    } catch (err) {
      console.error(err);
      alert("Unable to access camera.");
      closeCamera();
    }
  }

  function closeCamera() {
    cameraModal.classList.remove("open");
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  triggerBtn.addEventListener("click", () => {
    const ctx = sensor.getContext("2d");
    sensor.width = view.videoWidth;
    sensor.height = view.videoHeight;
    ctx.drawImage(view, 0, 0);
    const dataUrl = sensor.toDataURL("image/png");
    output.src = dataUrl;
    output.style.display = "block";

    if (currentPhotoRow) {
      const img = currentPhotoRow.querySelector("td:nth-child(3) img");
      if (img) {
        img.src = dataUrl;
      }
    }
    closeCamera();
  });

  closeBtn.addEventListener("click", () => {
    closeCamera();
  });

  // expose to other functions
  window.__openCameraModal = openCamera;
}

function openCameraForRow(row) {
  currentPhotoRow = row;
  if (window.__openCameraModal) {
    window.__openCameraModal();
  } else {
    alert("Camera not available.");
  }
}

// ---------- History ----------
function initHistory() {
  renderHistory();
}

function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

function addEntryToHistory(entry) {
  const list = getHistory();
  list.unshift(entry);
  saveHistory(list);
}

function renderHistory() {
  const container = $("#history-list");
  if (!container) return;

  const list = getHistory();
  if (!list.length) {
    container.innerHTML =
      '<p style="font-size:14px;color:#777;">No previous inspections saved yet.</p>';
    return;
  }

  container.innerHTML = "";
  list.forEach((item) => {
    const div = document.createElement("div");
    div.style.border = "1px solid #eee";
    div.style.borderRadius = "10px";
    div.style.padding = "8px 10px";
    div.style.marginBottom = "8px";
    div.style.fontSize = "13px";

    const date = new Date(item.date);
    const dateStr = isNaN(date.getTime())
      ? item.date
      : date.toLocaleString();

    div.innerHTML = `
      <div style="font-weight:600;">${item.address || "Unknown address"}</div>
      <div>Validator: ${item.validator || "Unknown"}</div>
      <div style="color:#666;">${dateStr}</div>
    `;
    container.appendChild(div);
  });
}
