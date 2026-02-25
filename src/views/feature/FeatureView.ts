import { Container, Graphics, Text } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../../utils/config';

/** Width/height of the shadow background behind the free-spins text. */
const FEATURE_BG_WIDTH = 370;
const FEATURE_BG_HEIGHT = 150;
const FEATURE_BG_RADIUS = 12;
/** Mostly transparent dark fill for shadow. */
const FEATURE_BG_FILL = { color: 0x000000, alpha: 0.35 };

/**
 * Displays free spins feature status using the pixel font:
 * "Free spins left:" and a single remaining count.
 */
export class FeatureView extends Container {
  private titleText!: Text;
  private counterText!: Text;
  private readonly FEATURE_VIEW_X_OFFSET = 740;
  constructor() {
    super();
    this.initialize();
  }

  protected initialize(): void {
    const shadowBg = this.createShadowBackground();
    this.addChild(shadowBg);

    this.titleText = this.createTitleText();
    this.titleText.y = -40;
    this.counterText = this.createCounterText();
    this.counterText.y = 20;

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
        fontSize: 48,
        fill: 0xfff176,
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
        fontSize: 80,
        fill: 0xffffff,
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
    this.x = GAME_WIDTH / 2 - this.FEATURE_VIEW_X_OFFSET;
    this.y = GAME_HEIGHT / 2;
  }

  /**
   * Updates the free spins display.
   * @param remaining Number of free spins remaining.
   */
  public setFreeSpins(remaining: number): void {
    if (remaining < 0) {
      this.visible = false;
      this.counterText.text = '';
      return;
    }

    this.visible = true;
    this.counterText.text = `${remaining}`;
  }
}

