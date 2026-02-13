import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Configurable tooltip positions
const POSITIONS = {
  top: { transform: 'translateX(-50%) translateY(-100%)' },
  bottom: { transform: 'translateX(-50%) translateY(0)' },
  left: { transform: 'translateX(-100%) translateY(-50%)' },
  right: { transform: 'translateX(0) translateY(-50%)' },
};

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return { x: 0, y: 0 };

    const rect = triggerRef.current.getBoundingClientRect();
    let x, y;

    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2;
        y = rect.top - 8;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2;
        y = rect.bottom + 8;
        break;
      case 'left':
        x = rect.left - 8;
        y = rect.top + rect.height / 2;
        break;
      case 'right':
        x = rect.right + 8;
        y = rect.top + rect.height / 2;
        break;
      default:
        x = rect.left + rect.width / 2;
        y = rect.top - 8;
    }

    return { x, y };
  }, [position]);

  const showTooltip = useCallback(() => {
    if (disabled || !content) return;

    timeoutRef.current = setTimeout(() => {
      setTooltipPos(calculatePosition());
      setIsVisible(true);
    }, delay);
  }, [disabled, content, delay, calculatePosition]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && content && createPortal(
        <div
          className={`fixed z-[9999] pointer-events-none ${className}`}
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: POSITIONS[position].transform,
          }}
        >
          <div className="pixel-panel-dark shadow-xl px-3 py-2 text-sm text-white max-w-xs">
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
