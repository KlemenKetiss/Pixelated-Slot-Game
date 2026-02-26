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
      expect(getSymbolPayout('LOW3', winWays.matchesNoPayout, testConfig)).toBe(0);
    });

    it('returns actual game payouts for real symbols', () => {
      expect(getSymbolPayout('LOW3', minReelsForWin, testConfig)).toBe(
        SYMBOL_PAYOUTS.LOW3[minReelsForWin]
      );
      expect(getSymbolPayout('HIGH1', minReelsForWin, testConfig)).toBe(
        SYMBOL_PAYOUTS.HIGH1[minReelsForWin]
      );
      expect(getSymbolPayout('WILD', winWays.matchesThree, testConfig)).toBe(
        SYMBOL_PAYOUTS.WILD[winWays.matchesThree]
      );
      expect(getSymbolPayout('BONUS', minReelsForWin, testConfig)).toBe(0);
    });
  });

  describe('checkForWinningWays', () => {
    it('returns no wins when no symbol appears on minReels consecutive reels', () => {
      const stops = [['LOW3'], ['HIGH1'], ['LOW3']];
      const result = checkForWinningWays(stops, testConfig);
      expect(result.wins).toHaveLength(0);
      expect(result.totalWin).toBe(0);
    });

    it('returns way wins using actual paytable and sums totalWin', () => {
      const stops = [
        ['LOW3', 'HIGH1', 'HIGH1'],
        ['LOW3', 'HIGH1', 'HIGH1'],
        ['LOW3', 'HIGH1', 'HIGH1'],
      ];
      const result = checkForWinningWays(stops, testConfig);
      const wayLow3 = result.wins.find((w) => w.symbol === 'LOW3');
      const wayHigh1 = result.wins.find((w) => w.symbol === 'HIGH1');
      expect(wayLow3).toBeDefined();
      expect(wayLow3!.count).toBe(minReelsForWin);
      expect(wayHigh1).toBeDefined();
      expect(wayHigh1!.count).toBe(minReelsForWin);
      const expected =
        SYMBOL_PAYOUTS.LOW3[minReelsForWin] * 1 +
        SYMBOL_PAYOUTS.HIGH1[minReelsForWin] * winWays.waysMultiplierThreeReelsTwoPerReel;
      expect(result.totalWin).toBe(expected);
    });

    it('sums multiple ways correctly for real symbols', () => {
      const stops = [['HIGH1'], ['HIGH1'], ['HIGH1']];
      const result = checkForWinningWays(stops, testConfig);
      expect(result.totalWin).toBe(SYMBOL_PAYOUTS.HIGH1[minReelsForWin]);
    });
  });
});
