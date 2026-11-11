# The Library — Design System & UI Specifications (`design.md`)

This document defines the visual identity, tokens, interactive 3D physics, component styling rules, and layout structures for **THE LIBRARY**.

---

## 1. Brand Identity & Aesthetic Philosophy

**THE LIBRARY** embodies a refined, intellectual, modern editorial aesthetic. It contrasts warm, textured tactile paper surfaces with deep forest green, charcoal ink, and subtle vermilion/emerald accents. It deliberately avoids generic SaaS layouts in favor of timeless editorial craft.

### 1.1 Color Tokens

```css
:root {
  /* Editorial Canvas & Paper Tokens */
  --paper: #F6F4EF;          /* Warm neutral paper sheet */
  --paper-subtle: #ECE9E1;   /* Subtle shelf/card backdrop */
  --paper-card: #FFFFFF;     /* Flat card surface */
  --ink: #191C1A;            /* Charcoal typography and crisp borders */
  --ink-muted: #646864;      /* Secondary metadata and captions */
  --rule: rgba(25, 28, 26, 0.15); /* 1px clean editorial dividing lines */

  /* Brand Accents */
  --forest: #1B382B;         /* Deep intellectual forest green (primary brand) */
  --forest-light: #244939;   /* Hover state for primary buttons */
  --forest-subtle: #EBF1ED;  /* Badges and active indicator chips */
  
  /* Status Colors */
  --status-available: #166534;   /* Emerald green */
  --status-borrowed: #B45309;    /* Warm amber */
  --status-overdue: #B91C1C;     /* Editorial vermilion */
  --status-reserved: #1D4ED8;    /* Academic cobalt */

  /* Animation Tokens */
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dark {
  --paper: #121513;
  --paper-subtle: #191D1B;
  --paper-card: #1F2421;
  --ink: #F2F4F2;
  --ink-muted: #8E948F;
  --rule: rgba(242, 244, 242, 0.12);
  --forest: #346850;
  --forest-light: #447F64;
  --forest-subtle: #182B21;
}
```

---

## 2. Typography: Plus Jakarta Sans

- **Mandatory Font Family:** `Plus Jakarta Sans`, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
- **Typographic Scale:**
  | Token | Size | Weight | Line Height | Usage |
  | :--- | :--- | :--- | :--- | :--- |
  | `editorial-hero` | 42px - 56px | 700 | 110% | Tactile shelf titles, homepage hero |
  | `heading-lg` | 24px - 28px | 600 | 120% | Modal headers, section titles |
  | `heading-md` | 18px - 20px | 600 | 130% | Book card titles, table headers |
  | `body-base` | 14px - 15px | 400 / 500 | 150% | General reading, descriptions |
  | `caption` | 12px - 13px | 500 | 140% | Metadata, authors, barcodes |
  | `label-badge` | 11px - 12px | 600 | 100% | Status chips, category indicators |

---

## 3. Public Tactile 3D Shelf Hero (First Interface)

Inspired by the physical presence of library archives and curated rare book collections:

```
+---------------------------------------------------------------------------------+
|                               [ THE LIBRARY ]                                   |
|                          CURATED VOLUMES • ARCHIVE                              |
|                                                                                 |
|   [ < ]     | | | | | |   +-----------------+   | | | | | |              [ > ]  |
|             | | | | | |   |                 |   | | | | | |                     |
|             | | | | | |   |   ACTIVE BOOK   |   | | | | | |                     |
|             | | | | | |   |    FRONT COVER  |   | | | | | |                     |
|             | | | | | |   |  (Turned in 3D) |   | | | | | |                     |
|             | | | | | |   +-----------------+   | | | | | |                     |
|                                                                                 |
|                        THE SILENT VALLEY (1958)                                 |
|                        LEON VASARI • FICTION                                    |
|                       [ 3 Copies Available ]                                    |
+---------------------------------------------------------------------------------+
```

### 3.1 3D Physical Geometry & Dimensions
- **Perspective:** `perspective: 2200px; perspective-origin: 50% 50%;` on the shelf viewport.
- **Stage Units:** Derived dynamically from `--H` (height of book):
  - `--H`: `min(46vh, 32vw)`
  - `--ws` (Spine Width): `H * 0.17`
  - `--d` (Cover Width / Depth): `H * 0.53`
  - `--gap`: `H * 0.035`
- **Faces:**
  - **Spine Face (`.sp`):** Width `--ws`, `transform: translateZ(calc(var(--d) / 2))`.
  - **Cover Face (`.cv`):** Width `--d`, `transform: rotateY(90deg) translateZ(calc(var(--ws) / 2))`, cast shadow `box-shadow: 0 30px 60px -28px rgba(20, 16, 10, 0.45)`.
- **Active 3D Turning:**
  - Openness `o` computed via smoothstep: `o = x^2 * (3 - 2x)`.
  - `rotateY(-90deg * o + tiltY * o)`: Box turns from spine to full face front cover.
  - `rotateZ(-4.5deg * o)`: The active book leans slightly on paper.
  - `translateZ(o * 0.2 * H)`: Pulled forward toward reader.

### 3.2 Dynamic Cursor & Tilt
- Pointer moves over active cover tilt it in 3D space (`tiltX: -6deg to +6deg`, `tiltY: -9deg to +9deg`).
- Custom cursor transitions to a deep forest green `"INSPECT / 見る"` disc with scale animation.

### 3.3 Paper Grain Overlay
- Fixed full-screen ambient SVG texture (`feTurbulence` fractalNoise, baseFrequency `.85`, 3 octaves) rendered with `mix-blend-mode: multiply` at opacity `0.06`, imparting authentic tactile paper weight across the interface.

---

## 4. Mandatory UI Rules (Operational Enforcement)

### 4.1 Popup Modals for All Create & Edit Operations
- **Rule:** Every Create and Edit flow MUST open in a centered popup modal overlay.
- **Strictly No Inline Editing** or separate edit page routes for forms.
- **Overlay Standards:** Dark semi-transparent backdrop blur (`rgba(15, 23, 42, 0.65)` with `backdrop-filter: blur(4px)`).
- **Structure:**
  - Clean header with semantic title (e.g. *"New Acquisition"*, *"Edit Copy #104"*).
  - Prominent top-right close icon (`✕`).
  - Compact inputs with intuitive placeholders.
  - Action footer: Aligned `Cancel` (ghost/outline) and `Save / Submit` (forest green primary).
  - Trapped focus and `Escape` key close listeners.

### 4.2 Explicit Delete Confirmation Modal
- **Rule:** Every destructive operation (deleting a book, deactivating a member, voiding a loan, removing a physical copy) MUST trigger an explicit **Delete Confirmation Modal**.
- **Content:**
  - Distinct warning header.
  - Exact target item name highlighted in bold.
  - Clear statement that the action is irreversible.
  - Default focused `Cancel` button and high-contrast destructive `Delete` button.
- **Never perform silent or one-click direct deletions.**

### 4.3 Flattened Cards (Strictly No Nested Cards)
- **Rule:** All cards MUST follow a single-level flat layout structure.
- **Zero Nested Cards:** Never place a `<Card>` inside another `<Card>`.
- Internal sections are organized through subtle background tints, 1px rules (`var(--rule)`), whitespace, and compact badges.

### 4.4 Remove Useless Labels & Descriptions
- Eliminate obvious text prefixes (e.g., avoid "Title:", "Author:", "ISBN:", "Status:", "Available:").
- Use typographic scale, icon pairings, and semantic badges (`Available`, `Borrowed`, `Overdue`) to communicate information immediately and cleanly.
