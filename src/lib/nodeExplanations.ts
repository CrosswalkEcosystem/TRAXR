// XRPL-native TRAXR node explanations
// Deterministic • Non-evaluative • Context-aware
// Interpretation layer (not oracle)

export type TraxrNodes = {
  depth: number;
  activity: number;
  impact: number;
  stability: number;
  trust: number;
  fee: number;
};

export type Explanation = {
  title: string;
  body: string;
};

/* --------------------------------------------------
 * Helpers
 * -------------------------------------------------- */

type Band = "low" | "mid" | "high";

function band(v: number): Band {
  if (v >= 70) return "high";
  if (v >= 40) return "mid";
  return "low";
}

function pairKey(a: keyof TraxrNodes, b: keyof TraxrNodes) {
  return [a, b].sort().join("_") as PairKey;
}

function tripleKey(
  a: keyof TraxrNodes,
  b: keyof TraxrNodes,
  c: keyof TraxrNodes,
) {
  return [a, b, c].sort().join("_") as TripleKey;
}

/* --------------------------------------------------
 * 1. LOCAL (single-metric)
 * -------------------------------------------------- */

export function getLocalExplanation(
  node: keyof TraxrNodes,
  value: number,
): Explanation {
  const b = band(value);

  const LOCAL: Record<keyof TraxrNodes, Record<Band, Explanation>> = {
    depth: {
      high: {
        title: "Depth",
        body:
          "On-ledger liquidity is substantial relative to typical XRPL trade sizes.",
      },
      mid: {
        title: "Depth",
        body:
          "Liquidity is sufficient for small to medium trades without major disruption.",
      },
      low: {
        title: "Depth",
        body:
          "Available liquidity is limited; execution may be sensitive to trade size.",
      },
    },

    activity: {
      high: {
        title: "Activity",
        body:
          "Trading activity is consistent, indicating regular pool usage.",
      },
      mid: {
        title: "Activity",
        body:
          "Trading occurs intermittently with uneven participation.",
      },
      low: {
        title: "Activity",
        body:
          "Little to no recent trading activity has been observed.",
      },
    },

    impact: {
      high: {
        title: "Impact",
        body:
          "Trades generally result in limited price movement per execution.",
      },
      mid: {
        title: "Impact",
        body:
          "Typical trades are expected to cause moderate price movement.",
      },
      low: {
        title: "Impact",
        body:
          "Price is highly sensitive to trades due to pool structure.",
      },
    },

    stability: {
      high: {
        title: "Stability",
        body:
          "Price behavior has remained relatively stable over time.",
      },
      mid: {
        title: "Stability",
        body:
          "Moderate volatility has been observed in recent periods.",
      },
      low: {
        title: "Stability",
        body:
          "Price behavior shows elevated volatility.",
      },
    },

    trust: {
      high: {
        title: "Trust",
        body:
          "Issuer trustlines show broad and distributed participation.",
      },
      mid: {
        title: "Trust",
        body:
          "Issuer adoption and trustline distribution are moderate.",
      },
      low: {
        title: "Trust",
        body:
          "Trustline participation is limited or concentrated.",
      },
    },

    fee: {
      high: {
        title: "Fee",
        body:
          "AMM fees are competitive relative to XRPL norms.",
      },
      mid: {
        title: "Fee",
        body:
          "AMM fees fall within typical XRPL ranges.",
      },
      low: {
        title: "Fee",
        body:
          "AMM fees are elevated compared to commonly used pools.",
      },
    },
  };

  return LOCAL[node][b];
}

/* --------------------------------------------------
 * 2. VALID COMBINATIONS (UI constraint)
 * -------------------------------------------------- */

export const VALID_COMBINATIONS: Record<
  keyof TraxrNodes,
  (keyof TraxrNodes)[]
> = {
  depth: ["activity", "impact", "stability", "trust"],
  activity: ["depth", "impact", "stability", "trust", "fee"],
  impact: ["depth", "activity", "stability"],
  stability: ["depth", "activity", "impact"],
  trust: ["depth", "activity"],
  fee: ["activity"],
};

/* --------------------------------------------------
 * 3. PAIR EXPLANATIONS (2 metrics)
 * -------------------------------------------------- */

type PairKey =
  | "activity_depth"
  | "depth_impact"
  | "depth_stability"
  | "activity_stability"
  | "activity_trust"
  | "depth_trust"
  | "activity_fee";

