import { SpineModel } from '../../spine/SpineModel';
import { SpineView } from '../spine/SpineView';
import {
  CHARACTER_FALLBACK_SKELETON_HEIGHT,
  CHARACTER_TARGET_HEIGHT,
  CHARACTER_X_RATIO,
  CHARACTER_Y_RATIO,
  GAME_HEIGHT,
  GAME_WIDTH,
} from '../../utils/config';
const SPINE_ALIASES = {
  skeleton: 'CharacterSkeleton',
  atlas: 'CharacterAtlas',
};
const PREFERRED_IDLE_ANIMATION = 'character_idle';
const CHARACTER_WIN_ANIMATION = 'character_small_win';
const CHARACTER_BONUS_ENTER_ANIMATION = 'character_bonus_anticipation_win'; //Also used for retrigger
const CHARACTER_REACTION_MIX_DURATION = 0.2;
const CHARACTER_IDLE_RETURN_MIX_DURATION = 0.25;

/**
 * Character-specific Spine view (layout only) on top of generic SpineView.
 */
export class CharacterSpineView extends SpineView {
  constructor(model: SpineModel, animationName?: string) {
    super(model, animationName);
    this.layoutSpine();
  }

  static create(): CharacterSpineView {
    const model = SpineModel.fromLoadedAssets(
      SPINE_ALIASES,
      PREFERRED_IDLE_ANIMATION,
    );
    return new CharacterSpineView(model);
  }

  private layoutSpine(): void {
    const data = this.spine.skeleton.data;
    const h =
      data.height > 0 ? data.height : CHARACTER_FALLBACK_SKELETON_HEIGHT;
    const scale = CHARACTER_TARGET_HEIGHT / h;
    this.spine.scale.set(scale);
    this.x = GAME_WIDTH * CHARACTER_X_RATIO;
    this.y = GAME_HEIGHT * CHARACTER_Y_RATIO;
  }

  playWinReaction(): void {
    this.playReaction(CHARACTER_WIN_ANIMATION);
  }

  playBonusEnterReaction(): void {
    this.playReaction(CHARACTER_BONUS_ENTER_ANIMATION);
  }

  private playReaction(animationName: string): void {
    if (!this.hasAnimation(animationName)) {
      this.playIdle();
      return;
    }
    this.setAnimation(0, animationName, false, CHARACTER_REACTION_MIX_DURATION);
    this.addAnimation(
      0,
      PREFERRED_IDLE_ANIMATION,
      true,
      0,
      CHARACTER_IDLE_RETURN_MIX_DURATION,
    );
  }

  private playIdle(): void {
    this.setAnimation(0, PREFERRED_IDLE_ANIMATION, true, CHARACTER_REACTION_MIX_DURATION);
  }
}
