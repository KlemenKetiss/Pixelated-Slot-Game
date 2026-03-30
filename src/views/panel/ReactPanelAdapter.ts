import type { PanelPort } from '../../logic/GameTypes';
import { formatPanelAmount } from '../../utils/panelFormat';

/**
 * Snapshot of panel chrome driven by {@link GameController} via {@link PanelPort}.
 * React should subscribe via {@link ReactPanelAdapter.connect} and render from this object.
 */
export interface PanelDisplayState {
  balance: number;
  win: number;
  bet: number;
  betDecreaseEnabled: boolean;
  betIncreaseEnabled: boolean;
  spinEnabled: boolean;
  forceSelectedIndex: number | null;
}

export function createDefaultPanelDisplayState(): PanelDisplayState {
  return {
    balance: 0,
    win: 0,
    bet: 0,
    betDecreaseEnabled: false,
    betIncreaseEnabled: false,
    spinEnabled: false,
    forceSelectedIndex: null,
  };
}

/**
 * {@link PanelPort} implementation that forwards display updates into React state.
 * Does not touch the DOM: call {@link ReactPanelAdapter.connect} from the mounted React tree
 * (e.g. pass `setState` or a dispatcher), then wire buttons to {@link invokeSpinRequested},
 * {@link invokeForceOutcome}, and {@link invokeBetChange}.
 */
export class ReactPanelAdapter implements PanelPort {
  private display: PanelDisplayState = createDefaultPanelDisplayState();
  private onStateChange: ((state: PanelDisplayState) => void) | null = null;

  private spinRequestedCallback: (() => void) | null = null;
  private forceOutcomeCallback: ((index: number) => void) | null = null;
  private betChangeCallback: ((direction: 'up' | 'down') => void) | null = null;

  private readonly onWinDisplay?: (formatted: string) => void;

  constructor(onWinDisplay?: (formatted: string) => void) {
    this.onWinDisplay = onWinDisplay;
  }

  /**
   * Registers the bridge used to push {@link PanelDisplayState} into React.
   * Immediately emits the current snapshot so the first paint matches controller sync.
   */
  connect(onStateChange: (state: PanelDisplayState) => void): void {
    this.onStateChange = onStateChange;
    onStateChange({ ...this.display });
  }

  disconnect(): void {
    this.onStateChange = null;
  }

  private push(): void {
    this.onStateChange?.({ ...this.display });
  }

  setBalance(value: number): void {
    this.display = { ...this.display, balance: value };
    this.push();
  }

  setWin(value: number): void {
    if (value === 0) {
      this.display = { ...this.display, win: 0 };
      this.onWinDisplay?.('');
      this.push();
      return;
    }
    const formatted = formatPanelAmount(value);
    this.display = { ...this.display, win: value };
    this.onWinDisplay?.(formatted);
    this.push();
  }

  setBet(value: number): void {
    this.display = { ...this.display, bet: value };
    this.push();
  }

  setBetButtonsEnabled(canDecrease: boolean, canIncrease: boolean): void {
    this.display = {
      ...this.display,
      betDecreaseEnabled: canDecrease,
      betIncreaseEnabled: canIncrease,
    };
    this.push();
  }

  setSpinEnabled(enabled: boolean): void {
    this.display = { ...this.display, spinEnabled: enabled };
    this.push();
  }

  setForceSelected(index: number | null): void {
    this.display = { ...this.display, forceSelectedIndex: index };
    this.push();
  }

  onSpinRequested(callback: () => void): void {
    this.spinRequestedCallback = callback;
  }

  onForceOutcome(callback: (index: number) => void): void {
    this.forceOutcomeCallback = callback;
  }

  onBetChange(callback: (direction: 'up' | 'down') => void): void {
    this.betChangeCallback = callback;
  }

  /** Spin button — forwards to the callback registered by {@link GameController}. */
  invokeSpinRequested(): void {
    this.spinRequestedCallback?.();
  }

  /** Force-outcome button — forwards to the callback registered by {@link GameController}. */
  invokeForceOutcome(index: number): void {
    this.forceOutcomeCallback?.(index);
  }

  /** Bet ± (including hold-repeat) — forwards to the callback registered by {@link GameController}. */
  invokeBetChange(direction: 'up' | 'down'): void {
    this.betChangeCallback?.(direction);
  }

  dispose(): void {
    this.spinRequestedCallback = null;
    this.forceOutcomeCallback = null;
    this.betChangeCallback = null;
    this.disconnect();
  }
}
