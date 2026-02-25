import type { GameConfig, GameEvent, GameState } from './GameTypes';

function getSpinCost(state: GameState, config: GameConfig): number {
  const clampedIndex = Math.max(
    0,
    Math.min(state.betIndex, config.betLevels.length - 1),
  );
  return config.betLevels[clampedIndex] ?? 0;
}

export function handleGameState(
  state: GameState,
  event: GameEvent,
  config: GameConfig,
): GameState {
  switch (event.type) {
    case 'SPIN_REQUESTED': {
      const hasFreeSpin = state.freeSpinsActive && state.freeSpinsLeft > 0;
      const spinCost = hasFreeSpin ? 0 : getSpinCost(state, config);
      if (state.spinActive || (!hasFreeSpin && state.balance < spinCost)) {
        return state;
      }
      const nextFreeSpinsLeft = hasFreeSpin
        ? state.freeSpinsLeft - 1
        : state.freeSpinsLeft;
      return {
        ...state,
        spinActive: true,
        balance: state.balance - spinCost,
        freeSpinsLeft: nextFreeSpinsLeft,
      };
    }
    case 'SPIN_CONCLUDED': {
      return {
        ...state,
        spinActive: false,
        balance: state.balance + event.totalWin,
        selectedForceIndex: null,
      };
    }
    case 'FORCE_SELECTED': {
      return {
        ...state,
        selectedForceIndex:
          state.selectedForceIndex === event.index ? null : event.index,
      };
    }
    case 'BET_UP': {
      if (state.spinActive || state.betIndex >= config.betLevels.length - 1) {
        return state;
      }
      return { ...state, betIndex: state.betIndex + 1 };
    }
    case 'BET_DOWN': {
      if (state.spinActive || state.betIndex <= 0) {
        return state;
      }
      return { ...state, betIndex: state.betIndex - 1 };
    }
    case 'FREE_SPINS_AWARDED': {
      if (!state.freeSpinsActive) {
        return {
          ...state,
          freeSpinsActive: true,
          freeSpinsLeft: event.count,
        };
      }
      return {
        ...state,
        freeSpinsLeft: state.freeSpinsLeft + event.count,
      };
    }
    default:
      return state;
  }
}

