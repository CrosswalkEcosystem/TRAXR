import { getTopPools } from "@/lib/traxrService";

export async function GET() {
  try {
    const pools = await getTopPools();
    return new Response(JSON.stringify(pools), { status: 200 });
  } catch (e) {
    console.error("[TRAXR] pools API error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
}
