// step3.js
// Logic for STEP 3: Legal & Finance
// - Manages "Does client already have legal/finance advisor?" toggles
// - Provides helper validation used by step4.js (PDF generation)
// - Exposes:
//     clearLegalFinanceErrors()
//     validateLegalFinance()  -> { valid, needsLegalContact, needsFinanceContact }
// - Also defines LEGAL_AGENT and FINANCE_AGENT data used in the PDF

/* ========= LEGAL & FINANCE DOM ========= */
const legalToggleGroup = document.getElementById("legal-toggle-group");
const financeToggleGroup = document.getElementById("finance-toggle-group");
const legalYesInput = document.getElementById("hasLegalYes");
const legalNoInput = document.getElementById("hasLegalNo");
const financeYesInput = document.getElementById("hasFinanceYes");
const financeNoInput = document.getElementById("hasFinanceNo");

/* ========= RECOMMENDED CONTACTS (FAKE DATA) ========= */

const LEGAL_AGENT = {
  name: "RAin Julia Hartmann",
  firm: "Hartmann & Partner Rechtsanwälte mbB",
  phone: "+49 30 1234 5678",
  email: "j.hartmann@hartmann-partner.de",
  note: "Spezialisiert auf Miet- und Wohnungseigentumsrecht in Berlin."
};

const FINANCE_AGENT = {
  name: "Markus Vogel",
  firm: "Vogel Finanzberatung",
  phone: "+49 30 9876 5432",
  email: "markus.vogel@vogel-finanz.de",
  note: "Unabhängige Finanzierungsberatung für Wohnimmobilien."
};

/* ========= PUBLIC HELPERS ========= */

/**
 * Clears only the Legal/Finance error state on the toggle pills.
 * Used by step4.js before running full validation.
 */
function clearLegalFinanceErrors() {
  if (legalToggleGroup) {
    legalToggleGroup.classList.remove("lf-error");
  }
  if (financeToggleGroup) {
    financeToggleGroup.classList.remove("lf-error");
  }
}

/**
 * Validates Legal & Finance toggles.
 * Returns:
 *  {
 *    valid: boolean,
 *    needsLegalContact: boolean,
 *    needsFinanceContact: boolean
 *  }
 *
 * This does NOT touch validator or table fields – only Step 3 toggles.
 */
function validateLegalFinance() {
  clearLegalFinanceErrors();

  let valid = true;

  const hasLegalYes = legalYesInput && legalYesInput.checked;
  const hasLegalNo = legalNoInput && legalNoInput.checked;
  const hasFinanceYes = financeYesInput && financeYesInput.checked;
  const hasFinanceNo = financeNoInput && financeNoInput.checked;

  // Validate legal
  if (!hasLegalYes && !hasLegalNo) {
    valid = false;
    if (legalToggleGroup) {
      legalToggleGroup.classList.add("lf-error");
      legalToggleGroup.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Validate finance
  if (!hasFinanceYes && !hasFinanceNo) {
    valid = false;
    if (financeToggleGroup) {
      // Scroll only if legal didn't already scroll
      if (valid === false && !hasLegalYes && !hasLegalNo) {
        // already scrolled to legal
      } else {
        financeToggleGroup.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      financeToggleGroup.classList.add("lf-error");
    }
  }

  return {
    valid,
    needsLegalContact: !!hasLegalNo,
    needsFinanceContact: !!hasFinanceNo
  };
}

const goStep4Btn = document.getElementById("go-step4-btn");

if (goStep4Btn) {
  goStep4Btn.addEventListener("click", () => {
    // Use your existing Legal/Finance validation
    const lfResult = validateLegalFinance(); // from step3.js
    if (!lfResult.valid) return; // don't proceed if toggles not answered

    unlockStep(4);
    const step4Card = document.getElementById("step4-card");
    if (step4Card) {
      step4Card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

