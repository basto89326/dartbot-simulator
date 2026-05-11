import type { Bot } from "./bots";

export type Leg = { winner: "A" | "B" };
export type Set = { legs: Leg[]; legsA: number; legsB: number; winner: "A" | "B" };
export type MatchResult = {
  sets: Set[];
  setsA: number;
  setsB: number;
  winner: "A" | "B";
  legProb: number;
  averageA: number;
  averageB: number;
};

// Per-level average score ranges (inclusive).
const AVERAGE_RANGES: Record<number, [number, number]> = {
  1: [20, 25],
  2: [26, 30],
  3: [31, 35],
  4: [36, 40],
  5: [41, 45],
  6: [46, 50],
  7: [51, 55],
};

// Compute a randomised average for a bot, biased by how well they performed.
// legsWon / legsLost across the whole match drives a 0..1 performance ratio
// that maps to the lower or upper portion of the bot's level band.
function computeAverage(bot: Bot, legsWon: number, legsLost: number): number {
  const [low, high] = AVERAGE_RANGES[bot.level] ?? [20, 25];
  const total = legsWon + legsLost;
  const winRatio = total === 0 ? 0.5 : legsWon / total;
  // Compress to [0.15, 0.85] so even a whitewash leaves some range, then
  // add a little jitter for natural variance.
  const base = 0.15 + winRatio * 0.7;
  const jittered = Math.max(0, Math.min(1, base + (Math.random() - 0.5) * 0.15));
  const avg = low + jittered * (high - low);
  return Math.round(avg * 100) / 100;
}

// Convert skill levels (1-7) to per-leg win probability for A.
// Squaring the ratio amplifies the gap so stronger bots clearly dominate
// without making it deterministic.
export function legProbability(a: Bot, b: Bot): number {
  const wa = a.level ** 2;
  const wb = b.level ** 2;
  return wa / (wa + wb);
}

function simulateSet(pA: number): Set {
  const legs: Leg[] = [];
  let legsA = 0;
  let legsB = 0;
  while (legsA < 3 && legsB < 3) {
    const winner: "A" | "B" = Math.random() < pA ? "A" : "B";
    legs.push({ winner });
    if (winner === "A") legsA++;
    else legsB++;
  }
  return { legs, legsA, legsB, winner: legsA === 3 ? "A" : "B" };
}

export function simulateMatch(a: Bot, b: Bot): MatchResult {
  const pA = legProbability(a, b);
  const sets: Set[] = [];
  let setsA = 0;
  let setsB = 0;
  let legsAtotal = 0;
  let legsBtotal = 0;
  while (setsA < 2 && setsB < 2) {
    const s = simulateSet(pA);
    sets.push(s);
    legsAtotal += s.legsA;
    legsBtotal += s.legsB;
    if (s.winner === "A") setsA++;
    else setsB++;
  }
  return {
    sets,
    setsA,
    setsB,
    winner: setsA === 2 ? "A" : "B",
    legProb: pA,
    averageA: computeAverage(a, legsAtotal, legsBtotal),
    averageB: computeAverage(b, legsBtotal, legsAtotal),
  };
}
