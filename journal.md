# Development Journal — StockFlow Inventory Management System

**Date:** September 3, 2026  
**Project:** StockFlow (Simple Inventory Management System)  
**Developer:** Pair-Programming Assistant & Developer  
**Status:** Completed & Version-Controlled (`master` branch)

---

## 1. What I Worked On

### Core Application Architecture & Setup
- **Single-Page Application (SPA) Structure:** Designed a modular 4-view layout (`Dashboard`, `Products`, `Stock Control`, `Sales & Orders`) within a semantic [index.html](file:///c:/Users/HP/Desktop/Inventory/index.html).
- **CSS Design System:** Created a pure CSS design system in [style.css](file:///c:/Users/HP/Desktop/Inventory/style.css) using CSS Variables for colors, shadows, border radiuses, typography, and responsive grid/flexbox layouts without external UI frameworks.
- **State & Storage Layer:** Developed persistent storage helpers in [script.js](file:///c:/Users/HP/Desktop/Inventory/script.js) using the Web Storage API (`localStorage`) with sample demo data seeding on initial load.

### Feature Implementation
- **Dashboard View:**
  - Real-time KPI cards: Total Products, Units in Stock, Total Sales Revenue ($), and Low Stock Alerts.
  - Dynamic Low Stock Alert box with direct single-click restock prompts.
  - Recent Sales activity table displaying latest transactions.
- **Product Management (CRUD):**
  - Add & Edit modal dialogs with input validation (Name, Category, Price, Quantity, Low-stock Threshold).
  - Custom delete confirmation modal to prevent accidental data loss.
  - Live multi-parameter filtering: text search (name/category), category dropdown, and stock status filter (*In Stock*, *Low Stock*, *Out of Stock*).
- **Stock Management View:**
  - Rapid quantity adjusters (`+1`, `-1`, `+5`, `-5`) with boundary protection (cannot go below 0).
  - Custom stock override input form per product.
  - Color-coded badges reflecting real-time threshold status.
- **Sales & Orders View:**
  - Point-of-Sale (POS) form with product selection, available stock validation, and live price/total calculation.
  - Automatic inventory deduction upon sale completion.
  - Persistent Sales History ledger with clear-history capability.
- **UI & Feedback System:**
  - Floating slide-in Toast Notification system for non-blocking feedback (success, warning, error, info).
  - Responsive mobile drawer menu and keyboard accessibility (`Escape` key to close modals).

### Documentation & Version Control
- Created an initial Git repository and completed the initial commit.
- Authored a comprehensive case study [README.md](file:///c:/Users/HP/Desktop/Inventory/README.md) detailing target audience, architectural choices, and run instructions.

---

## 2. What I Chose (Architectural & Design Decisions)

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| **Styling Strategy** | Vanilla CSS (CSS Variables) | Avoided Tailwind, Bootstrap, or build dependencies to keep the project 100% beginner-friendly and instantly runnable. |
| **Data Persistence** | `localStorage` with Demo Seeding | No server or backend database needed. Auto-seeds realistic sample items so the app is immediately useful on first launch. |
| **Dialog Handling** | Custom HTML/CSS Modals | Replaced native browser `alert()` and `confirm()` with custom accessible modals for a polished, consistent user experience. |
| **Stock Workflow** | Dedicated "Stock Control" View | Separated quick stock changes from full product editing to streamline daily warehouse/retail adjustments. |
| **Feedback Mechanism** | Floating Toast Notifications | Provided non-intrusive, auto-dismissing visual cues for all user actions without freezing the page. |
| **Security / Sanitization** | `escapeHtml()` Utility | Escaped user inputs rendered into innerHTML to protect against basic XSS injection. |

---

## 3. What I Parked (Deferred for Future Iterations)

To keep the application lightweight, beginner-friendly, and strictly within scope, the following features were intentionally parked:

- **CSV / Excel Export & Import:**
  - *Why parked:* Exporting sales history or bulk-importing products via CSV adds file parser dependencies. Kept for a future enhancement sprint.
- **Barcode & QR Code Scanner:**
  - *Why parked:* Camera API integration and barcode decoding libraries would overcomplicate the vanilla JavaScript learning experience.
- **Multi-Currency & Tax Engine:**
  - *Why parked:* Hardcoded standard USD formatting (`$`) was sufficient for the initial version. Dynamic currency selection and tax calculation rules were deferred.
- **Dark / Light Theme Toggle:**
  - *Why parked:* CSS variables were established to make theme switching straightforward in the future, but adding toggle state management was deferred to focus on core inventory features.
- **Backend & Authentication (Node.js / Express / MongoDB):**
  - *Why parked:* Explicit requirement to maintain an offline, zero-backend, client-side only architecture.

---

## 4. Next Steps & Recommendations

1. **Sprint 2 Candidate:** Add a "Export to CSV" button on the Sales History and Products tables using client-side `Blob` downloads.
2. **Sprint 3 Candidate:** Implement dark mode support utilizing the existing CSS variable structure.
3. **Sprint 4 Candidate:** Add low-stock threshold email/browser push notifications via Notification API.
