import { Container } from 'pixi.js';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/config';
import { ReelsView } from './ReelsView';

/**
 * Root Pixi container for the slot game scene.
 * Currently only hosts the reels, but later can include backgrounds, frames, etc.
 */
export class MainView extends Container {
  public readonly reelsView: ReelsView;

  constructor() {
    super();

    this.reelsView = new ReelsView();
    this.layoutReels();
    this.addChild(this.reelsView);
  }

  private layoutReels(): void {
    // ReelsView already sets its own pivot to its visual center.
    // Position its origin at the center of the game area.
    this.reelsView.x = GAME_WIDTH / 2;
    this.reelsView.y = GAME_HEIGHT / 2;
  }
}

