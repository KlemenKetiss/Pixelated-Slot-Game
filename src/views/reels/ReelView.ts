import { Container } from 'pixi.js';
import { SymbolView } from './SymbolView';
import type { ReelsView } from './ReelsView';
import gsap from 'gsap';
import { REEL_ANIMATION_CONFIG, REELS_CONFIG } from '../../utils/config';
import {
  DefaultSymbolGenerator,
  type SymbolGenerator,
} from '../../utils/SymbolGenerator';

interface ReelViewOptions {
  symbolHeight: number;
  symbolSpacing: number;
  numRows: number;
}

/**
 * Single reel with spin animation, adapted from simpleSlot.
 */
export class ReelView extends Container {
  private options: ReelViewOptions;
  private reelId: number;
  private reelsView: ReelsView;
  private symbolGenerator: SymbolGenerator;

  private symbols: SymbolView[] = []; // current visible symbols
  private virtualSymbols: SymbolView[] = []; // virtual reel symbols
  private stops: SymbolView[] = []; // target stop symbols for this spin

  private virtualReelContainer: Container; // holds virtual + new stops
  private stopsReel: Container; // holds current/old stops

  constructor(
    options: Partial<ReelViewOptions> = {},
    reelId: number,
    reelsView: ReelsView,
    symbolGenerator: SymbolGenerator = new DefaultSymbolGenerator(),
  ) {
    super();
    this.options = {
      symbolHeight: options.symbolHeight ?? REELS_CONFIG.symbolHeight,
      symbolSpacing: options.symbolSpacing ?? REELS_CONFIG.symbolSpacing,
      numRows: options.numRows ?? REELS_CONFIG.numRows,
    };
    this.reelId = reelId;
    this.reelsView = reelsView;
    this.symbolGenerator = symbolGenerator;
    this.virtualReelContainer = new Container();
    this.stopsReel = new Container();
    this.initializeReel(this.options.numRows);
  }

  protected initializeReel(numRows: number): void {
    for (let i = 0; i < numRows; i++) {
      const symbolView = new SymbolView(this.symbolGenerator.getRandomSymbol());
      symbolView.y = i * (this.options.symbolHeight + this.options.symbolSpacing);
      symbolView.x = 0;
      this.symbols.push(symbolView);
      this.stopsReel.addChild(symbolView);
    }
    this.addChild(this.stopsReel);
  }

  public updateSymbol(index: number, symbolName: string): void {
    if (index >= 0 && index < this.symbols.length) {
      this.symbols[index].changeSymbol(symbolName);
    }
  }

  public spin(): void {
    this.setVirtualReel(REEL_ANIMATION_CONFIG.virtualReelLength);
    this.spinReels();
  }

  private setVirtualReel(virtualReelLength: number): void {
    this.addChild(this.virtualReelContainer);
    const virtualReel = this.getVirtualReelOfLength(virtualReelLength, ['BONUS']);

    const stopSyms = this.reelsView.getStops()[this.reelId];
    for (let i = 0; i < stopSyms.length; i++) {
      const symbolView = new SymbolView(stopSyms[i]);
      symbolView.y =
        -this.options.symbolHeight *
        (virtualReel.length + stopSyms.length - i);
      symbolView.x = 0;

      this.stops.push(symbolView);
      this.virtualReelContainer.addChild(symbolView);
    }

    virtualReel.forEach((symbolName, index) => {
      const symbolView = new SymbolView(symbolName);
      symbolView.y =
        -this.options.symbolHeight * (virtualReel.length - index);
      symbolView.x = 0;

      this.virtualSymbols.push(symbolView);
      this.virtualReelContainer.addChild(symbolView);
    });
  }

  private spinReels(): void {
    const delay = this.reelId * REEL_ANIMATION_CONFIG.delayPerReel;
    const duration = REEL_ANIMATION_CONFIG.duration;
    const settleDelay = REEL_ANIMATION_CONFIG.settleDelay;
    gsap.to(this.virtualReelContainer, {
      delay,
      y:
        this.options.symbolHeight *
        (this.virtualSymbols.length + this.options.numRows),
      duration,
      ease: 'power1.inOut',
    });
    gsap.to(this.stopsReel, {
      delay,
      y:
        this.options.symbolHeight *
        (this.virtualSymbols.length + this.options.numRows),
      duration,
      ease: 'power1.inOut',
      onComplete: () => {
        gsap.delayedCall(settleDelay, () => {
          this.clearSymbolsReel();
        });
      },
    });
  }

  private clearVirtualReel(): void {
    this.virtualSymbols.forEach((symbol) => {
      symbol.dispose(true);
    });
    this.virtualSymbols = [];
    this.virtualReelContainer.y = 0;
    this.virtualReelContainer.removeChildren();
    this.removeChild(this.virtualReelContainer);
    this.virtualSymbols.forEach((symbol) => {
      symbol.dispose();
    });
    if (this.reelId + 1 === this.reelsView.getNumberOfReels()) {
      this.reelsView.emit('spinConcluded');
    }
  }

  private clearSymbolsReel(): void {
    this.stopsReel.removeChildren();
    this.symbols = [];
    for (let i = 0; i < this.options.numRows; i++) {
      const symbol = this.stops[i];
      this.virtualReelContainer.removeChild(symbol);
      this.stopsReel.addChild(symbol);
      symbol.y = i * this.options.symbolHeight;
      this.symbols.push(symbol);
    }
    this.stops = [];
    this.stopsReel.y = 0;
    this.clearVirtualReel();
  }

  public getVirtualReelOfLength(
    length: number,
    symbolsToExclude: string[],
  ): string[] {
    const virtualReel: string[] = [];
    for (let i = 0; i < length; i++) {
      let symbol = this.symbolGenerator.getRandomSymbol();
      while (symbolsToExclude.includes(symbol)) {
        symbol = this.symbolGenerator.getRandomSymbol();
      }
      virtualReel.push(symbol);
    }
    return virtualReel;
  }

  public getReelId(): number {
    return this.reelId;
  }

  public getSymboInRow(row: number): SymbolView | null {
    if (row >= 0 && row < this.symbols.length) {
      return this.symbols[row];
    }
    return null;
  }

  public dispose(): void {
    this.symbols.forEach((symbol) => {
      symbol.dispose();
    });
    this.symbols = [];
    this.removeChildren();
  }

  /** Reset any win animations on symbols in this reel. */
  public clearWinAnimations(): void {
    // Reset on all symbol instances that might still be around.
    [...this.symbols, ...this.virtualSymbols, ...this.stops].forEach(
      (symbol) => {
        symbol.resetWinAnimation();
      },
    );
  }
}

