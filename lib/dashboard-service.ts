import {
  assetRadar as fallbackAssetRadar,
  causalChain,
  fallbackThesis,
  feedSources,
  flowSteps,
  macroSignals as fallbackMacroSignals,
  newsFeed as fallbackNewsFeed,
  riskScenarios,
  watchMetrics,
} from "@/lib/dashboard-data";
import type {
  AssetCard,
  DashboardPayload,
  InsightCard,
  MacroSignal,
  NewsImpact,
  NewsItem,
  RiskScenario,
  WatchMetric,
} from "@/lib/dashboard-types";

type FredObservation = {
  date: string;
  value: string;
};

type FredSeriesResponse = {
  observations?: FredObservation[];
};

type GNewsArticle = {
  title?: string;
  publishedAt?: string;
  url?: string;
  source?: {
    name?: string;
  };
};

type GNewsResponse = {
  articles?: GNewsArticle[];
};

type GdeltArticle = {
  title?: string;
  url?: string;
  seendate?: string;
  domain?: string;
  sourcecountry?: string;
};

type GdeltResponse = {
  articles?: GdeltArticle[];
};

const SERIES_IDS = {
  oil: "DCOILWTICO",
  gold: "GOLDAMGBD228NLBM",
  us10y: "DGS10",
  breakeven5y: "T5YIE",
} as const;