type PairBandKey =
  | "low_low" | "low_mid" | "low_high"
  | "mid_low" | "mid_mid" | "mid_high"
  | "high_low" | "high_mid" | "high_high";


const PAIRS: Partial<Record<
  PairKey,
  Partial<Record<PairBandKey, Explanation>>
>> = {


  activity_depth: {
    high_high: {
      title: "Active Liquidity",
      body:
        "The pool combines strong liquidity with frequent usage, indicating healthy execution conditions.",
    },
    high_low: {
      title: "Retail-Driven Usage",
      body:
        "Trading activity exists despite limited liquidity, suggesting frequent small trades.",
    },
    low_high: {
      title: "Idle Liquidity",
      body:
        "Liquidity is present but sees limited usage, which may indicate early or passive participation.",
    },
    low_low: {
      title: "Inactive Pool",
      body:
        "Both liquidity and activity are low, indicating limited engagement.",
    },
    mid_mid: {
      title: "Moderate Participation",
      body:
        "Liquidity and usage are balanced at moderate levels.",
    },
    mid_high: {
      title: "Underutilized Liquidity",
      body:
        "Liquidity exceeds current usage levels.",
    },
    high_mid: {
      title: "Growing Usage",
      body:
        "Activity is increasing relative to available liquidity.",
    },
  },

  depth_impact: {
    high_high: {
      title: "Efficient Execution",
      body:
        "Deep liquidity supports low price sensitivity for trades.",
    },
    high_low: {
      title: "Uneven Liquidity",
      body:
        "Liquidity exists but is unevenly distributed, affecting execution.",
    },
    low_high: {
      title: "Execution Sensitive",
      body:
        "Limited depth results in noticeable price movement per trade.",
    },
    low_low: {
      title: "Small-Scale Trading",
      body:
        "Low depth and impact suggest small trades dominate.",
    },
    mid_mid: {
      title: "Balanced Execution",
      body:
        "Execution characteristics are proportional to liquidity.",
    },
    mid_high: {
      title: "Depth-Constrained Impact",
      body:
        "Liquidity partially absorbs trade pressure.",
    },
    high_mid: {
      title: "Resilient Pool",
      body:
        "Liquidity generally absorbs trade impact.",
    },
  },

  depth_stability: {
    high_high: {
      title: "Stable Market Structure",
      body:
        "Liquidity and price behavior are structurally aligned.",
    },
    high_low: {
      title: "Volatile Liquidity",
      body:
        "Liquidity exists, but prices fluctuate noticeably.",
    },
    low_high: {
      title: "Thin but Calm",
      body:
        "Despite limited liquidity, price behavior remains stable.",
    },
    low_low: {
      title: "Fragile Pool",
      body:
        "Low liquidity and volatility increase execution risk.",
    },
    mid_mid: {
      title: "Neutral Conditions",
      body:
        "Liquidity and stability are balanced.",
    },
    mid_high: {
      title: "Stable but Thin",
      body:
        "Price stability exists despite moderate depth.",
    },
    high_mid: {
      title: "Liquid but Reactive",
      body:
        "Liquidity absorbs trades but volatility is present.",
    },
  },

  activity_stability: {
    high_high: {
      title: "Healthy Trading",
      body:
        "Active trading occurs without destabilizing price behavior.",
    },
    high_low: {
      title: "Speculative Activity",
      body:
        "High activity coincides with elevated volatility.",
    },
    low_high: {
      title: "Dormant Stability",
      body:
        "Prices are stable despite low trading frequency.",
    },
    low_low: {
      title: "Neglected Pool",
      body:
        "Low activity and volatility indicate limited attention.",
    },
    mid_mid: {
      title: "Moderate Flow",
      body:
        "Trading and volatility are balanced.",
    },
    mid_high: {
      title: "Stable Participation",
      body:
        "Activity occurs without strong price swings.",
    },
    high_mid: {
      title: "Reactive Market",
      body:
        "Trading influences short-term price behavior.",
    },
  },

  activity_trust: {
    high_high: {
      title: "Organic Adoption",
      body:
        "Broad trustline participation aligns with active usage.",
    },
    high_low: {
      title: "Concentrated Usage",
      body:
        "Trading activity is driven by a limited set of participants.",
    },
    low_high: {
      title: "Passive Holders",
      body:
        "Trust exists but trading participation is limited.",
    },
    low_low: {
      title: "Limited Adoption",
      body:
        "Both usage and trustline participation are low.",
    },
    mid_mid: {
      title: "Developing Adoption",
      body:
        "Adoption and usage are progressing gradually.",
    },
    mid_high: {
      title: "Holder-Oriented Pool",
      body:
        "Trust exceeds active trading participation.",
    },
    high_mid: {
      title: "Usage-Led Adoption",
      body:
        "Trading is increasing ahead of broader trustline growth.",
    },
  },

  depth_trust: {
    high_high: {
      title: "Mature Pool",
      body:
        "Liquidity depth and trustline adoption are well aligned.",
    },
    high_low: {
      title: "Liquidity Without Adoption",
      body:
        "Liquidity exists despite limited trustline participation.",
    },
    low_high: {
      title: "Trusted but Illiquid",
      body:
        "Issuer trust exists, but liquidity remains constrained.",
    },
    low_low: {
      title: "Early-Stage Pool",
      body:
        "Both liquidity and trustline participation are limited.",
    },
    mid_mid: {
      title: "Growing Foundation",
      body:
        "Liquidity and adoption are developing together.",
    },
    mid_high: {
      title: "Adoption-Led Growth",
      body:
        "Trust precedes deeper liquidity.",
    },
    high_mid: {
      title: "Liquidity-Led Growth",
      body:
        "Liquidity growth outpaces adoption.",
    },
  },

  activity_fee: {
    high_high: {
      title: "Fee-Tolerant Trading",
      body:
        "Trading remains active despite higher fees.",
    },
    high_low: {
      title: "Efficient Market",
      body:
        "Low fees coincide with strong trading participation.",
    },
    low_high: {
      title: "Cost Barrier",
      body:
        "Higher fees may be suppressing trading activity.",
    },
    low_low: {
      title: "Fee-Insensitive Inactivity",
      body:
        "Low activity persists regardless of fee structure.",
    },
    mid_mid: {
      title: "Neutral Cost Dynamics",
      body:
        "Fees and activity are proportionally aligned.",
    },
    mid_high: {
      title: "Fee-Constrained Participation",
      body:
        "Fees may limit broader engagement.",
    },
    high_mid: {
      title: "Active Despite Costs",
      body:
        "Trading remains healthy with moderate fees.",
    },
  },
};

