# PRISM — Next-Generation Exam Workspace & Past-Paper Solving Deck

PRISM is a keyboard-first, physical-grade past-paper examination platform designed with deep pitch-black (#08090A) liquid glass substrates, dynamic specular refractions, a realistic 3D foldable booklet paper engine, and an integrated mark scheme workbench.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The plan has been updated to incorporate the following user additions:
> - **Flagship Pitch-Black Dark Theme**: `#08090A` dark mode with ultraviolet and slate refractions, frosted layered glass, and directional specular highlights across all UI states and components.
> - **Interactive Onboarding Tutorial**: Floating frosted glass modal tutorial introducing keyboard-first shortcuts (`J`/`K` question navigation, `1`-`6` mark tagging, `M` mark scheme curtain, `⌘K` quick search, and splitter controls).
> - **Tactile Micro-Haptic Engine**: Multi-modal haptic feedback (hardware `navigator.vibrate` where supported + synthesized Web Audio micro-haptic clicks/resonances) during splitter dragging/snapping and mark scheme curtain toggle.
> - **IB Board Status**: Under the **IB** board option, display an ambient frosted glass sign with subtle luminescence stating **"Coming Soon"**.

---

### 1. Overview & Core Concept

PRISM transforms past-paper solving from static PDF reading into a tactile, distraction-free examination cockpit. Students preparing for international and national boards (IGCSE, CBSE, IB, ICSE) can discover papers across sessions and variants via an illuminated completion matrix, solve papers on a 3D foldable booklet canvas with liquid resin stylus ink annotations, and self-mark in real-time with an interactive step-by-step mark scheme workbench.

- **Primary Persona**: High-achieving secondary and high-school students targeting top percentiles in IGCSE (Cambridge/Edexcel), CBSE Board, IB Diploma, and ICSE examinations.
- **Key Value**: Eliminates the clumsy friction of juggling printed exam papers, loose mark scheme PDFs, and stopwatches, combining them into a unified, physical-grade solving deck.

---

### 2. User Experience & Visual Design

#### A. Visual Foundations & Color Palette (60-30-10 Rule)
- **60% Deep Obsidian Canvas**: `#08090A` baseline with continuous subtle mesh gradients shifting between ultraviolet (`rgba(124, 58, 237, 0.08)`) and cold slate (`rgba(148, 163, 184, 0.05)`).
- **30% Liquid Glass Surfaces**: Translucent glass slabs (`bg-white/[0.03]` to `bg-white/[0.06]` with `backdrop-blur-2xl` and `saturate-[180%]`), edged by an ultra-fine 1px specular highlight (`border border-white/[0.08]`) that tracks cursor coordinates.
- **10% Semantic Jewels**:
  - *Solved / High Mastery*: Neon emerald facets (`#10B981` / emerald glow dot).
  - *In Progress / Active*: Amber micro-ring (`#F59E0B`).
  - *Critical Timer State (<5m)*: Pulsing coral breathing glow (`#EF4444`).
  - *Unattempted*: Dim obsidian plates (`#1E222A`).
  - *IB Ambient Badge*: Translucent violet-slate glow badge with `"Coming Soon"`.

#### B. Typographic System
- **Display & Interface Headings**: Plus Jakarta Sans / System Display with micro-letter-spacing (`-0.02em`) and optical weight compensation for dark mode.
- **Paper Codes, Timers & Mark Rubrics**: JetBrains Mono / SF Mono (`font-mono tabular-nums tracking-tight`) for instant vertical scanning of paper numbers (`0580/42`, `CBSE-12-MAT-041`), countdown timers, and mark allocations (`[M1]`, `[A1]`).

#### C. Interactive Onboarding Walkthrough
A multi-step floating frosted glass tutorial that welcomes new users or can be re-triggered anytime from the dock/header:
1. **Welcome to PRISM**: Introduction to the tactile dark obsidian solving cockpit.
2. **Keyboard-First Navigation**: Demonstrates `J` / `K` for stepping between questions, `1`-`6` for quick mark tagging, and `?` for the shortcut sheet.
3. **The 3D Foldable Paper**: Explains booklet perspective vs single-page focus mode and stylus ink annotation tools.
4. **The Split Workbench & Curtain**: Demonstrates the fluid liquid splitter and pressing `M` or `Space` to slide the mark scheme curtain in and out.
5. **Ready to Solve**: Quick summary of board switching and the `⌘K` Quick Jump palette.

#### D. Tactile Micro-Haptic Engine
- **Splitter Snap Feedback**: Triggers a crisp 8ms micro-vibration (`navigator.vibrate(8)`) and an ultra-short 120Hz sine pop via Web Audio synthesizer when snapping to 50/50, 60/40, or edge boundaries.
- **Mark Scheme Curtain Sliding**: Low-frequency resonant soft whoosh/click when the curtain slides into view or retracts.
- **Mark Assignment**: Subtle tactile feedback when tapping score buttons 1–6.

#### E. Core Navigation & The Persistent Island Dock
Floating 32px above the viewport bottom sits the primary command dock:
- **Segmented Glass Switcher**: Board switcher (`IGCSE`, `CBSE`, `IB`, `ICSE`) with a liquid mercury glider spring sliding underneath the active selection.
  - Selecting **IB** displays the ambient frosted "Coming Soon" banner and preview info.
- **⌘K Quick Jump Trigger**: Quick command palette button summoning paper search.
- **Solving Timer HUD**: Miniature countdown timer displaying elapsed / remaining time with coral pulse alert under 5 minutes.
- **Offline / Local Storage Pill**: Quiet indicator confirming local persistence to browser storage.
- **Interactive Tour Trigger**: Access button to launch the Onboarding Walkthrough.

#### F. The Paper Discovery Matrix
- **Subject Drawer & Board Filter**: Multi-board support with subjects (Mathematics, Physics, Chemistry, Biology, Computer Science, Economics) saved to localStorage.
- **Timeline Rows**: Chronological descent (2025, 2024, 2023, 2022, 2021) along a luminous neon timeline axis.
- **Variant Pods**: Glass tiles representing exam series (e.g., May/June Variant 22, Oct/Nov Variant 42). Hovering triggers a cursor-tethered lens flare and peeks metadata (question count, max marks, average solve duration, personal best).
- **Tactile Crystal Heatmap Rail**: Top completion rail where solved papers light up as cut-crystal emerald facets and revision-needed papers glow warm amber.

#### G. The Dual-Pane "Solving Deck"
- **Left Pane — 3D Foldable Examination Paper**:
  - Authentic exam booklet cover and interior pages with staple binding seam and realistic 3D paper curvature shadows.
  - Controls to switch between **3D Foldable Booklet View** and **Single-Page Focus View**.
  - Vector-sharp typography and exam diagrams with zoom (100% to 250%) and panning.
  - Liquid resin ink annotation engine: stylus / pen drawing, highlighter, eraser, and color picker (Azure, Neon Emerald, Amber, Graphite) rendered on a hardware-accelerated canvas.
  - "Download PDF" export button generating a formatted printable exam booklet.
- **Right Pane — Split Workbench**:
  - **Mark Scheme Tab**: Step-by-step official marking criteria with clickable rubrics (`M1` method, `A1` accuracy, `B1` independent marks).
  - **Self-Mark Checklist & Score Tracker**: Mark scoring pills (1 to 6) updating the total score and percentage in real-time.
  - **Scratchpad Tab**: Quick scratchpad with LaTeX math helper snippet shortcuts.
- **Adjustable Liquid Splitter**:
  - Razor-thin 2px frosted divider with grab handle and tactile haptic feedback.
  - Snaps smoothly between 50/50, 60/40, or Full-Screen views.
  - Mark scheme curtain toggle (shortcut `M` or `Tab`) sliding the right pane in and out.

#### H. Micro-Interactions & Physical Feel
- **Completion Explosion**: Submitting a paper triggers a dynamic glass prism confetti particle burst refracting screen lighting.
- **Keyboard Shortcuts**: `J`/`K` (next/prev question), `1`-`6` (assign marks), `M` (toggle mark scheme curtain), `?` (open keyboard cheat sheet), `⌘K` (open command palette).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Web Audio + Hardware Vibration Dual-Tier Haptics**
  - *Chosen Approach*: Implement a zero-dependency synthesized micro-audio haptic engine using Web Audio API (`AudioContext`) paired with `navigator.vibrate` when supported.
  - *Why*: Ensures physical haptic feedback is experienced on desktop browsers (where physical vibration motors do not exist) as well as mobile devices and trackpads.

- **Decision 2: 3D Foldable Booklet with Single-Page Focus Mode**
  - *Chosen Approach*: Realistic CSS 3D transform preserve-3d perspective with crease shading, center staple seam, page-turn kinematics, and a toggle for a flattened single-page focus mode.
  - *Why*: Delivers the exact physical exam tactile feel requested while accommodating focused solving on narrow viewports.

- **Decision 3: Local-First State Persistence**
  - *Chosen Approach*: All paper progress, ink annotations, scored rubrics, timer countdowns, onboarding tutorial state, and active boards/subjects are stored locally in `localStorage`.
  - *Why*: Fulfills the "design only UI, not backend" directive while providing 100% offline reliability with zero data loss.

---

### 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              PRISM App Root                            │
│  - Ambient Mesh Refraction Canvas (WebGL / Radial Cursor Spotlight)   │
│  - Active Board & Subject Store (Local Persistence)                    │
│  - Haptic Engine (AudioContext + navigator.vibrate)                    │
│  - Keyboard Shortcut Manager (Global Event Listener)                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│ Discovery Matrix │     │ Dual-Pane Deck    │     │ Onboarding Tour  │
│ - Board Switcher │     │ - 3D Foldable     │     │ - Floating Glass │
│   * IB "Coming   │     │   Booklet Paper   │     │   Card Steps     │
│     Soon" Sign   │     │ - Liquid Stylus   │     │ - Interactive    │
│ - Heatmap Rail   │     │ - Split Workbench │     │   Hotkeys Tour   │
│ - Year Timeline  │     │ - Liquid Splitter │     └──────────────────┘
│ - Variant Pods   │     │ - Mark Curtain    │
└──────────────────┘     └───────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌────────────────────────────────┐         ┌────────────────────────────────┐
│    Command Palette (⌘K)        │         │   Glass Prisms Confetti Engine │
│  - Fuzzy Search Input          │         │  - Completion Celebration      │
│  - Jewel Status Badges         │         │  - Keyboard Cheat Sheet (?)    │
│  - Keyboard Arrow Navigation   │         │  - Persistent Island Dock      │
└────────────────────────────────┘         └────────────────────────────────┘
```
