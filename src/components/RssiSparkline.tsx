type Props = {
  samples: number[];
  width?: number;
  height?: number;
};

export default function RssiSparkline({ samples, width = 120, height = 24 }: Props) {
  if (samples.length < 2) {
    return <div style={{ width, height, opacity: 0.3, fontSize: 10 }}>— no samples —</div>;
  }
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const range = Math.max(1, max - min);
  const step = width / (samples.length - 1);
  const d = samples
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="var(--ion-color-primary, #3880ff)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
