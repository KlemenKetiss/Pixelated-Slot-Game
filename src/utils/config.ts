// Core game dimensions (square-ish for 3x3, good for mobile & desktop)
export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

// Symbol and reel layout for a 3x3 grid
export const SYMBOL_WIDTH = 160;
export const SYMBOL_HEIGHT = 160;

// Reel frame layout and scaling
export const REEL_FRAME_Y_OFFSET = 10;
export const REEL_FRAME_SCALE = 1.1;

export const REELS_CONFIG = {
  numReels: 3,
  numRows: 3,
  reelWidth: SYMBOL_WIDTH,
  symbolHeight: SYMBOL_HEIGHT,
  reelSpacing: 20,
  symbolSpacing: 8,
  yOffset: 80,
  screenWidth: GAME_WIDTH,
  bonusSymbolThreshold: 3,
  maskColor: 0xffffff,
};

// Reels layout tuning inside the frame
export const REEL_FRAME_INNER_PADDING_SCALE = 0.98;
export const REELS_MAX_FIT_SCALE = 1.7;

// Reel separators layout (between reels)
export const REEL_SEPARATOR_X_OFFSET = 130;
export const REEL_SEPARATOR_Y_OFFSET = -30;
export const SEPERATOR_START_OFFSET = 0;

export const REEL_ANIMATION_CONFIG = {
  virtualReelLength: 20,
  delayPerReel: 0.12,
  duration: 0.9,
  settleDelay: 0.4,
};

export const PANEL_CONFIG = {
  initialBalance: 500,
};

// Bet ladder tuned for a smaller 3x3 game (can be adjusted later)
export const BET_LEVELS: number[] = [0.2, 0.5, 1, 2, 5, 10, 20];
export const DEFAULT_BET_INDEX = 2; // 1 credit

export const SLOT_RENDER_CONFIG = {
  backgroundColor: 0x0c0f1a,
  maxViewportScale: 1,
  viewportScaleDivisor: 2,
  screenCenterDivisor: 2,
};

// Ways config: minimum reels required and default matches
export const WINNING_WAYS_CONFIG = {
  minReelsForWin: 3,
  defaultNumMatches: 3,
};

export const SYMBOL_WIN_DIMMED_ALPHA = 0.5;
export const INITIAL_WIN = 0;

// Win field (Pixi overlay) layout and typography
export const WIN_FIELD_FONT_SIZE = 120;
export const WIN_FIELD_INITIAL_TEXT = '0';
export const WIN_FIELD_TEXT_Y_OFFSET = 50;
export const WIN_FIELD_BOTTOM_OFFSET = 300;
export const WIN_FIELD_HORIZONTAL_OFFSET = 750;

// Symbol view fallback + win animation tuning
export const SYMBOL_FALLBACK_CORNER_RADIUS = 16;
export const SYMBOL_FALLBACK_FONT_SIZE = 20;
export const SYMBOL_WIN_ANIMATION_CONFIG = {
  duration: 0.25,
  shakeOffsetX: 3,
};

// Symbol set tailored for a compact 3x3 game; aliases should match asset names.
// LOW3 (Cherry), LOW2 (Lemon), LOW1 (Plum), HIGH4 (Bell),
// HIGH3 (Diamond), HIGH2 (Bar), HIGH1 (Seven), WILD (Wild)
export const SYMBOLS: string[] = [
  'LOW3',  // Cherry
  'LOW2',  // Lemon
  'LOW1',  // Plum
  'HIGH4', // Bell
  'HIGH3', // Diamond
  'HIGH2', // Bar
  'HIGH1', // Seven
  'WILD',  // Wild
  'Bonus', // Bonus / feature symbol
];

// Example forced outcomes for dev/debug (placeholder, can be tuned later).
export const FORCE_STOP_SETS: Array<Array<Array<string>>> = [
  // High win: strong Seven / high symbol connections
  [
    ['HIGH1', 'HIGH3', 'HIGH1'],
    ['HIGH1', 'HIGH4', 'HIGH1'],
    ['HIGH2', 'HIGH1', 'HIGH2'],
  ],
  // Bonus trigger (3 BONUS on screen)
  [
    ['Bonus', 'LOW3', 'HIGH2'],
    ['LOW2', 'Bonus', 'HIGH3'],
    ['HIGH4', 'LOW1', 'Bonus'],
  ],
  // Mixed mid wins: combinations of lows and highs
  [
    ['LOW3', 'LOW3', 'LOW3'],
    ['HIGH3', 'LOW2', 'HIGH3'],
    ['LOW1', 'HIGH2', 'LOW1'],
  ],
];

// Payouts per symbol and matches; values are per-way multipliers.
export const SYMBOL_PAYOUTS: { [key: string]: { [matches: number]: number } } = {
  LOW3: { 3: 2, 4: 4, 5: 8 },   // Cherry
  LOW2: { 3: 3, 4: 6, 5: 10 },  // Lemon
  LOW1: { 3: 4, 4: 8, 5: 12 },  // Plum
  HIGH4: { 3: 8, 4: 15, 5: 25 }, // Bell
  HIGH3: { 3: 10, 4: 20, 5: 35 }, // Diamond
  HIGH2: { 3: 15, 4: 30, 5: 50 }, // Bar
  HIGH1: { 3: 25, 4: 50, 5: 100 }, // Seven
  WILD: { 3: 30, 4: 60, 5: 150 }, // Wild
  BONUS: { 3: 0, 4: 0, 5: 0 }, // Feature handled separately
};

