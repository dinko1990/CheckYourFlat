/* ========= LEGAL / FINANCE BUSINESS CARD AT BOTTOM ========= */
if (
  (needsLegalContact || needsFinanceContact) &&
  (typeof LEGAL_AGENT !== "undefined" || typeof FINANCE_AGENT !== "undefined")
) {

  // Add new page for clean layout
  doc.addPage();

  const pageHeight = 297;
  const margin = 12;

  const cardHeight = 40;
  const cardX = margin;
  const cardWidth = 210 - margin * 2;
  const cardY = pageHeight - cardHeight - margin;

  // Draw BORDER ONLY using your gradient
  // Approximation: left half yellowish → right half pink, visually blending
  const leftFill = "#ffc977";  // warm yellow
  const rightFill = "#ff88ae"; // rose-pink

  const borderThickness = 1.2;

  // LEFT border part
  doc.setDrawColor(leftFill);
  doc.setLineWidth(borderThickness);
  doc.roundedRect(cardX, cardY, cardWidth / 2, cardHeight, 3, 3, "S");

  // RIGHT border part
  doc.setDrawColor(rightFill);
  doc.setLineWidth(borderThickness);
  doc.roundedRect(cardX + cardWidth / 2, cardY, cardWidth / 2, cardHeight, 3, 3, "S");

  // White inner card
  doc.setFillColor(255, 255, 255);
  doc.rect(cardX + borderThickness, cardY + borderThickness,
           cardWidth - borderThickness * 2,
           cardHeight - borderThickness * 2,
           "F");

  // Title depends on which contact(s) appear
  let title = "";
  if (needsLegalContact && needsFinanceContact)       title = "Legal & Finance support";
  else if (needsLegalContact)                         title = "Legal support";
  else if (needsFinanceContact)                       title = "Finance support";

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40, 20, 60);
  doc.text(title, cardX + 6, cardY + 10);

  // Body text
  let textY = cardY + 17;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40, 20, 60);

  // LEGAL
  if (needsLegalContact && typeof LEGAL_AGENT !== "undefined") {
    doc.text(`${LEGAL_AGENT.name} – ${LEGAL_AGENT.firm}`, cardX + 6, textY);
    textY += 4;
    doc.text(`Phone: ${LEGAL_AGENT.phone}`, cardX + 6, textY);
    textY += 4;
    doc.text(`Email: ${LEGAL_AGENT.email}`, cardX + 6, textY);
    textY += 4;

    const legalNoteLines = doc.splitTextToSize(LEGAL_AGENT.note, cardWidth - 12);
    doc.text(legalNoteLines, cardX + 6, textY);
    textY += legalNoteLines.length * 4 + 2;

    if (needsFinanceContact) textY += 2;
  }

  // FINANCE
  if (needsFinanceContact && typeof FINANCE_AGENT !== "undefined") {
    doc.text(`${FINANCE_AGENT.name} – ${FINANCE_AGENT.firm}`, cardX + 6, textY);
    textY += 4;
    doc.text(`Phone: ${FINANCE_AGENT.phone}`, cardX + 6, textY);
    textY += 4;
    doc.text(`Email: ${FINANCE_AGENT.email}`, cardX + 6, textY);
    textY += 4;

    const finNoteLines = doc.splitTextToSize(FINANCE_AGENT.note, cardWidth - 12);
    doc.text(finNoteLines, cardX + 6, textY);
  }
}
