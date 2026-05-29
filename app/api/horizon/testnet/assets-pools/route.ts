import { NextResponse } from 'next/server';

const TESTNET_HORIZON = 'https://api.testnet.minepi.com';

export const dynamic = 'force-dynamic';
export const revalidate = 120; // 2 min cache

interface HorizonRecord {
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  amount?: string;
  num_accounts?: number;
  liquidity_pools_amount?: string;
  // pool fields
  id?: string;
  fee_bp?: number;
  total_trustlines?: string;
  total_shares?: string;
  reserves?: Array<{ asset?: string; amount?: string }>;
}

export async function GET() {
  try {
    const [assetsRes, poolsRes] = await Promise.all([
      fetch(`${TESTNET_HORIZON}/assets?limit=100&order=desc`),
      fetch(`${TESTNET_HORIZON}/liquidity_pools?limit=20&order=desc`),
    ]);

    const [assetsJson, poolsJson] = await Promise.all([
      assetsRes.json(),
      poolsRes.json(),
    ]);

    const assets: HorizonRecord[] = (assetsJson._embedded?.records ?? []) as HorizonRecord[];
    const pools: HorizonRecord[] = (poolsJson._embedded?.records ?? []) as HorizonRecord[];

    return NextResponse.json({
      success: true,
      data: {
        assets,
        pools,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Testnet assets-pools proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testnet assets/pools' },
      { status: 502 },
    );
  }
}
