"use client";

import { useEffect, useMemo, useState } from "react";
import { fallbackExpoFeeds } from "@/lib/expo-data";
import type { ExpoRadarPayload, FeedItem } from "@/lib/expo-types";

declare global {
  interface Window {
    sendPrompt?: (prompt: string) => void;
  }
}

const daysLeft = (d: string) => {
  if (!d || d.includes("全")) return 999;
  const p = d.split(".");
  if (p.length < 3) return 999;
  return Math.ceil((new Date(+p[0], +p[1] - 1, +p[2]).getTime() - new Date(2026, 3, 13).getTime()) / 864e5);
};

const fmtMoney = (b: string) => {
  const m = b.match(/[\d.]+/g);
  if (!m) return 0;
  return parseFloat(m[m.length - 1]);
};

const colors = {
  bg: "#F7F8FA",
  card: "#FFFFFF",
  accent: "#0066FF",
  accentLight: "#E8F0FE",
  hot: "#EF4444",
  hotBg: "#FEF2F2",
  hotBorder: "#FECACA",
  warn: "#F59E0B",
  warnBg: "#FFFBEB",
  warnBorder: "#FDE68A",
  ok: "#10B981",
  okBg: "#ECFDF5",
  okBorder: "#A7F3D0",
  muted: "#94A3B8",
  border: "#E2E8F0",
  text: "#0F172A",
  sub: "#64748B",
  light: "#F1F5F9",
};

const urgMap = {
  hot: { label: "紧急", dot: colors.hot, bg: colors.hotBg, border: colors.hotBorder },
  active: { label: "进行中", dot: colors.warn, bg: colors.warnBg, border: colors.warnBorder },
  upcoming: { label: "预告", dot: colors.ok, bg: colors.okBg, border: colors.okBorder },
};

const monitorSources = [
  { name: "剑鱼标讯", url: "https://www.jianyu360.cn", kw: "展台搭建 · 展览设计 · 特装搭建", status: "推荐" },
  { name: "乙方宝", url: "https://www.yfbzb.com", kw: "展览服务 · 展位制作 · 会议活动", status: "推荐" },
  { name: "中国招标网", url: "https://www.bidcenter.com.cn", kw: "新能源企业名 + 展览", status: "补充" },
  { name: "中国采购与招标网", url: "https://chinabidding.com.cn", kw: "展览展示 · 搭建施工", status: "补充" },
];

const industryLabels: Record<string, string> = {
  "光伏组件": "组件",
  "逆变器/储能": "逆变器/储能",
  "储能/动力电池": "储能/电池",
  "储能系统": "储能系统",
  "储能电芯": "储能电芯",
  "逆变器": "逆变器",
};

function Deadline({ d }: { d: string }) {
  const n = daysLeft(d);

  if (n <= 7) {
    return <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: colors.hot }}>{n}d</span>;
  }

  if (n <= 14) {
    return <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: colors.warn }}>{n}d</span>;
  }

  return <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: colors.ok }}>{n}d</span>;
}

