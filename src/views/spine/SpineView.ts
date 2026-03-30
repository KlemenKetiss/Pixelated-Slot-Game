import { Container } from 'pixi.js';
import { Spine } from '@pixi/spine-pixi';
import { SpineModel } from '../../spine/SpineModel';

/**
 * Generic Spine view that creates a new Spine instance from a SpineModel.
 * Can be reused for any Spine character/object.
 */
export class SpineView extends Container {
  public readonly spine: Spine;

  constructor(model: SpineModel, animationName?: string) {
    super();
    this.spine = new Spine({ skeletonData: model.skeletonData });
    this.addChild(this.spine);

    const startAnimation = animationName ?? model.defaultAnimation;
    if (startAnimation) {
      this.spine.state.setAnimation(0, startAnimation, true);
    }
  }

  setAnimation(track: number, animName: string, loop: boolean): void {
    this.spine.state.setAnimation(track, animName, loop);
  }
}
