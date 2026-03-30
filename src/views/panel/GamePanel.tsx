import { useCallback, useEffect, useState } from 'react';
import { useBetHold } from '../../hooks/useBetHold';
import { formatPanelAmount } from '../../utils/panelFormat';
import {
  ReactPanelAdapter,
  createDefaultPanelDisplayState,
  type PanelDisplayState,
} from './ReactPanelAdapter';

const FORCE_OUTCOME_BUTTONS: ReadonlyArray<{ index: number; label: string }> =
  [
    { index: 0, label: 'High win' },
    { index: 1, label: 'Bonus' },
    { index: 2, label: 'Card ways' },
    { index: 3, label: 'No win' },
  ];

export type GamePanelProps = {
  adapter: ReactPanelAdapter;
};

/**
 * React overlay matching `#ui-overlay` in `index.html`: same ids/classes for existing CSS.
 */
export function GamePanel({ adapter }: GamePanelProps) {
  const [display, setDisplay] = useState<PanelDisplayState>(
    createDefaultPanelDisplayState,
  );

  useEffect(() => {
    adapter.connect(setDisplay);
    return () => adapter.disconnect();
  }, [adapter]);

  const onBetStep = useCallback(
    (direction: 'up' | 'down') => {
      adapter.invokeBetChange(direction);
    },
    [adapter],
  );

  const { startBetHold, stopBetHold } = useBetHold(onBetStep);

  const balanceText = `Credits: ${formatPanelAmount(display.balance)} €`;
  const betText = `Bet: ${display.bet} €`;
  const winText =
    display.win === 0
      ? 'Win:'
      : `Win: ${formatPanelAmount(display.win)} €`;

  return (
    <aside id="ui-overlay" className="ui-overlay">
      <div className="ui-top-row">
        <div className="ui-stat-group">
          <div className="ui-stat" id="balance-display">
            {balanceText}
          </div>
          <div className="bet-control">
            <button
              type="button"
              className="btn btn-bet"
              id="bet-decrease"
              aria-label="Decrease bet"
              disabled={!display.betDecreaseEnabled}
              onMouseDown={() => startBetHold('down')}
              onTouchStart={() => startBetHold('down')}
              onMouseUp={stopBetHold}
              onMouseLeave={stopBetHold}
              onTouchEnd={stopBetHold}
              onTouchCancel={stopBetHold}
            >
              −
            </button>
            <span className="ui-stat" id="bet-display">
              {betText}
            </span>
            <button
              type="button"
              className="btn btn-bet"
              id="bet-increase"
              aria-label="Increase bet"
              disabled={!display.betIncreaseEnabled}
              onMouseDown={() => startBetHold('up')}
              onTouchStart={() => startBetHold('up')}
              onMouseUp={stopBetHold}
              onMouseLeave={stopBetHold}
              onTouchEnd={stopBetHold}
              onTouchCancel={stopBetHold}
            >
              +
            </button>
          </div>
          <div className="ui-stat" id="win-display">
            {winText}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-spin"
          id="spin-btn"
          disabled={!display.spinEnabled}
          onClick={() => adapter.invokeSpinRequested()}
        >
          SPIN
        </button>
      </div>
      <section className="force-outcomes">
        <span className="force-outcomes-label">Force outcomes:</span>
        <div className="force-buttons">
          {FORCE_OUTCOME_BUTTONS.map(({ index, label }) => (
            <button
              key={index}
              type="button"
              className={`btn btn-force${display.forceSelectedIndex === index ? ' selected' : ''}`}
              data-force-index={String(index)}
              onClick={() => adapter.invokeForceOutcome(index)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
