const plates = [
  { name: 'Client', detail: 'Next.js workspace' },
  { name: 'API', detail: 'Gin, cmd/api, :8080' },
  { name: 'Redis', detail: 'Stream yellowbird:jobs' },
  { name: 'Worker', detail: 'FFmpeg, cmd/worker' },
  { name: 'Object storage', detail: 'S3 in production' },
  { name: 'PostgreSQL', detail: 'Source of truth' },
];

export function PipelineStack() {
  const originX = 16;
  const originY = 18;
  const width = 250;
  const depth = 52;
  const thickness = 14;
  const gap = 62;

  return (
    <figure className="pipeline-stack">
      <svg viewBox="0 0 520 400" role="img" aria-labelledby="pipeline-title pipeline-desc">
        <title id="pipeline-title">YellowBird pipeline, exploded</title>
        <desc id="pipeline-desc">
          Illustrative stack of six plates: client, API, Redis, worker, object storage, and PostgreSQL.
        </desc>
        {plates.map((plate, index) => {
          const y = originY + index * gap;
          const top = `${originX},${y + depth / 2} ${originX + width / 2},${y} ${originX + width},${y + depth / 2} ${originX + width / 2},${y + depth}`;
          const front = `${originX},${y + depth / 2} ${originX + width / 2},${y + depth} ${originX + width / 2},${y + depth + thickness} ${originX},${y + depth / 2 + thickness}`;
          const side = `${originX + width / 2},${y + depth} ${originX + width},${y + depth / 2} ${originX + width},${y + depth / 2 + thickness} ${originX + width / 2},${y + depth + thickness}`;
          return (
            <g key={plate.name}>
              <polygon className="pipeline-face pipeline-face-side" points={side} />
              <polygon className="pipeline-face pipeline-face-front" points={front} />
              <polygon className="pipeline-face pipeline-face-top" points={top} />
              <text x={300} y={y + depth / 2 + 4} className="pipeline-label">
                {plate.name}
              </text>
              <text x={300} y={y + depth / 2 + 20} className="pipeline-detail">
                {plate.detail}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>Illustrative. Each plate is a process or store. Spacing is not a scale.</figcaption>
    </figure>
  );
}
