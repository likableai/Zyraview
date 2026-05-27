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
  priceChange24h?: number;
  marketCapChange24h?: number;
  updatedAt?: string;
};

const POLL_MS = 5000;

function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(n);
}

function fmtMC(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function fmtB(n: number) {
  return `${(n / 1e9).toFixed(2)}B`;
}

function fmtFull(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatChange(change?: number) {
  if (change === undefined) return null;
  const isGain = change >= 0;
  const prefix = isGain ? '+' : '';
  return {
    text: `${prefix}${change.toFixed(2)}%`,
    isGain,
    color: isGain ? 'text-success' : 'text-danger',
  };
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
            priceChange24h: json.data.priceChange24h,
            marketCapChange24h: json.data.marketCapChange24h,
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
    <section className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 lg:gap-6 lg:grid-cols-3">
      {/* Price Card — primary */}
      <Card className="lg:col-span-1 card-elevated">
        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</p>
            {live && (
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-accent">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                </span>
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-mono text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{fmtUsd(d.priceUsd)}</p>
            {formatChange(d.priceChange24h) && (
              <span className={`font-mono text-xs sm:text-sm font-bold ${formatChange(d.priceChange24h)!.color}`}>
                {formatChange(d.priceChange24h)!.text}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground font-mono">
            <span>24h High: {d.high24hUsd != null ? fmtUsd(d.high24hUsd) : '\u2014'}</span>
            <span>24h Low: {d.low24hUsd != null ? fmtUsd(d.low24hUsd) : '\u2014'}</span>
          </div>
          <div className="pt-3 sm:pt-4 border-t border-border space-y-2 sm:space-y-3">
            <div>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Market Cap</span>
              <p className="font-mono text-sm sm:text-base md:text-lg lg:text-lg font-bold text-foreground mt-1">{fmtMC(d.market_cap_usd)}</p>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">FDV</span>
              <p className="font-mono text-sm sm:text-base md:text-lg lg:text-lg font-bold text-foreground mt-1">{fmtMC(d.fdv_usd)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supply Details */}
      <Card className="lg:col-span-1 card-elevated">
        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sm:mb-4">Supply</p>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Circulating</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-foreground">{fmtB(d.total_circulating_supply)}</span>
            </div>
            <div className="w-full bg-muted rounded-md h-2 overflow-hidden">
              <div
                className="bg-accent h-full rounded-md transition-all duration-500"
                style={{ width: `${(d.total_circulating_supply / d.total_supply) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Supply</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-foreground">{fmtB(d.total_supply)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Locked</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-foreground">{fmtB(d.total_locked)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Unlocked %</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-accent">
                {((1 - d.total_locked / d.total_supply) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Activity */}
      <Card className="lg:col-span-1 card-elevated">
        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sm:mb-4">Network</p>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Block</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-foreground">#{d.latest_block?.toLocaleString() || '\u2014'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">TPS</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-foreground">{typeof d.tps === 'number' ? d.tps.toFixed(2) : '\u2014'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Circ / Locked</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-foreground">
                {((d.total_circulating_supply - d.total_locked) / 1e9).toFixed(2)}B / {fmtB(d.total_locked)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Utilization</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-accent">
                {((d.total_circulating_supply / d.total_supply) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
