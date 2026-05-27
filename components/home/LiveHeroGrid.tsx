'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Hash, Globe, Box, Lock, Zap, TrendingUp } from 'lucide-react';
import { Sparkline, generateSparklineData } from '@/components/charts/Sparkline';
import { useMobileLabel } from '@/hooks/use-mobile-labels';

type HeroData = {
  priceUsd: number;
  total_circulating_supply: number;
  total_supply: number;
  total_locked: number;
  latest_block: number;
  tps: number;
  market_cap_usd?: number;
  priceHistory?: Array<{ time: string; value: number }>;
  updatedAt?: string;
};

const metricConfig = [
  { key: 'price', label: 'Price', icon: DollarSign },
  { key: 'block', label: 'Block', icon: Hash },
  { key: 'circ', label: 'Circulating', icon: Globe },
  { key: 'supply', label: 'Supply', icon: Box },
  { key: 'locked', label: 'Locked', icon: Lock },
  { key: 'tps', label: 'TPS', icon: Zap },
  { key: 'mcap', label: 'Market Cap', icon: TrendingUp },
] as const;

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

export function LiveHeroGrid({ initial }: { initial: HeroData }) {
  const [data, setData] = useState<HeroData>({
    ...initial,
    priceHistory: initial.priceHistory || generateSparklineData(initial.priceUsd * 0.95, initial.priceUsd * 1.05),
  });
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
    mcap: d.market_cap_usd ? fmtMC(d.market_cap_usd) : '\u2014',
  };

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
        {metricConfig.map((m) => {
          const Icon = m.icon;
          const abbrevLabel = useMobileLabel(m.label);
          const sparklineData = m.key === 'price' ? d.priceHistory : generateSparklineData(parseFloat(values[m.key]) * 0.9, parseFloat(values[m.key]) * 1.1);
          const isPositive = !sparklineData || sparklineData.length < 2 ? true : sparklineData[sparklineData.length - 1].value >= sparklineData[0].value;
          
          return (
            <Card key={m.key} className="card-elevated">
              <CardContent className="p-2.5 sm:p-3 md:p-4 lg:p-5 space-y-2 sm:space-y-2.5 md:space-y-3">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                  <span className="text-[9px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                    {abbrevLabel}
                  </span>
                </div>
                <p className="font-mono text-sm sm:text-base md:text-xl lg:text-4xl font-bold text-foreground truncate">{values[m.key]}</p>
                {sparklineData && sparklineData.length > 0 && (
                  <div className="flex justify-start -ml-2.5 sm:-ml-3 md:-ml-4 lg:-ml-5">
                    <Sparkline data={sparklineData} height={20} isPositive={isPositive} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-right mt-4">
        {live && (
          <span className="inline-flex items-center gap-2 mr-3 text-accent font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            LIVE
          </span>
        )}
        {data.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' })}` : ''}
      </p>
    </section>
  );
}
