import { Container, Sprite, Assets } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../../../utils/config';

export class ReelsViewBackground extends Container {
    private reelFrameBackgroundSprite!: Sprite;

    constructor() {
        super();
        this.initialize();
    }

    protected initialize(): void {
        const frameBgTexture = Assets.get('ReelFrameBackground');
        const reelFrameBackgroundScale = 1.1;
        const reelFrameBackgroundYOffset = 10;
        this.reelFrameBackgroundSprite = new Sprite(frameBgTexture);
        this.reelFrameBackgroundSprite.anchor.set(0.5);
        this.reelFrameBackgroundSprite.x = GAME_WIDTH / 2;
        this.reelFrameBackgroundSprite.y = GAME_HEIGHT / 2 + reelFrameBackgroundYOffset;
        this.reelFrameBackgroundSprite.scale.set(reelFrameBackgroundScale);
        this.addChild(this.reelFrameBackgroundSprite);
    }
}