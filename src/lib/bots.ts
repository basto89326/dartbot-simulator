export type Bot = { name: string; level: number };

export const BOTS: Bot[] = [
  { name: "Richmond", level: 1 },
  { name: "West Coast", level: 1 },
  { name: "Essendon", level: 2 },
  { name: "Port Adelaide", level: 3 },
  { name: "North Melbourne", level: 3 },
  { name: "GWS", level: 4 },
  { name: "Melbourne", level: 4 },
  { name: "Adelaide", level: 4 },
  { name: "Gold Coast", level: 5 },
  { name: "Hawthorn", level: 5 },
  { name: "Sydney", level: 5 },
  { name: "Fremantle", level: 6 },
  { name: "Brisbane", level: 7 },
].sort((a, b) => a.name.localeCompare(b.name));
