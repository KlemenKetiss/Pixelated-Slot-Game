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
  WIN_FIELD_SPRITE_SCALE,
  WIN_FIELD_STROKE_COLOR,
  WIN_FIELD_STROKE_WIDTH,
  WIN_FIELD_DROP_SHADOW_COLOR,
  WIN_FIELD_DROP_SHADOW_ALPHA,
  WIN_FIELD_DROP_SHADOW_ANGLE,
  WIN_FIELD_DROP_SHADOW_DISTANCE,
  WIN_FIELD_DROP_SHADOW_BLUR,
  WIN_FIELD_LETTER_SPACING,
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
    this.winFieldSprite.scale.set(WIN_FIELD_SPRITE_SCALE);
    this.addChild(this.winFieldSprite);

    this.winText = new Text({
      text: WIN_FIELD_INITIAL_TEXT,
      style: {
        fontFamily: 'Inter',
        fontSize: WIN_FIELD_FONT_SIZE,
        fill: WIN_FIELD_TEXT_COLOR,
        align: 'center',
        stroke: {
          color: WIN_FIELD_STROKE_COLOR,
          width: WIN_FIELD_STROKE_WIDTH,
          join: 'round',
        },
        dropShadow: {
          color: WIN_FIELD_DROP_SHADOW_COLOR,
          alpha: WIN_FIELD_DROP_SHADOW_ALPHA,
          angle: WIN_FIELD_DROP_SHADOW_ANGLE,
          distance: WIN_FIELD_DROP_SHADOW_DISTANCE,
          blur: WIN_FIELD_DROP_SHADOW_BLUR,
        },
        letterSpacing: WIN_FIELD_LETTER_SPACING,
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

