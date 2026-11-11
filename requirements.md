# The Library — Master Requirements Specification (`requirements.md`)

## 1. Product Vision & Ecosystem Architecture
**THE LIBRARY** is a complete, production-grade digital library ecosystem engineered for real-world operations. It bridges two distinct, high-impact experiences:

1. **Public Library Website & Tactile Discovery:** An intellectual, editorial public portal featuring a tactile **3D Interactive Book Shelf Hero** (inspired by physical book spines, 3D turned covers, smooth kinetic physics, and editorial typography), comprehensive book catalog exploration, real-time availability checks, member authentication, and online borrowing/reservation requests.
2. **Internal Library Management System (LMS):** A robust, role-aware operational suite for **Administrators** and **Librarians** managing multi-copy physical inventory, circulation desk operations (borrowing & returns), an atomic approval center, reservation priority queues, overdue calculations, immutable audit logs, and analytical reports.

---

## 2. User Roles & Permission Matrix

Permissions are enforced at the database layer using Supabase Row Level Security (RLS) and server functions—never purely through client-side conditionals.

| Capability / Module | Member (Public/Patron) | Librarian (Staff) | Administrator (Superuser) |
| :--- | :---: | :---: | :---: |
| **Browse Catalog & Realtime Availability** | ✅ | ✅ | ✅ |
| **Tactile 3D Shelf Discovery** | ✅ | ✅ | ✅ |
| **Request Borrowing / Reserve Unavailable** | ✅ | ❌ (Processed at desk) | ❌ |
| **Manage Personal Profile & Borrow History** | ✅ (Self only) | ❌ | ❌ |
| **Catalog Management (Books, Authors, Categories)** | ❌ | ✅ | ✅ |
| **Physical Copies & Barcode Management** | ❌ | ✅ | ✅ |
| **Desk Issue & Return Processing** | ❌ | ✅ | ✅ |
| **Approval Center (Borrow / Renew Requests)** | ❌ | ✅ | ✅ |
| **Reservation Queue Allocation** | ❌ | ✅ | ✅ |
| **Staff & Librarian Account Provisioning** | ❌ | ❌ | ✅ |
| **Library Rules, Fines & Policy Configuration** | ❌ | ❌ | ✅ |
| **Full Operational Analytics & CSV Exports** | ❌ | Restricted | ✅ |
| **System Immutable Audit Logs** | ❌ | View Activity Only | Full Access |

---

## 3. Experience 1: Public Website & Discovery

### 3.1 Tactile 3D Book Shelf Hero (Front Page First Interface)
- **Concept:** Warm editorial paper canvas with an endless 3D shelf of cloth/paperbound books standing side by side, spine out.
- **Active Book Interaction:** The selected featured book pulls out forward from the shelf, physically rotates in 3D (`rotateY(-90deg) -> 0deg`), tilts gently toward the cursor (`tiltX`, `tiltY`), and reveals its illustrated front cover with soft drop shadow.
- **Seamless Kinetic Navigation:** Click any spine, arrows, keyboard (Left/Right), drag, or scroll to slide the shelf with spring physics (`dt` easing). In passing, books turn smoothly between spine and cover states.
- **Masked Typography Transitions:** Book title, author, category, and publication details rise through hidden overflow masks whenever the active title changes.
- **Detail Overlay ("Inspect / Read"):** Clicking the active cover or enter key expands an editorial sheet revealing synopsis, copy availability, author biography, and one-click "Borrow / Reserve" modal action.

### 3.2 Book Catalog & Search Engine
- **Search Criteria:** Instant full-text and trigram search across Title, Subtitle, Author, ISBN, Category, and Tags.
- **Filtering & Facets:** Multi-select filtering by Category/Genre, Availability status (`In Stock`, `All Copies Borrowed`), Language, and Publication Year range.
- **Views & Pagination:** Switchable Grid and List layouts with server-side pagination (12/24/48 items per page).

### 3.3 Book Details & Availability Breakdown
- **Title Information:** Cover art, publication metadata, publisher, edition, synopsis, shelf location tag.
- **Physical Copy Transparency:** Real-time badge counter of `Available Copies` vs `Total Physical Copies`.
- **Member Action Gateway:**
  - If copies available: Triggers **Borrow Request Modal**.
  - If all copies borrowed: Triggers **Reservation Queue Modal** displaying current queue length and estimated availability.

