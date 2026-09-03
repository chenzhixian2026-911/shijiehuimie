import { getAngerColor } from '../lib/game-engine';

interface AngerMeterProps {
  anger: number;
  shakeKey: number;
}

export default function AngerMeter({ anger, shakeKey }: AngerMeterProps) {
  const color = getAngerColor(anger);

  return (
    <div className="mt-2" key={shakeKey}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🔥</span>
          <span className="text-xs text-[var(--color-text-secondary)]">怒气值</span>
        </div>
        <span
          className="anger-number text-xl font-bold tabular-nums"
          style={{ color }}
        >
          {anger}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="anger-bar-fill h-full rounded-full"
          style={{
            width: `${anger}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
