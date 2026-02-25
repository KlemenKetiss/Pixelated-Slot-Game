import { Application, Assets } from 'pixi.js';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SLOT_RENDER_CONFIG,
  BET_LEVELS,
  DEFAULT_BET_INDEX,
  INITIAL_WIN,
  PANEL_CONFIG,
  FORCE_STOP_SETS,
  WINNING_WAYS_CONFIG,
  SYMBOL_PAYOUTS,
} from './utils/config';
import { MainView } from './views/MainView';
import { PanelView } from './views/panel/PanelView';
import { GameController } from './logic/GameController';
import type { GameConfig } from './logic/GameTypes';

export class Slot {
  private app: Application;
  private mainView!: MainView;
  private panelView!: PanelView;
  private gameController!: GameController;

  constructor() {
    this.app = new Application();
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

        try {
          await document.fonts.load('32px "Pixelify Sans"');
          console.log('Pixelify Sans font loaded successfully');
        } catch (error) {
          console.error('Failed to load Pixelify Sans font:', error);
        }

        this.mainView = new MainView();
        this.app.stage.addChild(this.mainView);

        const overlay = document.getElementById('ui-overlay');
        if (!overlay) throw new Error('ui-overlay element not found');
        this.panelView = new PanelView(overlay as HTMLElement, (formatted) => {
          this.mainView.winFieldView.setWinText(formatted);
        });

        const gameConfig: GameConfig = {
          initialBalance: PANEL_CONFIG.initialBalance,
          initialWin: INITIAL_WIN,
          betLevels: BET_LEVELS,
          defaultBetIndex: DEFAULT_BET_INDEX,
          forceStopSets: FORCE_STOP_SETS,
          winningWays: WINNING_WAYS_CONFIG,
          symbolPayouts: SYMBOL_PAYOUTS,
        };

        this.gameController = new GameController(
          this.panelView,
          this.mainView.reelsView,
          gameConfig,
          (remaining) => {
            this.mainView.featureView.setFreeSpins(remaining);
          },
        );
      });
  }
}
