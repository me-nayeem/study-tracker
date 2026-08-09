export function MasteryConstellation() {
  const dots = [
    { cx: 40, cy: 60, r: 4, color: "accent", delay: "0s" },
    { cx: 95, cy: 30, r: 3, color: "gamify", delay: "0.6s" },
    { cx: 150, cy: 80, r: 5, color: "accent", delay: "1.2s" },
    { cx: 70, cy: 130, r: 3, color: "gamify", delay: "0.3s" },
    { cx: 200, cy: 50, r: 4, color: "accent", delay: "1.8s" },
    { cx: 240, cy: 110, r: 3, color: "gamify", delay: "0.9s" },
    { cx: 180, cy: 160, r: 5, color: "accent", delay: "2.1s" },
    { cx: 110, cy: 190, r: 3, color: "gamify", delay: "1.5s" },
    { cx: 280, cy: 170, r: 4, color: "accent", delay: "0.4s" },
    { cx: 320, cy: 90, r: 3, color: "gamify", delay: "2.4s" },
    { cx: 30, cy: 220, r: 3, color: "accent", delay: "1.1s" },
    { cx: 260, cy: 230, r: 4, color: "gamify", delay: "1.7s" },
    { cx: 340, cy: 210, r: 3, color: "accent", delay: "0.7s" },
    { cx: 130, cy: 40, r: 3, color: "gamify", delay: "2.0s" },
    { cx: 350, cy: 40, r: 4, color: "accent", delay: "1.4s" },
  ];

  const links: [number, number][] = [
    [0, 2],
    [2, 4],
    [4, 5],
    [1, 3],
    [3, 7],
    [6, 11],
    [9, 12],
    [7, 10],
    [5, 8],
  ];

  return (
    <svg viewBox="0 0 380 260" className="h-full w-full" role="presentation" aria-hidden="true">
      <g className="opacity-40" stroke="var(--accent-primary)" strokeWidth="0.5">
        {links.map(([a, b], i) => (
          <line key={i} x1={dots[a].cx} y1={dots[a].cy} x2={dots[b].cx} y2={dots[b].cy} />
        ))}
      </g>
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={dot.color === "accent" ? "var(--accent-primary)" : "var(--accent-gamify)"}
          className="constellation-dot"
          style={{ animationDelay: dot.delay }}
        />
      ))}
    </svg>
  );
}
