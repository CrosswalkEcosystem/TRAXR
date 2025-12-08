import { NextRequest } from "next/server";
import { getTraxrScore } from "@/lib/traxrService";

export async function GET(req: NextRequest) {
  const mintA = req.nextUrl.searchParams.get("mintA");
  const mintB = req.nextUrl.searchParams.get("mintB");

  if (!mintA || !mintB) {
    return new Response(
      JSON.stringify({ error: "mintA and mintB are required" }),
      { status: 400 },
    );
  }

  try {
    const score = await getTraxrScore(mintA, mintB);
    if (!score) {
      return new Response(
        JSON.stringify({ error: "No XRPL pool found for pair" }),
        { status: 404 },
      );
    }
    return new Response(JSON.stringify(score), { status: 200 });
  } catch (e) {
    console.error("[TRAXR] API error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
}
