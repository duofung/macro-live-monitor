"use client";

import { useEffect, useMemo, useState } from "react";
import { TradingViewWidget } from "@/components/tradingview-widget";
import type { DashboardPayload, NewsImpact } from "@/lib/dashboard-types";

function MiniChart({ points, positive }: { points: string; positive: boolean }) {
  const gradientId = `grad-${positive ? "up" : "down"}-${points.length}`;

  return (
    <svg viewBox="0 0 160 40" className="h-14 w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={positive ? "#3B82F6" : "#94A3B8"} />
          <stop offset="100%" stopColor={positive ? "#93C5FD" : "#475569"} />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        points={points}
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.split(" ").map((point, index) => {
        const [x, y] = point.split(",");

        return (
          <g key={`${point}-${index}`}>
            <line x1={x} y1="6" x2={x} y2="34" stroke="#111827" strokeWidth="1" />
            <rect
              x={Number(x) - 2}
              y={Number(y) - 4}
              width="4"
              height="8"
              rx="1"
              fill={positive ? "#3B82F6" : "#64748B"}
            />
          </g>
        );
      })}
    </svg>
  );
}

const impactFilters: Array<NewsImpact | "全部"> = ["全部", "High", "Medium", "Low"];

function impactLabel(value: NewsImpact | "全部") {
  if (value === "全部") return "全部影响级别";
  if (value === "High") return "高影响";
  if (value === "Medium") return "中影响";
  return "低影响";
}

