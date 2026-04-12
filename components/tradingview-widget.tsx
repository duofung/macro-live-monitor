"use client";

import { useEffect, useId, useState } from "react";

type TradingViewSymbol = {
  label: string;
  symbol: string;
  description: string;
};

const symbols: TradingViewSymbol[] = [
  {
    label: "Brent",
    symbol: "TVC:UKOIL",
    description: "观察地缘风险如何快速反映在国际原油价格上。",
  },
  {
    label: "Gold",
    symbol: "OANDA:XAUUSD",
    description: "跟踪避险需求与实际利率、美元之间的拉扯。",
  },
  {
    label: "US10Y",
    symbol: "TVC:US10Y",
    description: "监测长端利率对通胀与风险偏好的再定价。",
  },
  {
    label: "DXY",
    symbol: "TVC:DXY",
    description: "观察美元强弱对全球资产的压制或缓和作用。",
  },
];

declare global {
  interface Window {
    TradingView?: {
      widget?: new (config: Record<string, unknown>) => unknown;
    };
  }
}

export function TradingViewWidget() {
  const containerId = useId().replace(/:/g, "");
  const [activeSymbol, setActiveSymbol] = useState(symbols[0]);
  const [isScriptReady, setIsScriptReady] = useState(false);

  useEffect(() => {
    if (window.TradingView?.widget) {
      setIsScriptReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-tradingview-script="embed-widget-advanced-chart"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => setIsScriptReady(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.dataset.tradingviewScript = "embed-widget-advanced-chart";
    script.onload = () => setIsScriptReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isScriptReady || !window.TradingView?.widget) {
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    container.innerHTML = "";

    const widgetHost = document.createElement("div");
    widgetHost.className = "tradingview-widget-container__widget h-full w-full";
    container.appendChild(widgetHost);

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.innerHTML =
      '<a href="https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/" rel="noopener nofollow" target="_blank"><span class="text-blue-300">Advanced chart</span></a> <span class="text-slate-500">by TradingView</span>';
    container.appendChild(copyright);

    new window.TradingView.widget({
      autosize: true,
      symbol: activeSymbol.symbol,
      interval: "60",
      timezone: "Asia/Shanghai",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#000000",
      gridColor: "rgba(148, 163, 184, 0.08)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      withdateranges: true,
      save_image: false,
      studies: ["Volume@tv-basicstudies"],
      container_id: containerId,
      support_host: "https://www.tradingview.com",
    });
  }, [activeSymbol, containerId, isScriptReady]);

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

      <p className="text-sm leading-6 text-slate-400">{activeSymbol.description}</p>

      <div className="border border-border bg-black/60 p-2">
        <div id={containerId} className="tradingview-widget-container h-[360px] w-full" />
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
              <p className={`font-mono text-[10px] uppercase tracking-[0.24em] ${active ? "text-blue-300" : "text-slate-500"}`}>
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
