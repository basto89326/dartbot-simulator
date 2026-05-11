import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BOTS, type Bot } from "@/lib/bots";
import { simulateMatch, type MatchResult } from "@/lib/simulate";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Index,
});

function BotPicker({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  exclude?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Pick a bot" />
        </SelectTrigger>
        <SelectContent>
          {BOTS.filter((b) => b.name !== exclude).map((b) => (
            <SelectItem key={b.name} value={b.name}>
              {b.name} <span className="text-muted-foreground">· L{b.level}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ScoreBadge({ value, highlight }: { value: number; highlight: boolean }) {
  return (
    <span
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-md font-mono text-lg font-bold " +
        (highlight
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground")
      }
    >
      {value}
    </span>
  );
}

function Index() {
  const [aName, setAName] = useState(BOTS[0].name);
  const [bName, setBName] = useState(BOTS[1].name);
  const [result, setResult] = useState<MatchResult | null>(null);

  const a = useMemo(() => BOTS.find((x) => x.name === aName)!, [aName]);
  const b = useMemo(() => BOTS.find((x) => x.name === bName)!, [bName]);

  const run = () => setResult(simulateMatch(a, b));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Darts Bot Simulator
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            First to 3 legs wins a set · First to 2 sets wins the match.
            Stronger bots win more often.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Set up the match</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <BotPicker label="Bot A" value={aName} onChange={setAName} exclude={bName} />
              <BotPicker label="Bot B" value={bName} onChange={setBName} exclude={aName} />
            </div>
            <Button onClick={run} className="w-full sm:w-auto">
              Simulate match
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Result</CardTitle>
                <Badge variant="secondary">
                  Per-leg win chance for {a.name}: {(result.legProb * 100).toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-6 rounded-lg border bg-card p-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">L{a.level}</div>
                  <div className="text-lg font-semibold">{a.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <ScoreBadge value={result.setsA} highlight={result.winner === "A"} />
                  <span className="text-muted-foreground">–</span>
                  <ScoreBadge value={result.setsB} highlight={result.winner === "B"} />
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">L{b.level}</div>
                  <div className="text-lg font-semibold">{b.name}</div>
                </div>
              </div>

              <p className="mt-4 text-center text-sm">
                <span className="font-semibold">
                  {(result.winner === "A" ? a : b).name}
                </span>{" "}
                wins {result.setsA}–{result.setsB} in sets.
              </p>

              <div className="mt-6 space-y-3">
                {result.sets.map((s, i) => (
                  <div key={i} className="rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Set {i + 1}</span>
                      <span className="font-mono text-sm">
                        {s.legsA}–{s.legsB} · won by{" "}
                        <span className="font-semibold">
                          {(s.winner === "A" ? a : b).name}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.legs.map((leg, j) => (
                        <span
                          key={j}
                          className={
                            "inline-flex h-7 min-w-7 items-center justify-center rounded px-2 font-mono text-xs " +
                            (leg.winner === "A"
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground")
                          }
                          title={`Leg ${j + 1}: ${(leg.winner === "A" ? a : b).name}`}
                        >
                          {(leg.winner === "A" ? a : b).name.split(" ").map((w) => w[0]).join("")}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
