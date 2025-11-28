// step3.js
// Logic for STEP 3 (validator + PDF):
// - Validates the validator name field
// - Generates the PDF report using jsPDF
// - Controls the preview modal and final download confirmation

/* ========= STEP 3: VALIDATOR ========= */
const validatorInput = document.getElementById("validator");

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
  const timeStr =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");
  const baseName =
    (EXPOSE_DATA.adresse || "Flat").replace(/[^\w]+/g, "_") || "Flat";
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

  // Collect rows from the DOM
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

  // Render rows into PDF
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

  // NO SIGNATURE ANYMORE

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
  // Note: lastPdfBlob is left as-is so we can still download
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
  URL.revokeObjectURL(url);

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

