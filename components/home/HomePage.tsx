'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { LiveHeroGrid } from '@/components/home/LiveHeroGrid';
import { LiveMarketOverview } from '@/components/home/LiveMarketOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Building2, Users, ExternalLink, Activity, Wallet } from 'lucide-react';
import type { SnapshotResponse } from '@/lib/server-fetch';

type TabType = 'overview' | 'supply' | 'network' | 'monitors' | 'ecosystem' | 'transactions';
type MonitorSubTab = 'pct' | 'cex';

const tabs: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'supply', label: 'Supply' },
  { id: 'network', label: 'Network' },
  { id: 'monitors', label: 'Monitors' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'transactions', label: 'Transactions' },
];

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

type EcoData = {
  communities: Array<{
    Name?: string;
    Members?: number;
    Category?: string;
    Region?: string;
  }>;
  influencers: Record<string, unknown>[];
};

interface TxRecord {
  id?: string;
  hash?: string;
  created_at?: string;
  source_account?: string;
  operation_count?: number;
  successful?: boolean;
  fee_charged?: string;
  base_amount?: string;
  counter_amount?: string;
  base_asset_type?: string;
  counter_asset_type?: string;
  seller?: string;
  amount?: string;
  buying?: { asset_type?: string; asset_code?: string };
  selling?: { asset_type?: string; asset_code?: string };
}

interface HomePageProps {
  hero: SnapshotResponse<HeroData>;
  pulse: SnapshotResponse<PulseData>;
  wallets: SnapshotResponse<TopWalletsData>;
  eco: SnapshotResponse<EcoData>;
  realtimeTransactions: React.ReactNode;
  ecosystemFallback: React.ReactNode;
}

const categoryColors: Record<string, string> = {
  CEX: 'bg-muted text-foreground',
  'Core Team': 'bg-secondary text-foreground',
  Generated: 'bg-accent text-foreground',
};

