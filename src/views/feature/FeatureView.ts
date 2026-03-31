import { Container, Graphics, Text } from 'pixi.js';
import {
  FEATURE_HIDDEN_VALUE,
  GAME_WIDTH,
  GAME_HEIGHT,
  FEATURE_VIEW_X_OFFSET,
  FEATURE_BG_WIDTH,
  FEATURE_BG_HEIGHT,
  FEATURE_BG_RADIUS,
  FEATURE_BG_ALPHA,
  FEATURE_TITLE_Y_OFFSET,
  FEATURE_COUNTER_Y_OFFSET,
  FEATURE_TITLE_FONT_SIZE,
  FEATURE_COUNTER_FONT_SIZE,
  FEATURE_TITLE_COLOR,
  FEATURE_COUNTER_COLOR,
  FEATURE_VIEW_Y_OFFSET_FROM_CENTER,
} from '../../utils/config';

/** Mostly transparent dark fill for shadow background. */
const FEATURE_BG_FILL = { color: 0x000000, alpha: FEATURE_BG_ALPHA };

/**
 * Displays free spins feature status using the pixel font:
 * "Free spins left:" and a single remaining count.
 */
export class FeatureView extends Container {
  private titleText!: Text;
  private counterText!: Text;

  constructor() {
    super();
    this.initialize();
  }

  protected initialize(): void {
    const shadowBg = this.createShadowBackground();
    this.addChild(shadowBg);

    this.titleText = this.createTitleText();
    this.titleText.y = FEATURE_TITLE_Y_OFFSET;
    this.counterText = this.createCounterText();
    this.counterText.y = FEATURE_COUNTER_Y_OFFSET;

    shadowBg.addChild(this.titleText);
    shadowBg.addChild(this.counterText);

    this.positionFeatureView();

    this.visible = false;
  }

  /**
   * Creates the rounded shadow background.
   */
  private createShadowBackground(): Graphics {
    const shadowBg = new Graphics();
    shadowBg.roundRect(
      -FEATURE_BG_WIDTH / 2,
      -FEATURE_BG_HEIGHT / 2,
      FEATURE_BG_WIDTH,
      FEATURE_BG_HEIGHT,
      FEATURE_BG_RADIUS,
    );
    shadowBg.fill(FEATURE_BG_FILL);
    return shadowBg;
  }

  /**
   * Creates the "Free spins left:" title text.
   */
  private createTitleText(): Text {
    const text = new Text({
      text: 'Free spins left:',
      style: {
        fontFamily: 'Pixelify Sans',
        fontSize: FEATURE_TITLE_FONT_SIZE,
        fill: FEATURE_TITLE_COLOR,
        align: 'center',
      },
    });
    text.anchor.set(0.5);
    return text;
  }

  /**
   * Creates the counter text for displaying free spins.
   */
  private createCounterText(): Text {
    const text = new Text({
      text: '',
      style: {
        fontFamily: 'Pixelify Sans',
        fontSize: FEATURE_COUNTER_FONT_SIZE,
        fill: FEATURE_COUNTER_COLOR,
        align: 'center',
      },
    });
    text.anchor.set(0.5);
    return text;
  }

  /**
   * Positions the FeatureView near the top-center of the game area.
   */
  private positionFeatureView(): void {
    this.x = GAME_WIDTH / 2 - FEATURE_VIEW_X_OFFSET;
    this.y = GAME_HEIGHT / 2 - FEATURE_VIEW_Y_OFFSET_FROM_CENTER;
  }

  /**
   * Updates the free spins display.
   * @param remaining Number of free spins remaining, or null when hidden.
   */
  public setFreeSpins(remaining: number | null): void {
    if (remaining === FEATURE_HIDDEN_VALUE) {
      this.visible = false;
      this.counterText.text = '';
      return;
    }

    this.visible = true;
    this.counterText.text = `${remaining}`;
  }
}

