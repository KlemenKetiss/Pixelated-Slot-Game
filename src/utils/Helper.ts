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

  public static computeReelsFitScale(
    layout: ReelsLayoutParams = {
      numReels: REELS_CONFIG.numReels,
      numRows: REELS_CONFIG.numRows,
      reelWidth: REELS_CONFIG.reelWidth,
      symbolHeight: REELS_CONFIG.symbolHeight,
      reelSpacing: REELS_CONFIG.reelSpacing,
      symbolSpacing: REELS_CONFIG.symbolSpacing,
    },
    gameWidth: number = GAME_WIDTH,
    gameHeight: number = GAME_HEIGHT,
  ): number {
    const totalWidth =
      layout.numReels * layout.reelWidth +
      (layout.numReels - 1) * layout.reelSpacing;
    const totalHeight =
      layout.numRows * layout.symbolHeight +
      (layout.numRows - 1) * layout.symbolSpacing;

    return Math.min(gameWidth / totalWidth, gameHeight / totalHeight);
  }
}

