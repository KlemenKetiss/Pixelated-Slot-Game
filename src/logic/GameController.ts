import type { PanelPort, ReelsPort, GameConfig, GameState } from './GameTypes';
import { handleGameState } from './GameStateHandler';
import { checkForWinningWays } from './WinLogic';
import {
  FREE_SPINS_INITIAL_AWARD,
  FREE_SPINS_RETRIGGER_AWARD,
  REELS_CONFIG,
} from '../utils/config';

export class GameController {
  // The current state of the game, handled and mutated through events.
  private state: GameState;

  constructor(
    private readonly panel: PanelPort,
    private readonly reels: ReelsPort,
    private readonly config: GameConfig,
    private readonly onFreeSpinsChange?: (remaining: number | null) => void,
    private readonly onSpinResolved?: (result: {
      totalWin: number;
      hasWin: boolean;
    }) => void,
    private readonly onBonusEntered?: () => void,
  ) {
    // Initial internal state setup.
    this.state = {
      balance: config.initialBalance,
      spinActive: false,
      selectedForceIndex: null,
      betIndex: config.defaultBetIndex,
      freeSpinsActive: false,
      freeSpinsLeft: 0,
    };
    // Sync panel UI to initial state.
    this.panel.setBalance(this.state.balance);
    this.panel.setWin(this.config.initialWin);
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
    this.updateFeatureView();
    this.wirePanel(); // Set up listeners from the Panel UI
    this.wireReels(); // Set up listeners from the Reels UI
  }

  /**
   * Returns the actual bet value from config using the state's betIndex.
   * Always clamps index within valid range.
   */
  private getCurrentBet(): number {
    const index = Math.max(
      0,
      Math.min(this.state.betIndex, this.config.betLevels.length - 1),
    );
    // Defensive: betLevels may be missing/empty, so default to 0.
    return this.config.betLevels[index] ?? 0;
  }

  /**
   * Enable or disable bet up/down buttons depending on current betIndex and player balance.
   * 'Can increase' is also only true if the user can afford the next bet.
   */
  private updateBetButtonsEnabled(): void {
    const canDecrease = this.state.betIndex > 0;
    const nextBet =
      this.state.betIndex < this.config.betLevels.length - 1
        ? this.config.betLevels[this.state.betIndex + 1]
        : Infinity;
    const canIncrease =
      this.state.betIndex < this.config.betLevels.length - 1 &&
      nextBet <= this.state.balance;
    this.panel.setBetButtonsEnabled(canDecrease, canIncrease);
  }

  /**
   * Enable/disable the spin button depending on state.
   * This allows spin if not already spinning, and if the user either has a free spin or enough balance.
   */
  private updateSpinEnabled(): void {
    const hasFreeSpin =
      this.state.freeSpinsActive && this.state.freeSpinsLeft > 0;
    const canAffordCurrentBet = this.state.balance >= this.getCurrentBet();
    const canSpin =
      !this.state.spinActive && (hasFreeSpin || canAffordCurrentBet);
    this.panel.setSpinEnabled(canSpin);
  }

  /**
   * Register callbacks for user UI events on the panel (UI inputs for spin, force, and bet changes).
   */
  private wirePanel(): void {
    this.panel.onSpinRequested(() => this.handleSpinRequested());
    this.panel.onForceOutcome((index) => this.handleForceOutcome(index));
    this.panel.onBetChange((direction) => this.handleBetChange(direction));
  }

  /**
   * Register callback for when a spin finishes on the reels.
   * Typically, the reels view emits this when the spin animation concludes.
   */
  private wireReels(): void {
    this.reels.on('spinConcluded', () => this.handleSpinConcluded());
  }

  /**
   * Handles when the player requests a new spin.
   * Advances state and emits spin event to the reels view, updating UI as needed.
   */
  private handleSpinRequested(): void {
    // Leverage state handler for validity checking (free spin, balance, etc.)
    const nextState = handleGameState(
      this.state,
      { type: 'SPIN_REQUESTED' },
      this.config,
    );
    // No-op: shouldn't really happen unless the UI gets out of sync and sends an invalid request.
    if (nextState === this.state) {
      return; // Defensive: ignore if not possible to spin now
    }

    // Commit new state (balance deducted, free spin decremented, etc.)
    this.state = nextState;
    this.panel.setBalance(this.state.balance);
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
    this.updateFeatureView();

    // If a force outcome is selected, use that stop set for this spin.
    const forceStops =
      this.state.selectedForceIndex !== null
        ? this.config.forceStopSets[this.state.selectedForceIndex] ?? []
        : [];
    this.reels.forceStops = forceStops;

    // Triggers reels view to begin the spin process.
    this.reels.emit('spinButtonClicked');
  }

  /**
   * Handles user selection/deselection of a "force outcome" (rigged stops set).
   */
  private handleForceOutcome(index: number): void {
    // Send force selection event to state handler.
    const nextState = handleGameState(
      this.state,
      { type: 'FORCE_SELECTED', index },
      this.config,
    );
    if (nextState === this.state) {
      return; // No state change: Ignore.
    }
    this.state = nextState;
    // Update force selection in UI
    this.panel.setForceSelected(this.state.selectedForceIndex);
  }

