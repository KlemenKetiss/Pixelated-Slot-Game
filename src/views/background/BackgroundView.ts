import { Container, Sprite, Assets } from 'pixi.js';
import { GAME_HEIGHT, GAME_WIDTH } from '../../utils/config';

export class BackgroundView extends Container {
    private backgroundSprite!: Sprite;

    constructor() {
        super();
        this.initialize();
    }

    protected initialize(): void {
    const texture = Assets.get('Background');
    this.backgroundSprite = new Sprite(texture);
    this.backgroundSprite.anchor.set(0.5);
    this.backgroundSprite.width = GAME_WIDTH;
    this.backgroundSprite.height = GAME_HEIGHT;
    // Center the background to fully cover the game area.
    this.backgroundSprite.x = GAME_WIDTH / 2;
    this.backgroundSprite.y = GAME_HEIGHT / 2;
    this.addChild(this.backgroundSprite);
    }
}