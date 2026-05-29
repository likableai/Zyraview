'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, BarChart3, Activity, Users, Key, Book, Layers,
  Coins, Droplets, ArrowRightLeft, TrendingUp, Wallet,
  Globe, Calendar, Sparkles, Star, AlertTriangle,
  ShieldCheck, Zap, MessageSquare, User, ChevronLeft,
  ChevronRight, Menu,
} from 'lucide-react';

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  links: Array<{ href: string; label: string }>;
}

const navGroups: NavGroup[] = [
  {
    label: 'Home', icon: <Home className="h-4 w-4" />,
    links: [
      { href: '/', label: 'Dashboard' },
      { href: '/block', label: 'Block Explorer' },
    ],
  },
  {
    label: 'Blockchain', icon: <Layers className="h-4 w-4" />,
    links: [
      { href: '/Transaction-list', label: 'Transactions' },
      { href: '/operations', label: 'Operations' },
      { href: '/trades-history', label: 'Trades' },
      { href: '/accountStats', label: 'Network Stats' },
    ],
  },
  {
    label: 'Markets', icon: <TrendingUp className="h-4 w-4" />,
    links: [
      { href: '/assets', label: 'Assets' },
      { href: '/pool', label: 'Liquidity Pools' },
    ],
  },
  {
    label: 'Monitors', icon: <ShieldCheck className="h-4 w-4" />,
    links: [
      { href: '/pct-wallet-monitor', label: 'Core Team' },
      { href: '/cex-wallet-monitor', label: 'Exchange (CEX)' },
    ],
  },
  {
    label: 'Ecosystem', icon: <Globe className="h-4 w-4" />,
    links: [
      { href: '/ecology', label: 'Ecology Hub' },
      { href: '/ecosystem/communities', label: 'Communities' },
      { href: '/ecosystem/events', label: 'Events' },
      { href: '/ecosystem/hackathons', label: 'Hackathons' },
      { href: '/ecosystem/influencers', label: 'Influencers' },
    ],
  },
  {
    label: 'Data & API', icon: <Zap className="h-4 w-4" />,
    links: [
      { href: '/api-dashboard', label: 'API Dashboard' },
      { href: '/oracle-api', label: 'Oracle API' },
      { href: '/api-documentation', label: 'API Docs' },
      { href: '/realtime-transactions', label: 'Real-time Feed' },
    ],
  },
  {
    label: 'Account', icon: <User className="h-4 w-4" />,
    links: [
      { href: '/profile', label: 'Profile' },
      { href: '/contactUs', label: 'Contact' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = useCallback(() => setMobileOpen(false), []);

  // Close on route change
  useEffect(() => { close(); }, [pathname, close]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [close]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebar = (
    <aside className={`h-full flex flex-col bg-card/95 backdrop-blur-sm border-r border-border transition-all duration-300 ${expanded ? 'w-56' : 'w-14'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        {expanded && (
          <Link href="/" className="text-sm font-bold text-foreground whitespace-nowrap">
            Zyrachain
          </Link>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {navGroups.map((g) => {
          const anyActive = g.links.some((l) => isActive(l.href));
          return (
            <div key={g.label} className="space-y-0.5">
              <div className={`flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${anyActive ? 'text-accent' : 'text-muted-foreground'}`}>
                {g.icon}
                {expanded && <span className="truncate">{g.label}</span>}
              </div>
              {g.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                    isActive(l.href)
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  <span className="w-1 h-1 rounded-full bg-current opacity-40 flex-shrink-0" />
                  {expanded && <span className="truncate">{l.label}</span>}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed bottom-4 left-4 z-[100] lg:hidden p-2.5 rounded-full bg-accent text-accent-foreground shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop: fixed inline */}
      <div className="hidden lg:block h-screen sticky top-0 z-40 flex-shrink-0">
        {sidebar}
      </div>

      {/* Mobile: slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <div className="absolute left-0 top-0 bottom-0 shadow-xl">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
