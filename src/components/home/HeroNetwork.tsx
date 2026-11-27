/** Decorative ambient node network for the hero (float-slow/mid/fast, hidden on reduced motion). */
const NODES = [
  { x: 8, y: 22, s: 10, a: "animate-float-slow" },
  { x: 16, y: 62, s: 6, a: "animate-float-mid" },
  { x: 26, y: 36, s: 8, a: "animate-float-fast" },
  { x: 74, y: 28, s: 9, a: "animate-float-mid" },
  { x: 84, y: 58, s: 7, a: "animate-float-slow" },
  { x: 92, y: 18, s: 5, a: "animate-float-fast" },
  { x: 68, y: 74, s: 6, a: "animate-float-slow" },
  { x: 32, y: 80, s: 5, a: "animate-float-mid" },
];

const EDGES: [number, number][] = [[0, 2], [1, 2], [2, 7], [3, 4], [3, 5], [4, 6]];

export function HeroNetwork() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {EDGES.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke="rgba(26,58,143,0.10)" strokeWidth="0.15" />
        ))}
      </svg>
      {NODES.map((n, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-brand-blue/15 ring-4 ring-brand-blue/5 ${n.a}`}
          style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.s, height: n.s, animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </div>
  );
}
