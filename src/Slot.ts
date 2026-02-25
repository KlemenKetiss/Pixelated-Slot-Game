import { Application, Assets } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, SLOT_RENDER_CONFIG, BET_LEVELS, DEFAULT_BET_INDEX, INITIAL_WIN, PANEL_CONFIG, FORCE_STOP_SETS, WINNING_WAYS_CONFIG, SYMBOL_PAYOUTS } from './utils/config';
import { MainView } from './views/MainView';
import type { GameConfig, GameState } from './logic/GameTypes';
import { reduceGameState } from './logic/GameTypes';
import { checkForWinningWays } from './logic/WinLogic';

export class Slot {
  private app: Application;
  private mainView?: MainView;
  private gameConfig: GameConfig;
  private gameState: GameState;

  constructor() {
    this.app = new Application();
    this.gameConfig = {
      initialBalance: PANEL_CONFIG.initialBalance,
      initialWin: INITIAL_WIN,
      betLevels: BET_LEVELS,
      defaultBetIndex: DEFAULT_BET_INDEX,
      forceStopSets: FORCE_STOP_SETS,
      winningWays: WINNING_WAYS_CONFIG,
      symbolPayouts: SYMBOL_PAYOUTS,
    };

    this.app
      .init({
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: SLOT_RENDER_CONFIG.backgroundColor,
        antialias: false,
      })
      .then(async () => {
        const container = document.getElementById('game-container');
        if (container) {
          container.insertBefore(this.app.canvas, container.firstChild);
        } else {
          document.body.appendChild(this.app.canvas);
        }

        try {
          await Assets.init({ manifest: './assets/manifest.json' });
          console.log('Assets manifest loaded successfully');
        } catch (error) {
          console.error('Failed to load assets manifest:', error);
        }

        try {
          await Assets.loadBundle('game-bundle');
          console.log('Assets bundle loaded successfully');
        } catch (error) {
          console.error('Failed to load assets bundle:', error);
        }

        // Create and attach the main view (reels etc.).
        this.mainView = new MainView();
        this.app.stage.addChild(this.mainView);

        this.wireUi();
      });

    this.gameState = {
      balance: this.gameConfig.initialBalance,
      spinActive: false,
      selectedForceIndex: null,
      betIndex: this.gameConfig.defaultBetIndex,
    };
    this.updatePanelUi(INITIAL_WIN);
  }

  /** Wires HTML controls to the reels logic. */
  private wireUi(): void {
    const spinBtn = document.getElementById('spin-btn') as HTMLButtonElement | null;
    const betUpBtn = document.getElementById('bet-increase') as HTMLButtonElement | null;
    const betDownBtn = document.getElementById('bet-decrease') as HTMLButtonElement | null;
    if (!spinBtn || !this.mainView) return;

    const reelsView = this.mainView.reelsView;

    const handleSpinClick = () => {
      // Ask reducer if spin is allowed and pay spin cost.
      const next = reduceGameState(this.gameState, { type: 'SPIN_REQUESTED' }, this.gameConfig);
      if (next === this.gameState) {
        // Not enough balance or already spinning.
        return;
      }
      this.gameState = next;
      this.updatePanelUi();

      // Prevent spamming while a spin is in progress.
      spinBtn.disabled = true;
      reelsView.emit('spinButtonClicked');
    };

    spinBtn.addEventListener('click', handleSpinClick);

    reelsView.on('spinConcluded', () => {
      spinBtn.disabled = false;
      this.handleSpinConcluded();
    });

    if (betUpBtn) {
      betUpBtn.addEventListener('click', () => {
        const next = reduceGameState(this.gameState, { type: 'BET_UP' }, this.gameConfig);
        if (next !== this.gameState) {
          this.gameState = next;
          this.updatePanelUi();
        }
      });
    }

    if (betDownBtn) {
      betDownBtn.addEventListener('click', () => {
        const next = reduceGameState(this.gameState, { type: 'BET_DOWN' }, this.gameConfig);
        if (next !== this.gameState) {
          this.gameState = next;
          this.updatePanelUi();
        }
      });
    }
  }

  /** Computes wins after a spin and plays win animations. */
  private handleSpinConcluded(): void {
    if (!this.mainView) return;
    const reelsView = this.mainView.reelsView;
    const stops = reelsView.getStops();
    if (!stops || stops.length === 0) return;

    const result = checkForWinningWays(stops, this.gameConfig);
    const currentBet = this.getCurrentBet();
    const totalWinCredits = result.totalWin * currentBet;

    // Feed win back into reducer to update balance and clear spinActive.
    this.gameState = reduceGameState(
      this.gameState,
      { type: 'SPIN_CONCLUDED', totalWin: totalWinCredits },
      this.gameConfig,
    );

    // Update Win field in UI
    const winDisplay = document.getElementById('win-display');
    if (winDisplay) {
      winDisplay.textContent = `Win: ${totalWinCredits} €`;
    }

    // Update credits/bet display
    this.updatePanelUi(totalWinCredits);

    // Play symbol win animations
    result.wins.forEach((win) => {
      win.positions.forEach((pos) => {
        reelsView.playWinAnimations(pos.reel, pos.row);
      });
    });
  }

  private getCurrentBet(): number {
    const idx = Math.max(
      0,
      Math.min(this.gameState.betIndex, this.gameConfig.betLevels.length - 1),
    );
    return this.gameConfig.betLevels[idx] ?? 0;
  }

  /** Syncs Credits and Bet fields in the HTML UI. */
  private updatePanelUi(latestWin?: number): void {
    const balanceDisplay = document.getElementById('balance-display');
    const betDisplay = document.getElementById('bet-display');

    if (balanceDisplay) {
      balanceDisplay.textContent = `Credits: ${this.formatAmount(
        this.gameState.balance,
      )} €`;
    }

    if (betDisplay) {
      betDisplay.textContent = `Bet: ${this.getCurrentBet()} €`;
    }

    if (latestWin === undefined) return;
    const winDisplay = document.getElementById('win-display');
    if (winDisplay) {
      winDisplay.textContent = `Win: ${this.formatAmount(latestWin)} €`;
    }
  }

  /** Formats numbers with up to two decimal places, without trailing zeros. */
  private formatAmount(value: number): string {
    if (!Number.isFinite(value)) return '0';
    const fixed = value.toFixed(2);
    return fixed.replace(/\.?0+$/, '');
  }
}