function SectionSkeleton({ className, count }: { className: string; count: number }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="h-4 w-24 rounded-md mb-3 skeleton-shimmer" />
          <div className="h-8 w-32 rounded-md skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function HomePage({ hero, pulse, wallets, eco, realtimeTransactions, ecosystemFallback }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeMonitorSubTab, setActiveMonitorSubTab] = useState<MonitorSubTab>('pct');

  const heroData = hero.success && hero.data ? hero.data : null;
  const pulseData = pulse.success && pulse.data ? pulse.data : null;
  const walletsData = wallets.success && wallets.data ? wallets.data : null;
  const ecoData = eco.success && eco.data ? eco.data : null;

  return (
    <main className="w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 max-w-7xl mx-auto">
      <div className="border-b border-border mb-8 sm:mb-12 lg:mb-14 flex gap-0 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap min-h-12 sm:min-h-auto ${
              activeTab === tab.id
                ? 'border-accent text-accent bg-accent/5 hover:bg-accent/10'
                : 'border-transparent text-foreground/60 hover:text-foreground/80 hover:bg-secondary/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 sm:space-y-12 lg:space-y-16 animate-in fade-in-0">
            <Suspense fallback={<SectionSkeleton className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 md:gap-4" count={7} />}>
              {heroData ? (
                <LiveHeroGrid initial={{ ...heroData, updatedAt: hero.updatedAt }} />
              ) : (
                <section className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground text-center">
                  Market overview temporarily unavailable. Ensure the API server is running and snapshots have warmed.
                </section>
              )}
            </Suspense>

            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Market Overview</h2>
              <Suspense fallback={<SectionSkeleton className="grid gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3" count={3} />}>
                {heroData ? (
                  <LiveMarketOverview initial={{ ...heroData, updatedAt: hero.updatedAt }} />
                ) : (
                  <section className="rounded border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                    Market data temporarily unavailable. The API server may be offline.
                  </section>
                )}
              </Suspense>
            </section>

            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Network Activity</h2>
              <Suspense fallback={<SectionSkeleton className="grid gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3" count={2} />}>
                <PulseSectionContent data={pulseData} />
              </Suspense>
            </section>

            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Top Wallets</h2>
              <Suspense fallback={<SectionSkeleton className="grid gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3" count={2} />}>
                <TopWalletsSectionContent data={walletsData} realtimeSlot={realtimeTransactions} />
              </Suspense>
            </section>
          </div>
        )}

        {/* Supply Tab */}
        {activeTab === 'supply' && (
          <div className="space-y-12 sm:space-y-14 animate-in fade-in-0">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Supply Metrics</h2>
              <Suspense fallback={<SectionSkeleton className="grid gap-4 sm:gap-6 lg:grid-cols-2" count={2} />}>
                {heroData ? (
                  <LiveMarketOverview initial={{ ...heroData, updatedAt: hero.updatedAt }} />
                ) : (
                  <section className="rounded border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                    Market data temporarily unavailable. The API server may be offline.
                  </section>
                )}
              </Suspense>
            </section>
          </div>
        )}

        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className="space-y-12 sm:space-y-14 animate-in fade-in-0">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Network Statistics</h2>
              <Suspense fallback={<SectionSkeleton className="grid gap-4 sm:gap-6 lg:grid-cols-2" count={2} />}>
                {heroData ? (
                  <LiveHeroGrid initial={{ ...heroData, updatedAt: hero.updatedAt }} />
                ) : (
                  <section className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground text-center">
                    Market overview temporarily unavailable.
                  </section>
                )}
              </Suspense>
            </section>
            <section className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Network Activity</h3>
              <Suspense fallback={<SectionSkeleton className="grid gap-4 sm:gap-6 lg:grid-cols-3" count={3} />}>
                <PulseSectionContent data={pulseData} />
              </Suspense>
            </section>
          </div>
        )}

        {/* Ecosystem Tab */}
        {activeTab === 'ecosystem' && (
          <div className="space-y-12 sm:space-y-14 animate-in fade-in-0">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Community & Ecosystem</h2>
              <Suspense fallback={<SectionSkeleton className="grid gap-4 sm:gap-6 lg:grid-cols-3" count={3} />}>
                {ecoData ? (
                  <EcosystemSectionContent data={ecoData} />
                ) : (
                  ecosystemFallback
                )}
              </Suspense>
            </section>
          </div>
        )}

        {/* Monitors Tab */}
        {activeTab === 'monitors' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in-0">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Wallet Monitors</h2>
              <div className="flex gap-2 border-b border-border">
                <button
                  onClick={() => setActiveMonitorSubTab('pct')}
                  className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${
                    activeMonitorSubTab === 'pct'
                      ? 'border-accent text-accent bg-accent/5'
                      : 'border-transparent text-foreground/60 hover:text-foreground/80'
                  }`}
                >
                  Core Team
                </button>
                <button
                  onClick={() => setActiveMonitorSubTab('cex')}
                  className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${
                    activeMonitorSubTab === 'cex'
                      ? 'border-accent text-accent bg-accent/5'
                      : 'border-transparent text-foreground/60 hover:text-foreground/80'
                  }`}
                >
                  Exchange
                </button>
              </div>
            </div>
            {activeMonitorSubTab === 'pct' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">See core team wallets and recent changes.</p>
                <a href="/pct-wallet-monitor" className="inline-block px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors">
                  Open Core Team Tracker →
                </a>
              </div>
            )}
            {activeMonitorSubTab === 'cex' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">See exchange wallets and recent changes.</p>
                <a href="/cex-wallet-monitor" className="inline-block px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors">
                  Open Exchange Tracker →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-12 sm:space-y-14 animate-in fade-in-0">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recent Transactions & Wallet Activity</h2>
              <Suspense fallback={<SectionSkeleton className="grid gap-4 sm:gap-6 lg:grid-cols-3" count={3} />}>
                <TopWalletsSectionContent data={walletsData} realtimeSlot={realtimeTransactions} />
              </Suspense>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function PulseSectionContent({ data }: { data: PulseData | null }) {
  if (!data) {
    return (
      <section className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
        Pulse metrics will appear once balance data is available.
      </section>
    );
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 4 });

  return (
    <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
      <Card className="border-border/60 bg-card/40">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            Core Team (24h)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <p className={`text-2xl font-bold ${data.netChange24hCoreTeam >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {data.netChange24hCoreTeam >= 0 ? '+' : ''}{fmt(data.netChange24hCoreTeam)}
            <span className="text-sm font-normal text-muted-foreground ml-1">Pi</span>
          </p>
          <div className="flex items-center gap-1 mt-1">
            {data.netChange24hCoreTeam >= 0
              ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
            <span className="text-xs text-muted-foreground">net 24h flow</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/40">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-amber-500" />
            CEX Exchanges (24h)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <p className={`text-2xl font-bold ${data.netChange24hCex >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {data.netChange24hCex >= 0 ? '+' : ''}{fmt(data.netChange24hCex)}
            <span className="text-sm font-normal text-muted-foreground ml-1">Pi</span>
          </p>
          <div className="flex items-center gap-1 mt-1">
            {data.netChange24hCex >= 0
              ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
            <span className="text-xs text-muted-foreground">net 24h flow</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/40">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Largest Moves (24h)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          {data.largestMoves24h.length === 0 ? (
            <p className="text-xs text-muted-foreground">No moves recorded in the last 24h.</p>
          ) : (
            <div className="space-y-1">
              {data.largestMoves24h.slice(0, 7).map((m, idx) => (
                <div key={`${m.wallet}-${idx}`} className="flex items-center justify-between gap-2 py-1 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-mono truncate max-w-[100px] sm:max-w-[160px]">{m.wallet}</span>
                    <Link href={`/account/${m.wallet}`} className="shrink-0 text-muted-foreground hover:text-primary">
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 ${m.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {m.change >= 0 ? '+' : ''}{fmt(m.change)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function TopWalletsSectionContent({ data, realtimeSlot }: { data: TopWalletsData | null; realtimeSlot: React.ReactNode }) {
  if (!data) {
    return (
      <section className="rounded border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
        Wallet data temporarily unavailable. The API server may be offline.
      </section>
    );
  }

  const wallets = data.wallets.slice(0, 25);
  const totalBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0);

  return (
    <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 border border-border bg-card">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Top Tracked Wallets
          </CardTitle>
          <Link href="/pct-wallet-monitor" className="text-xs text-primary hover:underline shrink-0">
            View all
          </Link>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="overflow-x-auto -mx-4 sm:-mx-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8">#</TableHead>
                  <TableHead className="text-xs">Wallet</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-right text-xs">Balance (Pi)</TableHead>
                  <TableHead className="text-right text-xs">% of Tracked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((w, i) => (
                  <TableRow key={w.identifier}>
                    <TableCell className="text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                    <TableCell className="max-w-[120px] sm:max-w-[220px] truncate">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/account/${w.identifier}`} className="text-primary hover:underline text-xs sm:text-sm font-medium truncate">
                          {w.name}
                        </Link>
                        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-1.5 py-0.5 ${categoryColors[w.category] || ''}`}>
                        {w.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm font-medium">
                      {typeof w.balance === 'number'
                        ? w.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })
                        : '\u2014'}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {totalBalance > 0 ? `${((w.balance || 0) / totalBalance * 100).toFixed(1)}%` : '\u2014'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-1">
        {realtimeSlot}
      </div>
    </section>
  );
}

function EcosystemSectionContent({ data }: { data: EcoData }) {
  const communities = data.communities || [];
  const totalCommunities = communities.length;
  const totalMembers = communities.reduce((s, c) => s + (c.Members || 0), 0);
  const categories = [...new Set(communities.map((c) => c.Category || 'Other'))];
  const topCommunities = communities
    .sort((a, b) => (b.Members || 0) - (a.Members || 0))
    .slice(0, 8);
  const fmtN = (n: number) => n.toLocaleString('en-US');

  return (
    <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1 border border-border bg-card">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Ecosystem Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Communities</span>
            <span className="font-semibold">{fmtN(totalCommunities)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Members</span>
            <span className="font-semibold">{fmtN(totalMembers)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Categories</span>
            <span className="font-semibold">{categories.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Members</span>
            <span className="font-semibold">
              {totalCommunities > 0 ? fmtN(Math.round(totalMembers / totalCommunities)) : '0'}
            </span>
          </div>
          <div className="pt-2">
            <Link href="/ecology" className="text-xs text-primary hover:underline">
              View full ecosystem →
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border border-border bg-card">
        <CardHeader className="pb-2 px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Largest Communities
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          {topCommunities.length === 0 ? (
            <p className="text-xs text-muted-foreground">No community data available.</p>
          ) : (
            <div className="space-y-1.5">
              {topCommunities.map((c, i) => (
                <div key={c.Name || i} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-mono text-muted-foreground w-5 shrink-0 text-right">#{i + 1}</span>
                    <span className="text-sm font-medium truncate">{c.Name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground shrink-0">
                      {c.Category || 'General'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold shrink-0">{fmtN(c.Members || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
