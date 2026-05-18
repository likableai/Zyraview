'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type HeroData = {
  priceUsd: number;
  market_cap_usd: number;
  fdv_usd: number;
  total_circulating_supply: number;
  total_supply: number;
  total_locked: number;
  latest_block: number;
  tps: number;
  high24hUsd?: number;
  low24hUsd?: number;
  updatedAt?: string;
};

const POLL_MS = 5000;

function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtB(n: number) {
  return `${(n / 1e9).toFixed(2)}B`;
}

function fmtFull(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function LiveMarketOverview({ initial }: { initial: HeroData }) {
  const [data, setData] = useState<HeroData>(initial);
  const [live, setLive] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      try {
        const res = await fetch('/api/v2/home/hero?fresh=1', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data && mounted.current) {
          setData({
            priceUsd: json.data.priceUsd ?? 0,
            market_cap_usd: json.data.market_cap_usd ?? 0,
            fdv_usd: json.data.fdv_usd ?? 0,
            total_circulating_supply: json.data.total_circulating_supply ?? 0,
            total_supply: json.data.total_supply ?? 0,
            total_locked: json.data.total_locked ?? 0,
            latest_block: json.data.latest_block ?? 0,
            tps: json.data.tps ?? 0,
            high24hUsd: json.data.high24hUsd,
            low24hUsd: json.data.low24hUsd,
            updatedAt: json.updatedAt,
          });
          setLive(true);
        }
      } catch {
        // keep previous data
      }
    }

    poll();
    intervalId = setInterval(poll, POLL_MS);

    return () => {
      mounted.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const d = data;

  return (
    <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
      {/* Price Card — prominent with LIVE indicator */}
      <Card className="lg:col-span-1 border-border/60 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/10 dark:to-green-950/10">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pi Price</p>
            {live && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                LIVE
              </span>
            )}
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-foreground">{fmtUsd(d.priceUsd)}</p>
          <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
            <span>24h H: {d.high24hUsd != null ? fmtUsd(d.high24hUsd) : '\u2014'}</span>
            <span>24h L: {d.low24hUsd != null ? fmtUsd(d.low24hUsd) : '\u2014'}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Market Cap</span>
              <p className="font-semibold text-foreground">{fmtUsd(d.market_cap_usd)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">FDV</span>
              <p className="font-semibold text-foreground">{fmtUsd(d.fdv_usd)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supply Details */}
      <Card className="lg:col-span-1 border-border/60 bg-card/40">
        <CardContent className="p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Supply</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Circulating</span>
              <span className="text-sm font-semibold">{fmtB(d.total_circulating_supply)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(d.total_circulating_supply / d.total_supply) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Supply</span>
              <span className="text-sm font-semibold">{fmtB(d.total_supply)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Locked</span>
              <span className="text-sm font-semibold">{fmtB(d.total_locked)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Unlocked %</span>
              <span className="text-sm font-semibold">
                {((1 - d.total_locked / d.total_supply) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Activity */}
      <Card className="lg:col-span-1 border-border/60 bg-card/40">
        <CardContent className="p-4 sm:p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Network</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Latest Block</span>
              <span className="text-sm font-semibold font-mono">#{d.latest_block?.toLocaleString() || '\u2014'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">TPS (est.)</span>
              <span className="text-sm font-semibold">{typeof d.tps === 'number' ? d.tps.toFixed(2) : '\u2014'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Circulating / Locked</span>
              <span className="text-sm font-semibold">
                {((d.total_circulating_supply - d.total_locked) / 1e9).toFixed(2)}B / {fmtB(d.total_locked)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Supply Utilization</span>
              <span className="text-sm font-semibold">
                {((d.total_circulating_supply / d.total_supply) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
