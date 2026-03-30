import type { GameConfig } from '../logic/GameTypes';
import {
  PANEL_CONFIG,
  BET_LEVELS,
  DEFAULT_BET_INDEX,
  WINNING_WAYS_CONFIG,
  SYMBOL_PAYOUTS,
  FORCE_STOP_SETS,
  INITIAL_WIN,
} from '../utils/config';

/**
 * Game config for unit tests using the same symbols and payouts as the real game.
 * Tests then validate logic against actual paytable and symbols (9, A, M*, H*).
 */
export const testConfig: GameConfig = {
  initialBalance: PANEL_CONFIG.initialBalance,
  initialWin: INITIAL_WIN,
  betLevels: BET_LEVELS,
  defaultBetIndex: DEFAULT_BET_INDEX,
  forceStopSets: FORCE_STOP_SETS,
  winningWays: WINNING_WAYS_CONFIG,
  symbolPayouts: SYMBOL_PAYOUTS,
};

/** Named constants used in tests to avoid magic numbers. */
export const TestConstants = {
  balance: {
    default: 100,
    low: 50,
    empty: 0,
  },
  betIndex: {
    min: 0,
    mid: 1,
    maxOffset: 2,
  },
  spin: {
    winAmount: 10,
  },
  freeSpins: {
    initialCount: 2,
    afterOneUsed: 1,
    awardCount: 5,
    addCount: 3,
    totalAfterAdd: 6,
  },
  force: {
    selectedIndex: 1,
  },
  winWays: {
    matchesNoPayout: 2,
    matchesThree: 3,
    waysMultiplierThreeReelsTwoPerReel: 2 * 2 * 2,
  },
} as const;
