import { SpineModel } from '../../spine/SpineModel';
import { SpineView } from '../spine/SpineView';
import { GAME_HEIGHT, GAME_WIDTH } from '../../utils/config';

const TARGET_HEIGHT = 420;
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
    const h = data.height > 0 ? data.height : 617;
    const scale = TARGET_HEIGHT / h;
    this.spine.scale.set(scale);
    this.x = GAME_WIDTH * 0.18;
    this.y = GAME_HEIGHT * 0.82;
  }
}
