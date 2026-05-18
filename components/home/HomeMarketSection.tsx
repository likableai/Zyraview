import { fetchSnapshot } from '@/lib/server-fetch';
import { LiveMarketOverview } from './LiveMarketOverview';

type HeroPayload = {
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
};

export async function HomeMarketSection() {
  const res = await fetchSnapshot<HeroPayload>('hero', 10);
  if (!res.success || !res.data) return null;

  return <LiveMarketOverview initial={{ ...res.data, updatedAt: res.updatedAt }} />;
}
