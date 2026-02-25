import { Container } from 'pixi.js';
import { REELS_CONFIG, SYMBOL_HEIGHT, SYMBOL_WIDTH } from '../utils/config';
import { ReelView } from './ReelView';

/**
 * Collection of reels laid out horizontally.
 */
export class ReelsView extends Container {
  public readonly reels: ReelView[] = [];

  constructor() {
    super();

    const { numReels, numRows, reelSpacing, symbolSpacing } = REELS_CONFIG;

    for (let reelIndex = 0; reelIndex < numReels; reelIndex++) {
      const reelView = new ReelView(reelIndex);
      reelView.x = reelIndex * (SYMBOL_WIDTH + reelSpacing);
      reelView.y = 0;
      this.reels.push(reelView);
      this.addChild(reelView);
    }

    // Precompute total size for centering if needed.
    const totalWidth = numReels * SYMBOL_WIDTH + (numReels - 1) * reelSpacing;
    const totalHeight = numRows * SYMBOL_HEIGHT + (numRows - 1) * symbolSpacing;
    this.width = totalWidth;
    this.height = totalHeight;
  }
}

