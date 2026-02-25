export interface PanelPort {
  setBalance(value: number): void;
  setWin(value: number): void;
  setBet(value: number): void;
  setBetButtonsEnabled(canDecrease: boolean, canIncrease: boolean): void;
  setSpinEnabled(enabled: boolean): void;
  setForceSelected(index: number | null): void;
  onSpinRequested(callback: () => void): void;
  onForceOutcome(callback: (index: number) => void): void;
  onBetChange(callback: (direction: 'up' | 'down') => void): void;
}

export interface ReelsPort {
  /** Current visible symbols on each reel (left → right, top → bottom). */
  getStops(): string[][];
  playWinAnimations(reel: number, row: number): void;
  checkBonusCondition(): void;
  clearWinAnimations(): void;
  getNumberOfReels(): number;
  /** Optional externally forced stops for debug / scripted spins. */
  forceStops: string[][];
  on(event: 'spinConcluded', listener: () => void): void;
  emit(event: 'spinButtonClicked'): void;
}

export interface WinningPosition {
  reel: number;
  row: number;
}

export interface WinningWay {
  /** Symbol that formed the way win. */
  symbol: string;
  /** How many consecutive reels this symbol appeared on (left to right). */
  count: number;
  /** Grid positions (reel, row) that are part of this win. */
  positions: WinningPosition[];
}

export interface WinResult {
  wins: WinningWay[];
  /** Sum of all way wins, in "credits" (bet multiplier still applied outside). */
  totalWin: number;
}

export interface GameConfig {
  /** Starting balance shown when the game loads. */
  initialBalance: number;
  /** Value to show in the win field before the first spin. */
  initialWin: number;
  /** Allowed bet values in credits; betIndex points into this array. */
  betLevels: number[];
  /** Initial index into betLevels. */
  defaultBetIndex: number;
  /**
   * Optional pre-defined stop layouts used when forcing specific outcomes.
   * Shape: [setIndex][reelIndex][rowIndex] = symbol alias.
   */
  forceStopSets: string[][][];
  /** Configuration for ways evaluation. */
  winningWays: {
    /** Minimum number of consecutive reels (from left) required for a win. */
    minReelsForWin: number;
    /** Default "matches" threshold for the paytable, if needed. */
    defaultNumMatches: number;
  };
  /**
   * Payouts per symbol and number of matches.
   * Example: symbolPayouts['SEVEN'][3] = 10 (10× bet per way for 3-of-a-kind SEVEN's).
   */
  symbolPayouts: { [symbol: string]: { [matches: number]: number } };
}

export interface GameState {
  balance: number;
  spinActive: boolean;
  selectedForceIndex: number | null;
  betIndex: number;
  freeSpinsActive: boolean;
  freeSpinsLeft: number;
}

export type GameEvent =
  | { type: 'SPIN_REQUESTED' }
  | { type: 'SPIN_CONCLUDED'; totalWin: number }
  | { type: 'FORCE_SELECTED'; index: number }
  | { type: 'BET_UP' }
  | { type: 'BET_DOWN' }
  | { type: 'FREE_SPINS_AWARDED'; count: number };
