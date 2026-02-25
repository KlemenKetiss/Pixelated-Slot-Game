import { Container } from 'pixi.js';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  REELS_CONFIG,
  SYMBOL_HEIGHT,
  SYMBOL_WIDTH,
  REEL_FRAME_INNER_PADDING_SCALE,
  REELS_MAX_FIT_SCALE,
} from '../utils/config';
import { ReelsView } from './ReelsView';
import { ReelFrame } from './ReelFrame';
import { WinFieldView } from './WinFieldView';
import { ReelSeparatorView } from './ReelSeparatorView';

/**
 * Root Pixi container for the slot game scene.
 * Currently only hosts the reels, but later can include backgrounds, frames, etc.
 */
export class MainView extends Container {
  public readonly reelsView: ReelsView;
  public readonly reelFrame: ReelFrame;
  public readonly winFieldView: WinFieldView;
  public readonly reelSeparators: ReelSeparatorView;
  constructor() {
    super();

    this.reelFrame = new ReelFrame();
    this.winFieldView = new WinFieldView();
    this.reelsView = new ReelsView();
    this.reelSeparators = new ReelSeparatorView(REELS_CONFIG.numReels - 1);
    this.layoutReels();
    // Draw frame behind reels, WinField overlay near bottom, then reels
    this.addChild(this.reelsView);
    this.addChild(this.reelSeparators);
    this.addChild(this.reelFrame);
    this.addChild(this.winFieldView);
  }

  private layoutReels(): void {
    const { numReels, numRows, reelSpacing, symbolSpacing } = REELS_CONFIG;

    const totalWidth =
      numReels * SYMBOL_WIDTH + (numReels - 1) * reelSpacing;
    const totalHeight =
      numRows * SYMBOL_HEIGHT + (numRows - 1) * symbolSpacing;

    // Compute available space inside the frame (small padding so reels don't touch the border).
    const frameInnerWidth = this.reelFrame.width * REEL_FRAME_INNER_PADDING_SCALE;
    const frameInnerHeight = this.reelFrame.height * REEL_FRAME_INNER_PADDING_SCALE;

    const scaleX = frameInnerWidth / totalWidth;
    const scaleY = frameInnerHeight / totalHeight;
    const fitScale = Math.min(scaleX, scaleY, REELS_MAX_FIT_SCALE);

    this.reelsView.scale.set(fitScale);

    // Center reels within the game area (and thus within the frame).
    this.reelsView.x = GAME_WIDTH / 2;
    this.reelsView.y = GAME_HEIGHT / 2;

    // Match separators to the reels view position and scale so they stay aligned.
    this.reelSeparators.x = this.reelsView.x;
    this.reelSeparators.y = this.reelsView.y;
    this.reelSeparators.height = this.reelsView.height;
  }
}

