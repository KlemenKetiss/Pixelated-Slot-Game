import { Container, Sprite, Assets } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/config';

export class ReelFrame extends Container {
  private frameSprite: Sprite;

  constructor() {
    super();

    const REEL_FRAME_Y_OFFSET = 10;
    // Load the frame asset synchronously, assuming it was preloaded
    const frameTexture = Assets.get('ReelFrame');
    this.frameSprite = new Sprite(frameTexture);

    // Center the anchor
    this.frameSprite.anchor.set(0.5);

    // Position it at the center of the screen
    this.frameSprite.x = GAME_WIDTH / 2;
    this.frameSprite.y = GAME_HEIGHT / 2 + REEL_FRAME_Y_OFFSET;
    this.frameSprite.scale.set(1.1);

    this.addChild(this.frameSprite);
  }
}