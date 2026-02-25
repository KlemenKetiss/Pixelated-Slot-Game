import { Container } from 'pixi.js';
import { REELS_CONFIG, SYMBOL_HEIGHT, SYMBOLS } from '../utils/config';
import { SymbolView } from './SymbolView';

/**
 * Represents a single vertical reel of symbols.
 */
export class ReelView extends Container {
  public readonly reelIndex: number;
  public readonly symbols: SymbolView[] = [];

  constructor(reelIndex: number) {
    super();
    this.reelIndex = reelIndex;

    const { numRows, symbolSpacing } = REELS_CONFIG;

    for (let row = 0; row < numRows; row++) {
      const alias = SYMBOLS[(reelIndex * numRows + row) % SYMBOLS.length];
      const symbolView = new SymbolView(alias);
      symbolView.x = 0;
      symbolView.y = row * (SYMBOL_HEIGHT + symbolSpacing);
      this.symbols.push(symbolView);
      this.addChild(symbolView);
    }
  }
}

