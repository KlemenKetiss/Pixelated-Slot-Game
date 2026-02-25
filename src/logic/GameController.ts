import type { PanelPort, ReelsPort, GameConfig, GameState } from './GameTypes';
import { reduceGameState } from './GameTypes';
import { checkForWinningWays } from './WinLogic';

export class GameController {
  private state: GameState;

  constructor(
    private readonly panel: PanelPort,
    private readonly reels: ReelsPort,
    private readonly config: GameConfig,
  ) {
    this.state = {
      balance: config.initialBalance,
      spinActive: false,
      selectedForceIndex: null,
      betIndex: config.defaultBetIndex,
    };
    this.panel.setBalance(this.state.balance);
    this.panel.setWin(this.config.initialWin);
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
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
    const canAffordCurrentBet = this.state.balance >= this.getCurrentBet();
    const canSpin = !this.state.spinActive && canAffordCurrentBet;
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
    const nextState = reduceGameState(
      this.state,
      { type: 'SPIN_REQUESTED' },
      this.config,
    );
    if (nextState === this.state) {
      return;
    }

    this.state = nextState;
    this.panel.setBalance(this.state.balance);
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();

    const forceStops =
      this.state.selectedForceIndex !== null
        ? this.config.forceStopSets[this.state.selectedForceIndex] ?? []
        : [];
    this.reels.forceStops = forceStops;
    this.reels.emit('spinButtonClicked');
  }

  private handleForceOutcome(index: number): void {
    const nextState = reduceGameState(
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
    const nextState = reduceGameState(this.state, event, this.config);
    if (nextState === this.state) return;
    this.state = nextState;
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
  }

  private handleSpinConcluded(): void {
    const stops = this.reels.getStops();
    const { wins, totalWin: baseWin } = checkForWinningWays(
      stops,
      this.config,
    );
    const bet = this.getCurrentBet();
    const totalWin = baseWin * bet;

    this.reels.checkBonusCondition();

    const nextState = reduceGameState(
      this.state,
      { type: 'SPIN_CONCLUDED', totalWin },
      this.config,
    );
    this.state = nextState;

    this.panel.setWin(totalWin);
    this.panel.setBalance(this.state.balance);
    this.panel.setBet(this.getCurrentBet());
    this.updateBetButtonsEnabled();
    this.updateSpinEnabled();
    this.reels.forceStops = [];
    this.panel.setForceSelected(this.state.selectedForceIndex);

    wins.forEach((win) => {
      win.positions.forEach((pos) => {
        this.reels.playWinAnimations(pos.reel, pos.row);
      });
    });
  }
}
