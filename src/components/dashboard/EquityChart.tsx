import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type AreaData,
  type Time,
} from 'lightweight-charts';

import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import type { LoadingState } from '@/types/domain';

export interface EquityChartProps {
  equitySeries: { time: number; equity: number }[];
  drawdownSeries: { time: number; drawdown: number }[];
  state: LoadingState;
  error?: string | null;
  onRetry?: () => void;
}

export function EquityChart({
  equitySeries,
  drawdownSeries,
  state,
  error,
  onRetry,
}: EquityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const equityRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ddRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#7F8DA3',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(38,54,77,0.35)' },
        horzLines: { color: 'rgba(38,54,77,0.35)' },
      },
      rightPriceScale: { borderColor: '#26364D' },
      timeScale: { borderColor: '#26364D', timeVisible: true, secondsVisible: false },
      crosshair: {
        vertLine: { color: '#26364D', labelBackgroundColor: '#172437' },
        horzLine: { color: '#26364D', labelBackgroundColor: '#172437' },
      },
      width: containerRef.current.clientWidth,
      height: 280,
    });
    chartRef.current = chart;

    const equitySeriesApi = chart.addLineSeries({
      color: '#5EA6F7',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      priceScaleId: 'right',
    });
    equityRef.current = equitySeriesApi;

    const ddSeriesApi = chart.addAreaSeries({
      lineColor: 'rgba(240,100,100,0.6)',
      topColor: 'rgba(240,100,100,0.25)',
      bottomColor: 'rgba(240,100,100,0.02)',
      lineWidth: 1,
      priceScaleId: 'left',
      priceFormat: { type: 'percent', precision: 2, minMove: 0.01 },
    });
    ddRef.current = ddSeriesApi;

    chart.priceScale('left').applyOptions({
      scaleMargins: { top: 0.7, bottom: 0 },
    });
    chart.priceScale('right').applyOptions({
      scaleMargins: { top: 0.05, bottom: 0.3 },
    });

    const resize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      equityRef.current = null;
      ddRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!equityRef.current || !ddRef.current) return;
    if (state !== 'success') return;

    const eqData: LineData[] = equitySeries.map((p) => ({
      time: p.time as Time,
      value: p.equity,
    }));
    const ddData: AreaData[] = drawdownSeries.map((p) => ({
      time: p.time as Time,
      value: p.drawdown,
    }));
    equityRef.current.setData(eqData);
    ddRef.current.setData(ddData);
    chartRef.current?.timeScale().fitContent();
  }, [equitySeries, drawdownSeries, state]);

  return (
    <div className="relative h-[280px] w-full">
      <div ref={containerRef} className="h-full w-full" />

      {state === 'loading' && (
        <div className="bg-surface/60 absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      )}
      {state === 'error' && (
        <div className="bg-surface absolute inset-0">
          <ErrorState message={error ?? undefined} onRetry={onRetry} />
        </div>
      )}
      {state === 'empty' && (
        <div className="bg-surface absolute inset-0">
          <EmptyState title="No equity history" description="No portfolio data available yet." />
        </div>
      )}
    </div>
  );
}