export function DashboardShell({ initialData }: { initialData: DashboardPayload }) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [impactFilter, setImpactFilter] = useState<NewsImpact | "全部">("全部");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setRefreshing(true);
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as DashboardPayload;
        if (active) {
          setData(payload);
          setError(null);
        }
      } catch {
        if (active) {
          setError("数据刷新失败，当前展示最近一次成功载入的数据。");
        }
      } finally {
        if (active) {
          setRefreshing(false);
        }
      }
    };

    const interval = window.setInterval(load, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const filteredMacroNews = useMemo(() => {
    return data.newsFeed.filter((item) => impactFilter === "全部" || item.impact === impactFilter);
  }, [data.newsFeed, impactFilter]);

  const commodityAssets = data.assetRadar.filter((item) => /原油|黄金/.test(item.name));
  const ratesAsset = data.assetRadar.find((item) => /美债|国债/.test(item.name));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1880px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="overflow-hidden border border-border bg-panel">
          <div className="grid gap-4 px-4 py-5 lg:grid-cols-[1.3fr_0.7fr] lg:px-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-blue-500/30 bg-accent-soft px-2 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-blue-300">
                  ExpoRadar
                </span>
                <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-slate-500">
                  宏观经济实时监测看板
                </span>
                <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  {refreshing ? "刷新中" : "每60秒自动刷新"}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-5xl font-mono text-3xl leading-tight text-white sm:text-4xl xl:text-5xl">
                  用最直白的方式看懂战争、油价、物价、利率和股票之间的连锁反应
                </h1>
                <p className="max-w-4xl text-sm leading-7 text-slate-400 sm:text-base">
                  这是一个给普通人也能读懂的宏观看板。你不需要先理解复杂金融术语，只要顺着“战争怎么发生、油价怎么变、物价怎么受影响、美联储会不会动、股票为什么波动”这条路径往下看，就能理解经济变化。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>最新更新时间：{new Date(data.generatedAt).toLocaleString("zh-CN", { hour12: false })}</span>
                <span>宏观新闻：{filteredMacroNews.length} 条</span>
                <span>军事新闻：{data.militaryFeed.length} 条</span>
                {error ? <span className="text-orange-300">{error}</span> : null}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {data.macroSignals.map((signal) => (
                <article key={signal.label} className="border border-border bg-black/60 px-3 py-3">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500">{signal.label}</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="font-mono text-lg text-white">
                      {/原油|黄金/.test(signal.label) ? `$${signal.value}` : signal.value}
                    </span>
                    <span className="font-mono text-xs text-blue-400">{signal.delta}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </header>

        <section className="border border-border bg-panel px-4 py-4 lg:px-6">
          <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blue-400">第一层 / 战争与地缘</p>
              <h2 className="mt-1 font-mono text-xl text-white">中东局势与军事动态</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              先看战争和军事新闻，因为这是当前宏观冲击的源头。战争升级，最先受影响的是能源运输、原油供应预期和全球避险情绪。
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="border border-border bg-black/55 px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">你需要先知道什么</p>
              <p className="mt-3 text-base leading-8 text-slate-100">{data.thesis}</p>
              <div className="mt-4 grid gap-2">
                {data.watchMetrics.map((metric) => (
                  <div key={metric.label} className="border border-border bg-black/40 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[11px] text-slate-400">{metric.label}</p>
                      <span className="font-mono text-[10px] text-blue-300">{metric.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-200">{metric.value}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-3 md:grid-cols-2">
              {data.militaryFeed.map((item) => (
                <article key={item.id} className="border border-border bg-black/55 px-4 py-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] text-slate-500">{item.time}</span>
                    <span className="font-mono text-[10px] text-orange-300">军事动态</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-200">{item.headlineZh ?? item.headline}</p>
                  <p className="mt-3 text-xs leading-6 text-slate-500">原文来源：{item.source}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border border-border bg-panel px-4 py-4 lg:px-6">
          <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blue-400">第二层 / 原油与贵金属</p>
              <h2 className="mt-1 font-mono text-xl text-white">大宗商品和避险资产</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              战争一旦影响能源供给预期，原油通常先动；黄金则告诉你市场更偏向“避险”还是“利率冲击”。
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="grid gap-4">
              {commodityAssets.map((asset) => (
                <article key={asset.id} className="border border-border bg-black/60 px-4 py-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-white">{asset.name}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-500">{asset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg text-white">${asset.price}</p>
                      <p className={`mt-1 font-mono text-xs ${asset.positive ? "text-blue-400" : "text-slate-400"}`}>
                        {asset.move}
                      </p>
                    </div>
                  </div>
                  <MiniChart points={asset.points} positive={asset.positive} />
                </article>
              ))}
            </div>

            <article className="border border-border bg-black/55 px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">图表区</p>
              <div className="mt-3">
                <TradingViewWidget />
              </div>
            </article>
          </div>
        </section>

        <section className="border border-border bg-panel px-4 py-4 lg:px-6">
          <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blue-400">第三层 / 物价、利率与美联储</p>
              <h2 className="mt-1 font-mono text-xl text-white">战争如何传导到物价和政策</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              这一层是最关键的经济传导层。油价抬升，意味着运输和生活成本更贵，通胀压力更强，美联储就更难降息。
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <article className="border border-border bg-black/55 px-4 py-4">
              <p className="font-mono text-[11px] text-slate-500">物价影响</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                原油上涨通常会先推高运输、航空、化工和居民能源账单，最终让整体物价更难回落。
              </p>
            </article>
            <article className="border border-border bg-black/55 px-4 py-4">
              <p className="font-mono text-[11px] text-slate-500">美联储政策</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                如果通胀预期重新抬头，美联储更可能维持高利率更久。对股票市场来说，这通常不是好消息。
              </p>
            </article>
            <article className="border border-border bg-black/55 px-4 py-4">
              <p className="font-mono text-[11px] text-slate-500">大数据影响</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                非农就业、CPI、PCE、失业率等数据会决定战争冲击能否真正变成持续性的经济压力。
              </p>
            </article>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <article className="border border-border bg-black/60 px-4 py-4">
              <p className="font-mono text-[11px] text-slate-500">关键利率资产</p>
              {ratesAsset ? (
                <>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-white">{ratesAsset.name}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-500">{ratesAsset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg text-white">{ratesAsset.price}</p>
                      <p className="mt-1 font-mono text-xs text-blue-400">{ratesAsset.move}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <MiniChart points={ratesAsset.points} positive={ratesAsset.positive} />
                  </div>
                </>
              ) : null}
            </article>

            <article className="border border-border bg-black/55 px-4 py-4">
              <p className="font-mono text-[11px] text-slate-500">传导路径</p>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {data.flowSteps.map((step, index) => (
                  <div key={step.stage} className="border border-border bg-white/[0.02] px-3 py-3">
                    <p className="font-mono text-[10px] text-blue-300">第 {index + 1} 步</p>
                    <p className="mt-2 font-mono text-sm text-white">{step.stage}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{step.summary}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="border border-border bg-panel px-4 py-4 lg:px-6">
          <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blue-400">第四层 / 股票与风险资产</p>
              <h2 className="mt-1 font-mono text-xl text-white">股票市场受到什么影响</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              股票不是独立变化的。油价、利率和美联储预期都会通过估值和成本两条路，影响科技股、消费股和航空运输板块。
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <article className="border border-border bg-black/55 px-4 py-4">
              <p className="font-mono text-[11px] text-slate-500">科技股</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                当利率上升时，未来盈利折现价值下降，大市值科技股通常更容易承压，所以我们把苹果放进图表层来观察。
              </p>
            </article>
            <article className="border border-border bg-black/55 px-4 py-4">
              <p className="font-mono text-[11px] text-slate-500">消费与航空</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                油价上行会推高运输和燃料成本，对航空、物流和居民消费意愿形成双重压力。
              </p>
            </article>
            <article className="border border-border bg-black/55 px-4 py-4">
              <p className="font-mono text-[11px] text-slate-500">能源与军工</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                如果战争主线持续，能源和军工板块往往会先跑赢市场，是最直接的受益方向之一。
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <aside className="border border-border bg-panel px-4 py-4">
            <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blue-400">第五层 / 新闻与 AI 总结</p>
                <h2 className="mt-1 font-mono text-xl text-white">宏观新闻速读</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {impactFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setImpactFilter(filter)}
                    className={`border px-3 py-2 text-[11px] transition ${
                      impactFilter === filter
                        ? "border-blue-500/40 bg-accent-soft text-blue-300"
                        : "border-border bg-black/55 text-slate-500 hover:border-blue-500/30 hover:text-slate-300"
                    }`}
                  >
                    {impactLabel(filter)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredMacroNews.map((item) => (
                <article key={item.id} className="border border-border bg-black/60 px-4 py-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] text-slate-500">{item.time}</span>
                    <span className="font-mono text-[10px] text-blue-300">{item.category}</span>
                  </div>
                  <p className="text-sm leading-7 text-slate-100">{item.headlineZh ?? item.headline}</p>
                  <p className="mt-3 text-xs leading-6 text-slate-500">原文来源：{item.source}</p>
                </article>
              ))}
            </div>
          </aside>

          <section className="border border-border bg-panel px-4 py-4 lg:px-6">
            <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-blue-400">AI 总结与风险矩阵</p>
                <h2 className="mt-1 font-mono text-xl text-white">把复杂信息压缩成结论</h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-400">
                这里是整张板子的结论层。前面几层是事实，这一层是可以直接指导理解和决策的总结。
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <article className="border border-blue-500/20 bg-[linear-gradient(180deg,rgba(59,130,246,0.12),rgba(0,0,0,0.04))] px-4 py-4">
                <p className="font-mono text-[11px] text-blue-300">一句话结论</p>
                <p className="mt-3 text-base leading-8 text-slate-100">{data.thesis}</p>
                <div className="mt-4 grid gap-3">
                  {data.insightCards.map((card) => (
                    <div key={card.title} className="border border-border bg-black/45 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-sm text-white">{card.title}</p>
                        <span className="font-mono text-[10px] text-blue-300">{card.emphasis}</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{card.detail}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="border border-border bg-black/55 px-4 py-4">
                <p className="font-mono text-[11px] text-slate-500">风险情景</p>
                <div className="mt-4 space-y-3">
                  {data.riskScenarios.map((scenario) => (
                    <div key={scenario.title} className="border border-border bg-white/[0.02] px-3 py-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <p className="font-mono text-sm text-white">{scenario.title}</p>
                        <span className="font-mono text-xs text-blue-400">{scenario.probability}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{scenario.marketImpact}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{scenario.positioning}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
