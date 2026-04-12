"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TradingViewSymbol = {
  label: string;
  symbol: string;
  description: string;
  layer: string;
};

const symbols: TradingViewSymbol[] = [
  {
    label: "原油",
    symbol: "TVC:UKOIL",
    description: "观察战争风险如何首先抬升国际原油价格。",
    layer: "大宗商品层",
  },
  {
    label: "黄金",
    symbol: "OANDA:XAUUSD",
    description: "观察避险需求与利率、美元之间的拉扯。",
    layer: "贵金属层",
  },
  {
    label: "美债利率",
    symbol: "TVC:US10Y",
    description: "观察长端利率如何把战争和通胀冲击传导到估值层。",
    layer: "利率政策层",
  },
  {
    label: "苹果",
    symbol: "NASDAQ:AAPL",
    description: "观察大市值科技股在利率冲击下的敏感度。",
    layer: "股票层",
  },
];

export function TradingViewWidget() {
  const [activeSymbol, setActiveSymbol] = useState(symbols[0]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const config = useMemo(
    () => ({
      autosize: true,
      symbol: activeSymbol.symbol,
      interval: "60",
      timezone: "Asia/Shanghai",
      theme: "dark",
      style: "1",
      locale: "zh_CN",
      withdateranges: true,
      allow_symbol_change: false,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      save_image: false,
      calendar: false,
      details: true,
      hotlist: false,
      studies: ["Volume@tv-basicstudies"],
      backgroundColor: "#000000",
      gridColor: "rgba(148,163,184,0.08)",
      watchlist: [],
      support_host: "https://www.tradingview.com",
    }),
    [activeSymbol.symbol],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container h-[420px] w-full";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget h-full w-full";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.innerHTML = JSON.stringify(config);

    widgetContainer.appendChild(widget);
    widgetContainer.appendChild(script);
    container.appendChild(widgetContainer);
  }, [config]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {symbols.map((item) => {
          const active = item.symbol === activeSymbol.symbol;

          return (
            <button
              key={item.symbol}
              type="button"
              onClick={() => setActiveSymbol(item)}
              className={`border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition ${
                active
                  ? "border-blue-500/40 bg-accent-soft text-blue-300"
                  : "border-border bg-black/55 text-slate-400 hover:border-blue-500/30 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
        <div className="border border-border bg-black/55 px-4 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
            当前图层
          </p>
          <p className="mt-2 font-mono text-lg text-white">{activeSymbol.layer}</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">{activeSymbol.description}</p>
        </div>

        <div className="border border-border bg-black/60 p-2">
          <div ref={containerRef} className="min-h-[420px] w-full" />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {symbols.map((item) => {
          const active = item.symbol === activeSymbol.symbol;

          return (
            <button
              key={`${item.symbol}-mini`}
              type="button"
              onClick={() => setActiveSymbol(item)}
              className={`border px-3 py-3 text-left transition ${
                active
                  ? "border-blue-500/40 bg-accent-soft"
                  : "border-border bg-black/55 hover:border-blue-500/30"
              }`}
            >
              <p
                className={`font-mono text-[10px] uppercase tracking-[0.24em] ${
                  active ? "text-blue-300" : "text-slate-500"
                }`}
              >
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.layer}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
