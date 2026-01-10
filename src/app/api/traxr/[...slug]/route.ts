import { NextRequest } from "next/server";

import { getPoolTrend } from "@/lib/traxrTrendService";
import { getTopPools, getTraxrScore } from "@/lib/traxrService";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });

const notFound = (message = "Not found") =>
  json({ error: message }, 404);

function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await context.params;
  const [resource, id] = slug;

  if (!resource) {
    return notFound("Missing endpoint");
  }

  try {
    switch (resource) {
      case "score": {
        const mintA = request.nextUrl.searchParams.get("mintA");
        const mintB = request.nextUrl.searchParams.get("mintB");

        if (!mintA || !mintB) {
          return json(
            { error: "mintA and mintB are required" },
            400,
          );
        }

        const score = await getTraxrScore(mintA, mintB);
        if (!score) {
          return notFound("No XRPL pool found for pair");
        }
        return json(score);
      }
      case "pools": {
        if (id) {
          const poolId = decodeSlug(id);
          const pools = await getTopPools();
          const pool = pools.find((item) => item.poolId === poolId);
          if (!pool) return notFound("Pool not found");
          return json(pool);
        }

        const pools = await getTopPools();
        return json(pools);
      }
      case "pool-trend": {
        const poolId = request.nextUrl.searchParams.get("poolId") || "";
        if (!poolId) {
          return json({ error: "Missing poolId" }, 400);
        }

        const trend = getPoolTrend(poolId);
        return json(trend);
      }
      case "issuer": {
        if (!id) return json({ error: "Missing issuer address" }, 400);

        const issuer = decodeSlug(id).toLowerCase();
        const pools = await getTopPools();
        const issuerPools = pools.filter(
          (pool) => pool.tokenIssuer?.toLowerCase() === issuer,
        );

        if (!issuerPools.length) {
          return notFound("Issuer not found");
        }

        const totals = issuerPools.reduce(
          (acc, pool) => {
            acc.poolCount += 1;
            acc.totalLiquidity += pool.metrics.liquidityUsd || 0;
            acc.totalVolume24h += pool.metrics.volume24hUsd || 0;
            acc.totalVolume7d += pool.metrics.volume7dUsd || 0;
            acc.totalScore += pool.score || 0;
            return acc;
          },
          {
            poolCount: 0,
            totalLiquidity: 0,
            totalVolume24h: 0,
            totalVolume7d: 0,
            totalScore: 0,
          },
        );

        const averageScore =
          totals.poolCount > 0
            ? totals.totalScore / totals.poolCount
            : 0;

        return json({
          issuer,
          poolCount: totals.poolCount,
          averageScore,
          totalLiquidity: totals.totalLiquidity,
          totalVolume24h: totals.totalVolume24h,
          totalVolume7d: totals.totalVolume7d,
          pools: issuerPools,
        });
      }
      case "alerts": {
        const pools = await getTopPools();
        const alerts = pools
          .filter((pool) => pool.warnings?.length)
          .map((pool) => ({
            poolId: pool.poolId,
            score: pool.score,
            ctsNodes: pool.ctsNodes,
            warnings: pool.warnings,
            tokenName: pool.tokenName,
            tokenCode: pool.tokenCode,
            tokenIssuer: pool.tokenIssuer,
            updatedAt: pool.updatedAt,
          }));

        return json({ count: alerts.length, alerts });
      }
      default:
        return notFound("Unknown endpoint");
    }
  } catch (e) {
    console.error("[TRAXR] API error", e);
    return json({ error: "Internal error" }, 500);
  }
}
