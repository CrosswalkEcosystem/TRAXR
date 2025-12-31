import { getPoolTrend } from "@/lib/traxrTrendService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get("poolId") || "";
    if (!poolId) {
      return new Response(JSON.stringify({ error: "Missing poolId" }), {
        status: 400,
      });
    }

    const trend = getPoolTrend(poolId);
    return new Response(JSON.stringify(trend), { status: 200 });
  } catch (e) {
    console.error("[TRAXR] pool trend API error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
}
