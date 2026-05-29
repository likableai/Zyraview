'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Command, Home, BarChart3, Activity, Users, Book, AlertCircle, Layers, Coins, Droplets, TrendingUp, ArrowRightLeft, ShieldCheck, Zap, Wallet, Globe, Calendar, Star, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: 'navigation' | 'metric' | 'feature';
}

const SEARCH_DATA: SearchResult[] = [
  // Navigation — core pages
  { id: 'home', title: 'Home', description: 'Dashboard overview', href: '/', icon: <Home className="w-4 h-4" />, category: 'navigation' },
  { id: 'explorer', title: 'Block Explorer', description: 'Browse blocks ledgers', href: '/block', icon: <BarChart3 className="w-4 h-4" />, category: 'navigation' },
  { id: 'txs', title: 'Transactions', description: 'Latest transactions', href: '/Transaction-list', icon: <ArrowRightLeft className="w-4 h-4" />, category: 'navigation' },
  { id: 'ops', title: 'Operations', description: 'Latest operations', href: '/operations', icon: <Layers className="w-4 h-4" />, category: 'navigation' },
  { id: 'trades', title: 'Trades History', description: 'Trade records', href: '/trades-history', icon: <TrendingUp className="w-4 h-4" />, category: 'navigation' },
  // Markets
  { id: 'assets', title: 'Assets', description: 'All issued assets on testnet', href: '/assets', icon: <Coins className="w-4 h-4" />, category: 'navigation' },
  { id: 'pools', title: 'Liquidity Pools', description: 'All liquidity pools', href: '/pool', icon: <Droplets className="w-4 h-4" />, category: 'navigation' },
  { id: 'stats', title: 'Network Stats', description: 'Account & supply stats', href: '/accountStats', icon: <Activity className="w-4 h-4" />, category: 'navigation' },
  // Monitors
  { id: 'pct', title: 'Core Team Monitor', description: 'PCT wallet tracker', href: '/pct-wallet-monitor', icon: <ShieldCheck className="w-4 h-4" />, category: 'navigation' },
  { id: 'cex', title: 'Exchange Monitor', description: 'CEX wallet tracker', href: '/cex-wallet-monitor', icon: <ShieldCheck className="w-4 h-4" />, category: 'navigation' },
  { id: 'realtime', title: 'Real-time Feed', description: 'Live tx/trades/ops', href: '/realtime-transactions', icon: <Zap className="w-4 h-4" />, category: 'navigation' },
  // Ecosystem
  { id: 'eco', title: 'Ecology Hub', description: 'Ecosystem & community', href: '/ecology', icon: <Globe className="w-4 h-4" />, category: 'navigation' },
  { id: 'communities', title: 'Communities', description: 'Pi communities', href: '/ecosystem/communities', icon: <Users className="w-4 h-4" />, category: 'navigation' },
  { id: 'events', title: 'Events', description: 'Ecosystem events', href: '/ecosystem/events', icon: <Calendar className="w-4 h-4" />, category: 'navigation' },
  { id: 'hackathons', title: 'Hackathons', description: 'Ecosystem hackathons', href: '/ecosystem/hackathons', icon: <Star className="w-4 h-4" />, category: 'navigation' },
  { id: 'influencers', title: 'Influencers', description: 'Pi influencers', href: '/ecosystem/influencers', icon: <Users className="w-4 h-4" />, category: 'navigation' },
  // API & tools
  { id: 'api-dash', title: 'API Dashboard', description: 'Manage API keys', href: '/api-dashboard', icon: <ShieldCheck className="w-4 h-4" />, category: 'navigation' },
  { id: 'oracle', title: 'Oracle API', description: 'Get a price oracle key', href: '/oracle-api', icon: <Zap className="w-4 h-4" />, category: 'navigation' },
  { id: 'api-docs', title: 'API Docs', description: 'API documentation', href: '/api-documentation', icon: <Book className="w-4 h-4" />, category: 'navigation' },
  // Account
  { id: 'profile', title: 'Profile', description: 'Your account & profile', href: '/profile', icon: <User className="w-4 h-4" />, category: 'navigation' },
  { id: 'contact', title: 'Contact', description: 'Get in touch', href: '/contactUs', icon: <Book className="w-4 h-4" />, category: 'navigation' },
  // Quick metrics
  { id: 'mc-price', title: 'PI Price', description: 'Current PI/USD price', href: '/?tab=overview', icon: <TrendingUp className="w-4 h-4" />, category: 'metric' },
  { id: 'mc-mcap', title: 'Market Cap', description: 'PI market cap & FDV', href: '/?tab=overview', icon: <TrendingUp className="w-4 h-4" />, category: 'metric' },
  { id: 'mc-supply', title: 'Supply', description: 'Circulating, locked, total', href: '/?tab=supply', icon: <Coins className="w-4 h-4" />, category: 'metric' },
  { id: 'mc-network', title: 'Network', description: 'Block, TPS, utilization', href: '/?tab=network', icon: <Activity className="w-4 h-4" />, category: 'metric' },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults(SEARCH_DATA.slice(0, 10));
      setSelectedIndex(0);
      return;
    }

    const filtered = SEARCH_DATA.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            router.push(results[selectedIndex].href);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, router]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-card/40 hover:bg-card/60 transition-all duration-200 flex items-center gap-3 text-muted-foreground hover:text-foreground group"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Search everything...</span>
        <span className="text-sm sm:hidden">Search...</span>
        <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-background/50 group-hover:bg-background">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      {/* Search Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-start justify-center px-3 sm:px-0 pt-[var(--search-offset,6rem)]">
          <div className="w-full max-w-lg">
            <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center border-b border-border px-4 py-3">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages, metrics, features..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 ml-3 bg-transparent text-foreground outline-none text-sm placeholder-muted-foreground"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result, index) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-150 ${
                          index === selectedIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-secondary text-foreground'
                        }`}
                      >
                        <div className="mt-0.5 text-current opacity-60">{result.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{result.title}</div>
                          <div className="text-xs text-current opacity-60 truncate">{result.description}</div>
                        </div>
                        <span className="text-xs font-medium opacity-40 flex-shrink-0">{result.category}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <p className="text-sm">No results found for "{query}"</p>
                  </div>
                )}
              </div>

              {/* Footer with shortcuts */}
              <div className="border-t border-border bg-card/50 px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded bg-background/50">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded bg-background/50">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 rounded bg-background/50">Esc</kbd>
                    <span>Close</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
