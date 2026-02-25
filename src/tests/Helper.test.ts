import { describe, it, expect } from 'vitest';
import { Helper } from '../utils/Helper';
import { FORCE_STOP_SETS } from '../utils/config';

const INVALID_INDEX_NEGATIVE = -1;
const INVALID_INDEX_PAST_END_OFFSET = 10;
const FIRST_VALID_INDEX = 0;

const reels2x2 = { numReels: 2, numRows: 2, reelWidth: 50, symbolHeight: 50, reelSpacing: 0, symbolSpacing: 0 };
const reels3x3 = { numReels: 3, numRows: 3, reelWidth: 100, symbolHeight: 100, reelSpacing: 0, symbolSpacing: 0 };
const reels2x1 = { numReels: 2, numRows: 1, reelWidth: 100, symbolHeight: 100, reelSpacing: 0, symbolSpacing: 0 };
const containerSquare100 = { width: 100, height: 100 };
const containerSquare1000 = { width: 1000, height: 1000 };
const containerWide = { width: 400, height: 100 };
const maxScaleCap = 1.5;
const fitScaleOne = 1;

describe('Helper', () => {
  describe('getForceStops', () => {
    it('returns empty array for negative index', () => {
      expect(Helper.getForceStops(INVALID_INDEX_NEGATIVE)).toEqual([]);
    });

    it('returns empty array when index is >= FORCE_STOP_SETS length', () => {
      expect(Helper.getForceStops(FORCE_STOP_SETS.length)).toEqual([]);
      expect(Helper.getForceStops(FORCE_STOP_SETS.length + INVALID_INDEX_PAST_END_OFFSET)).toEqual(
        []
      );
    });

    it('returns the force stop set at the given valid index', () => {
      const firstSet = Helper.getForceStops(FIRST_VALID_INDEX);
      expect(Array.isArray(firstSet)).toBe(true);
      expect(firstSet.length).toBeGreaterThan(0);
      expect(firstSet).toEqual(FORCE_STOP_SETS[FIRST_VALID_INDEX]);
    });
  });

  describe('computeReelsFitScale', () => {
    it('returns scale that fits content inside container', () => {
      const scale = Helper.computeReelsFitScale(
        reels2x2,
        containerSquare100.width,
        containerSquare100.height
      );
      expect(scale).toBe(fitScaleOne);
    });

    it('returns scale limited by maxScale when provided', () => {
      const scale = Helper.computeReelsFitScale(
        reels3x3,
        containerSquare1000.width,
        containerSquare1000.height,
        maxScaleCap
      );
      expect(scale).toBe(maxScaleCap);
    });

    it('uses container aspect ratio correctly', () => {
      const scale = Helper.computeReelsFitScale(
        reels2x1,
        containerWide.width,
        containerWide.height
      );
      expect(scale).toBe(fitScaleOne);
    });
  });
});
