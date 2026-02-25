import { Container, Sprite, Assets } from 'pixi.js';
import {
  SYMBOL_WIDTH,
  REELS_CONFIG,
  REEL_SEPARATOR_X_OFFSET,
  REEL_SEPARATOR_Y_OFFSET,
  SEPERATOR_START_OFFSET,
} from '../../../utils/config';

/**
 * Displays a row of vertical ReelSeparator sprites, spaced apart by symbol width.
 */
export class ReelSeparatorView extends Container {
  private separators: Sprite[] = [];

  /**
   * @param count Number of reel separators to create and display.
   */
  constructor(count: number) {
            super();
            this.initializeSeparators(count);
    }

    protected initializeSeparators(count: number): void {
        const separatorTexture = Assets.get('ReelSeperator');
        const reelSpacing = REELS_CONFIG.reelSpacing;

        for (let i = 0; i < count; i++) {
            const sprite = new Sprite(separatorTexture);
            sprite.anchor.set(0.5);
            sprite.x = -SYMBOL_WIDTH - SEPERATOR_START_OFFSET + i * (SYMBOL_WIDTH + reelSpacing + REEL_SEPARATOR_X_OFFSET);
            sprite.y = REEL_SEPARATOR_Y_OFFSET;
            this.separators.push(sprite);
            this.addChild(sprite);
        }
    }
}
