import { Sprite, Assets, Container, Graphics, Text } from 'pixi.js';
import {
  SYMBOL_HEIGHT,
  SYMBOL_WIDTH,
  SYMBOL_WIN_DIMMED_ALPHA,
  SYMBOL_FALLBACK_CORNER_RADIUS,
  SYMBOL_FALLBACK_FONT_SIZE,
  SYMBOL_FALLBACK_BG_COLOR,
  SYMBOL_FALLBACK_TEXT_COLOR,
  SYMBOL_WIN_ANIMATION_CONFIG,
} from '../../utils/config';
import gsap from 'gsap';

/**
 * Single symbol that uses base + optional "_connect" texture from the manifest.
 */
export class SymbolView extends Container {
  private _symbolName: string = '';
  private symbolTexture!: Sprite;
  private winTween?: gsap.core.Tween;
  private baseScaleX = 1;
  private baseScaleY = 1;
  private hasConnectTexture = false;

  constructor(symbolName: string) {
    super();
    this.initialize(symbolName);
  }

  initialize(symbolName: string): void {
    try {
      this._symbolName = symbolName;
      const baseTexture = Assets.get(symbolName);
      const shouldUseConnectVariant = symbolName !== 'BONUS';
      const connectTexture = shouldUseConnectVariant
        ? Assets.get(`${symbolName}_connect`)
        : undefined;
      this.hasConnectTexture = Boolean(connectTexture);
      if (baseTexture) {
        this.symbolTexture = new Sprite(baseTexture);
        this.symbolTexture.anchor.set(0.5);
        this.symbolTexture.width = SYMBOL_WIDTH;
        this.symbolTexture.height = SYMBOL_HEIGHT;
        this.symbolTexture.alpha = 1;
        this.addChild(this.symbolTexture);
        // Center sprite within its container
        this.symbolTexture.x = SYMBOL_WIDTH / 2;
        this.symbolTexture.y = SYMBOL_HEIGHT / 2;
        // Remember the natural scale after sizing, so we can restore it later.
        this.baseScaleX = this.symbolTexture.scale.x;
        this.baseScaleY = this.symbolTexture.scale.y;
      } else {
        // Fallback debug tile when texture is missing.
        const tile = new Graphics()
          .roundRect(
            0,
            0,
            SYMBOL_WIDTH,
            SYMBOL_HEIGHT,
            SYMBOL_FALLBACK_CORNER_RADIUS,
          )
          .fill({ color: SYMBOL_FALLBACK_BG_COLOR });

        const label = new Text({
          text: symbolName,
          style: {
            fill: SYMBOL_FALLBACK_TEXT_COLOR,
            fontSize: SYMBOL_FALLBACK_FONT_SIZE,
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
    this.resetWinAnimation();
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

  /**
   * Simple win effect: pulse scale between 0.8 and 1.2 with a slight shake.
   */
  public playWinAnimation(): void {
    if (this.symbolTexture) {
      this.resetWinAnimation();
      if (this.hasConnectTexture) {
        const connectTexture = Assets.get(`${this._symbolName}_connect`);
        if (connectTexture) {
          this.symbolTexture.texture = connectTexture;
        }
      }
      this.winTween = gsap.to(this.symbolTexture, {
        duration: SYMBOL_WIN_ANIMATION_CONFIG.duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        alpha: SYMBOL_WIN_DIMMED_ALPHA,
        //x: this.symbolTexture.x + SYMBOL_WIN_ANIMATION_CONFIG.shakeOffsetX,
      });
    }
  }

  /**
   * Clears any active win tween and restores default appearance.
   */
  public resetWinAnimation(): void {
    if (this.winTween) {
      this.winTween.kill();
      this.winTween = undefined;
    }
    if (this.symbolTexture) {
      const baseTexture = Assets.get(this._symbolName);
      if (baseTexture) {
        this.symbolTexture.texture = baseTexture;
      }
      this.symbolTexture.alpha = 1;
      this.symbolTexture.scale.set(this.baseScaleX, this.baseScaleY);
      this.symbolTexture.x = SYMBOL_WIDTH / 2;
      this.symbolTexture.y = SYMBOL_HEIGHT / 2;
    }
  }

  getSprite(): Sprite {
    return this.symbolTexture;
  }

  public get symbolName(): string {
    return this._symbolName;
  }
}

