export type NewsImpact = "High" | "Medium" | "Low";

export type NewsItem = {
  id: string;
  time: string;
  source: string;
  category: string;
  impact: NewsImpact;
  headline: string;
  url?: string;
};

export type CausalNode = {
  id: string;
  title: string;
  description: string;
  signal: string;
  tone: string;
};

export type AssetCard = {
  id: string;
  name: string;
  symbol: string;
  price: string;
  move: string;
  positive: boolean;
  range: string;
  points: string;
};

export type MacroSignal = {
  label: string;
  value: string;
  delta: string;
};

export type FeedSource = {
  name: string;
  status: "Live" | "Ready" | "Optional";
  note: string;
};

export type WatchMetric = {
  label: string;
  value: string;
  status: "Hot" | "Watch" | "Calm";
};

export type FlowStep = {
  stage: string;
  summary: string;
};

export type RiskScenario = {
  title: string;
  probability: string;
  marketImpact: string;
  positioning: string;
};

export type InsightCard = {
  title: string;
  detail: string;
  emphasis: "Primary" | "Secondary" | "Watch";
};

export type DashboardPayload = {
  generatedAt: string;
  thesis: string;
  macroSignals: MacroSignal[];
  newsFeed: NewsItem[];
  causalChain: CausalNode[];
  assetRadar: AssetCard[];
  feedSources: FeedSource[];
  watchMetrics: WatchMetric[];
  flowSteps: FlowStep[];
  riskScenarios: RiskScenario[];
  insightCards: InsightCard[];
};
