# HELM

```text
██╗  ██╗███████╗██╗     ███╗   ███╗
██║  ██║██╔════╝██║     ████╗ ████║
███████║█████╗  ██║     ██╔████╔██║
██╔══██║██╔══╝  ██║     ██║╚██╔╝██║
██║  ██║███████╗███████╗██║ ╚═╝ ██║
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝
OPERATING SYSTEM FOR STUDENT PRODUCTIVITY
v1.2.0-stable
```

Helm is a distraction-free, keyboard-centric productivity suite designed for students and power users. It combines a calendar, a context-aware notebook, and a focus timer into a single Electron runtime.

---

### [ SYSTEM ARCHITECTURE ]

**Core Stack:**
*   **Runtime:** Electron (Main + Renderer processes)
*   **Frontend:** React + Vite
*   **Styling:** TailwindCSS (Dynamic CSS Variables)
*   **Data:** `electron-store` (Local JSON persistence)
*   **Motion:** Framer Motion

---

### [ MODULES & FEATURES ]

#### 1. COMMAND CENTER (Dashboard)
*   **Hybrid View:** Seamless toggle between Monthly Calendar and Weekly Schedule.
*   **Visual Logic:** Events are rendered as transparent blocks; Tasks are rendered as solid "stickers."
*   **Collapsible Journal:** Sidebar slides away for a full-screen deep work view.
*   **AM/PM Support:** 12-hour time format standard.

#### 2. CONTEXT-AWARE EVENT MODAL
A completely refactored "Tabbed Architecture" for managing complex schedules.
*   **Launchpad:** Dynamic, top-level buttons for external links (Google Meet, Drive, Notion). Auto-detects URL types and assigns icons.
*   **Resource Manager:** Store syllabus links, PDFs, and chat channels directly inside the event.
*   **Smart Notebooks:**
    *   **Standard Tasks:** Notes are attached to the task itself.
    *   **Repeating Classes:** Notes are **Date-Stamped**. Clicking a class creates a unique note entry for *that specific date* (e.g., "Dec 09 Lecture").
    *   **History Archive:** View all past notes for a recurring class without leaving the current view.

#### 3. FOCUS ENGINE
*   **Physics-Based Timer:** Drag up/down to set duration.
*   **Mini-HUD:** Detach the timer into a floating "Picture-in-Picture" window that stays on top of other apps.
*   **Transparent UI:** Glassmorphism design that respects your custom wallpaper.

#### 4. NOTIFICATION DAEMON
*   **Background Process:** Runs on the Main Electron thread, independent of the UI window.
*   **Custom Offsets:** Trigger alerts at event time, 15m before, 1h before, or 1d before.
*   **System Integration:** Uses native OS notification bubbles.

#### 5. THEME ENGINE
*   **Dynamic Variables:** CSS colors converted to RGB channels to support runtime opacity adjustments.
*   **Custom Wallpapers:** Support for external image URLs (Unsplash/Direct links) with auto-dimming overlays for text readability.

---

### [ CHANGELOG: RECENT PATCHES ]

**> UI/UX Overhaul**
*   **Fixed:** `EventModal` clutter reduced via Tabbed Interface (Main / Content / Config).
*   **Fixed:** `Z-Index` clipping on Dropdowns. Date/Time pickers now use **React Portals** to render at the document root, floating above all scroll containers.
*   **Fixed:** Focus Mode background transparency.

**> Data & Logic**
*   **Added:** `notebooks` database store for handling history-based notes.
*   **Added:** `settings` database store for persisting theme and notification preferences.
*   **Added:** Recurrence logic updated to respect `repeatStart` and `repeatEnd` dates.

---

### [ KEYBOARD SHORTCUTS ]

| Key | Action |
| :--- | :--- |
| `Ctrl + 1` | Switch to Dashboard |
| `Ctrl + 2` | Switch to Focus Timer |
| `Ctrl + N` | New Entry |
| `Ctrl + ,` | Open Settings |
| `a` | Focus Command Bar (Vim-style) |
| `Esc` | Close Modals / Clear Selection |

---

### [ INSTALLATION ]

1.  **Clone Repository**
    ```bash
    git clone https://github.com/your-username/helm.git
    cd helm
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Build**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build:win  # or build:mac / build:linux
    ```