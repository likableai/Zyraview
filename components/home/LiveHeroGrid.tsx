'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Hash, Globe, Box, Lock, Zap, TrendingUp } from 'lucide-react';

type HeroData = {
  priceUsd: number;
  total_circulating_supply: number;
  total_supply: number;
  total_locked: number;
  latest_block: number;
  tps: number;
  market_cap_usd?: number;
  updatedAt?: string;
};

const metricConfig = [
  { key: 'price', label: 'Pi Price', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
  { key: 'block', label: 'Latest Block', icon: Hash, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { key: 'circ', label: 'Circulating', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  { key: 'supply', label: 'Total Supply', icon: Box, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
  { key: 'locked', label: 'Locked Pi', icon: Lock, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
  { key: 'tps', label: 'TPS (est.)', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { key: 'mcap', label: 'Market Cap', icon: TrendingUp, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/20' },
] as const;

const POLL_MS = 5000;

function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

function fmtB(n: number) {
  return `${(n / 1e9).toFixed(2)}B`;
}

export function LiveHeroGrid({ initial }: { initial: HeroData }) {
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
            total_circulating_supply: json.data.total_circulating_supply ?? 0,
            total_supply: json.data.total_supply ?? 0,
            total_locked: json.data.total_locked ?? 0,
            latest_block: json.data.latest_block ?? 0,
            tps: json.data.tps ?? 0,
            market_cap_usd: json.data.market_cap_usd,
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
  const values: Record<string, string> = {
    price: fmtUsd(d.priceUsd),
    block: String(d.latest_block ?? '\u2014'),
    circ: fmtB(d.total_circulating_supply),
    supply: fmtB(d.total_supply),
    locked: fmtB(d.total_locked),
    tps: typeof d.tps === 'number' ? d.tps.toFixed(2) : '\u2014',
    mcap: d.market_cap_usd ? fmtUsd(d.market_cap_usd) : '\u2014',
  };

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
        {metricConfig.map((m) => (
          <Card key={m.key} className="border-border/60 bg-card/40 backdrop-blur hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                  {m.label}
                </span>
                <div className={`rounded-full p-1 ${m.bg}`}>
                  <m.icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${m.color}`} />
                </div>
              </div>
              <p className="text-sm sm:text-base font-bold text-foreground truncate">{values[m.key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground text-right mt-1.5">
        {live && (
          <span className="inline-flex items-center gap-1 mr-2 text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            LIVE
          </span>
        )}
        {data.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleString()}` : ''}
      </p>
    </section>
  );
}
