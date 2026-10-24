import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { buildDays, monthLabels } from '../lib/heatmap.ts';
import { format } from '../lib/dates.ts';
import { rootScale } from '../lib/units.ts';

export type CellShape = 'square' | 'rounded';

interface HeatmapGridProps {
  startKey: string;
  endKey: string;
  today: string;
  /** Color and tooltip text for a day. */
  cellFor: (key: string) => { color: string; label: string };
  minSize?: number;
  maxSize?: number;
  labels?: boolean;
  shape?: CellShape;
  ariaLabel: string;
}

/**
 * A calendar heatmap: one column per week (Sun→Sat) from startKey to endKey.
 * Days outside the range are left blank; days after today are drawn as dim outlines.
 * Cells grow to fill the card (within min/max) and the grid scrolls sideways below min.
 */
export function HeatmapGrid({ startKey, endKey, today, cellFor, minSize = 10, maxSize = 22, labels = true, shape = 'square', ariaLabel }: HeatmapGridProps) {
  const days = useMemo(() => buildDays(startKey, endKey, today), [startKey, endKey, today]);
  const months = useMemo(() => monthLabels(days), [days]);
  const weeks = days.length / 7;
  const scroller = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(12);
  const [gap, setGap] = useState(3);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    // Sizes are in design pixels at the 16px base; scale them with the root font size like the CSS.
    const fit = () => {
      const scale = rootScale();
      const g = Math.round(3 * scale);
      const width = el.clientWidth - (labels ? 36 * scale : 0);
      const s = Math.floor((width + g) / weeks) - g;
      setGap(g);
      setCell(Math.max(Math.round(minSize * scale), Math.min(Math.round(maxSize * scale), s)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [weeks, labels, minSize, maxSize]);

  const radius = shape === 'rounded' ? Math.round(cell / 2) : Math.max(2, Math.round(cell / 4));
  const style = { '--cell': `${cell}px`, '--cell-gap': `${gap}px`, '--cell-radius': `${radius}px`, '--weeks': weeks } as CSSProperties;

  return (
    <div className="heatmap" ref={scroller} style={style}>
      <div className="heatmap__inner">
        {labels && (
          <div className="heatmap__weekdays" aria-hidden="true">
            <span />
            <span />
            <span>Mon</span>
            <span />
            <span>Wed</span>
            <span />
            <span>Fri</span>
            <span />
          </div>
        )}
        <div className="heatmap__body">
          {labels && (
            <div className="heatmap__months" aria-hidden="true">
              {months.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
          <div className="heatmap__cells" role="img" aria-label={ariaLabel}>
            {days.map(({ key, blank, future }) => {
              if (blank) return <span key={key} className="heatmap__cell is-future" />;
              if (future) return <span key={key} className="heatmap__cell heatmap__cell--upcoming" title={`${format.short(key)} · upcoming`} />;
              const { color, label } = cellFor(key);
              return <span key={key} className="heatmap__cell" style={{ background: color }} title={`${format.short(key)} · ${label}`} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Legend({ colors, shape = 'square' }: { colors: string[]; shape?: CellShape }) {
  const radius = shape === 'rounded' ? 6 : 3;
  return (
    <div className="legend" aria-hidden="true">
      <span>Less</span>
      {colors.map((c) => (
        <span key={c} className="legend__cell" style={{ background: c, borderRadius: radius }} />
      ))}
      <span>More</span>
    </div>
  );
}
