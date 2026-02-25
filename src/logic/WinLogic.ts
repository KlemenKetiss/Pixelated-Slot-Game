import type { GameConfig, WinResult, WinningWay, WinningPosition } from './GameTypes';

export function getSymbolPayout(
  symbol: string,
  numMatches: number,
  config: GameConfig,
): number {
  const payouts = config.symbolPayouts[symbol];
  return (payouts && payouts[numMatches]) ?? 0;
}

/**
 * Calculates ways-based wins for the current stops grid.
 * Adapted from the simpleSlot project.
 */
export function checkForWinningWays(stops: string[][], config: GameConfig): WinResult {
  const wins: WinningWay[] = [];
  let totalWin = 0;
  const processedSymbols = new Set<string>();
  const minReels = config.winningWays.minReelsForWin;

  for (let row = 0; row < stops[0].length; row++) {
    const currentSymbol = stops[0][row];
    if (processedSymbols.has(currentSymbol)) continue;
    processedSymbols.add(currentSymbol);

    let consecutiveReels = 1;
    let symbolMultiplier = 1;
    const winningPositions: WinningPosition[] = [];

    stops[0].forEach((symbol, rowIndex) => {
      if (symbol === currentSymbol) winningPositions.push({ reel: 0, row: rowIndex });
    });
    const firstReelCount = stops[0].filter((s) => s === currentSymbol).length;
    symbolMultiplier *= firstReelCount;

    for (let reel = 1; reel < stops.length; reel++) {
      const symbolsInReel = stops[reel].filter((s) => s === currentSymbol).length;
      if (symbolsInReel > 0) {
        stops[reel].forEach((symbol, rowIndex) => {
          if (symbol === currentSymbol) winningPositions.push({ reel, row: rowIndex });
        });
        consecutiveReels++;
        symbolMultiplier *= symbolsInReel;
      } else {
        break;
      }
    }

    if (consecutiveReels >= minReels) {
      const baseWin = getSymbolPayout(currentSymbol, consecutiveReels, config);
      totalWin += baseWin * symbolMultiplier;
      wins.push({
        symbol: currentSymbol,
        count: consecutiveReels,
        positions: winningPositions,
      });
    }
  }

  return { wins, totalWin };
}

