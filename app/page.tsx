export const dynamic = 'force-dynamic';

import { fetchSnapshot, type SnapshotResponse } from '@/lib/server-fetch';
import { HomePage } from '@/components/home/HomePage';
import { HomeRealtimeTransactions } from '@/components/home/HomeRealtimeTransactions';
import { HomeEcosystemSection } from '@/components/home/HomeEcosystemSection';

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

type PulseData = {
  netChange24hCoreTeam: number;
  netChange24hCex: number;
  largestMoves24h: Array<{
    wallet: string;
    change: number;
    detectedAt: string;
  }>;
};

type WalletItem = {
  identifier: string;
  name: string;
  category: 'CEX' | 'Core Team' | 'Generated';
  balance: number | null;
};

type TopWalletsData = {
  wallets: WalletItem[];
};

type CommunityItem = {
  Name?: string;
  Members?: number;
  Category?: string;
  Region?: string;
};

type EcoData = {
  communities: CommunityItem[];
  influencers: Record<string, unknown>[];
};

export default async function Page() {
  const [heroRes, pulseRes, walletsRes, ecoRes] = await Promise.all([
    fetchSnapshot<HeroData>('hero', 10),
    fetchSnapshot<PulseData>('pulse', 120),
    fetchSnapshot<TopWalletsData>('top-wallets', 300),
    fetchSnapshot<EcoData>('ecosystem-leaderboards', 600),
  ]);

  return (
    <HomePage
      hero={heroRes}
      pulse={pulseRes}
      wallets={walletsRes}
      eco={ecoRes}
      realtimeTransactions={<HomeRealtimeTransactions />}
      ecosystemFallback={<HomeEcosystemSection />}
    />
  );
}
