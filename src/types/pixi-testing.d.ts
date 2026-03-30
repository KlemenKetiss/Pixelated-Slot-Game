import type { Application } from 'pixi.js';

declare global {
  var __PIXI_APP__: Application | undefined;
  var __PIXI_STAGE__: Application['stage'] | undefined;
  var __PIXI_RENDERER__: Application['renderer'] | undefined;
}

export {};
