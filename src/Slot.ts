import { Application, Assets } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, SLOT_RENDER_CONFIG } from './utils/config';
import { MainView } from './views/MainView';

export class Slot {
  private app: Application;
  private mainView?: MainView;

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

        // Create and attach the main view (reels etc.). Views use Assets.get(...)
        // just like in the original simpleSlot project.
        this.mainView = new MainView();
        this.app.stage.addChild(this.mainView);
      });
  }
}
