'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

function ChartSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-end gap-2 h-48 mb-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-200 rounded-t"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
      <div className="h-3 w-1/3 bg-slate-200 rounded mx-auto" />
    </div>
  );
}

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

interface PlotlyChartProps {
  data: any[];
  layout?: any;
  config?: any;
  style?: React.CSSProperties;
}

export default function PlotlyChart({ data, layout, config, style }: PlotlyChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const mergedLayout = isDark
    ? {
        ...layout,
        plot_bgcolor: 'rgba(15,23,42,0.6)',
        paper_bgcolor: 'transparent',
        font: { ...(layout?.font ?? {}), color: 'rgb(203,213,225)' },
        xaxis: {
          ...(layout?.xaxis ?? {}),
          gridcolor: 'rgba(71,85,105,0.5)',
          linecolor: 'rgb(71,85,105)',
          zerolinecolor: 'rgb(71,85,105)',
          tickfont: { color: 'rgb(148,163,184)' },
          title: layout?.xaxis?.title
            ? { ...(typeof layout.xaxis.title === 'string' ? { text: layout.xaxis.title } : layout.xaxis.title), font: { color: 'rgb(148,163,184)' } }
            : undefined,
        },
        yaxis: {
          ...(layout?.yaxis ?? {}),
          gridcolor: 'rgba(71,85,105,0.5)',
          linecolor: 'rgb(71,85,105)',
          zerolinecolor: 'rgb(71,85,105)',
          tickfont: { color: 'rgb(148,163,184)' },
          title: layout?.yaxis?.title
            ? { ...(typeof layout.yaxis.title === 'string' ? { text: layout.yaxis.title } : layout.yaxis.title), font: { color: 'rgb(148,163,184)' } }
            : undefined,
        },
        legend: {
          ...(layout?.legend ?? {}),
          bgcolor: 'rgba(15,23,42,0.7)',
          bordercolor: 'rgb(71,85,105)',
        },
        title: layout?.title
          ? { ...(typeof layout.title === 'string' ? { text: layout.title } : layout.title), font: { ...(layout.title?.font ?? {}), color: 'rgb(226,232,240)' } }
          : undefined,
      }
    : layout;

  return <Plot data={data} layout={mergedLayout} config={config} style={style} />;
}
