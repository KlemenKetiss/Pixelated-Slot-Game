import { useCallback, useEffect, useRef, useState } from 'react';
import { useBetHold } from '../../hooks/useBetHold';
import { formatPanelAmount } from '../../utils/panelFormat';
import { FORCE_OUTCOME_LABELS } from '../../utils/config';
import {
  ReactPanelAdapter,
  createDefaultPanelDisplayState,
  type PanelDisplayState,
} from './ReactPanelAdapter';

export type GamePanelProps = {
  adapter: ReactPanelAdapter;
  /** Called once after {@link ReactPanelAdapter.connect} so {@link GameController} can sync after React state is live. */
  onAdapterConnected?: () => void;
};

/**
 * React overlay: same ids/classes as the legacy HTML panel for existing CSS.
 */
export function GamePanel({ adapter, onAdapterConnected }: GamePanelProps) {
  const [display, setDisplay] = useState<PanelDisplayState>(
    createDefaultPanelDisplayState,
  );

  const onConnectedRef = useRef(onAdapterConnected);
  onConnectedRef.current = onAdapterConnected;

  useEffect(() => {
    adapter.connect(setDisplay);
    onConnectedRef.current?.();
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
          {FORCE_OUTCOME_LABELS.map((label, index) => (
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
