import { Container, Graphics } from 'pixi.js';
import { ReelView } from './ReelView';
import { DefaultSymbolGenerator } from '../../utils/SymbolGenerator';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  REELS_CONFIG,
  REEL_FRAME_INNER_PADDING_SCALE,
  REELS_MAX_FIT_SCALE,
} from '../../utils/config';
import { Helper } from '../../utils/Helper';

export enum GameMode {
  NORMAL = 'NORMAL',
  BONUS = 'BONUS',
  FREESPINS = 'FREESPINS',
}

interface ReelsViewOptions {
  numReels: number;
  numRows: number;
  reelWidth: number;
  symbolHeight: number;
  reelSpacing: number;
  yOffset: number;
  screenWidth: number;
  scale: number;
  /** Extra scale used on narrow (mobile) viewports. */
  scaleMobile: number;
}

/**
 * Reels container with spin logic, adapted from the simpleSlot project.
 */
export class ReelsView extends Container {
  private reelViews: ReelView[] = [];
  private options!: ReelsViewOptions;
  public mask!: Graphics;
  public stops!: Array<Array<string>>;
  public forceStops: Array<Array<string>> = [];
  private currentGameMode: GameMode = GameMode.NORMAL;

  constructor(options: Partial<ReelsViewOptions> = {}) {
    super();
    this.initialize(options);
    this.initializeReels();
  }

  protected initialize(options: Partial<ReelsViewOptions> = {}): void {
    const numReels = options.numReels ?? REELS_CONFIG.numReels;
    const numRows = options.numRows ?? REELS_CONFIG.numRows;
    const reelWidth = options.reelWidth ?? REELS_CONFIG.reelWidth;
    const symbolHeight = options.symbolHeight ?? REELS_CONFIG.symbolHeight;
    const reelSpacing = options.reelSpacing ?? REELS_CONFIG.reelSpacing;

    const fitScale = Helper.computeReelsFitScale(
      {
        numReels,
        numRows,
        reelWidth,
        symbolHeight,
        reelSpacing,
        symbolSpacing: REELS_CONFIG.symbolSpacing,
      },
      GAME_WIDTH,
      GAME_HEIGHT,
    );

    this.options = {
      numReels,
      numRows,
      reelWidth,
      symbolHeight,
      reelSpacing,
      yOffset: options.yOffset ?? REELS_CONFIG.yOffset,
      screenWidth: options.screenWidth ?? REELS_CONFIG.screenWidth,
      scale: options.scale ?? fitScale,
      scaleMobile: options.scaleMobile ?? fitScale,
    };

    this.on('spinButtonClicked', () => {
      this.clearWinAnimations();
      this.stops =
        this.forceStops.length > 0 ? this.forceStops : this.generateStops();
      this.spin();
    });
  }

  protected initializeReels(): void {
    this.stops = [];
    const symbolGenerator = new DefaultSymbolGenerator();

    // Create and position reel views
    for (let i = 0; i < this.options.numReels; i++) {
      const reelView = new ReelView(
        {
          symbolHeight: this.options.symbolHeight,
          symbolSpacing: REELS_CONFIG.symbolSpacing,
          numRows: this.options.numRows,
        },
        i,
        this,
        symbolGenerator,
      );

      // Position each reel horizontally with spacing
      reelView.x = i * (this.options.reelWidth + this.options.reelSpacing);

      this.reelViews.push(reelView);
      this.addChild(reelView);
    }

    // Center the entire reels container (include spacing so it works for any numReels)
    const totalWidth =
      this.options.numReels * this.options.reelWidth +
      (this.options.numReels - 1) * this.options.reelSpacing;
    const totalHeight =
      this.options.numRows * this.options.symbolHeight +
      (this.options.numRows - 1) * REELS_CONFIG.symbolSpacing;
    this.pivot.set(totalWidth / 2, totalHeight / 2);
    this.createMask();

    // Apply initial global scale from config/options (desktop by default)
    this.scale.set(this.options.scale);
  }

  /**
   * Layout reels to fit inside a frame and center at the given point.
   * Uses frame inner padding and max scale from config. Call after add to stage when frame size is known.
   */
  public layoutWithinFrame(
    frameWidth: number,
    frameHeight: number,
    centerX: number = GAME_WIDTH / 2,
    centerY: number = GAME_HEIGHT / 2,
  ): void {
    const layout = {
      numReels: this.options.numReels,
      numRows: this.options.numRows,
      reelWidth: this.options.reelWidth,
      symbolHeight: this.options.symbolHeight,
      reelSpacing: this.options.reelSpacing,
      symbolSpacing: REELS_CONFIG.symbolSpacing,
    };
    const frameInnerWidth = frameWidth * REEL_FRAME_INNER_PADDING_SCALE;
    const frameInnerHeight = frameHeight * REEL_FRAME_INNER_PADDING_SCALE;
    const fitScale = Helper.computeReelsFitScale(
      layout,
      frameInnerWidth,
      frameInnerHeight,
      REELS_MAX_FIT_SCALE,
    );
    this.scale.set(fitScale);
    this.x = centerX;
    this.y = centerY;
  }

  private createMask(): void {
    this.mask = new Graphics()
      .rect(0, 0, this.width, this.height)
      .fill(REELS_CONFIG.maskColor);

    this.addChild(this.mask);
    this.mask = this.mask;
  }

  /**
   * Update the reels container scale based on viewport size/orientation.
   * Uses scaleMobile when viewport is in portrait (width < height).
   */
  public updateScaleForViewport(
    viewportWidth: number,
    viewportHeight: number,
  ): void {
    const isPortrait = viewportWidth < viewportHeight;
    const targetScale = isPortrait ? this.options.scaleMobile : this.options.scale;
    this.scale.set(targetScale);
  }

  public spin(): void {
    this.reelViews.forEach((reelView) => {
      reelView.spin();
    });
  }

  private generateStops(): string[][] {
    const stops: string[][] = [];
    const symbolGenerator = new DefaultSymbolGenerator();

    for (let reelIndex = 0; reelIndex < this.options.numReels; reelIndex++) {
      const column: string[] = [];
      let bonusUsed = false;

      for (let rowIndex = 0; rowIndex < this.options.numRows; rowIndex++) {
        let symbol = symbolGenerator.getRandomSymbol();

        if (symbol === 'BONUS' && bonusUsed) {
          // Re-roll until we get a non-BONUS symbol for this reel.
          while (symbol === 'BONUS') {
            symbol = symbolGenerator.getRandomSymbol();
          }
        }

        if (symbol === 'BONUS') {
          bonusUsed = true;
        }

        column.push(symbol);
      }

      stops.push(column);
    }

    return stops;
  }

  public playWinAnimations(reel: number, row: number): void {
    const reelView = this.reelViews[reel];
    const symbolView = reelView.getSymboInRow(row);
    if (symbolView) {
      symbolView.playWinAnimation();
    }
  }

  /** Clears any active win animations on all symbols. */
  public clearWinAnimations(): void {
    this.reelViews.forEach((reelView) => {
      reelView.clearWinAnimations();
    });
  }

  public dispose(): void {
    this.reelViews.forEach((reelView) => {
      reelView.dispose();
    });
    this.reelViews = [];
    this.removeChildren();
  }

  public getStops(): string[][] {
    return this.stops;
  }

  public getReelViews(): ReelView[] {
    return this.reelViews;
  }

  public getNumberOfReels(): number {
    return this.options.numReels;
  }

  public getGameMode(): GameMode {
    return this.currentGameMode;
  }

  public setGameMode(mode: GameMode): void {
    this.currentGameMode = mode;
  }
}

