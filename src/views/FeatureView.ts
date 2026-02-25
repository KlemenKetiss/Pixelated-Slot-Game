import { Container, Text } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/config';

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
    this.titleText = new Text({
      text: 'Free spins left:',
      style: {
        fontFamily: 'Pixelify Sans',
        fontSize: 48,
        fill: 0xfff176,
        align: 'center',
      },
    });
    this.titleText.anchor.set(0.5);

    this.counterText = new Text({
      text: '',
      style: {
        fontFamily: 'Pixelify Sans',
        fontSize: 80,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.counterText.anchor.set(0.5);
    this.counterText.y = 70;

    this.addChild(this.titleText);
    this.addChild(this.counterText);

    // Position near the top-center of the game area.
    this.x = GAME_WIDTH / 2 - this.FEATURE_VIEW_X_OFFSET;
    this.y = GAME_HEIGHT / 2;

    this.visible = false;
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

