import { Application, Assets, Sprite, Graphics, Text } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, REELS_CONFIG, SYMBOLS, SLOT_RENDER_CONFIG, SYMBOL_HEIGHT, SYMBOL_WIDTH } from './utils/config';

export class Slot {
  private app: Application;

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
          // Parcel copies everything from /assets to dist/assets via parcel-reporter-static-files-copy
          await Assets.init({ manifest: './assets/manifest.json' });
          const textures = await Assets.loadBundle('game-bundle');
          console.log('Assets loaded, ready to start the game.');

          // Render an initial 3x3 grid using the loaded textures.
          this.createInitialBoard(textures as Record<string, any>);
        } catch (error) {
          console.error('Failed to load assets manifest or bundle:', error);
        }
      });
  }

  /** Renders a simple 3x3 grid of symbol sprites using loaded textures. */
  private createInitialBoard(textures: Record<string, any>): void {
    const { numReels, numRows, reelSpacing, symbolSpacing } = REELS_CONFIG;

    const totalWidth =
      numReels * SYMBOL_WIDTH + (numReels - 1) * reelSpacing;
    const totalHeight =
      numRows * SYMBOL_HEIGHT + (numRows - 1) * symbolSpacing;

    const originX = (GAME_WIDTH - totalWidth) / 2;
    const originY = (GAME_HEIGHT - totalHeight) / 2;

    for (let reel = 0; reel < numReels; reel++) {
      for (let row = 0; row < numRows; row++) {
        const x =
          originX +
          reel * (SYMBOL_WIDTH + reelSpacing);
        const y =
          originY +
          row * (SYMBOL_HEIGHT + symbolSpacing);

        const alias = SYMBOLS[(reel * numRows + row) % SYMBOLS.length];
        const texture = textures[alias];

        if (texture) {
          const sprite = new Sprite(texture);
          sprite.x = x;
          sprite.y = y;
          sprite.width = SYMBOL_WIDTH;
          sprite.height = SYMBOL_HEIGHT;
          this.app.stage.addChild(sprite);
        } else {
          // Fallback: draw a debug tile with the alias text if the texture is missing.
          const tile = new Graphics()
            .roundRect(0, 0, SYMBOL_WIDTH, SYMBOL_HEIGHT, 16)
            .fill({ color: 0x1f2937 })
            .stroke({ color: 0x4b5563, width: 3 });

          tile.x = x;
          tile.y = y;

          const label = new Text({
            text: alias,
            style: {
              fill: 0xf9fafb,
              fontSize: 28,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            },
          });
          label.anchor.set(0.5);
          label.x = SYMBOL_WIDTH / 2;
          label.y = SYMBOL_HEIGHT / 2;

          tile.addChild(label);
          this.app.stage.addChild(tile);
        }
      }
    }
  }
}
