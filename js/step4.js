// step4.js
// Logic for STEP 4: validator + PDF + modal
// - Uses validateLegalFinance() from step3.js (mandatory step)
// - Validates the validator name field
// - Validates mandatory inspection fields (from step2.js)
// - Generates the PDF report using jsPDF
// - Adds a Legal/Finance "business card" at the bottom if client has no advisor
// - Add T&C
// - Controls the preview modal and final download confirmation

/* ========= STEP 4: VALIDATOR ========= */
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

/* ========= OPTIONAL LOGO LOADING FOR HEADER ========= */

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

let legalCardImageData = null;
let financeCardImageData = null;

// Load legal card
(function loadLegalCard() {
    const img = new Image();
    img.src = "img/legal_card.png";   // ← PATH HERE
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        let c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d").drawImage(img, 0, 0);
        legalCardImageData = c.toDataURL("image/png");
    };
})();

// Load finance card
(function loadFinanceCard() {
    const img = new Image();
    img.src = "img/finance_card.png";  // ← PATH HERE
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        let c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d").drawImage(img, 0, 0);
        financeCardImageData = c.toDataURL("image/png");
    };
})();


/* ========= VALIDATION HELPERS ========= */

function clearValidationErrors() {
  // Clear validator field error
  if (validatorInput) {
    validatorInput.classList.remove("field-error");
  }

  // Clear Legal/Finance errors (defined in step3.js)
  if (typeof clearLegalFinanceErrors === "function") {
    clearLegalFinanceErrors();
  }

  // Clear mandatory row errors from Step 2
  comparisonBody.querySelectorAll("tr.mandatory-row").forEach((tr) => {
    tr.classList.remove("row-error");
    const cell = tr.querySelector("td.editable");
    if (cell) cell.classList.remove("field-error");
  });
}

/* ========= GENERATE PDF & OPEN MODAL ========= */

generateBtn.addEventListener("click", () => {
  clearValidationErrors();
  let hasError = false;

  // 1) Validate Legal/Finance (Step 3)
  let needsLegalContact = false;
  let needsFinanceContact = false;

  if (typeof validateLegalFinance === "function") {
    const lfResult = validateLegalFinance();
    if (!lfResult.valid) {
      hasError = true;
    }
    needsLegalContact = !!lfResult.needsLegalContact;
    needsFinanceContact = !!lfResult.needsFinanceContact;
  }

  // 2) Validate validator name (Step 4)
  const validator = validatorInput.value.trim();
  if (!validator) {
    hasError = true;
    validatorInput.classList.add("field-error");
    validatorInput.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // 3) Validate mandatory fields in inspection table (Step 2)
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
  comparisonBody.querySelectorAll("tr").forEach((tr) => {
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
      if (span) {
        reality = (span.textContent || "").replace(/\s+/g, " ").trim();
      }
      if (select && select.value) {
        reality = select.value;
      }
    }

    // Only keep rows with actual content (Reality text OR photo)
    const hasContent = (reality && reality.length > 0) || !!photoData;
    if (!hasContent) {
      return;
    }

    rows.push({ type, desc, reality, photoData });
  });

  // Render rows into PDF
  rows.forEach((row) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    if (row.desc) {
      doc.setFont("helvetica", "bold");
      doc.text("• " + row.desc, 12, y);
      y += lineHeight;
    }

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

/* ========= LEGAL / FINANCE BUSINESS CARD (AFTER CONTENT) ========= */
if (needsLegalContact || needsFinanceContact) {

    const hasLegal = !!legalCardImageData;
    const hasFinance = !!financeCardImageData;

    if (hasLegal || hasFinance) {

        const pageWidth = 210;
        const cardWidth = 60;    // your PNGs height/width in mm
        const cardHeight = 60;
        const gap = 12;          // space between table and cards

        // Move down a little from last printed y
        y += gap;

        // If cards exceed page bottom → new page
        if (y + cardHeight + 10 > 297) {
            doc.addPage();
            y = 20;
        }

        let legalX = null;
        let financeX = null;

        // Layout rules
        if (needsLegalContact && needsFinanceContact && hasLegal && hasFinance) {
            // Two centered cards
            const totalWidth = cardWidth * 2 + 10;
            const startX = (pageWidth - totalWidth) / 2;
            legalX = startX;
            financeX = startX + cardWidth + 10;

        } else if (needsLegalContact && hasLegal) {
            legalX = (pageWidth - cardWidth) / 2;

        } else if (needsFinanceContact && hasFinance) {
            financeX = (pageWidth - cardWidth) / 2;
        }

        // LEGAL card
        if (needsLegalContact && hasLegal && legalX !== null) {
            doc.addImage(legalCardImageData, "PNG", legalX, y, cardWidth, cardHeight);
            doc.link(legalX, y, cardWidth, cardHeight, {
                url: LEGAL_AGENT?.url || "https://en.jslegal.de/"
            });
        }

        // FINANCE card
        if (needsFinanceContact && hasFinance && financeX !== null) {
            doc.addImage(financeCardImageData, "PNG", financeX, y, cardWidth, cardHeight);
            doc.link(financeX, y, cardWidth, cardHeight, {
                url: FINANCE_AGENT?.url || "https://fin-consult.example/"
            });
        }

        // Move y after cards for T&C
        y += cardHeight + 10;
    }
}


/* ========= TERMS & CONDITIONS (GERMAN – SMALL FOOTER) ========= */
doc.addPage();

doc.setFont("helvetica", "bold");
doc.setFontSize(9);
doc.setTextColor(60, 40, 80);

doc.text("Hinweis & Haftungsausschluss", 12, 265);

doc.setFont("helvetica", "normal");
doc.setFontSize(7);
doc.setTextColor(60, 40, 80);

const termsDE = [
  "Dieser Bericht dient ausschließlich Informationszwecken und basiert auf den zum Zeitpunkt der Begehung",
  "sichtbaren und zugänglichen Bereichen. Es wird keine Gewähr für Vollständigkeit, Genauigkeit oder zukünftige",
  "Entwicklungen des Objektzustands übernommen.",
  "",
  "Nicht einsehbare Bauteile, versteckte Mängel sowie technische Anlagen, die während der Begehung nicht",
  "getestet wurden, sind vom Umfang ausgeschlossen. Dieser Bericht ersetzt keine rechtliche, finanzielle oder",
  "technische Beratung.",
  "",
  "Der Auftraggeber ist verpflichtet, alle Angaben eigenständig zu prüfen und bei Bedarf qualifizierte",
  "Fachpersonen hinzuzuziehen. Weder der Inspektor noch Check Your Flat haften für Entscheidungen oder",
  "Schäden, die aus der Nutzung dieses Berichts entstehen.",
  "",
  "Mit Verwendung dieses Dokuments erkennt der Auftraggeber diese Bedingungen an."
];

let yPos = 272;
termsDE.forEach(line => {
  doc.text(line, 12, yPos);
  yPos += 4;
});


  const pdfBlob = doc.output("blob");
  lastPdfBlob = pdfBlob;

  const url = URL.createObjectURL(pdfBlob);
  pdfFrame.src = url;
  modalValidatorLabel.textContent = validator;
  modalValidatorFooter.textContent = "Check the PDF. If OK, approve & download.";
  modalBackdrop.classList.add("visible");
});




/* ========= MODAL CONTROL ========= */

function closeModal() {
  modalBackdrop.classList.remove("visible");
  pdfFrame.src = "";
  // pdfBlob is revoked on actual download
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
