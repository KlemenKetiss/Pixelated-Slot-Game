import { Assets, Container, Sprite } from 'pixi.js';
import { GAME_HEIGHT, GAME_WIDTH, REELS_CONFIG, SYMBOL_HEIGHT, SYMBOL_WIDTH } from '../utils/config';
import { ReelsView } from './ReelsView';

/**
 * Root Pixi container for the slot game scene.
 * Currently only hosts the reels, but later can include backgrounds, frames, etc.
 */
export class MainView extends Container {
  public readonly reelsView: ReelsView;

  constructor() {
    super();

    // Reels
    this.reelsView = new ReelsView();
    this.layoutReels();
    this.addChild(this.reelsView);

    // Static overlay / frame elements
    this.addReelFrame();
    this.addReelSeparators();
    this.addUiElements();
  }

  private layoutReels(): void {
    const { numReels, numRows, reelSpacing, symbolSpacing } = REELS_CONFIG;

    const totalWidth =
      numReels * SYMBOL_WIDTH + (numReels - 1) * reelSpacing;
    const totalHeight =
      numRows * SYMBOL_HEIGHT + (numRows - 1) * symbolSpacing;

    const originX = (GAME_WIDTH - totalWidth) / 2;
    const originY = (GAME_HEIGHT - totalHeight) / 2;

    this.reelsView.x = originX;
    this.reelsView.y = originY;
  }

  private addReelFrame(): void {
    let frameTexture;
    try {
      frameTexture = Assets.get('ReelFrame');
    } catch {
      frameTexture = undefined;
    }
    if (!frameTexture) return;

    const frame = new Sprite(frameTexture);
    frame.anchor.set(0.5);
    frame.x = GAME_WIDTH / 2;
    frame.y = GAME_HEIGHT / 2;

    this.addChildAt(frame, 0);
  }

  private addReelSeparators(): void {
    let sepTexture;
    try {
      sepTexture = Assets.get('ReelSeperator');
    } catch {
      sepTexture = undefined;
    }
    if (!sepTexture) return;

    const { numReels, reelSpacing } = REELS_CONFIG;

    const totalWidth =
      numReels * SYMBOL_WIDTH + (numReels - 1) * reelSpacing;
    const originX = (GAME_WIDTH - totalWidth) / 2;
    const centerY = GAME_HEIGHT / 2;

    // For 3 reels we need 2 separators between them.
    for (let i = 1; i < numReels; i++) {
      const sep = new Sprite(sepTexture);
      sep.anchor.set(0.5);
      const x =
        originX +
        i * SYMBOL_WIDTH +
        (i - 0.5) * reelSpacing;
      sep.x = x;
      sep.y = centerY;
      this.addChild(sep);
    }
  }

  private addUiElements(): void {
    let betFieldTex, winFieldTex, spinButtonTex;
    try {
      betFieldTex = Assets.get('BetField');
    } catch {
      betFieldTex = undefined;
    }
    try {
      winFieldTex = Assets.get('WinField');
    } catch {
      winFieldTex = undefined;
    }
    try {
      spinButtonTex = Assets.get('SpinButton');
    } catch {
      spinButtonTex = undefined;
    }

    const bottomY = GAME_HEIGHT - 80;

    if (betFieldTex) {
      const betField = new Sprite(betFieldTex);
      betField.anchor.set(0.5);
      betField.x = GAME_WIDTH / 2 - 220;
      betField.y = bottomY;
      this.addChild(betField);
    }

    if (winFieldTex) {
      const winField = new Sprite(winFieldTex);
      winField.anchor.set(0.5);
      winField.x = GAME_WIDTH / 2 + 220;
      winField.y = bottomY;
      this.addChild(winField);
    }

    if (spinButtonTex) {
      const spinButton = new Sprite(spinButtonTex);
      spinButton.anchor.set(0.5);
      spinButton.x = GAME_WIDTH / 2;
      spinButton.y = bottomY;
      this.addChild(spinButton);
    }
  }
}

