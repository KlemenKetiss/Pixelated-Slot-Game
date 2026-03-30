import { Assets } from 'pixi.js';
import { AtlasAttachmentLoader, SkeletonJson } from '@pixi/spine-pixi';
import type { SkeletonData } from '@esotericsoftware/spine-core';

export interface SpineAssetAliases {
  skeleton: string;
  atlas: string;
}

/**
 * Generic parsed Spine model from already-loaded Pixi assets.
 */
export class SpineModel {
  constructor(
    public readonly skeletonData: SkeletonData,
    public readonly animationNames: string[],
    public readonly defaultAnimation: string,
  ) {}

  static fromLoadedAssets(
    aliases: SpineAssetAliases,
    preferredAnimation = '',
  ): SpineModel {
    const skeletonAsset = Assets.get(aliases.skeleton);
    const atlasAsset = Assets.get(aliases.atlas);

    if (!skeletonAsset || !atlasAsset) {
      throw new Error(
        `Spine assets not available in cache. Missing aliases: skeleton="${aliases.skeleton}", atlas="${aliases.atlas}".`,
      );
    }

    const attachmentLoader = new AtlasAttachmentLoader(atlasAsset);
    const parser = new SkeletonJson(attachmentLoader);
    const skeletonData = parser.readSkeletonData(skeletonAsset);
    const animationNames = skeletonData.animations.map(
      (animation) => animation.name,
    );
    const defaultAnimation = SpineModel.resolveDefaultAnimation(
      animationNames,
      preferredAnimation,
    );

    return new SpineModel(skeletonData, animationNames, defaultAnimation);
  }

  private static resolveDefaultAnimation(
    availableAnimations: string[],
    preferredAnimation: string,
  ): string {
    if (
      preferredAnimation &&
      availableAnimations.includes(preferredAnimation)
    ) {
      return preferredAnimation;
    }
    return availableAnimations[0] ?? '';
  }
}