function toPercentChange(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return "0.0%";
  }

  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function toBasisPoints(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return "0bp";
  }

  const diff = (current - previous) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${Math.round(diff)}bp`;
}

function compactTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(date);
}

function mapImpact(text: string): NewsImpact {
  const lower = text.toLowerCase();
  if (
    lower.includes("oil") ||
    lower.includes("crude") ||
    lower.includes("inflation") ||
    lower.includes("treasury") ||
    lower.includes("yield") ||
    lower.includes("middle east") ||
    lower.includes("iran") ||
    lower.includes("israel")
  ) {
    return "High";
  }

  if (lower.includes("gold") || lower.includes("dollar") || lower.includes("energy")) {
    return "Medium";
  }

  return "Low";
}

function formatPrice(value: number, digits = 2, prefix = "") {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return `${prefix}${value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })}`;
}

function sparklinePoints(values: number[]) {
  if (values.length === 0) {
    return "10,20 150,20";
  }

  const width = 140;
  const height = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = 10 + (index * width) / Math.max(values.length - 1, 1);
      const y = 8 + ((max - value) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function classifyRegime(params: {
  oilLatest: number;
  oilPrev: number;
  us10yLatest: number;
  us10yPrev: number;
  breakevenLatest: number;
  breakevenPrev: number;
  newsItems: NewsItem[];
}) {
  const geopoliticalPressure = params.newsItems.some((item) =>
    /middle east|iran|israel|gaza|red sea|oil|crude|energy/i.test(item.headline),
  );
  const oilUp = params.oilLatest > params.oilPrev;
  const ratesUp = params.us10yLatest >= params.us10yPrev;
  const inflationUp = params.breakevenLatest >= params.breakevenPrev;

  if (geopoliticalPressure && oilUp && ratesUp && inflationUp) {
    return "reflation_shock";
  }

  if (geopoliticalPressure && oilUp && !ratesUp) {
    return "supply_shock_with_growth_fear";
  }

  if (!oilUp && !ratesUp) {
    return "cooling_risk";
  }

  return "mixed";
}

function buildDynamicThesis(params: {
  oilLatest: number;
  oilPrev: number;
  us10yLatest: number;
  us10yPrev: number;
  breakevenLatest: number;
  breakevenPrev: number;
  newsItems: NewsItem[];
}) {
  const regime = classifyRegime(params);

  switch (regime) {
    case "reflation_shock":
      return "当前 AI 判断：市场正在交易典型的地缘冲击向再通胀扩散。能源风险溢价推高油价，油价又抬升通胀预期与长端利率，这种组合往往先压制成长久期，再强化能源、贵金属与防御资产的相对优势。";
    case "supply_shock_with_growth_fear":
      return "当前 AI 判断：市场更接近“供应冲击 + 增长担忧”的组合。油价被地缘风险抬起，但长端利率未同步上行，说明资金在定价增长放缓与避险需求，而不是纯粹的再通胀交易。";
    case "cooling_risk":
      return "当前 AI 判断：能源与利率同时回落，说明地缘风险或再通胀主线正在降温。若该状态延续，市场风格可能重新偏向成长与消费修复，而能源超额收益会逐步收敛。";
    default:
      return "当前 AI 判断：市场仍处于混合定价阶段。地缘冲击、通胀预期和利率路径尚未完全共振，因此资产表现可能继续分化，交易重点应放在确认主导变量是谁。";
  }
}

function buildDynamicInsightCards(params: {
  oilLatest: number;
  oilPrev: number;
  us10yLatest: number;
  us10yPrev: number;
  breakevenLatest: number;
  breakevenPrev: number;
  newsItems: NewsItem[];
}): InsightCard[] {
  const regime = classifyRegime(params);
  const oilDirection = params.oilLatest > params.oilPrev ? "上行" : "回落";
  const rateDirection = params.us10yLatest >= params.us10yPrev ? "抬升" : "回落";
  const inflDirection = params.breakevenLatest >= params.breakevenPrev ? "走高" : "走弱";
  const leadHeadline = params.newsItems[0]?.headline ?? "当前未抓取到高优先级 headline。";

  switch (regime) {
    case "reflation_shock":
      return [
        {
          title: "AI 判断",
          detail: `最新 headline 指向能源与地缘冲击，且油价${oilDirection}、10Y 利率${rateDirection}、通胀预期${inflDirection}，说明市场正在形成再通胀链条。`,
          emphasis: "Primary",
        },
        {
          title: "关键验证点",
          detail: "继续观察油价是否突破下一档关键阻力，同时确认黄金能否在美元偏强环境中维持韧性；若不能，说明利率交易正在压过避险交易。",
          emphasis: "Secondary",
        },
        {
          title: "失效条件",
          detail: "若地缘 headline 降温且长端利率回落，则该主线会从“再通胀冲击”转向“情绪修复”，能源与防御板块的超额收益可能见顶。",
          emphasis: "Watch",
        },
      ];
    case "supply_shock_with_growth_fear":
      return [
        {
          title: "AI 判断",
          detail: `当前更像供应冲击驱动的避险定价。油价${oilDirection}，但 10Y 利率没有同步抬升，说明市场担心的是增长而不是全面再通胀。`,
          emphasis: "Primary",
        },
        {
          title: "关键验证点",
          detail: "观察黄金与债券是否继续同步走强；如果是，说明资金正在向避险资产迁移，而非押注经济再加热。",
          emphasis: "Secondary",
        },
        {
          title: "失效条件",
          detail: "如果后续通胀预期重新抬头并带动长端利率转向上行，则该框架会切换回再通胀交易。",
          emphasis: "Watch",
        },
      ];
    case "cooling_risk":
      return [
        {
          title: "AI 判断",
          detail: "油价和利率同步降温，说明市场正在降低对能源冲击和通胀外溢的定价强度，风险偏好修复的条件在改善。",
          emphasis: "Primary",
        },
        {
          title: "关键验证点",
          detail: "关注消费、科技和高久期资产是否开始跑赢能源与贵金属；这会是风格切换成立的最直接信号。",
          emphasis: "Secondary",
        },
        {
          title: "失效条件",
          detail: "若新的地缘 headline 再次强化供应担忧，该修复逻辑会迅速失效，市场会重回防御配置。",
          emphasis: "Watch",
        },
      ];
    default:
      return [
        {
          title: "AI 判断",
          detail: `当前市场仍是混合定价，领先 headline 为：“${leadHeadline}” 。但油价、利率与通胀预期尚未形成单边共振。`,
          emphasis: "Primary",
        },
        {
          title: "关键验证点",
          detail: "重点观察哪一个变量先走出趋势：如果是油价，偏商品；如果是长端利率，偏估值压缩；如果是黄金，偏避险。",
          emphasis: "Secondary",
        },
        {
          title: "失效条件",
          detail: "如果三组变量重新共振，混合格局会结束，市场会重新进入清晰主线交易。",
          emphasis: "Watch",
        },
      ];
  }
}

function buildDynamicWatchMetrics(params: {
  oilLatest: number;
  oilPrev: number;
  us10yLatest: number;
  breakevenLatest: number;
  breakevenPrev: number;
}): WatchMetric[] {
  return [
    {
      label: "WTI Momentum",
      value: params.oilLatest > params.oilPrev ? "油价仍在抬升" : "油价短线降温",
      status: params.oilLatest > params.oilPrev ? "Hot" : "Calm",
    },
    {
      label: "US 10Y",
      value: params.us10yLatest >= 4.5 ? "接近高压区" : "仍低于极值区",
      status: params.us10yLatest >= 4.5 ? "Hot" : "Watch",
    },
    {
      label: "5Y BEI",
      value: params.breakevenLatest >= params.breakevenPrev ? "通胀预期抬头" : "通胀预期回落",
      status: params.breakevenLatest >= params.breakevenPrev ? "Watch" : "Calm",
    },
    {
      label: "Cross-Asset",
      value: params.oilLatest > params.oilPrev && params.us10yLatest >= 4.3 ? "商品/利率共振" : "尚未完全共振",
      status: params.oilLatest > params.oilPrev && params.us10yLatest >= 4.3 ? "Hot" : "Watch",
    },
  ];
}

function buildDynamicRiskScenarios(params: {
  oilLatest: number;
  oilPrev: number;
  newsItems: NewsItem[];
}): RiskScenario[] {
  const geopoliticalPressure = params.newsItems.some((item) =>
    /middle east|iran|israel|gaza|red sea/i.test(item.headline),
  );

  if (geopoliticalPressure && params.oilLatest > params.oilPrev) {
    return [
      {
        title: "冲突持续升级",
        probability: "40%",
        marketImpact: "油价与通胀预期进一步抬升，利率和美元偏强，权益继续承压分化。",
        positioning: "增配能源、黄金与防御暴露，压缩高久期和高耗能配置。",
      },
      {
        title: "高位震荡",
        probability: "40%",
        marketImpact: "市场继续围绕 headline 摆动，风格轮动加速但方向未完全单边化。",
        positioning: "保持弹性仓位，围绕商品与避险资产做相对价值。",
      },
      {
        title: "风险快速降温",
        probability: "20%",
        marketImpact: "油价回落，风险偏好修复，市场重新转向增长与宽松预期。",
        positioning: "逐步回补成长与消费板块。",
      },
    ];
  }

  return riskScenarios;
}

async function fetchJson<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchFredSeries(seriesId: string, apiKey: string) {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: "json",
    sort_order: "desc",
    limit: "16",
  });

  const data = await fetchJson<FredSeriesResponse>(
    `https://api.stlouisfed.org/fred/series/observations?${params.toString()}`,
    { next: { revalidate: 300 } },
  );

  const observations = (data.observations ?? [])
    .filter((item) => item.value !== ".")
    .map((item) => ({
      date: item.date,
      value: Number(item.value),
    }))
    .filter((item) => Number.isFinite(item.value));

  return observations.reverse();
}