  /**
   * Handles bet up/down changes from the UI, updating state appropriately.
   * Also clears win animations, since win amounts/bet levels are out of sync after any bet change.
   */
  private handleBetChange(direction: 'up' | 'down'): void {
    // Compose proper bet event type.
    const event =
      direction === 'up'
        ? { type: 'BET_UP' as const }
        : { type: 'BET_DOWN' as const };
    const nextState = handleGameState(this.state, event, this.config);
    if (nextState === this.state) return; // No state change, e.g., at bounds or during spin
    this.state = nextState;

    // For user feedback: clear all win animations as bet/amount views change.
    this.reels.clearWinAnimations();

    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
  }

  /**
   * Main handler for when the reels animation reports the spin has finished.
   * - Evaluates the win for the stops,
   * - checks and processes bonus/free spin condition,
   * - applies resulting game state/winnings,
   * - updates UI accordingly,
   * - triggers animations.
   */
  private handleSpinConcluded(): void {
    // Get the current grid of stopped symbols.
    const stops = this.reels.getStops();
    // Check for regular wins and their positions.
    const { wins, totalWin: baseWin } = checkForWinningWays(stops, this.config);
    // Multiply base win by bet to get final payout amount.
    const bet = this.getCurrentBet();
    const totalWin = baseWin * bet;

    this.handleBonusCondition(stops);
    this.updateGameStateOnSpinConcluded(totalWin);
    this.checkIfFreeSpinsEnded();
    this.updatePanelState(totalWin);
    this.updateFeatureView();
    this.clearForceStops();
    this.animateWins(wins);
    this.onSpinResolved?.({ totalWin, hasWin: totalWin > 0 });
  }

  /**
   * After handling spin conclusion: 
   * If all free spins have been used, ensure we set freeSpinsActive to false.
   */
  private checkIfFreeSpinsEnded(): void {
    // Prevents remaining at "free spins mode" once no spins left.
    if (this.state.freeSpinsLeft <= 0) {
      this.state = { ...this.state, freeSpinsActive: false, freeSpinsLeft: 0 };
    }
  }

  /**
   * After every spin, assess if the spin grid triggered a free-spin bonus.
   * If enough Bonus symbols are shown, initiates or retriggers free spins accordingly.
   * Also updates reels game mode to reflect bonus status.
   */
  private handleBonusCondition(stops: string[][]): void {
    // Tally the number of "BONUS" symbols on screen.
    let bonusCount = 0;
    stops.forEach((reel) => {
      reel.forEach((symbol) => {
        if (symbol === 'BONUS') {
          bonusCount++;
        }
      });
    });

    if (bonusCount < REELS_CONFIG.bonusSymbolThreshold) return;

    // Pick correct award size: initial vs retrigger amount depending on free mode.
    const award = this.state.freeSpinsActive
      ? FREE_SPINS_RETRIGGER_AWARD
      : FREE_SPINS_INITIAL_AWARD;

    // Update state with additional free spins.
    this.state = handleGameState(
      this.state,
      { type: 'FREE_SPINS_AWARDED', count: award },
      this.config,
    );
    this.onBonusEntered?.();
  }

  /**
   * Updates the game state after a spin has concluded.
   * Applies winnings to the balance, marks the spin as inactive, and resets selectedForceIndex.
   * @param totalWin - The win amount for the concluded spin, in bet multiples
   */
  private updateGameStateOnSpinConcluded(totalWin: number): void {
    // Use the state handler to update the game state due to 'SPIN_CONCLUDED'
    const nextState = handleGameState(
      this.state,
      { type: 'SPIN_CONCLUDED', totalWin },
      this.config,
    );
    // Store the updated state
    this.state = nextState;
  }

  /**
   * Update various panel elements after spin, reflecting winnings/payouts, bet, balance, and force status.
   */
  private updatePanelState(totalWin: number): void {
    this.panel.setWin(totalWin);
    this.panel.setBalance(this.state.balance);
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
    this.panel.setForceSelected(this.state.selectedForceIndex);
  }

  /**
   * If onFreeSpinsChange callback is supplied: call it with free spins remaining,
   * or null when the player is not in a free spins session.
   */
  private updateFeatureView(): void {
    if (!this.onFreeSpinsChange) return;
    const { freeSpinsActive, freeSpinsLeft } = this.state;
    const remaining = freeSpinsActive ? freeSpinsLeft : null;
    this.onFreeSpinsChange(remaining);
  }

  /**
   * After a spin concludes, forcibly clear any forced stops, so next spin is random 
   * (unless user selects a new force outcome again).
   */
  private clearForceStops(): void {
    this.reels.forceStops = [];
  }

  /**
   * Loops through each win, and for each position of the win, 
   * triggers the reels view to play its win animation at the given reel and row.
   */
  private animateWins(wins: Array<{ positions: Array<{ reel: number; row: number }> }>): void {
    if (wins.length === 0) return;
    wins.forEach((win) => {
      win.positions.forEach((pos) => {
        this.reels.playWinAnimations(pos.reel, pos.row);
      });
    });
  }
}
