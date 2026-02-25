import { Sprite, Assets, Container, Graphics, Text } from 'pixi.js';
import { SYMBOL_HEIGHT, SYMBOL_WIDTH, SYMBOL_WIN_DIMMED_ALPHA } from '../utils/config';

/**
 * Single symbol that uses only the base texture from the manifest.
 * There are no separate "_connect" win textures in this project.
 */
export class SymbolView extends Container {
  private _symbolName: string = '';
  private symbolTexture!: Sprite;

  constructor(symbolName: string) {
    super();
    this.initialize(symbolName);
  }

  initialize(symbolName: string): void {
    try {
      this._symbolName = symbolName;
      const baseTexture = Assets.get(symbolName);
      if (baseTexture) {
        this.symbolTexture = new Sprite(baseTexture);
        this.symbolTexture.width = SYMBOL_WIDTH;
        this.symbolTexture.height = SYMBOL_HEIGHT;
        this.symbolTexture.alpha = 1;
        this.addChild(this.symbolTexture);
      } else {
        // Fallback debug tile when texture is missing.
        const tile = new Graphics()
          .roundRect(0, 0, SYMBOL_WIDTH, SYMBOL_HEIGHT, 16)
          .fill({ color: 0x1f2937 });

        const label = new Text({
          text: symbolName,
          style: {
            fill: 0xf9fafb,
            fontSize: 20,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
        });
        label.anchor.set(0.5);
        label.x = SYMBOL_WIDTH / 2;
        label.y = SYMBOL_HEIGHT / 2;

        tile.addChild(label);
        this.addChild(tile);
      }
    } catch (error) {
      console.error('Error initializing symbol:', error);
    }
  }

  public dispose(disposeOfItself = false): void {
    this.removeChildren();

    if (this.symbolTexture) {
      this.symbolTexture.destroy();
    }

    if (disposeOfItself) {
      this.destroy({ children: true });
    }
  }

  public changeSymbol(newSymbolName: string): void {
    this.dispose();
    this.initialize(newSymbolName);
  }

  /** Simple win effect: dim the base symbol. */
  public playWinAnimation(): void {
    if (this.symbolTexture) {
      this.symbolTexture.alpha = SYMBOL_WIN_DIMMED_ALPHA;
    }
  }

  getSprite(): Sprite {
    return this.symbolTexture;
  }

  public get symbolName(): string {
    return this._symbolName;
  }
}