async function fetchMacroSignals() {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return {
      macroSignals: fallbackMacroSignals,
      assetRadar: fallbackAssetRadar,
      thesis: fallbackThesis,
      oilLatest: 84.62,
      oilPrev: 83.10,
      us10yLatest: 4.38,
      us10yPrev: 4.27,
      breakevenLatest: 2.39,
      breakevenPrev: 2.31,
    };
  }

  try {
    const [oilSeries, goldSeries, us10ySeries, breakevenSeries] = await Promise.all([
      fetchFredSeries(SERIES_IDS.oil, apiKey),
      fetchFredSeries(SERIES_IDS.gold, apiKey),
      fetchFredSeries(SERIES_IDS.us10y, apiKey),
      fetchFredSeries(SERIES_IDS.breakeven5y, apiKey),
    ]);

    const oilLatest = oilSeries.at(-1)?.value ?? 0;
    const oilPrev = oilSeries.at(-2)?.value ?? oilLatest;
    const goldLatest = goldSeries.at(-1)?.value ?? 0;
    const goldPrev = goldSeries.at(-2)?.value ?? goldLatest;
    const us10yLatest = us10ySeries.at(-1)?.value ?? 0;
    const us10yPrev = us10ySeries.at(-2)?.value ?? us10yLatest;
    const breakevenLatest = breakevenSeries.at(-1)?.value ?? 0;
    const breakevenPrev = breakevenSeries.at(-2)?.value ?? breakevenLatest;

    const macroSignals: MacroSignal[] = [
      {
        label: "WTI",
        value: formatPrice(oilLatest, 2, "$"),
        delta: toPercentChange(oilLatest, oilPrev),
      },
      {
        label: "Gold",
        value: formatPrice(goldLatest, 2, "$"),
        delta: toPercentChange(goldLatest, goldPrev),
      },
      {
        label: "US 10Y",
        value: `${us10yLatest.toFixed(2)}%`,
        delta: toBasisPoints(us10yLatest, us10yPrev),
      },
      {
        label: "5Y BEI",
        value: `${breakevenLatest.toFixed(2)}%`,
        delta: toBasisPoints(breakevenLatest, breakevenPrev),
      },
    ];

    const assetRadar: AssetCard[] = [
      {
        id: "asset-oil",
        name: "WTI Crude",
        symbol: SERIES_IDS.oil,
        price: formatPrice(oilLatest, 2, "$"),
        move: toPercentChange(oilLatest, oilPrev),
        positive: oilLatest >= oilPrev,
        range: "FRED",
        points: sparklinePoints(oilSeries.map((item) => item.value)),
      },
      {
        id: "asset-gold",
        name: "Gold Fix",
        symbol: SERIES_IDS.gold,
        price: formatPrice(goldLatest, 2, "$"),
        move: toPercentChange(goldLatest, goldPrev),
        positive: goldLatest >= goldPrev,
        range: "FRED",
        points: sparklinePoints(goldSeries.map((item) => item.value)),
      },
      {
        id: "asset-us10y",
        name: "US 10Y Yield",
        symbol: SERIES_IDS.us10y,
        price: `${us10yLatest.toFixed(2)}%`,
        move: toBasisPoints(us10yLatest, us10yPrev),
        positive: us10yLatest >= us10yPrev,
        range: "FRED",
        points: sparklinePoints(us10ySeries.map((item) => item.value)),
      },
    ];

    const thesis =
      oilLatest > oilPrev && us10yLatest >= us10yPrev
        ? "当前主线假设：油价与长端利率同步走高，说明市场正在朝再通胀与风险溢价上修的方向重估，权益久期和高耗能行业的压力正在累积。"
        : fallbackThesis;

    return {
      macroSignals,
      assetRadar,
      thesis,
      oilLatest,
      oilPrev,
      us10yLatest,
      us10yPrev,
      breakevenLatest,
      breakevenPrev,
    };
  } catch {
    return {
      macroSignals: fallbackMacroSignals,
      assetRadar: fallbackAssetRadar,
      thesis: fallbackThesis,
      oilLatest: 84.62,
      oilPrev: 83.10,
      us10yLatest: 4.38,
      us10yPrev: 4.27,
      breakevenLatest: 2.39,
      breakevenPrev: 2.31,
    };
  }
}

