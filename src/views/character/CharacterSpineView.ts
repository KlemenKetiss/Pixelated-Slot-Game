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
}