/* --------------------------------------------------
 * 4. TRIPLE EXPLANATIONS (3 metrics)
 * -------------------------------------------------- */

type TripleKey =
  | "activity_depth_stability"
  | "depth_activity_impact"
  | "activity_trust_depth";

const TRIPLES: Record<
  TripleKey,
  (nodes: TraxrNodes) => Explanation
> = {
  activity_depth_stability: (n) => ({
    title: "Market Structure",
    body:
      "Liquidity, trading behavior, and price dynamics together describe the overall resilience of this pool.",
  }),

  depth_activity_impact: (n) => ({
    title: "Execution Profile",
    body:
      "Liquidity depth, usage, and price sensitivity collectively determine execution quality.",
  }),

  activity_trust_depth: (n) => ({
    title: "Adoption Dynamics",
    body:
      "Trustline participation, liquidity, and usage reflect how adoption translates into market activity.",
  }),
};

/* --------------------------------------------------
 * 5. MAIN CONTEXTUAL DISPATCH
 * -------------------------------------------------- */

export function getContextualExplanationForSelection(
  selected: (keyof TraxrNodes)[],
  nodes: TraxrNodes,
): Explanation[] {
  if (selected.length === 1) {
    return [getLocalExplanation(selected[0], nodes[selected[0]])];
  }

  // 3-metric
  if (selected.length === 3) {
    const key = tripleKey(selected[0], selected[1], selected[2]);
    const fn = TRIPLES[key];
    if (fn) return [fn(nodes)];
  }

  // 2-metric
  if (selected.length === 2) {
    const [a, b] = selected;
    const key = pairKey(a, b);
    const map = PAIRS[key];

    if (map) {
        const va = band(nodes[a]);
        const vb = band(nodes[b]);
        const entry = map[`${va}_${vb}` as PairBandKey];

        if (entry) return [entry];
    }
  }


  // Fallback (never empty)
  return [
    {
      title: "Context Overview",
      body:
        "The selected metrics together provide structural context for interpreting this pool.",
    },
  ];
}
