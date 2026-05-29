'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FlashValue } from './FlashValue';
import {
  fmtUsd,
  fmtMoneyCompact,
  fmtCompact,
  fmtInt,
  formatChange,
} from '@/lib/format';

export type TickerHero = {
  priceUsd: number;
  market_cap_usd: number;
  fdv_usd: number;
  total_circulating_supply: number;
  total_supply: number;
  total_locked: number;
  latest_block: number;
  tps: number;
  priceChange24h?: number;
  marketCapChange24h?: number;
};

type TradeRecord = {
  base_amount?: string;
  counter_amount?: string;
  base_asset_type?: string;
  counter_asset_type?: string;
  base_asset_code?: string;
  counter_asset_code?: string;
};

const HERO_POLL_MS = 5000;
const TRADES_POLL_MS = 30000;

function estimateVolume(records: TradeRecord[], priceUsd: number): { volumeUsd: number; pairs: number } {
  let piVolume = 0;
  const pairSet = new Set<string>();
  for (const t of records) {
    const baseNative = t.base_asset_type === 'native';
    const counterNative = t.counter_asset_type === 'native';
    if (baseNative) piVolume += parseFloat(t.base_amount || '0') || 0;
    else if (counterNative) piVolume += parseFloat(t.counter_amount || '0') || 0;

    const baseLabel = baseNative ? 'Pi' : t.base_asset_code || t.base_asset_type || '?';
    const counterLabel = counterNative ? 'Pi' : t.counter_asset_code || t.counter_asset_type || '?';
    pairSet.add(`${baseLabel}/${counterLabel}`);
  }
  return { volumeUsd: piVolume * (priceUsd || 0), pairs: pairSet.size };
}

interface TickerItem {
  label: string;
  value: string;
  numeric?: number;
  change?: number;
}

function TickerCell({ item }: { item: TickerItem }) {
  const change = formatChange(item.change);
  return (
    <span className="inline-flex items-center gap-1.5 px-4 border-r border-border/40 whitespace-nowrap">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        {item.label}
      </span>
      <FlashValue
        value={item.value}
        numeric={item.numeric}
        className="font-mono text-xs font-bold text-foreground tabular-nums"
      />
      {change && !change.isFlat && (
        <span className={`inline-flex items-center text-[11px] font-bold ${change.color}`}>
          {change.isGain ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change.text}
        </span>
      )}
    </span>
  );
}

export function LiveTicker({
  initialHero,
  initialVolumeUsd = null,
  initialPairs = null,
}: {
  initialHero: TickerHero;
  initialVolumeUsd?: number | null;
  initialPairs?: number | null;
}) {
  const [hero, setHero] = useState<TickerHero>(initialHero);
  const [volumeUsd, setVolumeUsd] = useState<number | null>(initialVolumeUsd);
  const [pairs, setPairs] = useState<number | null>(initialPairs);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let heroId: ReturnType<typeof setInterval> | null = null;
    let tradesId: ReturnType<typeof setInterval> | null = null;

    async function pollHero() {
      try {
        const res = await fetch('/api/v2/home/hero?fresh=1', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && json.data && mounted.current) setHero((h) => ({ ...h, ...json.data }));
      } catch {
        /* keep previous */
      }
    }

    async function pollTrades() {
      try {
        const res = await fetch('/api/v2/home/latest-trades', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && json.data?.records && mounted.current) {
          const { volumeUsd: v, pairs: p } = estimateVolume(json.data.records, hero.priceUsd);
          setVolumeUsd(v);
          setPairs(p);
        }
      } catch {
        /* keep previous */
      }
    }

    pollHero();
    pollTrades();
    heroId = setInterval(pollHero, HERO_POLL_MS);
    tradesId = setInterval(pollTrades, TRADES_POLL_MS);

    return () => {
      mounted.current = false;
      if (heroId) clearInterval(heroId);
      if (tradesId) clearInterval(tradesId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items: TickerItem[] = [
    { label: 'PI Price', value: fmtUsd(hero.priceUsd), numeric: hero.priceUsd, change: hero.priceChange24h },
    { label: 'Market Cap', value: fmtMoneyCompact(hero.market_cap_usd), numeric: hero.market_cap_usd, change: hero.marketCapChange24h },
    { label: 'FDV', value: fmtMoneyCompact(hero.fdv_usd), numeric: hero.fdv_usd },
    { label: '24h Vol (est.)', value: volumeUsd != null ? fmtMoneyCompact(volumeUsd) : '\u2014', numeric: volumeUsd ?? undefined },
    { label: 'Pairs', value: pairs != null ? String(pairs) : '\u2014', numeric: pairs ?? undefined },
    { label: 'Circulating', value: `${fmtCompact(hero.total_circulating_supply)} \u03c0`, numeric: hero.total_circulating_supply },
    { label: 'Locked', value: `${fmtCompact(hero.total_locked)} \u03c0`, numeric: hero.total_locked },
    { label: 'TPS', value: typeof hero.tps === 'number' ? hero.tps.toFixed(2) : '\u2014', numeric: hero.tps },
    { label: 'Block', value: `#${fmtInt(hero.latest_block)}`, numeric: hero.latest_block },
  ];

  // Duplicate the items for a seamless marquee loop.
  const loop = [...items, ...items];

  return (
    <div className="ticker-viewport w-full overflow-hidden border-y border-border bg-card/60 backdrop-blur-sm">
      <div className="ticker-track py-2">
        {loop.map((item, i) => (
          <TickerCell key={`${item.label}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}
