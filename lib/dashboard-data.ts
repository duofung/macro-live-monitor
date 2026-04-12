import type {
  AssetCard,
  CausalNode,
  FeedSource,
  FlowStep,
  InsightCard,
  MacroSignal,
  NewsItem,
  RiskScenario,
  WatchMetric,
} from "@/lib/dashboard-types";

export const macroSignals: MacroSignal[] = [
  { label: "Brent", value: "$87.10", delta: "+2.4%" },
  { label: "Gold", value: "$2,384", delta: "+0.9%" },
  { label: "US 10Y", value: "4.38%", delta: "+11bp" },
  { label: "DXY", value: "104.72", delta: "+0.6%" },
];

export const newsFeed: NewsItem[] = [
  {
    id: "news-1",
    time: "08:42",
    source: "GDELT",
    category: "Geopolitics",
    impact: "High",
    headline: "中东冲突升级，油运通道风险溢价上升，原油远月曲线继续陡峭化。",
  },
  {
    id: "news-2",
    time: "08:36",
    source: "GNews",
    category: "Energy",
    impact: "High",
    headline: "国际油价快速拉升后，航运、航空与化工板块同步进入成本敏感区间。",
  },
  {
    id: "news-3",
    time: "08:28",
    source: "FRED",
    category: "Rates",
    impact: "Medium",
    headline: "美债收益率上行压制风险资产估值，实际利率与美元共振偏强。",
  },
  {
    id: "news-4",
    time: "08:19",
    source: "NewsAPI",
    category: "Inflation",
    impact: "High",
    headline: "能源价格冲击重新抬升通胀预期，市场对宽松路径的定价被迫后移。",
  },
  {
    id: "news-5",
    time: "08:07",
    source: "Yahoo",
    category: "Cross-Asset",
    impact: "Medium",
    headline: "黄金受避险需求支撑，但若美元持续走强，贵金属上行斜率将趋缓。",
  },
];

export const causalChain: CausalNode[] = [
  {
    id: "c1",
    title: "地缘冲突",
    description: "原油供应中断预期升温，能源风险溢价先于实体供需收紧反应。",
    signal: "Shock Origin",
    tone: "from-blue-500/18 to-transparent",
  },
  {
    id: "c2",
    title: "油价上行",
    description: "原油及成品油价格抬升，运输、制造与居民能源账单同步承压。",
    signal: "Commodity Transmission",
    tone: "from-slate-500/20 to-transparent",
  },
  {
    id: "c3",
    title: "再通胀交易",
    description: "通胀预期抬升，长端利率和美元偏强，压制全球风险偏好与成长久期。",
    signal: "Rates / FX",
    tone: "from-blue-500/18 to-transparent",
  },
  {
    id: "c4",
    title: "资产再定价",
    description: "权益板块轮动，黄金、油气、军工受益；航空、消费与高估值科技承压。",
    signal: "Portfolio Impact",
    tone: "from-slate-500/20 to-transparent",
  },
];

export const assetRadar: AssetCard[] = [
  {
    id: "asset-1",
    name: "WTI Crude",
    symbol: "CL1!",
    price: "$84.62",
    move: "+1.84%",
    positive: true,
    range: "1D",
    points: "10,31 24,20 38,24 52,18 66,28 80,24 94,33 108,22 122,26 136,15 150,18",
  },
  {
    id: "asset-2",
    name: "Gold Spot",
    symbol: "XAUUSD",
    price: "$2,384",
    move: "+0.92%",
    positive: true,
    range: "1D",
    points: "10,28 24,30 38,22 52,25 66,19 80,21 94,15 108,17 122,14 136,10 150,13",
  },
  {
    id: "asset-3",
    name: "UST Bond Index",
    symbol: "USTB",
    price: "109.41",
    move: "-0.47%",
    positive: false,
    range: "1D",
    points: "10,14 24,12 38,18 52,17 66,24 80,20 94,27 108,24 122,30 136,27 150,31",
  },
];

export const feedSources: FeedSource[] = [
  {
    name: "GDELT Project",
    status: "Live",
    note: "全球事件与新闻语义监测，适合地缘政治与冲突脉冲。",
  },
  {
    name: "FRED API",
    status: "Live",
    note: "利率、通胀、失业、收益率曲线等核心宏观序列。",
  },
  {
    name: "GNews / NewsAPI",
    status: "Ready",
    note: "国际财经与综合新闻补充源，适合 headline stream。",
  },
  {
    name: "Yahoo Finance / TradingView",
    status: "Optional",
    note: "前端图表与资产报价展示层，适合 radar 与 widget 嵌入。",
  },
];

export const fallbackThesis =
  "当前主线假设：地缘冲突抬升油价预期，油价抬升强化再通胀交易，再通胀进一步推动利率与美元偏强，最终对全球风险资产形成估值压力。";

export const watchMetrics: WatchMetric[] = [
  { label: "Brent > 90", value: "临界区间", status: "Watch" },
  { label: "US 10Y > 4.5%", value: "久期风险", status: "Watch" },
  { label: "5Y BEI", value: "再通胀抬头", status: "Hot" },
  { label: "Gold / Oil Ratio", value: "避险未失效", status: "Calm" },
];

export const flowSteps: FlowStep[] = [
  {
    stage: "Event Pulse",
    summary: "中东冲突与航运风险推升能源风险溢价。",
  },
  {
    stage: "Macro Transmission",
    summary: "油价进入通胀预期，压制宽松定价并推动实际利率。",
  },
  {
    stage: "Cross-Asset Move",
    summary: "美元、长端利率、黄金与能源股出现分化性再定价。",
  },
  {
    stage: "Portfolio Action",
    summary: "降低高耗能与长久期暴露，关注能源、军工、贵金属与防御资产。",
  },
];

export const riskScenarios: RiskScenario[] = [
  {
    title: "冲突持续升级",
    probability: "35%",
    marketImpact: "油价上冲、利率抬升、风险资产承压",
    positioning: "偏多能源和黄金，压缩成长久期",
  },
  {
    title: "局势维持高波动但未失控",
    probability: "45%",
    marketImpact: "通胀预期抬升但风险资产分化",
    positioning: "中性仓位，跟踪通胀交易和 sector rotation",
  },
  {
    title: "冲突快速降温",
    probability: "20%",
    marketImpact: "油价回落，利率下修，风险偏好修复",
    positioning: "回补成长和消费，减弱商品过度配置",
  },
];

export const insightCards: InsightCard[] = [
  {
    title: "AI 判断",
    detail: "当前交易主线仍是地缘冲击向再通胀扩散，而不是单纯的避险恐慌。",
    emphasis: "Primary",
  },
  {
    title: "关键验证点",
    detail: "如果油价继续上行但黄金涨幅受限，说明市场更偏向利率冲击而非纯避险交易。",
    emphasis: "Secondary",
  },
  {
    title: "失效条件",
    detail: "若冲突降温且长端利率回落，则再通胀链条会快速弱化，成长资产估值修复。",
    emphasis: "Watch",
  },
];
