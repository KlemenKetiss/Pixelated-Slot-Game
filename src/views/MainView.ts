import { Container } from 'pixi.js';
import { GAME_HEIGHT, GAME_WIDTH, REELS_CONFIG } from '../utils/config';
import { ReelsView } from './reels/ReelsView';
import { ReelFrame } from './reels/frame/ReelFrame';
import { WinFieldView } from './winField/WinFieldView';
import { FeatureView } from './feature/FeatureView';
import { BackgroundView } from './background/BackgroundView';
import { ReelsViewBackground } from './reels/frame/ReelsViewBackground';
import { CharacterSpineView } from './character/CharacterSpineView';

/**
 * Root Pixi container for the slot game scene.
 * Currently only hosts the reels, but later can include backgrounds, frames, etc.
 */
export class MainView extends Container {
  /** Host for Spine character. */
  public readonly characterSpineLayer: Container;
  public readonly characterSpineView: CharacterSpineView | null;
  public readonly reelsView: ReelsView;
  public readonly reelFrame: ReelFrame;
  public readonly winFieldView: WinFieldView;
  public readonly featureView: FeatureView;
  public readonly backgroundView: BackgroundView;
  public readonly reelsViewBackground: ReelsViewBackground;
  constructor() {
    super();
    this.characterSpineLayer = new Container();
    this.backgroundView = new BackgroundView();
    this.reelsViewBackground = new ReelsViewBackground();
    this.reelFrame = new ReelFrame();
    this.winFieldView = new WinFieldView();
    this.reelsView = new ReelsView();
    this.characterSpineView = this.createCharacterSpineView();
    this.featureView = new FeatureView();
    this.layoutReels();
    this.addChild(this.backgroundView);
    this.addChild(this.reelsViewBackground);
    this.addChild(this.reelsView);
    this.addChild(this.characterSpineLayer);
    if (this.characterSpineView) {
      this.characterSpineLayer.addChild(this.characterSpineView);
    }
    this.addChild(this.winFieldView);
    this.addChild(this.featureView);

  }

  private layoutReels(): void {
    this.reelsView.layoutWithinFrame(
      this.reelFrame.width,
      this.reelFrame.height,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
    );
    //this.reelSeparators.x = this.reelsView.x;
    //this.reelSeparators.y = this.reelsView.y;
    //this.reelSeparators.height = this.reelsView.height;
  }

  private createCharacterSpineView(): CharacterSpineView | null {
    try {
      return CharacterSpineView.create();
    } catch (error) {
      console.error('Failed to create Spine character:', error);
      return null;
    }
  }
}