async function fetchGNewsItems() {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return [] as NewsItem[];
  }

  const params = new URLSearchParams({
    q: '(oil OR crude OR inflation OR treasury OR dollar OR "middle east")',
    lang: "en",
    max: "8",
    apikey: apiKey,
  });

  try {
    const data = await fetchJson<GNewsResponse>(`https://gnews.io/api/v4/search?${params.toString()}`, {
      next: { revalidate: 180 },
    });

    return (data.articles ?? []).slice(0, 4).map((article, index) => ({
      id: `gnews-${index}`,
      time: compactTime(article.publishedAt ?? ""),
      source: article.source?.name ?? "GNews",
      category: "Macro News",
      impact: mapImpact(article.title ?? ""),
      headline: article.title ?? "Untitled article",
      url: article.url,
    }));
  } catch {
    return [];
  }
}

async function fetchGdeltItems() {
  const params = new URLSearchParams({
    query: '("middle east" OR israel OR iran OR gaza OR "red sea") (oil OR crude OR energy)',
    mode: "artlist",
    maxrecords: "6",
    sort: "datedesc",
    format: "json",
    timespan: "7days",
  });

  try {
    const data = await fetchJson<GdeltResponse>(
      `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`,
      { next: { revalidate: 180 } },
    );

    return (data.articles ?? []).slice(0, 4).map((article, index) => ({
      id: `gdelt-${index}`,
      time: compactTime(article.seendate ?? ""),
      source: article.domain ?? "GDELT",
      category: "Geopolitics",
      impact: mapImpact(article.title ?? ""),
      headline: article.title ?? "Untitled article",
      url: article.url,
    }));
  } catch {
    return [];
  }
}

