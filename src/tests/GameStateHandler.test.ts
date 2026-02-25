import { describe, it, expect } from 'vitest';
import { handleGameState } from '../logic/GameStateHandler';
import { testConfig, TestConstants } from './testConfig';
import type { GameState } from '../logic/GameTypes';

const { balance, betIndex, spin, freeSpins, force } = TestConstants;

function initialState(overrides: Partial<GameState> = {}): GameState {
  return {
    balance: balance.default,
    spinActive: false,
    selectedForceIndex: null,
    betIndex: betIndex.min,
    freeSpinsActive: false,
    freeSpinsLeft: 0,
    ...overrides,
  };
}

describe('GameStateHandler', () => {
  describe('SPIN_REQUESTED', () => {
    it('deducts bet and sets spinActive', () => {
      const state = initialState({ balance: balance.default, betIndex: betIndex.min });
      const next = handleGameState(state, { type: 'SPIN_REQUESTED' }, testConfig);
      expect(next.spinActive).toBe(true);
      const bet = testConfig.betLevels[betIndex.min];
      expect(next.balance).toBe(balance.default - bet);
    });

    it('returns same state when spin already active', () => {
      const state = initialState({ spinActive: true, balance: balance.default });
      const next = handleGameState(state, { type: 'SPIN_REQUESTED' }, testConfig);
      expect(next).toBe(state);
    });

    it('returns same state when balance too low', () => {
      const state = initialState({ balance: balance.empty, betIndex: betIndex.min });
      const next = handleGameState(state, { type: 'SPIN_REQUESTED' }, testConfig);
      expect(next).toBe(state);
    });

    it('does not deduct balance during free spin', () => {
      const state = initialState({
        balance: balance.low,
        freeSpinsActive: true,
        freeSpinsLeft: freeSpins.initialCount,
      });
      const next = handleGameState(state, { type: 'SPIN_REQUESTED' }, testConfig);
      expect(next.balance).toBe(balance.low);
      expect(next.freeSpinsLeft).toBe(freeSpins.afterOneUsed);
      expect(next.spinActive).toBe(true);
    });
  });

  describe('SPIN_CONCLUDED', () => {
    it('adds totalWin to balance and clears spinActive', () => {
      const state = initialState({ balance: balance.default, spinActive: true });
      const next = handleGameState(
        state,
        { type: 'SPIN_CONCLUDED', totalWin: spin.winAmount },
        testConfig
      );
      expect(next.spinActive).toBe(false);
      expect(next.balance).toBe(balance.default + spin.winAmount);
      expect(next.selectedForceIndex).toBeNull();
    });
  });

  describe('BET_UP', () => {
    it('increments betIndex when not at max', () => {
      const state = initialState({ betIndex: betIndex.mid });
      const next = handleGameState(state, { type: 'BET_UP' }, testConfig);
      expect(next.betIndex).toBe(betIndex.maxOffset);
    });

    it('returns same state when at max bet', () => {
      const state = initialState({ betIndex: testConfig.betLevels.length - 1 });
      const next = handleGameState(state, { type: 'BET_UP' }, testConfig);
      expect(next).toBe(state);
    });

    it('returns same state during spin', () => {
      const state = initialState({ spinActive: true, betIndex: betIndex.min });
      const next = handleGameState(state, { type: 'BET_UP' }, testConfig);
      expect(next).toBe(state);
    });
  });

  describe('BET_DOWN', () => {
    it('decrements betIndex when not at min', () => {
      const state = initialState({ betIndex: betIndex.maxOffset });
      const next = handleGameState(state, { type: 'BET_DOWN' }, testConfig);
      expect(next.betIndex).toBe(betIndex.mid);
    });

    it('returns same state when at min bet', () => {
      const state = initialState({ betIndex: betIndex.min });
      const next = handleGameState(state, { type: 'BET_DOWN' }, testConfig);
      expect(next).toBe(state);
    });
  });

  describe('FORCE_SELECTED', () => {
    it('sets selectedForceIndex when different', () => {
      const state = initialState();
      const next = handleGameState(
        state,
        { type: 'FORCE_SELECTED', index: force.selectedIndex },
        testConfig
      );
      expect(next.selectedForceIndex).toBe(force.selectedIndex);
    });

    it('clears selectedForceIndex when same index toggled', () => {
      const state = initialState({ selectedForceIndex: force.selectedIndex });
      const next = handleGameState(
        state,
        { type: 'FORCE_SELECTED', index: force.selectedIndex },
        testConfig
      );
      expect(next.selectedForceIndex).toBeNull();
    });
  });

  describe('FREE_SPINS_AWARDED', () => {
    it('sets freeSpinsActive and count when not already active', () => {
      const state = initialState();
      const next = handleGameState(
        state,
        { type: 'FREE_SPINS_AWARDED', count: freeSpins.awardCount },
        testConfig
      );
      expect(next.freeSpinsActive).toBe(true);
      expect(next.freeSpinsLeft).toBe(freeSpins.awardCount);
    });

    it('adds count to freeSpinsLeft when already active', () => {
      const state = initialState({
        freeSpinsActive: true,
        freeSpinsLeft: freeSpins.addCount,
      });
      const next = handleGameState(
        state,
        { type: 'FREE_SPINS_AWARDED', count: freeSpins.addCount },
        testConfig
      );
      expect(next.freeSpinsLeft).toBe(freeSpins.totalAfterAdd);
    });
  });
});
