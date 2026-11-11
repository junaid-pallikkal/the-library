# Reusable Components Registry (`components.md`)

This document is the official registry and technical specification for all reusable UI components in **THE LIBRARY**.

---

## 1. Zero-Duplicate Protocol

Before writing or modifying any UI component:
1. **Consult the Component Catalog below:** Verify whether a registered component already covers the requirements.
2. **Reuse Existing Primitives:** If a component exists, import and compose it. **Do NOT build duplicates.**
3. **If Creating a New Component:**
   - Adhere strictly to [design.md](file:///d:/BUILDATHON/library/design.md) (Plus Jakarta Sans, popup modals for Create/Edit, confirmation modal for Delete, zero-nested flat cards, clean label-free inputs).
   - Implement the file under `src/components/common/`, `src/components/modals/`, or `src/components/ui/`.
   - **Immediately register it** in this file (`components.md`) and in [agents.md](file:///d:/BUILDATHON/library/agents.md).

---

## 2. Reusable Component Catalog

| Component Name | Category | File Path | Status | Purpose & Description |
| :--- | :--- | :--- | :--- | :--- |
| `Modal` | Overlay | `src/components/common/Modal.tsx` | Planned | Base accessible modal container with backdrop blur, trapped focus, and ESC listener. |
| `DeleteConfirmationModal` | Overlay | `src/components/modals/DeleteConfirmationModal.tsx` | Planned | Mandatory popup modal for confirming any destructive or deletion action. |
| `ItemFormModal` | Overlay | `src/components/modals/ItemFormModal.tsx` | Planned | Reusable popup modal for both Create and Edit operations with form slots. |
| `FlatCard` | Layout | `src/components/common/FlatCard.tsx` | Planned | Base flat card component strictly enforcing zero-nested card architecture. |
| `Button` | Controls | `src/components/common/Button.tsx` | Planned | Primary (forest green), secondary (paper), destructive, and ghost variants. |
| `IconButton` | Controls | `src/components/common/IconButton.tsx` | Planned | Minimal accessible icon-only button for edit, delete, and navigation triggers. |
| `Input` | Form | `src/components/common/Input.tsx` | Planned | Minimalist input with intuitive placeholders, omitting redundant text labels. |
| `Badge` | Feedback | `src/components/common/Badge.tsx` | Planned | Status/category chip for `Available`, `Borrowed`, `Overdue`, and genres. |
| `Tactile3DShelf` | Discovery | `src/components/hero/Tactile3DShelf.tsx` | Planned | Interactive 3D physical book shelf with kinetic physics, turned covers & tilts. |
| `BookCover3D` | 3D Display | `src/components/hero/BookCover3D.tsx` | Planned | Projected 3D book box with textured spine, front cover, and dynamic shading. |
| `GrainOverlay` | Atmosphere | `src/components/common/GrainOverlay.tsx` | Implemented | Ambient fixed paper texture overlay rendered via SVG turbulence filters. |
| `AppSidebar` | Navigation | `src/components/layout/AppSidebar.tsx` | Implemented | Persistent editorial navigation sidebar with live telemetry and quick role selector. |
| `AuthModal` | Overlay | `src/components/modals/AuthModal.tsx` | Implemented | Gateway popup for system authentication (Admin/Librarian) and patron membership registration. |
| `DataTable` | Data | `src/components/tables/DataTable.tsx` | Planned | TanStack Table wrapper with search, column sorting, pagination, and clean borders. |

---

## 3. Detailed Component Specifications

### 3.1 `Modal`
- **File:** `src/components/common/Modal.tsx`
- **Role:** Base container for popup overlays (Create, Edit, Inspect).
- **Props:**
  ```typescript
  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  }
  ```
- **Constraints:** Enforces backdrop blur, focus trap, and clean header with close button. Zero nested cards allowed inside children.

### 3.2 `DeleteConfirmationModal`
- **File:** `src/components/modals/DeleteConfirmationModal.tsx`
- **Role:** Enforces explicit user confirmation before any record or asset is deleted.
- **Props:**
  ```typescript
  interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    itemName: string;
    itemType?: string; // e.g. "Book Title", "Physical Copy", "Member"
    isDeleting?: boolean;
  }
  ```

### 3.3 `FlatCard`
- **File:** `src/components/common/FlatCard.tsx`
- **Role:** Container for book items, member summaries, and stats.
- **Constraints:** Must NEVER wrap another card. Renders clean 1px border (`var(--rule)`), subtle paper background, and rounded corners (`radius-md`).

### 3.4 `Tactile3DShelf`
- **File:** `src/components/hero/Tactile3DShelf.tsx`
- **Role:** Public homepage hero presenting a continuous 3D carousel of books standing spine-out, with the active volume physically rotated 90° toward the viewer.
- **Physics:** Driven by `requestAnimationFrame` with exponential spring smoothing (`1 - e^(-k*dt)`), cursor hover lift, and dynamic mouse tilt (`tiltX`, `tiltY`).
