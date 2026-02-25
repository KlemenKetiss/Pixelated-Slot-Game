import { GAME_HEIGHT, GAME_WIDTH, REELS_CONFIG, FORCE_STOP_SETS } from './config';

type ReelsLayoutParams = {
  numReels: number;
  numRows: number;
  reelWidth: number;
  symbolHeight: number;
  reelSpacing: number;
  symbolSpacing: number;
};

export class Helper {
  public static getForceStops(index: number): Array<Array<string>> {
    if (index < 0 || index >= FORCE_STOP_SETS.length) {
      return [];
    }
    return FORCE_STOP_SETS[index];
  }

  /**
   * Computes scale so that reels (totalWidth x totalHeight) fit inside the given container.
   * @param layout Reel grid dimensions and spacing.
   * @param containerWidth Available width (e.g. game or frame inner width).
   * @param containerHeight Available height (e.g. game or frame inner height).
   * @param maxScale Optional cap for the scale (e.g. REELS_MAX_FIT_SCALE).
   */
  public static computeReelsFitScale(
    layout: ReelsLayoutParams = {
      numReels: REELS_CONFIG.numReels,
      numRows: REELS_CONFIG.numRows,
      reelWidth: REELS_CONFIG.reelWidth,
      symbolHeight: REELS_CONFIG.symbolHeight,
      reelSpacing: REELS_CONFIG.reelSpacing,
      symbolSpacing: REELS_CONFIG.symbolSpacing,
    },
    containerWidth: number = GAME_WIDTH,
    containerHeight: number = GAME_HEIGHT,
    maxScale?: number,
  ): number {
    const totalWidth =
      layout.numReels * layout.reelWidth +
      (layout.numReels - 1) * layout.reelSpacing;
    const totalHeight =
      layout.numRows * layout.symbolHeight +
      (layout.numRows - 1) * layout.symbolSpacing;

    const scaleX = containerWidth / totalWidth;
    const scaleY = containerHeight / totalHeight;
    const fitScale = Math.min(scaleX, scaleY);
    return maxScale != null ? Math.min(fitScale, maxScale) : fitScale;
  }
}