function SignalCard({
  title,
  value,
  sub,
  tone,
  active,
  onClick,
}: {
  title: string;
  value: number | string;
  sub: string;
  tone: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 156,
        padding: "22px 20px",
        borderRadius: 18,
        textAlign: "left",
        border: active ? `1.5px solid ${tone}` : "1px solid rgba(255,255,255,0.09)",
        background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.045)",
        boxShadow: active ? `0 0 0 1px ${tone}18 inset` : "0 10px 28px rgba(15,23,42,0.16)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -26,
          right: -22,
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tone}16 0%, transparent 72%)`,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ fontSize: 13, color: "#B6C2D2", letterSpacing: 0.2, marginBottom: 14, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 44, lineHeight: 1, fontWeight: 700, letterSpacing: -1.8, color: tone, fontFamily: "\"JetBrains Mono\", var(--font-mono)", marginBottom: 10 }}>
          {value}
        </div>
        <div style={{ marginTop: "auto", fontSize: 12, color: "#94A3B8", lineHeight: 1.45 }}>{sub}</div>
      </div>
    </button>
  );
}

function RadarMark() {
  return (
    <div
      style={{
        position: "relative",
        width: 56,
        height: 56,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 8,
          borderRadius: "50%",
          border: "3px solid #19f0ba",
          boxShadow: "0 0 18px rgba(25,240,186,0.22)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 8,
          animation: "radarSpin 4.5s linear infinite",
          transformOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            borderRadius: "50%",
            background: "#19f0ba",
            boxShadow: "0 0 10px rgba(25,240,186,0.9)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 3,
            height: 18,
            marginLeft: -1.5,
            marginTop: -2,
            background: "linear-gradient(180deg, rgba(25,240,186,0.95), rgba(25,240,186,0.35))",
            borderRadius: 999,
            transformOrigin: "50% 2px",
            transform: "rotate(28deg)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 4,
          bottom: 6,
          width: 18,
          height: 10,
          borderLeft: "4px solid #19f0ba",
          borderBottom: "4px solid #19f0ba",
          borderBottomLeftRadius: 14,
          transform: "rotate(-12deg)",
          opacity: 0.95,
          animation: "radarTail 3.6s ease-in-out infinite",
          transformOrigin: "100% 100%",
        }}
      />
    </div>
  );
}

function formatSyncDate(dateLike: string) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "----.--.--";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function ExpoRadar({ initialPayload }: { initialPayload?: ExpoRadarPayload }) {
  const [filter, setFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [now, setNow] = useState("14:32");
  const [feeds, setFeeds] = useState<FeedItem[]>(initialPayload?.feeds ?? fallbackExpoFeeds);
  const [updatedAt, setUpdatedAt] = useState(initialPayload?.updatedAt ?? new Date().toISOString());
  const [liveCount, setLiveCount] = useState(initialPayload?.liveCount ?? 0);

  useEffect(() => {
    setNow(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  useEffect(() => {
    if (!initialPayload) return;
    setFeeds(initialPayload.feeds);
    setUpdatedAt(initialPayload.updatedAt);
    setLiveCount(initialPayload.liveCount);
  }, [initialPayload]);

  useEffect(() => {
    let aborted = false;

    async function refresh() {
      try {
        const response = await fetch("/api/expo-radar", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as ExpoRadarPayload;
        if (aborted) return;
        setFeeds(payload.feeds);
        setUpdatedAt(payload.updatedAt);
        setLiveCount(payload.liveCount);
      } catch {
        // Keep the current board state when live refresh fails.
      }
    }

    const timer = window.setInterval(refresh, 5 * 60 * 1000);
    return () => {
      aborted = true;
      window.clearInterval(timer);
    };
  }, []);

  const filtered = useMemo(() => {
    let list = feeds;

    if (filter !== "all") list = list.filter((f) => f.urg === filter);
    if (regionFilter === "overseas") list = list.filter((f) => f.region === "海外");
    if (regionFilter === "domestic") list = list.filter((f) => f.region === "国内");
    if (regionFilter === "bidding") list = list.filter((f) => f.bidding);

    return [...list].sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));
  }, [feeds, filter, regionFilter]);

  const stats = useMemo(() => {
    const totalBudget = feeds.reduce((s, f) => s + fmtMoney(f.budget), 0);
    return {
      total: feeds.length,
      hot: feeds.filter((f) => f.urg === "hot").length,
      active: feeds.filter((f) => f.urg === "active").length,
      upcoming: feeds.filter((f) => f.urg === "upcoming").length,
      bidding: feeds.filter((f) => f.bidding).length,
      overseas: feeds.filter((f) => f.region === "海外").length,
      totalBudget: Math.round(totalBudget),
    };
  }, [feeds]);

  const overseasRatio = stats.total > 0 ? Math.round((stats.overseas / stats.total) * 100) : 0;
  const domesticCount = stats.total - stats.overseas;
  const latestPublishDate = useMemo(() => [...feeds].sort((a, b) => b.pubDate.localeCompare(a.pubDate))[0]?.pubDate ?? "", [feeds]);
  const todayNewCount = useMemo(() => feeds.filter((item) => item.pubDate === latestPublishDate).length, [feeds, latestPublishDate]);
  const industryStats = useMemo(() => {
    return Object.entries(
      feeds.reduce<Record<string, number>>((acc, item) => {
        acc[item.seg] = (acc[item.seg] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([segment, count]) => ({
        label: industryLabels[segment] ?? segment,
        value: `${count}`,
      }));
  }, [feeds]);

  const actionBoard = useMemo(() => {
    const sorted = [...feeds].sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));

    return {
      thisWeek: sorted.filter((item) => daysLeft(item.deadline) > 3 && daysLeft(item.deadline) <= 10),
      pipeline: sorted.filter((item) => daysLeft(item.deadline) > 10).slice(0, 5),
    };
  }, [feeds]);

  const projectRows = useMemo(() => {
    const rows: FeedItem[][] = [];
    for (let i = 0; i < filtered.length; i += 3) rows.push(filtered.slice(i, i + 3));
    return rows;
  }, [filtered]);

  const rightRailPanels = [
    {
      key: "focus",
      title: "今日焦点",
      subtitle: "最需要今天处理的项目",
      tone: colors.accent,
      items: [...feeds].sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline)).slice(0, 3),
    },
    {
      key: "week",
      title: "本周推荐",
      subtitle: "适合本周重点跟进",
      tone: colors.warn,
      items: actionBoard.thisWeek.slice(0, 3),
    },
    {
      key: "pipeline",
      title: "储备项目",
      subtitle: "适合提前准备素材",
      tone: colors.ok,
      items: actionBoard.pipeline.slice(0, 3),
    },
    {
      key: "region",
      title: "行业分布",
      subtitle: "项目所属业务赛道",
      tone: "#8B5CF6",
      stats: industryStats,
    },
  ] as const;

  const syncDate = formatSyncDate(updatedAt);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, padding: 24 }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", fontFamily: "'DM Sans', var(--font-sans)", color: colors.text }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
            borderRadius: 18,
            padding: "32px 28px 28px",
            marginBottom: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.18,
              backgroundImage:
                "linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.16) 50%, transparent 100%), repeating-linear-gradient(90deg, rgba(148,163,184,0.10) 0 1px, transparent 1px 64px), repeating-linear-gradient(180deg, rgba(148,163,184,0.10) 0 1px, transparent 1px 30px)",
              backgroundSize: "100% 220px, 100% 100%, 100% 100%",
              backgroundPosition: "0 -220px, 0 0, 0 0",
              animation: "heroVerticalScan 7s ease-in-out infinite, heroLineFloat 9s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.06,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.02) 40%, rgba(15,23,42,0.14))" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.ok, boxShadow: `0 0 8px ${colors.ok}` }} />
                  <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>System online</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: "#F8FAFC", margin: 0, letterSpacing: -0.5 }}>ExpoRadar</h1>
                  <RadarMark />
                </div>
                <p style={{ fontSize: 13, color: "#94A3B8", margin: "6px 0 0", lineHeight: 1.4 }}>
                  新能源产业链 · 展览招标监控中心 · XpandExpo 接单看板
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>最近同步</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color: "#E2E8F0" }}>{now}</div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{syncDate}</div>
                <div style={{ fontSize: 10, color: liveCount > 0 ? "#19f0ba" : "#475569", marginTop: 4 }}>{liveCount > 0 ? `${liveCount} 条实时命中` : "未命中实时资讯"}</div>
              </div>
            </div>

            <div className="expo-hero-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
              {[
                { label: "活跃招标", value: stats.hot + stats.active, color: "#F8FAFC", accent: colors.hot },
                { label: "正在竞标", value: stats.bidding, color: "#F8FAFC", accent: colors.accent },
                { label: "海外项目", value: stats.overseas, color: "#F8FAFC", accent: "#8B5CF6" },
                { label: "预估总额", value: `${stats.totalBudget}+`, color: "#F8FAFC", accent: colors.ok, unit: "万" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: s.accent, fontFamily: "var(--font-mono)", letterSpacing: -1 }}>{s.value}</span>
                    {"unit" in s ? <span style={{ fontSize: 11, color: "#64748B" }}>{s.unit}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { key: "all", label: "全部", count: stats.total },
              { key: "hot", label: "紧急", count: stats.hot, color: colors.hot },
              { key: "active", label: "进行中", count: stats.active, color: colors.warn },
              { key: "upcoming", label: "预告", count: stats.upcoming, color: colors.ok },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: filter === f.key ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: filter === f.key ? `${("color" in f ? f.color : colors.accent) ?? colors.accent}14` : colors.card,
                  border: filter === f.key ? `1.5px solid ${("color" in f ? f.color : colors.accent) ?? colors.accent}` : `1px solid ${colors.border}`,
                  color: filter === f.key ? (("color" in f ? f.color : colors.accent) ?? colors.accent) : colors.sub,
                }}
              >
                {"color" in f ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.color }} /> : null}
                {f.label}
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, opacity: 0.7 }}>{f.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[{ key: "all", label: "全部" }, { key: "domestic", label: "国内展" }, { key: "overseas", label: "海外展" }, { key: "bidding", label: "竞标中" }].map((r) => (
              <button
                key={r.key}
                onClick={() => setRegionFilter(r.key)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 10,
                  fontSize: 11,
                  cursor: "pointer",
                  background: regionFilter === r.key ? colors.text : "transparent",
                  color: regionFilter === r.key ? "#fff" : colors.sub,
                  border: regionFilter === r.key ? "none" : `1px solid ${colors.border}`,
                  fontWeight: regionFilter === r.key ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="expo-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 12, marginBottom: 20 }}>
          <SignalCard title="今日新增" value={todayNewCount} sub={`最新录入日 ${latestPublishDate || "--"}`} tone="#16A3FF" />
          <SignalCard title="国内展" value={domesticCount} sub="当前国内项目总数" tone="#F59E0B" active={regionFilter === "domestic"} onClick={() => setRegionFilter(regionFilter === "domestic" ? "all" : "domestic")} />
          <SignalCard title="国外展" value={stats.overseas} sub={`海外占比 ${overseasRatio}%`} tone="#2563EB" active={regionFilter === "overseas"} onClick={() => setRegionFilter(regionFilter === "overseas" ? "all" : "overseas")} />
          <SignalCard title="预计发出" value={stats.upcoming} sub="提前布局项目" tone="#10B981" active={filter === "upcoming"} onClick={() => setFilter(filter === "upcoming" ? "all" : "upcoming")} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 20 }}>
          {projectRows.map((row, rowIndex) => {
            const panel = rightRailPanels[rowIndex];

            return (
              <div key={`row-${rowIndex}`} className="expo-row-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 18, alignItems: "stretch" }}>
                {row.map((f) => {
                  const u = urgMap[f.urg];
                  const isExp = expanded === f.id;
                  const dl = daysLeft(f.deadline);

                  return (
                    <div
                      key={f.id}
                      onClick={() => setExpanded(isExp ? null : f.id)}
                      style={{
                        background: isExp ? "#FAFCFF" : colors.card,
                        borderRadius: 18,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: f.bidding ? `1.5px solid ${colors.accent}` : `1px solid ${colors.border}`,
                        transition: "all 0.2s",
                        position: "relative",
                        minHeight: 360,
                        boxShadow: isExp ? "0 8px 28px rgba(15,23,42,0.08)" : "none",
                      }}
                    >
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: u.dot, borderRadius: "18px 0 0 18px" }} />
                      <div style={{ padding: "18px 18px 18px 22px", display: "flex", flexDirection: "column", height: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, padding: "3px 10px", borderRadius: 999, background: u.bg, color: u.dot, border: `1px solid ${u.border}` }}>{u.label}</span>
                            {f.isLive ? (
                              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3, padding: "3px 10px", borderRadius: 999, background: "rgba(25,240,186,0.12)", color: "#089981", border: "1px solid rgba(25,240,186,0.35)" }}>
                                {f.liveSourceType === "官网" ? "官网命中" : "聚合命中"}
                              </span>
                            ) : null}
                          </div>
                          <Deadline d={f.deadline} />
                        </div>

                        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, marginBottom: 4 }}>{f.co}</div>
                        <div style={{ fontSize: 12, color: colors.muted, marginBottom: 14 }}>{f.coEn}</div>

                        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, minHeight: 64, marginBottom: 14 }}>{f.title}</div>
                        {f.liveHeadline ? (
                          <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 12, background: "rgba(0,102,255,0.06)", border: "1px solid rgba(0,102,255,0.12)" }}>
                            <div style={{ fontSize: 10, color: colors.accent, fontWeight: 700, letterSpacing: 0.3, marginBottom: 6 }}>实时资讯</div>
                            <div style={{ fontSize: 12, color: colors.sub, lineHeight: 1.6 }}>{f.liveHeadline}</div>
                          </div>
                        ) : null}

                        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                          {[
                            ["展会", f.expo],
                            ["预算", f.budget],
                            ["面积", f.area],
                            ["行业", f.seg],
                          ].map(([label, value]) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12 }}>
                              <span style={{ color: colors.muted }}>{label}</span>
                              <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                          {f.tags.slice(0, 2).map((tag) => (
                            <span key={tag} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, background: colors.light, color: colors.sub, fontWeight: 500 }}>
                              {tag}
                            </span>
                          ))}
                          <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, background: f.region === "海外" ? "#EDE9FE" : "#ECFDF5", color: f.region === "海外" ? "#7C3AED" : "#059669", fontWeight: 500 }}>
                            {f.region}
                          </span>
                        </div>

                        <div style={{ marginTop: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <a href={f.srcUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 12, padding: "8px 12px", borderRadius: 10, textDecoration: "none", background: colors.text, color: "#fff", fontWeight: 500 }}>
                            查看来源
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.sendPrompt?.(`针对「${f.co}」的「${f.title}」，帮我准备投标响应方案：展会${f.expo}，面积${f.area}，预算${f.budget}，包含设计理念、搭建方案、报价框架、项目时间线`);
                            }}
                            style={{ fontSize: 12, padding: "8px 12px", borderRadius: 10, background: colors.accent, color: "#fff", fontWeight: 500, border: "none" }}
                          >
                            生成方案 ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {panel ? (
                  <section style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 18, overflow: "hidden", minHeight: 360, display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "16px 18px", borderBottom: `1px solid ${colors.border}`, background: `${panel.tone}10` }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: panel.tone }}>{panel.title}</div>
                      <div style={{ marginTop: 4, fontSize: 11, color: colors.sub }}>{panel.subtitle}</div>
                    </div>
                    {"items" in panel ? (
                      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                        {panel.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setExpanded(item.id)}
                            style={{ textAlign: "left", border: `1px solid ${colors.border}`, background: colors.light, borderRadius: 14, padding: "12px 14px" }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                              <span style={{ fontSize: 12, fontWeight: 700 }}>{item.co}</span>
                              <Deadline d={item.deadline} />
                            </div>
                            <div style={{ marginTop: 6, fontSize: 12, color: colors.sub, lineHeight: 1.55 }}>{item.title}</div>
                            <div style={{ marginTop: 8, fontSize: 11, color: colors.muted }}>{item.expo}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                        {panel.stats.map((item) => (
                          <div key={item.label} style={{ padding: 14, borderRadius: 14, background: colors.light }}>
                            <div style={{ fontSize: 11, color: colors.muted }}>{item.label}</div>
                            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)", color: panel.tone }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ) : (
                  <div style={{ minHeight: 360 }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${colors.border}`, background: colors.card }}>
          <div style={{ padding: "16px 20px", background: colors.light, borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>数据源 · 监控设置</div>
              <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>在以下平台设置关键词订阅，实现自动推送</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.ok }} />
              <span style={{ fontSize: 11, color: colors.ok, fontWeight: 500 }}>3 源已配置</span>
            </div>
          </div>
          <div className="expo-source-grid" style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            {monitorSources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, background: colors.light, textDecoration: "none", color: colors.text, gap: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: colors.card, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: colors.accent, fontFamily: "var(--font-mono)" }}>
                    {s.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: colors.muted }}>关键词: {s.kw}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: s.status === "推荐" ? colors.accentLight : colors.light, color: s.status === "推荐" ? colors.accent : colors.muted, fontWeight: 500 }}>
                    {s.status}
                  </span>
                  <span style={{ fontSize: 12, color: colors.accent }}>→</span>
                </div>
              </a>
            ))}
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <button
              onClick={() => {
                window.sendPrompt?.("帮我制定ExpoRadar自动化监控技术方案：用Python脚本定时爬取招标平台的展览搭建类招标，筛选新能源企业，通过企业微信机器人/邮件自动推送通知，包含完整代码");
              }}
              style={{ width: "100%", padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: colors.text, color: "#fff", border: "none" }}
            >
              生成自动化监控方案 ↗
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
          @keyframes heroVerticalScan{0%{background-position:0 -220px,0 0,0 0}50%{background-position:0 calc(50% - 20px),0 -6px,0 10px}100%{background-position:0 calc(100% + 220px),0 0,0 0}}
          @keyframes heroLineFloat{0%{transform:translateY(0)}50%{transform:translateY(-10px)}100%{transform:translateY(0)}}
          @keyframes radarSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
          @keyframes radarTail{0%,100%{transform:rotate(-16deg) translateY(0)}50%{transform:rotate(8deg) translateY(2px)}}
          @media (max-width: 1100px) {
            .expo-row-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .expo-source-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 720px) {
            .expo-hero-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .expo-summary-grid { grid-template-columns: 1fr !important; }
            .expo-row-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 560px) {
            .expo-hero-stats { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
