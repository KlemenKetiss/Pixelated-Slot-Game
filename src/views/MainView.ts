import { Container } from 'pixi.js';
import { GAME_HEIGHT, GAME_WIDTH, REELS_CONFIG, SYMBOL_HEIGHT, SYMBOL_WIDTH } from '../utils/config';
import { ReelsView } from './ReelsView';
import { ReelFrame } from './ReelFrame';

/**
 * Root Pixi container for the slot game scene.
 * Currently only hosts the reels, but later can include backgrounds, frames, etc.
 */
export class MainView extends Container {
  public readonly reelsView: ReelsView;
  public readonly reelFrame: ReelFrame;
  constructor() {
    super();

    this.reelFrame = new ReelFrame();
    this.reelsView = new ReelsView();
    this.layoutReels();
    // Draw frame behind reels
    this.addChild(this.reelFrame);
    this.addChild(this.reelsView);
  }

  private layoutReels(): void {
    const { numReels, numRows, reelSpacing, symbolSpacing } = REELS_CONFIG;

    const totalWidth =
      numReels * SYMBOL_WIDTH + (numReels - 1) * reelSpacing;
    const totalHeight =
      numRows * SYMBOL_HEIGHT + (numRows - 1) * symbolSpacing;

    // Compute available space inside the frame (small padding so reels don't touch the border).
    const frameInnerWidth = this.reelFrame.width * 0.98;
    const frameInnerHeight = this.reelFrame.height * 0.98;

    const scaleX = frameInnerWidth / totalWidth;
    const scaleY = frameInnerHeight / totalHeight;
    const fitScale = Math.min(scaleX, scaleY, 1.7);

    this.reelsView.scale.set(fitScale);

    // Center reels within the game area (and thus within the frame).
    this.reelsView.x = GAME_WIDTH / 2;
    this.reelsView.y = GAME_HEIGHT / 2;
  }
}

