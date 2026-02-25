import type { GameConfig, GameEvent, GameState } from './GameTypes';

/**
 * Computes the cost of a spin based on the current bet index,
 * ensuring the index stays within the valid range of available bet levels.
 */
function getSpinCost(state: GameState, config: GameConfig): number {
  const clampedIndex = Math.max(
    0,
    Math.min(state.betIndex, config.betLevels.length - 1),
  );
  return config.betLevels[clampedIndex] ?? 0;
}

/**
 * Handles state transitions for all game events.
 * Returns a new state object based on the current state, the event received, and the config.
 */
export function handleGameState(
  state: GameState,
  event: GameEvent,
  config: GameConfig,
): GameState {
  switch (event.type) {
    case 'SPIN_REQUESTED': {
      // If in free spins mode with spins left, no balance reduction; otherwise, use regular spin cost.
      const hasFreeSpin = state.freeSpinsActive && state.freeSpinsLeft > 0;
      const spinCost = hasFreeSpin ? 0 : getSpinCost(state, config);

      // If a spin is already active or insufficient balance, do not change state.
      if (state.spinActive || (!hasFreeSpin && state.balance < spinCost)) {
        return state;
      }

      // Decrease free spins left if applicable; else, keep same.
      const nextFreeSpinsLeft = hasFreeSpin
        ? state.freeSpinsLeft - 1
        : state.freeSpinsLeft;

      // Activate spin, deduct cost, update free spins.
      return {
        ...state,
        spinActive: true,
        balance: state.balance - spinCost,
        freeSpinsLeft: nextFreeSpinsLeft,
      };
    }
    case 'SPIN_CONCLUDED': {
      // Deactivate spin, add winnings, and clear any force outcome selection.
      return {
        ...state,
        spinActive: false,
        balance: state.balance + event.totalWin,
        selectedForceIndex: null,
      };
    }
    case 'FORCE_SELECTED': {
      // Toggle the forced outcome index: deselect if already selected, otherwise set new one.
      return {
        ...state,
        selectedForceIndex:
          state.selectedForceIndex === event.index ? null : event.index,
      };
    }
    case 'BET_UP': {
      // Prevent changing bet while spinning or increasing above max level.
      if (state.spinActive || state.betIndex >= config.betLevels.length - 1) {
        return state;
      }
      return { ...state, betIndex: state.betIndex + 1 };
    }
    case 'BET_DOWN': {
      // Prevent changing bet while spinning or decreasing below zero.
      if (state.spinActive || state.betIndex <= 0) {
        return state;
      }
      return { ...state, betIndex: state.betIndex - 1 };
    }
    case 'FREE_SPINS_AWARDED': {
      // If not already in free spin mode, activate and set awarded count.
      if (!state.freeSpinsActive) {
        return {
          ...state,
          freeSpinsActive: true,
          freeSpinsLeft: event.count,
        };
      }
      // Otherwise, increase remaining free spins (retrigger scenario)
      return {
        ...state,
        freeSpinsLeft: state.freeSpinsLeft + event.count,
      };
    }
    default:
      // For unknown or unhandled events, return unchanged state.
      return state;
  }
}