async function fetchNewsFeed() {
  const [gnewsItems, gdeltItems] = await Promise.all([fetchGNewsItems(), fetchGdeltItems()]);
  const merged = [...gdeltItems, ...gnewsItems];
  return merged.length > 0 ? merged.slice(0, 8) : fallbackNewsFeed;
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  const [macroData, newsItems] = await Promise.all([fetchMacroSignals(), fetchNewsFeed()]);
  const thesis = buildDynamicThesis({
    oilLatest: macroData.oilLatest,
    oilPrev: macroData.oilPrev,
    us10yLatest: macroData.us10yLatest,
    us10yPrev: macroData.us10yPrev,
    breakevenLatest: macroData.breakevenLatest,
    breakevenPrev: macroData.breakevenPrev,
    newsItems,
  });
  const dynamicInsightCards = buildDynamicInsightCards({
    oilLatest: macroData.oilLatest,
    oilPrev: macroData.oilPrev,
    us10yLatest: macroData.us10yLatest,
    us10yPrev: macroData.us10yPrev,
    breakevenLatest: macroData.breakevenLatest,
    breakevenPrev: macroData.breakevenPrev,
    newsItems,
  });
  const dynamicWatchMetrics = buildDynamicWatchMetrics({
    oilLatest: macroData.oilLatest,
    oilPrev: macroData.oilPrev,
    us10yLatest: macroData.us10yLatest,
    breakevenLatest: macroData.breakevenLatest,
    breakevenPrev: macroData.breakevenPrev,
  });
  const dynamicRiskScenarios = buildDynamicRiskScenarios({
    oilLatest: macroData.oilLatest,
    oilPrev: macroData.oilPrev,
    newsItems,
  });

  return {
    generatedAt: new Date().toISOString(),
    thesis,
    macroSignals: macroData.macroSignals,
    newsFeed: newsItems,
    causalChain,
    assetRadar: macroData.assetRadar,
    feedSources,
    watchMetrics: dynamicWatchMetrics,
    flowSteps,
    riskScenarios: dynamicRiskScenarios,
    insightCards: dynamicInsightCards,
  };
}
