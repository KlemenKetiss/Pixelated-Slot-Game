import { Container } from 'pixi.js';
import { Spine } from '@pixi/spine-pixi';
import { SpineModel } from '../../spine/SpineModel';

/**
 * Generic Spine view that creates a new Spine instance from a SpineModel.
 * Can be reused for any Spine character/object.
 */
export class SpineView extends Container {
  public readonly spine: Spine;
  protected readonly animationNames: string[];

  constructor(model: SpineModel, animationName?: string) {
    super();
    this.spine = new Spine({ skeletonData: model.skeletonData });
    this.animationNames = model.animationNames;
    this.addChild(this.spine);

    const startAnimation = animationName ?? model.defaultAnimation;
    if (startAnimation) {
      this.spine.state.setAnimation(0, startAnimation, true);
    }
  }

  setAnimation(
    track: number,
    animName: string,
    loop: boolean,
    mixDuration = 0,
  ): void {
    const entry = this.spine.state.setAnimation(track, animName, loop);
    if (mixDuration > 0) {
      entry.mixDuration = mixDuration;
    }
  }

  addAnimation(
    track: number,
    animName: string,
    loop: boolean,
    delay = 0,
    mixDuration = 0,
  ): void {
    const entry = this.spine.state.addAnimation(track, animName, loop, delay);
    if (mixDuration > 0) {
      entry.mixDuration = mixDuration;
    }
  }

  hasAnimation(animName: string): boolean {
    return this.animationNames.includes(animName);
  }
}
