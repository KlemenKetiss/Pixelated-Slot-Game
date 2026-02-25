# Pixelated Slot Game
- **Grid:** 3 reels × 3 rows (3×3).
- **Ways win:** A symbol pays when it appears on 3 consecutive reels (left to right). More copies of that symbol on a reel multiply the way (e.g. 2×2×2 = 8 ways).
- **Symbols:** Low (Cherry, Lemon, Plum), mid (Bell, Diamond, Bar), high (Seven), Wild, and Bonus. Payouts and symbols are defined in `src/utils/config.ts`.
- **Free spins:** Landing 3 Bonus symbols triggers free spins. Wins during free spins don’t deduct balance.
- **Force outcomes (dev):** Buttons let you force a result: High win, Bonus trigger, Mixed win, or No win. Used for testing and demos.
# Base game
<img width="857" height="596" alt="image" src="https://github.com/user-attachments/assets/c4d7ed6a-e1ab-40e4-af5b-bf05f1c93655" />

# Free Spins
<img width="922" height="647" alt="image" src="https://github.com/user-attachments/assets/5f3ae93f-e556-4118-8dbd-b58c70e195e0" />

---

## How to Run Locally

### Prerequisites

- **Node.js** (v18 or similar LTS)
- **npm**

### Commands

```bash
# Install dependencies
npm install

# Run the game in development (Parcel dev server)
npm start
```

Then open the URL shown in the terminal (usually `http://localhost:1234`).

### Other scripts

| Script           | Description                          |
|------------------|--------------------------------------|
| `npm run build`  | Production build into `dist/`        |
| `npm run test`   | Run unit tests (Vitest)              |
| `npm run test:watch` | Run tests in watch mode          |
| `npm run deploy` | Deploy `dist/` to GitHub Pages       |

---

## How Everything Is Linked

### Entry and bootstrap

1. **`index.html`** – Shell: `#game-container`, `#ui-overlay` (balance, bet, win, SPIN, force-outcome buttons). Loads `styles.css` and `index.ts`.
2. **`index.ts`** – On `window.load`, instantiates `Slot`.
3. **`Slot.ts`** – Creates the Pixi `Application`, loads assets from `assets/manifest.json`, injects the canvas into `#game-container`, then builds **MainView** (Pixi) and **PanelView** (HTML), builds **GameConfig** from `config`, and creates **GameController**. Registers a resize handler that uses **ViewportLayout** to scale and center the game container.

### Configuration

- **`src/utils/config.ts`** – Single place for game constants: dimensions, reel layout, bet levels, paytable (`SYMBOL_PAYOUTS`), symbols (`SYMBOLS`), force stop sets (`FORCE_STOP_SETS`), free-spin awards, win evaluation (`WINNING_WAYS_CONFIG`), and UI/layout tuning.

### Game logic (no DOM, no Pixi)

- **`GameTypes.ts`** – Shared types: `GameConfig`, `GameState`, `GameEvent`, `PanelPort`, `ReelsPort`, `WinResult`, etc.
- **`GameStateHandler.ts`** – Pure reducer: `handleGameState(state, event, config)` returns the next state for SPIN_REQUESTED, SPIN_CONCLUDED, BET_UP/DOWN, FORCE_SELECTED, FREE_SPINS_AWARDED.
- **`WinLogic.ts`** – `getSymbolPayout(symbol, numMatches, config)` and `checkForWinningWays(stops, config)` return wins and total win from a stop matrix.
- **`GameController.ts`** – Holds `GameState`, owns `PanelPort` and `ReelsPort`. Wires panel (spin, bet, force) and reels (`spinConcluded`). On spin: applies force stops if one is selected, tells reels to spin; on spin end: runs win logic, updates balance, awards free spins if needed, updates panel and feature view.

### Views

- **Pixi (MainView and children)**  
  - **BackgroundView** – Full-screen background.  
  - **ReelsViewBackground** – Frame behind reels.  
  - **ReelFrame** – Visual frame around the reels.  
  - **ReelsView** – Container of **ReelView**s; each reel has **SymbolView**s. Handles spin animation, layout within frame, and exposes `forceStops` and `getStops()`.  
  - **ReelSeparatorView** – Vertical separators between reels.  
  - **WinFieldView** – Pixi “win” amount (pixel font).  
  - **FeatureView** – Free-spins counter overlay.  

- **HTML (PanelView)**  
  - Binds to `#balance-display`, `#bet-display`, `#win-display`, spin button, bet ±, and all `.btn-force` buttons.  
  - Implements `PanelPort`: updates balance/bet/win, spin enabled, bet buttons, force selection; calls back for spin requested, force outcome index, and bet change.

### Data flow (high level)

- **User clicks SPIN** → Panel callback → GameController `handleSpinRequested` → `handleGameState(SPIN_REQUESTED)` → deduct bet (or use free spin) → set `reels.forceStops` from config if a force is selected → `reels.emit('spinButtonClicked')` → ReelsView spins (random or forced stops).
- **Reels finish** → ReelsView emits `spinConcluded` → GameController `handleSpinConcluded` → `checkForWinningWays(reels.getStops(), config)` → update balance, award free spins if 3× Bonus → `handleGameState(SPIN_CONCLUDED)` → update panel and feature view.
- **Bet / Force** → Panel callbacks → GameController → `handleGameState(BET_UP|BET_DOWN|FORCE_SELECTED)` → update panel state.

### Utilities and tests

- **`Helper.ts`** – `getForceStops(index)` (from config), `computeReelsFitScale(...)` for fitting reels in the frame.
- **`ViewportLayout.ts`** – `getFitScale`, `resetLayoutStyles`, `applyScaledCenteredLayout` for responsive game container.
- **`SymbolGenerator.ts`** – Random symbol selection for non-forced spins.
- **`src/tests/`** – Unit tests for `Helper`, `WinLogic`, and `GameStateHandler` using shared `testConfig` and `TestConstants` from `testConfig.ts`.

---

## Project structure (main parts)

```
src/
├── index.html          # Page shell + UI overlay markup
├── index.ts            # Entry: new Slot() on load
├── Slot.ts             # Pixi app, asset load, MainView + PanelView + GameController, resize
├── styles.css          # Layout and styling for overlay
├── logic/              # Pure game logic
│   ├── GameTypes.ts
│   ├── GameStateHandler.ts
│   ├── WinLogic.ts
│   └── GameController.ts
├── views/              # Pixi and HTML views
│   ├── MainView.ts
│   ├── panel/PanelView.ts
│   ├── reels/ReelsView.ts, ReelView.ts, SymbolView.ts, frame/*
│   ├── winField/, feature/, background/
├── utils/
│   ├── config.ts       # All game/config constants
│   ├── Helper.ts
│   ├── ViewportLayout.ts
│   └── SymbolGenerator.ts
└── tests/              # Unit tests (Vitest)
assets/                 # manifest.json, images, fonts (Parcel copies to output)
```

---

## Tech stack

- **Pixi.js** – Canvas rendering (reels, symbols, frame, background, win/feature overlays).
- **TypeScript** – Typed logic and views.
- **Parcel** – Dev server and production build; `parcel-reporter-static-files-copy` copies `assets/` to the build output.
- **Vitest** – Unit tests.
- **GSAP** – Used in symbol win animation (e.g. in `SymbolView`).
