/** Tiny PUE trend line for a site card. */
export function PueSpark({ data }: { data: { month: string; pue: number }[] }) {
  if (data.length < 2) return null;
  const vals = data.map((d) => d.pue);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 200},${40 - ((d.pue - min) / (max - min || 1)) * 36 - 2}`).join(" ");
  return (
    <div>
      <svg viewBox="0 0 200 40" className="h-10 w-full" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke="#1a3a8f" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400"><span>{data[0].month}</span><span>PUE {min.toFixed(2)}–{max.toFixed(2)}</span><span>{data[data.length - 1].month}</span></div>
    </div>
  );
}