### 3.4 Member Portal & Authentication
- **Supabase Auth:** Email/password registration, magic link login, password recovery.
- **Member Dashboard:** Flat card overview of currently borrowed books, upcoming due dates with countdown indicators, pending requests, and historical loans.

---

## 4. Experience 2: Internal Library Management System (LMS)

### 4.1 Executive & Operational Dashboard
- **Key Metrics (Real Database Queries):**
  - Total Book Titles, Total Physical Copies, Available Copies, Active Borrowings, Reserved Copies, Overdue Items, Damaged/In Maintenance, Active Members.
- **Visual Analytics:** Monthly circulation trends (borrowings vs returns), top borrowed books, popular genres, and stock health.
- **Activity Stream:** Real-time feed of recent desk issues, returns, and approvals.

### 4.2 Book Title & Physical Copy Management
- **Titles vs. Copies Separation:** One book title record links to multiple distinct physical copies.
- **Title Form (Popup Modal):** Title, Subtitle, ISBN, Authors (multi-select/create), Categories, Publisher, Edition, Year, Language, Shelf Location, Cover Image upload.
- **Physical Copy Engine:**
  - Each copy has a unique Barcode / Asset ID, acquisition date, condition (`Excellent`, `Good`, `Fair`, `Damaged`), and status (`Available`, `Borrowed`, `Reserved`, `Maintenance`, `Lost`, `Retired`).
  - Barcode lookup modal for rapid copy verification.

### 4.3 Circulation Desk: Issue & Return Processing
- **Issue Workflow:**
  1. Search and select verified member (verifies membership is active and under borrowing limit).
  2. Scan or select available physical copy.
  3. Automatically calculate due date based on configurable library rules (e.g., 14 days).
  4. Atomic PostgreSQL transaction issues loan, updates copy status to `Borrowed`, and logs audit entry.
- **Return Workflow:**
  1. Scan barcode or look up transaction.
  2. Assess returned condition (`Good`, `Damaged`, `Requires Repair`).
  3. Calculate overdue fines if returned past due date.
  4. Automatically check reservation queue: if reserved, assign to next queue patron; otherwise return to `Available`.

### 4.4 Central Approval Hub
- Unified desk review for:
  - **Online Borrowing Requests**
  - **Loan Renewal Requests**
  - **Hold / Reservation Requests**
- Concurrency-safe atomic approvals preventing double-assignment of physical copies.

### 4.5 Reservation Priority Queue
- FIFO reservation queue per title when zero physical copies are available.
- Automated hold period (e.g., 48 hours) upon book return before auto-releasing to next member in line.

### 4.6 Inventory & Stock Auditing
- Comprehensive condition reports, loss tracking, retirement logs, and shelf reconciliation.

### 4.7 Immutable Audit Logs
- Tamper-proof operational ledger tracking Actor ID, Role, Action, Target Entity, Timestamp, and Before/After delta JSON.

---

## 5. UI & Design System Directives (Zero-Violation Rules)

All modules must strictly enforce the operational rules defined in `design.md` and `agents.md`:

1. **Popup Modals for Create and Edit:**
   - Every creation (Add Book, Add Copy, New Member, Issue Loan, Reserve) and edit operation MUST open in a centered popup modal with backdrop blur.
   - Strictly NO inline editing or separate page navigations for form operations.
2. **Mandatory Delete Confirmation Modal:**
   - Any destructive action (deleting a book, deactivating a member, canceling a loan/reservation) MUST trigger an explicit Delete Confirmation Modal specifying the item name.
3. **Flattened Cards (Strictly No Nested Cards):**
   - Book cards, member rows, and inventory items use flat single-container layouts with badges, dividers, and typography contrast—never cards inside cards.
4. **Clean Labels:**
   - Eliminate redundant text prefixes (avoid "Title:", "Author:", "Status:"). Use semantic badges and typographic scale.
5. **Typography & Palette:**
   - Typeface: **Plus Jakarta Sans**.
   - Palette: Deep Forest Green (`#1b382b`), warm neutral paper (`#f6f4ef`), charcoal ink (`#191c1a`), with emerald and amber accents.
