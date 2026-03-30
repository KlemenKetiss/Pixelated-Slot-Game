import { describe, it, expect } from 'vitest';
import { getSymbolPayout, checkForWinningWays } from '../logic/WinLogic';
import { testConfig, TestConstants } from './testConfig';
import { SYMBOL_PAYOUTS } from '../utils/config';

const { winWays } = TestConstants;
const minReelsForWin = testConfig.winningWays.minReelsForWin;

describe('WinLogic', () => {
  describe('getSymbolPayout', () => {
    it('returns 0 for unknown symbol', () => {
      expect(getSymbolPayout('UNKNOWN', minReelsForWin, testConfig)).toBe(0);
    });

    it('returns 0 for symbol with no payout at given matches', () => {
      expect(getSymbolPayout('9', winWays.matchesNoPayout, testConfig)).toBe(0);
    });

    it('returns actual game payouts for real symbols', () => {
      expect(getSymbolPayout('9', minReelsForWin, testConfig)).toBe(
        SYMBOL_PAYOUTS['9'][minReelsForWin]
      );
      expect(getSymbolPayout('H6', minReelsForWin, testConfig)).toBe(
        SYMBOL_PAYOUTS.H6[minReelsForWin]
      );
      expect(getSymbolPayout('M2', winWays.matchesThree, testConfig)).toBe(
        SYMBOL_PAYOUTS.M2[winWays.matchesThree]
      );
    });
  });

  describe('checkForWinningWays', () => {
    it('returns no wins when no symbol appears on minReels consecutive reels', () => {
      const stops = [['9'], ['H6'], ['10']];
      const result = checkForWinningWays(stops, testConfig);
      expect(result.wins).toHaveLength(0);
      expect(result.totalWin).toBe(0);
    });

    it('returns way wins using actual paytable and sums totalWin', () => {
      const stops = [
        ['9', 'H6', 'H6'],
        ['9', 'H6', 'H6'],
        ['9', 'H6', 'H6'],
      ];
      const result = checkForWinningWays(stops, testConfig);
      const wayNine = result.wins.find((w) => w.symbol === '9');
      const wayHigh = result.wins.find((w) => w.symbol === 'H6');
      expect(wayNine).toBeDefined();
      expect(wayNine!.count).toBe(minReelsForWin);
      expect(wayHigh).toBeDefined();
      expect(wayHigh!.count).toBe(minReelsForWin);
      const expected =
        SYMBOL_PAYOUTS['9'][minReelsForWin] * 1 +
        SYMBOL_PAYOUTS.H6[minReelsForWin] * winWays.waysMultiplierThreeReelsTwoPerReel;
      expect(result.totalWin).toBe(expected);
    });

    it('sums multiple ways correctly for real symbols', () => {
      const stops = [['H6'], ['H6'], ['H6']];
      const result = checkForWinningWays(stops, testConfig);
      expect(result.totalWin).toBe(SYMBOL_PAYOUTS.H6[minReelsForWin]);
    });
  });
});
