import { Container, Sprite, Assets } from 'pixi.js';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  REEL_FRAME_SCALE,
  REEL_FRAME_Y_OFFSET,
} from '../../../utils/config';

export class ReelsViewBackground extends Container {
  private reelFrameBackgroundSprite!: Sprite;

  constructor() {
    super();
    this.initialize();
  }

  protected initialize(): void {
    const frameBgTexture = Assets.get('ReelFrameBackground');
    this.reelFrameBackgroundSprite = new Sprite(frameBgTexture);
    this.reelFrameBackgroundSprite.anchor.set(0.5);
    this.reelFrameBackgroundSprite.x = GAME_WIDTH / 2;
    this.reelFrameBackgroundSprite.y = GAME_HEIGHT / 2 + REEL_FRAME_Y_OFFSET;
    this.reelFrameBackgroundSprite.scale.set(REEL_FRAME_SCALE);
    this.addChild(this.reelFrameBackgroundSprite);
  }
}