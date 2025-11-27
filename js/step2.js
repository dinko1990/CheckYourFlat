// step2.js
// Logic for STEP 2 (inspection table):
// - Builds the comparison table using EXPOSE_DATA + inspection fields
// - Adds custom text rows and photo rows
// - Manages drag-and-drop row reordering
// - Validates mandatory fields in the Reality column
// This file is still large, but now isolated to table-related behavior.

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
  tr.dataset.fieldId = field.id; // used by mock auto-fill

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
let dragPlaceholder = null;

function makeRowDraggable(tr) {
  tr.draggable = true;
  tr.classList.add("row-draggable");

  // When dragging starts
  tr.addEventListener("dragstart", function (e) {
    dragSrcRow = tr;
    tr.classList.add("dragging");

    // Create placeholder row if needed
    if (!dragPlaceholder) {
      dragPlaceholder = document.createElement("tr");
      dragPlaceholder.className = "drag-placeholder";
      const td = document.createElement("td");
      td.colSpan = tr.children.length || 2;
      dragPlaceholder.appendChild(td);
    } else {
      const td = dragPlaceholder.firstElementChild;
      td.colSpan = tr.children.length || td.colSpan || 2;
    }

    // Insert placeholder after the dragged row initially
    if (tr.nextSibling) {
      comparisonBody.insertBefore(dragPlaceholder, tr.nextSibling);
    } else {
      comparisonBody.appendChild(dragPlaceholder);
    }

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ""); // required for Firefox
  });

  // While dragging over another row
  tr.addEventListener("dragover", function (e) {
    e.preventDefault();
    if (!dragSrcRow || tr === dragSrcRow || tr === dragPlaceholder) return;

    const tbody = tr.parentNode;
    const rect = tr.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const half = rect.height / 2;

    if (offset < half) {
      // Move placeholder above this row
      tbody.insertBefore(dragPlaceholder, tr);
    } else {
      // Move placeholder below this row
      if (tr.nextSibling) {
        tbody.insertBefore(dragPlaceholder, tr.nextSibling);
      } else {
        tbody.appendChild(dragPlaceholder);
      }
    }
  });

  // Prevent default drop behavior
  tr.addEventListener("drop", function (e) {
    e.preventDefault();
  });

  // When dragging ends (drop or cancel)
  tr.addEventListener("dragend", function () {
    tr.classList.remove("dragging");

    if (dragPlaceholder && dragPlaceholder.parentNode === comparisonBody && dragSrcRow) {
      // Move the dragged row into the placeholder position
      comparisonBody.insertBefore(dragSrcRow, dragPlaceholder);
      comparisonBody.removeChild(dragPlaceholder);
    }

    dragSrcRow = null;
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

// Auto-fill sample notes (mock)
// - Text fields: fill only empty Reality cells with SAMPLE_NOTES
// - Select fields: if Reality empty/unbekannt and EXPOSE_DATA has a matching value,
//                  set the select to that value
mockAutofillBtn.addEventListener("click", () => {
  const rows = comparisonBody.querySelectorAll("tr[data-row-type='field']");

  rows.forEach((tr) => {
    const fieldId = tr.dataset.fieldId;
    if (!fieldId) return;

    const realityCell = tr.querySelector("td.editable");
    if (!realityCell) return;

    const fieldCfg = EXPOSE_FIELDS[fieldId];

    // -------------------------
    // 1) SELECT FIELDS
    // -------------------------
    if (fieldCfg && fieldCfg.type === "select") {
      const selectEl = realityCell.querySelector("select");
      if (!selectEl) return;

      const current = (selectEl.value || "").trim();

      // Do NOT override user choice if they already picked something
      // (we treat "unbekannt" as the "empty" default)
      if (current && current !== "" && current !== "unbekannt") {
        return;
      }

      const exposeVal = (EXPOSE_DATA[fieldId] || "").trim();
      if (!exposeVal) return;

      // Try to find an option whose value OR visible text matches the exposé value
      const match = Array.from(selectEl.options).find((opt) => {
        const optVal = (opt.value || "").trim();
        const optText = (opt.textContent || "").trim();
        return optVal === exposeVal || optText === exposeVal;
      });

      if (match) {
        selectEl.value = match.value;
      }

      return; // we handled this row as a select-field
    }

    // -------------------------
    // 2) TEXT-LIKE FIELDS
    // -------------------------
    const span = realityCell.querySelector(".cell-editable");
    if (!span) return;

    const currentText = span.textContent.replace(/\s+/g, " ").trim();

    // Do NOT overwrite meaningful user input
    if (currentText && currentText !== "Write your inspection result…") {
      return;
    }

    const note = SAMPLE_NOTES[fieldId] || SAMPLE_NOTE_DEFAULT;
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
