import type { PanelPort, ReelsPort, GameConfig, GameState } from './GameTypes';
import { handleGameState } from './GameStateHandler';
import { checkForWinningWays } from './WinLogic';
import {
  FREE_SPINS_INITIAL_AWARD,
  FREE_SPINS_RETRIGGER_AWARD,
  REELS_CONFIG,
} from '../utils/config';

export class GameController {
  private state: GameState;

  constructor(
    private readonly panel: PanelPort,
    private readonly reels: ReelsPort,
    private readonly config: GameConfig,
    private readonly onFreeSpinsChange?: (remaining: number) => void,
  ) {
    this.state = {
      balance: config.initialBalance,
      spinActive: false,
      selectedForceIndex: null,
      betIndex: config.defaultBetIndex,
      freeSpinsActive: false,
      freeSpinsLeft: 0,
    };
    this.panel.setBalance(this.state.balance);
    this.panel.setWin(this.config.initialWin);
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
    this.updateFeatureView();
    this.wirePanel();
    this.wireReels();
  }

  private getCurrentBet(): number {
    const index = Math.max(
      0,
      Math.min(this.state.betIndex, this.config.betLevels.length - 1),
    );
    return this.config.betLevels[index] ?? 0;
  }

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

  private updateSpinEnabled(): void {
    const hasFreeSpin = this.state.freeSpinsActive && this.state.freeSpinsLeft > 0;
    const canAffordCurrentBet = this.state.balance >= this.getCurrentBet();
    const canSpin =
      !this.state.spinActive && (hasFreeSpin || canAffordCurrentBet);
    this.panel.setSpinEnabled(canSpin);
  }

  private wirePanel(): void {
    this.panel.onSpinRequested(() => this.handleSpinRequested());
    this.panel.onForceOutcome((index) => this.handleForceOutcome(index));
    this.panel.onBetChange((direction) => this.handleBetChange(direction));
  }

  private wireReels(): void {
    this.reels.on('spinConcluded', () => this.handleSpinConcluded());
  }

  private handleSpinRequested(): void {
    const nextState = handleGameState(
      this.state,
      { type: 'SPIN_REQUESTED' },
      this.config,
    );
    if (nextState === this.state) {
      return; //This doesn't really happen because the spin is requested only when the button is clicked
    }

    this.state = nextState;
    this.panel.setBalance(this.state.balance);
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
    this.updateFeatureView();

    const forceStops =
      this.state.selectedForceIndex !== null
        ? this.config.forceStopSets[this.state.selectedForceIndex] ?? []
        : [];
    this.reels.forceStops = forceStops;
    this.reels.emit('spinButtonClicked');
  }

  private handleForceOutcome(index: number): void {
    const nextState = handleGameState(
      this.state,
      { type: 'FORCE_SELECTED', index },
      this.config,
    );
    if (nextState === this.state) {
      return;
    }
    this.state = nextState;
    this.panel.setForceSelected(this.state.selectedForceIndex);
  }

  private handleBetChange(direction: 'up' | 'down'): void {
    const event =
      direction === 'up'
        ? { type: 'BET_UP' as const }
        : { type: 'BET_DOWN' as const };
    const nextState = handleGameState(this.state, event, this.config);
    if (nextState === this.state) return;
    this.state = nextState;

    // Any time the bet changes, clear existing win animations.
    this.reels.clearWinAnimations();

    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
  }

  private handleSpinConcluded(): void {
    const stops = this.reels.getStops();
    const { wins, totalWin: baseWin } = checkForWinningWays(stops, this.config);
    const bet = this.getCurrentBet();
    const totalWin = baseWin * bet;

    this.handleBonusCondition(stops);
    this.updateGameStateOnSpinConcluded(totalWin);
    this.checkIfFreeSpinsEnded();
    this.updatePanelState(totalWin);
    this.updateFeatureView();
    this.clearForceStops();
    this.animateWins(wins);
  }

  private checkIfFreeSpinsEnded(): void {
    if (this.state.freeSpinsLeft <= 0) {
      this.state = { ...this.state, freeSpinsActive: false, freeSpinsLeft: 0 };
    }
  }

  private handleBonusCondition(stops: string[][]): void {
    // Update reels GameMode / logging.
    this.reels.checkBonusCondition();

    // Count bonus symbols in the current stops grid.
    let bonusCount = 0;
    stops.forEach((reel) => {
      reel.forEach((symbol) => {
        if (symbol === 'Bonus') {
          bonusCount++;
        }
      });
    });

    if (bonusCount < REELS_CONFIG.bonusSymbolThreshold) return;

    const award = this.state.freeSpinsActive
      ? FREE_SPINS_RETRIGGER_AWARD
      : FREE_SPINS_INITIAL_AWARD;

    this.state = handleGameState(
      this.state,
      { type: 'FREE_SPINS_AWARDED', count: award },
      this.config,
    );
  }

  private updateGameStateOnSpinConcluded(totalWin: number): void {
    const nextState = handleGameState(
      this.state,
      { type: 'SPIN_CONCLUDED', totalWin },
      this.config,
    );
    this.state = nextState;
  }

  private updatePanelState(totalWin: number): void {
    this.panel.setWin(totalWin);
    this.panel.setBalance(this.state.balance);
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
    this.panel.setForceSelected(this.state.selectedForceIndex);
  }

  private updateFeatureView(): void {
    if (!this.onFreeSpinsChange) return;
    const { freeSpinsActive, freeSpinsLeft } = this.state;
    const remaining = freeSpinsActive ? freeSpinsLeft : -1;
    this.onFreeSpinsChange(remaining);
  }

  private clearForceStops(): void {
    this.reels.forceStops = [];
  }

  private animateWins(wins: Array<{ positions: Array<{ reel: number; row: number }> }>): void {
    wins.forEach((win) => {
      win.positions.forEach((pos) => {
        this.reels.playWinAnimations(pos.reel, pos.row);
      });
    });
  }
}
