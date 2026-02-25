import { BET_HOLD_DELAY_MS, BET_HOLD_REPEAT_INTERVAL_MS } from '../utils/config';
/**
 * DOM-based panel view: binds to HTML elements and exposes events/callbacks for the game controller.
 * No Pixi.js; all UI is HTML/CSS.
 * Copied from simpleSlot; optional onWinDisplay allows syncing win text to Pixi WinFieldView.
 */
export class PanelView {
  private readonly balanceEl: HTMLElement;
  private readonly winEl: HTMLElement;
  private readonly betEl: HTMLElement;
  private readonly betDownBtn: HTMLButtonElement;
  private readonly betUpBtn: HTMLButtonElement;
  private readonly spinBtn: HTMLButtonElement;
  private readonly forceButtons: HTMLButtonElement[];

  private spinRequestedCallback: (() => void) | null = null;
  private forceOutcomeCallback: ((index: number) => void) | null = null;
  private betChangeCallback: ((direction: 'up' | 'down') => void) | null = null;
  private betHoldTimeoutId: number | null = null;
  private betHoldIntervalId: number | null = null;
  private readonly onWinDisplay?: (formatted: string) => void;

  constructor(
    container: HTMLElement,
    onWinDisplay?: (formatted: string) => void,
  ) {
    this.onWinDisplay = onWinDisplay;

    const balanceEl = container.querySelector<HTMLElement>('#balance-display');
    const winEl = container.querySelector<HTMLElement>('#win-display');
    const betEl = container.querySelector<HTMLElement>('#bet-display');
    const betDownBtn = container.querySelector<HTMLButtonElement>('#bet-decrease');
    const betUpBtn = container.querySelector<HTMLButtonElement>('#bet-increase');
    const spinBtn = container.querySelector<HTMLButtonElement>('#spin-btn');
    const forceBtns = container.querySelectorAll<HTMLButtonElement>('.btn-force');

    if (
      !(balanceEl instanceof HTMLElement) ||
      !(winEl instanceof HTMLElement) ||
      !(betEl instanceof HTMLElement) ||
      !(betDownBtn instanceof HTMLButtonElement) ||
      !(betUpBtn instanceof HTMLButtonElement) ||
      !(spinBtn instanceof HTMLButtonElement)
    ) {
      throw new Error(
        'PanelView: required DOM elements not found (#balance-display, #win-display, #bet-display, #bet-decrease, #bet-increase, #spin-btn)',
      );
    }

    this.balanceEl = balanceEl;
    this.winEl = winEl;
    this.betEl = betEl;
    this.betDownBtn = betDownBtn;
    this.betUpBtn = betUpBtn;
    this.spinBtn = spinBtn;
    this.forceButtons = Array.from(forceBtns);

    this.spinBtn.addEventListener('click', () => this.spinRequestedCallback?.());

    // Added to allow holding buttons to increase and decrease bet
    const startHoldDown = () => this.startBetHold('down');
    const startHoldUp = () => this.startBetHold('up');
    const stopHold = () => this.stopBetHold();

    this.betDownBtn.addEventListener('mousedown', startHoldDown);
    this.betDownBtn.addEventListener('touchstart', startHoldDown);
    this.betDownBtn.addEventListener('mouseup', stopHold);
    this.betDownBtn.addEventListener('mouseleave', stopHold);
    this.betDownBtn.addEventListener('touchend', stopHold);
    this.betDownBtn.addEventListener('touchcancel', stopHold);

    this.betUpBtn.addEventListener('mousedown', startHoldUp);
    this.betUpBtn.addEventListener('touchstart', startHoldUp);
    this.betUpBtn.addEventListener('mouseup', stopHold);
    this.betUpBtn.addEventListener('mouseleave', stopHold);
    this.betUpBtn.addEventListener('touchend', stopHold);
    this.betUpBtn.addEventListener('touchcancel', stopHold);

    this.forceButtons.forEach((btn, i) => {
      btn.addEventListener('click', () => this.forceOutcomeCallback?.(i));
    });
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

  private startBetHold(direction: 'up' | 'down'): void {
    if (!this.betChangeCallback) return;

    // Apply one step immediately.
    this.betChangeCallback(direction);

    // Clear any existing timers.
    this.stopBetHold();

    this.betHoldTimeoutId = window.setTimeout(() => {
      this.betHoldIntervalId = window.setInterval(() => {
        this.betChangeCallback?.(direction);
      }, BET_HOLD_REPEAT_INTERVAL_MS);
    }, BET_HOLD_DELAY_MS);
  }

  private stopBetHold(): void {
    if (this.betHoldTimeoutId !== null) {
      window.clearTimeout(this.betHoldTimeoutId);
      this.betHoldTimeoutId = null;
    }
    if (this.betHoldIntervalId !== null) {
      window.clearInterval(this.betHoldIntervalId);
      this.betHoldIntervalId = null;
    }
  }

  setBet(value: number): void {
    this.betEl.textContent = `Bet: ${value} €`;
  }

  setBetButtonsEnabled(canDecrease: boolean, canIncrease: boolean): void {
    this.betDownBtn.disabled = !canDecrease;
    this.betUpBtn.disabled = !canIncrease;
  }

  setBalance(value: number): void {
    const formatted = this.formatAmount(value);
    this.balanceEl.textContent = `Credits: ${formatted} €`;
  }

  setWin(value: number): void {
    if (value === 0) {
      // Don't show a numeric win when it's zero; keep label and clear Pixi text.
      this.winEl.textContent = 'Win:';
      this.onWinDisplay?.('');
      return;
    }
    const formatted = this.formatAmount(value);
    this.winEl.textContent = `Win: ${formatted} €`;
    this.onWinDisplay?.(formatted);
  }

  private formatAmount(value: number): string {
    if (!Number.isFinite(value)) return '0';
    const fixed = value.toFixed(2);
    return fixed.replace(/\.?0+$/, '');
  }

  setSpinEnabled(enabled: boolean): void {
    this.spinBtn.disabled = !enabled;
  }

  setForceSelected(index: number | null): void {
    this.forceButtons.forEach((btn, i) => {
      btn.classList.toggle('selected', i === index);
    });
  }

  dispose(): void {
    this.spinRequestedCallback = null;
    this.forceOutcomeCallback = null;
    this.betChangeCallback = null;
  }
}
