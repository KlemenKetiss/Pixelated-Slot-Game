import { SYMBOLS } from './config';

export interface SymbolGenerator {
  getRandomSymbol(): string;
}

export class DefaultSymbolGenerator implements SymbolGenerator {
  getRandomSymbol(): string {
    const index = Math.floor(Math.random() * SYMBOLS.length);
    return SYMBOLS[index];
  }
}

