import { Assets, Container, Sprite, Text } from 'pixi.js';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  WIN_FIELD_FONT_SIZE,
  WIN_FIELD_INITIAL_TEXT,
  WIN_FIELD_TEXT_Y_OFFSET,
  WIN_FIELD_BOTTOM_OFFSET,
  WIN_FIELD_HORIZONTAL_OFFSET,
  WIN_FIELD_TEXT_COLOR,
} from '../../utils/config';

/**
 * Pixi container that draws the WinField.png and the win amount using
 * the pixel font provided in assets/fonts.
 *
 * Positions itself near the bottom-right, behind the HTML win text.
 */
export class WinFieldView extends Container {
  private winFieldSprite: Sprite;
  private winText: Text;

  constructor() {
    super();

    const texture = Assets.get('WinField');
    this.winFieldSprite = new Sprite(texture);
    this.winFieldSprite.anchor.set(0.5);
    this.winFieldSprite.scale.set(0.8);
    this.addChild(this.winFieldSprite);

    this.winText = new Text({
      text: WIN_FIELD_INITIAL_TEXT,
      style: {
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        fontSize: WIN_FIELD_FONT_SIZE,
        fill: WIN_FIELD_TEXT_COLOR,
        align: 'center',
        stroke: { color: 0x111827, width: 8, join: 'round' },
        dropShadow: {
          color: 0x000000,
          alpha: 0.35,
          angle: Math.PI / 4,
          distance: 4,
          blur: 0,
        },
        letterSpacing: 1.5,
      },
    });
    this.winText.anchor.set(0.5);
    this.winText.y = WIN_FIELD_TEXT_Y_OFFSET;
    this.addChild(this.winText);

    // Return to approximate position used before centering: bottom-right area.
    this.x = GAME_WIDTH / 2 - WIN_FIELD_HORIZONTAL_OFFSET;
    this.y = GAME_HEIGHT / 2 - WIN_FIELD_BOTTOM_OFFSET;
  }

  public setWinText(text: string): void {
    this.winText.text = text;
  }
}

