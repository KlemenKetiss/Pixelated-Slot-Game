import { SYMBOLS, SYMBOL_WEIGHTS } from './config';

export interface SymbolGenerator {
  getRandomSymbol(): string;
}

function pickWeightedIndex(weights: number[]): number {
  let total = 0;
  for (const w of weights) {
    total += w;
  }
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) {
      return i;
    }
  }
  return weights.length - 1;
}

export class DefaultSymbolGenerator implements SymbolGenerator {
  private readonly weights: number[];

  constructor(weights: number[] = SYMBOL_WEIGHTS) {
    if (weights.length !== SYMBOLS.length) {
      throw new Error(
        `SYMBOL_WEIGHTS length (${weights.length}) must match SYMBOLS (${SYMBOLS.length})`,
      );
    }
    this.weights = weights;
  }

  getRandomSymbol(): string {
    const index = pickWeightedIndex(this.weights);
    return SYMBOLS[index];
  }
}
