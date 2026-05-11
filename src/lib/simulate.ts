import type { Bot } from "./bots";

export type Leg = { winner: "A" | "B" };
export type Set = { legs: Leg[]; legsA: number; legsB: number; winner: "A" | "B" };
export type MatchResult = {
  sets: Set[];
  setsA: number;
  setsB: number;
  winner: "A" | "B";
  legProb: number;
};

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
  while (setsA < 2 && setsB < 2) {
    const s = simulateSet(pA);
    sets.push(s);
    if (s.winner === "A") setsA++;
    else setsB++;
  }
  return {
    sets,
    setsA,
    setsB,
    winner: setsA === 2 ? "A" : "B",
    legProb: pA,
  };
}
