'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { usePriceHistory } from '@/lib/use-chart-data';
import { fmtUsd, fmtMoneyCompact, formatChange } from '@/lib/format';
import { Sparkline, type SparklineDataPoint } from '@/components/charts/Sparkline';

const PriceChart = dynamic(() => import('@/components/charts/PriceChart'), { ssr: false });

type Range = '1d' | '7d' | '30d' | '90d';
const RANGES: Range[] = ['1d', '7d', '30d', '90d'];

export type HeroPriceData = {
  priceUsd: number;
  priceChange24h?: number;
  high24hUsd?: number;
  low24hUsd?: number;
  market_cap_usd?: number;
  confidenceScore?: number;
  updatedAt?: string;
};

const POLL_MS = 5000;

export function HeroPriceChart({ initial }: { initial: HeroPriceData }) {
  const [range, setRange] = useState<Range>('7d');
  const [data, setData] = useState<HeroPriceData>(initial);
  const [live, setLive] = useState(false);
  const mounted = useRef(true);
  const { priceHistory, loading } = usePriceHistory(range);

  useEffect(() => {
    mounted.current = true;
    let id: ReturnType<typeof setInterval> | null = null;
    async function poll() {
      try {
        const res = await fetch('/api/v2/home/hero?fresh=1', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && json.data && mounted.current) {
          setData((d) => ({ ...d, ...json.data, updatedAt: json.updatedAt }));
          setLive(true);
        }
      } catch {
        /* keep previous */
      }
    }
    poll();
    id = setInterval(poll, POLL_MS);
    return () => {
      mounted.current = false;
      if (id) clearInterval(id);
    };
  }, []);

  const change = formatChange(data.priceChange24h);
  const confidence =
    data.confidenceScore != null
      ? Math.round(data.confidenceScore * (data.confidenceScore <= 1 ? 100 : 1))
      : null;

  const sparklineData: SparklineDataPoint[] = priceHistory.map((p) => ({
    time: p.time,
    value: p.close,
  }));
  const hasHistory = !loading && priceHistory.length > 0;

  return (
    <Card className="card-elevated">
      <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                PI / USD
              </span>
              {live && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-accent">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                  </span>
                  LIVE
                </span>
              )}
              {confidence != null && (
                <span
                  title="Oracle confidence score across price sources"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground border border-border rounded px-1.5 py-0.5"
                >
                  <ShieldCheck className="h-3 w-3 text-success" />
                  {confidence}% conf.
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tabular-nums">
                {fmtUsd(data.priceUsd)}
              </span>
              {change && (
                <span className={`inline-flex items-center font-mono text-sm font-bold ${change.color}`}>
                  {!change.isFlat &&
                    (change.isGain ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    ))}
                  {change.text}
                </span>
              )}
            </div>
            <div className="flex gap-3 text-[11px] sm:text-xs text-muted-foreground font-mono">
              <span>24h H: {fmtUsd(data.high24hUsd)}</span>
              <span>24h L: {fmtUsd(data.low24hUsd)}</span>
              {data.market_cap_usd != null && (
                <span>MCap: {fmtMoneyCompact(data.market_cap_usd)}</span>
              )}
            </div>
          </div>

          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  range === r
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-80 text-muted-foreground text-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Loading price data...</span>
            </div>
          </div>
        ) : hasHistory ? (
          <PriceChart data={priceHistory} height={320} showVolume legend="PI/USD" />
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-muted-foreground text-sm border border-dashed border-border rounded-lg px-6">
            <TrendingUp className="h-8 w-8 mb-3 opacity-40" />
            <p className="font-medium mb-1">No price history yet</p>
            <p className="text-xs text-center max-w-md">
              Price history is populated by a background cron job once the oracle begins recording data.
              The live price and metrics above are available in real time.
            </p>
            {sparklineData.length > 0 && (
              <div className="mt-3">
                <Sparkline data={sparklineData} height={40} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
