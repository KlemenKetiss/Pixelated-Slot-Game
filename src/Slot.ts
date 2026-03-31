import '@pixi/spine-pixi';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
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
import {
  getFitScale,
  resetLayoutStyles,
  applyScaledCenteredLayout,
} from './utils/ViewportLayout';
import { MainView } from './views/MainView';
import { GamePanel } from './views/panel/GamePanel';
import { ReactPanelAdapter } from './views/panel/ReactPanelAdapter';
import { GameController } from './logic/GameController';
import { CharacterController } from './logic/CharacterController';
import type { GameConfig } from './logic/GameTypes';

type PixiTestingGlobals = typeof globalThis & {
  __PIXI_APP__?: Application;
  __PIXI_STAGE__?: Application['stage'];
  __PIXI_RENDERER__?: Application['renderer'];
};

export function getPixiAppForTesting(): Application | undefined {
  return (globalThis as PixiTestingGlobals).__PIXI_APP__;
}

export class Slot {
  private app: Application;
  private mainView!: MainView;
  private panelAdapter!: ReactPanelAdapter;
  private gameController!: GameController;
  private characterController!: CharacterController;
  private gameControllerInitialized = false;

  constructor() {
    this.app = new Application();
    (globalThis as PixiTestingGlobals).__PIXI_APP__ = this.app;
    this.app
      .init({
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: SLOT_RENDER_CONFIG.backgroundColor,
        antialias: false,
      })
      .then(async () => {
        (globalThis as PixiTestingGlobals).__PIXI_STAGE__ = this.app.stage;
        (globalThis as PixiTestingGlobals).__PIXI_RENDERER__ = this.app.renderer;
        const container = document.getElementById('game-container');
        if (container) {
          container.insertBefore(this.app.canvas, container.firstChild);
        } else {
          document.body.appendChild(this.app.canvas);
        }

        const assetsBase =
          window.location.origin +
          window.location.pathname.replace(/\/[^/]*$/, '') +
          '/assets/';

        try {
          await Assets.init({
            basePath: assetsBase,
            manifest: assetsBase + 'manifest.json',
          });
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
        this.characterController = new CharacterController(
          this.mainView.characterSpineView,
        );

        const panelMount = document.getElementById('panel-root');
        if (!panelMount) throw new Error('panel-root element not found');

        this.panelAdapter = new ReactPanelAdapter((formatted) => {
          this.mainView.winFieldView.setWinText(formatted);
        });

        createRoot(panelMount).render(
          createElement(GamePanel, {
            adapter: this.panelAdapter,
            onAdapterConnected: () => this.ensureGameController(),
          }),
        );

        window.addEventListener('resize', () => this.onResize());
        this.onResize();
      });
  }

  /**
   * Runs once after {@link ReactPanelAdapter.connect} so the first
   * `setBalance` / `setBet` / … from {@link GameController}'s constructor push into React.
   */
  private ensureGameController(): void {
    if (this.gameControllerInitialized) return;
    this.gameControllerInitialized = true;

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
      this.panelAdapter,
      this.mainView.reelsView,
      gameConfig,
      (remaining) => {
        this.mainView.featureView.setFreeSpins(remaining);
      },
      this.characterController.handleSpinResolved,
      this.characterController.handleBonusEntered,
    );
  }

  private onResize(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    this.updateGameContainerLayout(container as HTMLElement);
  }

  /**
   * Scales and centers the game container (canvas + HTML UI) so it fits in the
   * viewport and stays centered when the window is very wide or very short.
   */
  private updateGameContainerLayout(container: HTMLElement): void {
    resetLayoutStyles(container);
    const bounds = container.getBoundingClientRect();
    const scale = getFitScale(
      bounds.width,
      bounds.height,
      window.innerWidth,
      window.innerHeight,
      SLOT_RENDER_CONFIG.maxViewportScale
    );
    applyScaledCenteredLayout(container, scale);
  }
}
