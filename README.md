🧭 README – Project Structure & Refactor Overview

This project was originally built as a single-page web application with all logic contained in one JavaScript file (main.js) and one CSS file (style.css).
To improve maintainability, clarity, and scalability, the codebase has been modularized into multiple JavaScript and CSS files.

This README explains:

Project Purpose

Folder Structure

JS Architecture

CSS Architecture

How Steps Work

How to Extend / Modify the App

📌 1. Project Purpose

This application generates a PDF inspection report based on:

Uploaded or sample exposé data

A customizable inspection table (step 2)

Photos & camera captures

A signature (step 3)

PDF preview and export

Local history of generated reports

The app is fully client-side (no backend).

📁 2. Folder Structure
refactored_app/
│
├── index.html               # Main HTML file (links split JS & CSS)
│
├── css/
│   ├── base.css             # Global reset, typography, colors
│   ├── layout.css           # Page layout: sidebar, cards, hero, steps bar
│   ├── components.css       # Tables, modals, camera, signature, photo blocks
│   ├── responsive.css       # Media queries only
│   └── style.original.css   # Unmodified backup of the original CSS
│
└── js/
    ├── core.js              # Navigation, step gating, app config, shared data
    ├── step1.js             # Upload area + sample exposé (Step 1)
    ├── step2.js             # Inspection table logic (Step 2)
    ├── step3.js             # Signature + PDF generation (Step 3)
    ├── history.js           # Report history (localStorage)
    └── main.original.js     # Unmodified backup of the original JS


Each JS file starts with a descriptive comment block explaining its responsibility.

🧱 3. JavaScript Architecture

The JavaScript has been split into functional modules.

core.js – Shared Logic & App Initialization

Handles:

App version

jsPDF access

Sidebar navigation

Mobile navigation menu

Step gating (unlocking step 2 & 3)

Shared exposé data structure

Mandatory fields list

Sample notes (mock autofill)

Global utility functions

This file essentially contains all logic that is not specific to a single step.

step1.js – STEP 1: Upload / Sample Exposé

Handles:

Drag & drop upload

File input

“Make the magic ✨” button

“Fake Berlin exposé – Kantstraße 123”

Reading exposé data

Unlocking Step 2

step2.js – STEP 2: Inspection Table

This is the largest module.

Handles:

Building the inspection table

Adding predefined rows (from inspectionFields)

Adding custom text rows

Adding photo rows

Uploading or capturing photos (camera modal)

Rotating photos (via canvas)

Drag & drop row reordering

Mandatory field validation

Auto-fill (mock sample notes)

Resetting to default table

Unlocking Step 3

This step produces the full “table data” for the final PDF.

step3.js – STEP 3: Signature + PDF

Handles:

Signature canvas resizing + drawing

Clearing signature

PDF generation using jsPDF:

Meta data

Inspection table

Photos

Signature

PDF preview modal (Approve / Cancel)

Finishes by triggering history save.

history.js – Local History

Handles:

Saving PDF metadata to localStorage

Rendering history list

Clicking “History” in the sidebar

Clearing history (if needed)

Populating history section on load

🎨 4. CSS Architecture

CSS was split based on professional minimal-split architecture:

base.css

Global CSS reset

Typography

Colors

Body background

No component or layout styling

layout.css

Sidebar

Navigation items

Main content grid

Hero section

Step bar

Card containers

Covers the physical structure of the page.

components.css

Contains all functional UI components, such as:

Inspection table

Drag & drop styles

Row highlight animations

Custom rows

Photo previews

Photo actions buttons

Camera modal

PDF modal

Signature block

These styles apply independent of layout.

responsive.css

Contains only media queries:

≤ 960px

≤ 720px

≤ 480px

Everything responsive is in one place.

🚦 5. How the Steps Work Together

Below is the general flow:

STEP 1 → STEP 2 → STEP 3
Step 1 Output:

Parsed exposé data → stored globally

Step 2 Output:

Inspection rows (default + custom + photos)

Mandatory validation

Step 3 Output:

Validator name

Signature image

Final PDF

When PDF is approved:

A history entry is created

🧩 6. How to Extend / Modify the App
To add new inspection fields:

Edit the array in core.js:

const inspectionFields = [
  { title: "Küche", exposeKey: "kitchen" },
  ...
];

To add new sample exposés:

Edit the object in core.js:

const EXPOSE_DATA = {
  // ...
};

To change PDF layout:

Edit the generatePDF() section in step3.js.

To add new UI components:

Put the CSS in:

layout → if it affects the page structure

components → if it’s a functional block

responsive → if it’s mobile-specific

✔️ Summary

This refactoring keeps everything functioning exactly the same, while:

Making each step clearly separated

Keeping responsibilities isolated

Maintaining identical UI

Allowing future expansions

Making the code easy to navigate

If you need:

A TypeScript version

Further modular JS (e.g., splitting step2.js into submodules)

Full component-based CSS

A build system (Vite / Webpack)

Or TypeScript-based PDF generator

Just tell me — happy to help!
