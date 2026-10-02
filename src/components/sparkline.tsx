import type { HistoryPoint } from "@/lib/view";

export function Sparkline({ points }: { points: HistoryPoint[] }) {
  const slice = points.slice(-7);
  const width = 68;
  const height = 16;
  const values = slice.length > 0 ? slice.map((point) => point.score) : [0];
  const step = values.length === 1 ? 0 : (width - 2) / (values.length - 1);
  const coords = values
    .map((score, index) => {
      const x = values.length === 1 ? width / 2 : 1 + index * step;
      const y = height - 1 - (Math.min(100, Math.max(0, score)) / 100) * (height - 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 text-current"
      aria-hidden="true"
    >
      <polyline fill="none" stroke="currentColor" strokeWidth="1" points={coords} />
    </svg>
  );
}
