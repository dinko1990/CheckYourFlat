/// js/app.js

// Helper: safe query
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initMobileNav();
  initSteps();
  initFileUpload();
  initStepNavigation();
  initSignaturePad();
  initPdfModal();
  initCameraModal();
  initHistoryView();
});

// --- SIDEBAR TOGGLE ---
function initSidebar() {
  const sidebar = $("#sidebar");
  const toggle = $("#sidebar-toggle");
  if (!sidebar || !toggle) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  // nav buttons
  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });
}

function switchView(view) {
  // Very simple: show/hide history vs main steps
  const historyCard = $("#history-card");
  const stepCards = ["#step1-card", "#step2-card", "#step3-card"]
    .map((id) => $(id));

  if (view === "history") {
    historyCard.style.display = "block";
    stepCards.forEach((c) => c && (c.style.display = "none"));
  } else {
    historyCard.style.display = "";
    stepCards.forEach((c) => c && (c.style.display = ""));
  }

  $$(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  if (view === "logout") {
    // Placeholder for your logout logic
    alert("Logout clicked (implement your own logic)");
  }
}

// --- MOBILE NAV ---
function initMobileNav() {
  const toggle = $("#mobile-left-toggle");
  const menu = $("#mobile-left-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  $("#nav-new-expose")?.addEventListener("click", () => switchView("new"));
  $("#nav-history")?.addEventListener("click", () => switchView("history"));
  $("#nav-logout-mobile")?.addEventListener("click", () => switchView("logout"));
}

// --- HORIZONTAL STEPS BAR ---
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
    if (parseInt(s, 10) === step) {
      card.classList.remove("step-disabled");
    } else {
      // visually still available but "greyed out" if you want
      // here we leave them as-is; you can customize behavior
    }
  });

  $$("#steps-floating .steps-inner button").forEach((btn) => {
    const s = parseInt(btn.dataset.step, 10);
    btn.classList.toggle("active", s === step);
  });
}

// --- STEP 1: FILE UPLOAD ---
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
    // Placeholder: load your fake Berlin example here
    alert("Load Berlin example (implement your own logic)");
    unlockStep2();
  });

  function handleFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF.");
      return;
    }
    fileInfo.textContent = `Loaded: ${file.name}`;
    unlockStep2();
    // TODO: parse PDF & populate comparison table if needed
  }

  function unlockStep2() {
    const step2Card = $("#step2-card");
    if (step2Card) {
      step2Card.classList.remove("step-disabled");
    }
    const step2Button = document.querySelector(
      '#steps-floating .steps-inner button[data-step="2"]'
    );
    if (step2Button) {
      step2Button.disabled = false;
      step2Button.classList.add("unlocked");
    }
  }
}

// --- STEP NAVIGATION BUTTON (Step 2 -> Step 3) ---
function initStepNavigation() {
  const goStep3Btn = $("#go-step3-btn");
  if (!goStep3Btn) return;

  goStep3Btn.addEventListener("click", () => {
    const step3Card = $("#step3-card");
    if (step3Card) {
      step3Card.classList.remove("step-disabled");
    }

    const step3Button = document.querySelector(
      '#steps-floating .steps-inner button[data-step="3"]'
    );
    if (step3Button) {
      step3Button.disabled = false;
      step3Button.classList.add("unlocked");
      goToStep(3);
    }
  });
}

// --- SIGNATURE PAD (very basic) ---
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
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.putImageData(imageData, 0, 0);
  };

  // Initial size
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

// --- PDF MODAL (placeholder for jsPDF) ---
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
    const validatorName = validatorInput?.value?.trim() || "Unknown inspector";
    if (validatorLabel) validatorLabel.textContent = validatorName;
    if (validatorFooter)
      validatorFooter.textContent = `Validator: ${validatorName}`;
    modalBackdrop.classList.add("open");

    // Simple example PDF:
    const { jsPDF } = window.jspdf || {};
    if (jsPDF) {
      const doc = new jsPDF();
      doc.text("Check Your Flat – Inspection Report", 10, 20);
      doc.text(`Validator: ${validatorName}`, 10, 30);
      // TODO: Add real content + signature image from canvas
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      iframe.src = url;
    } else {
      iframe.src = "about:blank";
      console.warn("jsPDF not loaded");
    }
  };

  const closeModal = () => {
    modalBackdrop.classList.remove("open");
    iframe.src = "about:blank";
  };

  generateBtn.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  approveBtn?.addEventListener("click", () => {
    // If doc already created in openModal, you might re-generate and save.
    // Here we just show a placeholder.
    alert("Download approved (implement real download logic)");
    closeModal();
  });
}

// --- CAMERA MODAL (skeleton) ---
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

  // You will likely call openCameraModal() from a button in a "photo row"
  async function openCameraModal() {
    cameraModal.classList.add("open");
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      view.srcObject = stream;
    } catch (err) {
      console.error(err);
      alert("Unable to access camera");
    }
  }

  function closeCameraModal() {
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
    output.src = sensor.toDataURL("image/png");
    output.style.display = "block";
    // TODO: attach this data URL to the correct "photo row"
    closeCameraModal();
  });

  closeBtn.addEventListener("click", closeCameraModal);

  // Expose globally if you want to call from other buttons
  window.openCameraModal = openCameraModal;
}

// --- HISTORY (placeholder) ---
function initHistoryView() {
  const historyList = $("#history-list");
  if (!historyList) return;

  // Placeholder – implement localStorage-based history here
  historyList.innerHTML = `
    <p style="font-size: 14px; color: #777;">
      No history implementation yet. Use localStorage here (e.g. "cyf_inspections") 
      to render a list of previous inspections.
    </p>
  `;
}
