import { Application, Assets } from 'pixi.js';

export class Slot {
  private app: Application;

  constructor() {
    this.app = new Application();

    this.app
      .init({
        width: 800,
        height: 600,
        backgroundColor: 0x000000,
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
          // Parcel copies everything from /assets to dist/assets via parcel-reporter-static-files-copy
          await Assets.init({ manifest: './assets/manifest.json' });
          await Assets.loadBundle('game-bundle');
          console.log('Assets loaded, ready to start the game.');
        } catch (error) {
          console.error('Failed to load assets manifest or bundle:', error);
        }
      });
  }
}

