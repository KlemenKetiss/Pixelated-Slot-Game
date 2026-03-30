// Core game dimensions (square-ish for 3x3, good for mobile & desktop)
export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

// Symbol and reel layout for a 3x3 grid
export const SYMBOL_WIDTH = 110;
export const SYMBOL_HEIGHT = 110;

// Reel frame layout and scaling
export const REEL_FRAME_Y_OFFSET = 10;
export const REEL_FRAME_SCALE = 1.1;

export const REELS_CONFIG = {
  numReels: 5,
  numRows: 3,
  reelWidth: SYMBOL_WIDTH,
  symbolHeight: SYMBOL_HEIGHT,
  reelSpacing: 0,
  symbolSpacing: 0,
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
export const BET_LEVELS: number[] = [0.2, 0.5, 1, 2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
export const DEFAULT_BET_INDEX = 2; // 1 credit

// After a short delay, start repeating while held.
export const BET_HOLD_DELAY_MS = 350;
export const BET_HOLD_REPEAT_INTERVAL_MS = 120;

// Free spins feature configuration
export const FREE_SPINS_INITIAL_AWARD = 10;
export const FREE_SPINS_RETRIGGER_AWARD = 3;

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
export const WIN_FIELD_TEXT_COLOR = 0xffffff;

// Feature view (free spins overlay) layout and styling
export const FEATURE_VIEW_X_OFFSET = 740;
export const FEATURE_BG_WIDTH = 370;
export const FEATURE_BG_HEIGHT = 150;
export const FEATURE_BG_RADIUS = 12;
export const FEATURE_BG_ALPHA = 0.35;
export const FEATURE_TITLE_Y_OFFSET = -40;
export const FEATURE_COUNTER_Y_OFFSET = 20;
export const FEATURE_TITLE_FONT_SIZE = 48;
export const FEATURE_COUNTER_FONT_SIZE = 80;
export const FEATURE_TITLE_COLOR = 0xfff176;
export const FEATURE_COUNTER_COLOR = 0xffffff;

// Symbol view fallback + win animation tuning
export const SYMBOL_FALLBACK_CORNER_RADIUS = 16;
export const SYMBOL_FALLBACK_FONT_SIZE = 20;
export const SYMBOL_FALLBACK_BG_COLOR = 0x1f2937;
export const SYMBOL_FALLBACK_TEXT_COLOR = 0xf9fafb;
export const SYMBOL_WIN_ANIMATION_CONFIG = {
  duration: 0.25,
  shakeOffsetX: 3,
};

// Symbol set matching the new assets under assets/images/symbols.
export const SYMBOLS: string[] = [
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
  'M1',
  'M2',
  'M3',
  'M4',
  'M5',
  'M6',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'BONUS',
];

// Forced outcomes aligned with the new symbol set.
export const FORCE_STOP_SETS: Array<Array<Array<string>>> = [
  // High win: many H6 symbols across all reels.
  [
    ['H6', 'H5', 'H6'],
    ['H6', 'H6', 'H4'],
    ['H6', 'H6', 'H3'],
    ['H6', 'H2', 'H6'],
    ['H6', 'H1', 'H6'],
  ],
  // Mid win: M3 appears on all reels.
  [
    ['BONUS', 'Q', '10'],
    ['K', 'BONUS', 'J'],
    ['A', '9', 'BONUS'],
    ['M3', 'J', 'Q'],
    ['10', 'M3', 'K'],
  ],
  // Multi-way card win: mixed card symbols with strong K ways.
  [
    ['K', 'K', 'A'],
    ['Q', 'K', 'K'],
    ['K', 'J', 'K'],
    ['K', 'A', 'Q'],
    ['J', 'K', '10'],
  ],
  // No win: no symbol appears on 3 consecutive reels.
  [
    ['9', '10', 'J'],
    ['Q', 'K', 'A'],
    ['M1', 'M2', 'M3'],
    ['M4', 'M5', 'M6'],
    ['H1', 'H2', 'H3'],
  ],
];

// Payouts per symbol and matches; values are per-way multipliers.
export const SYMBOL_PAYOUTS: { [key: string]: { [matches: number]: number } } = {
  '9': { 3: 2 },
  '10': { 3: 2.5 },
  J: { 3: 3 },
  Q: { 3: 3.5 },
  K: { 3: 4 },
  A: { 3: 5 },
  M1: { 3: 6 },
  M2: { 3: 7 },
  M3: { 3: 8 },
  M4: { 3: 9 },
  M5: { 3: 10 },
  M6: { 3: 12 },
  H1: { 3: 14 },
  H2: { 3: 16 },
  H3: { 3: 18 },
  H4: { 3: 20 },
  H5: { 3: 24 },
  H6: { 3: 30 },
  BONUS: { 3: 0 },
};

