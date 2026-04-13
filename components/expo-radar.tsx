"use client";

import { useEffect, useMemo, useState } from "react";

type FeedItem = {
  id: number;
  co: string;
  coEn: string;
  seg: string;
  urg: "hot" | "active" | "upcoming";
  title: string;
  expo: string;
  expoDate: string;
  area: string;
  budget: string;
  deadline: string;
  pubDate: string;
  src: string;
  srcUrl: string;
  desc: string;
  tags: string[];
  region: "国内" | "海外";
  bidding?: boolean;
};

declare global {
  interface Window {
    sendPrompt?: (prompt: string) => void;
  }
}

const FEEDS: FeedItem[] = [
  { id: 1, co: "阳光电源", coEn: "Sungrow", seg: "逆变器/储能", urg: "hot", title: "SNEC 2026 展台特装搭建项目", expo: "SNEC PV&ES 2026 上海", expoDate: "2026.06.03-05", area: "~400㎡", budget: "¥200-350万", deadline: "2026.04.20", pubDate: "2026.04.08", src: "企业采购平台", srcUrl: "https://cn.sungrowpower.com", desc: "阳光电源SNEC 2026年度展台特装设计搭建，含主展台+储能展区，要求品牌视觉一致性，需提供3D效果图。", tags: ["特装搭建", "品牌展台", "双展区"], region: "国内" },
  { id: 2, co: "晶科能源", coEn: "JinkoSolar", seg: "光伏组件", urg: "hot", title: "Intersolar Europe 2026 展台搭建招标", expo: "Intersolar Europe 2026 慕尼黑", expoDate: "2026.05.14-16", area: "~200㎡", budget: "€150-250K", deadline: "2026.04.18", pubDate: "2026.04.05", src: "企业采购公告", srcUrl: "https://www.jinkosolar.com", desc: "晶科能源Intersolar Europe展位特装设计搭建，海外项目，需在慕尼黑本地搭建。", tags: ["海外展", "欧洲", "光伏"], region: "海外" },
  { id: 3, co: "宁德时代", coEn: "CATL", seg: "储能/动力电池", urg: "active", title: "2026年度展览服务框架采购", expo: "全年多展", expoDate: "2026全年", area: "框架", budget: "¥800-1500万/年", deadline: "2026.04.30", pubDate: "2026.04.01", src: "剑鱼标讯", srcUrl: "https://www.jianyu360.cn", desc: "宁德时代2026年度展览展示服务供应商入库采购，覆盖SNEC/CIBF/上海车展/国际储能展等。", tags: ["框架采购", "年度入库", "超大客户"], region: "国内" },
  { id: 4, co: "隆基绿能", coEn: "LONGi", seg: "光伏组件", urg: "active", title: "SNEC 2026 主展位设计搭建", expo: "SNEC PV&ES 2026 上海", expoDate: "2026.06.03-05", area: "~500㎡", budget: "¥300-500万", deadline: "2026.04.25", pubDate: "2026.04.03", src: "中国招标网", srcUrl: "https://www.bidcenter.com.cn", desc: "隆基绿能SNEC 2026主展位特装搭建，含BC技术展示区、氢能展区、产品互动体验区。", tags: ["特装搭建", "超大展位", "多展区"], region: "国内" },
  { id: 5, co: "特隆美", coEn: "Tecloman", seg: "储能系统", urg: "hot", title: "Smarter E 2026 慕尼黑展台搭建", expo: "Smarter E Europe 2026", expoDate: "2026.06.23-25", area: "170㎡", budget: "€80-120K", deadline: "2026.04.15", pubDate: "2026.03.20", src: "直接邀标", srcUrl: "https://www.tecloman.com", desc: "XpandExpo正在竞标！特隆美Smarter E慕尼黑展台设计搭建。", tags: ["海外展", "竞标中", "XpandExpo"], region: "海外", bidding: true },
  { id: 6, co: "特隆美", coEn: "Tecloman", seg: "储能系统", urg: "hot", title: "SNEC 2026 展台特装搭建", expo: "SNEC PV&ES 2026 上海", expoDate: "2026.06.03-05", area: "300㎡", budget: "¥120-180万", deadline: "2026.04.20", pubDate: "2026.03.25", src: "直接邀标", srcUrl: "https://www.tecloman.com", desc: "XpandExpo正在竞标！特隆美SNEC上海主展位特装搭建。", tags: ["特装搭建", "竞标中", "XpandExpo"], region: "国内", bidding: true },
  { id: 7, co: "海辰储能", coEn: "Hithium", seg: "储能电芯", urg: "active", title: "SNEC 2026 展台设计搭建比选", expo: "SNEC PV&ES 2026 上海", expoDate: "2026.06.03-05", area: "~200㎡", budget: "¥100-180万", deadline: "2026.04.22", pubDate: "2026.04.06", src: "乙方宝", srcUrl: "https://www.yfbzb.com", desc: "海辰储能SNEC展台特装搭建比选，储能电芯新势力展位。", tags: ["比选", "特装搭建", "新客户"], region: "国内" },
  { id: 8, co: "比亚迪储能", coEn: "BYD ESS", seg: "储能系统", urg: "active", title: "ees Europe 2026 展台搭建", expo: "ees Europe 2026 慕尼黑", expoDate: "2026.05.14-16", area: "~300㎡", budget: "€200-350K", deadline: "2026.04.25", pubDate: "2026.04.09", src: "企业采购平台", srcUrl: "https://www.byd.com", desc: "比亚迪储能事业部ees Europe展台特装搭建。", tags: ["海外展", "欧洲", "超大客户"], region: "海外" },
  { id: 9, co: "固德威", coEn: "GoodWe", seg: "逆变器", urg: "active", title: "Intersolar Europe 2026 展台搭建", expo: "Intersolar Europe 2026", expoDate: "2026.05.14-16", area: "~120㎡", budget: "€60-100K", deadline: "2026.04.20", pubDate: "2026.04.02", src: "企业采购", srcUrl: "https://www.goodwe.com", desc: "固德威Intersolar展台设计搭建，户用逆变器重点展示。", tags: ["海外展", "欧洲", "户用"], region: "海外" },
  { id: 10, co: "天合光能", coEn: "Trina Solar", seg: "光伏组件", urg: "upcoming", title: "RE+ 2026 美国展台搭建询价", expo: "RE+ 2026 美国", expoDate: "2026.09", area: "~150㎡", budget: "$80-150K", deadline: "2026.05.15", pubDate: "2026.04.10", src: "企业官网", srcUrl: "https://www.trinasolar.com", desc: "天合光能RE+ 2026美国展台设计搭建。", tags: ["海外展", "美国", "询价"], region: "海外" },
  { id: 11, co: "古瑞瓦特", coEn: "Growatt", seg: "逆变器", urg: "upcoming", title: "Solar Show Africa 2026 展台搭建", expo: "Solar Show Africa 2026", expoDate: "2026.10", area: "~80㎡", budget: "$30-50K", deadline: "2026.06.30", pubDate: "2026.04.12", src: "企业询价", srcUrl: "https://www.growatt.com", desc: "Growatt非洲太阳能展展台搭建。", tags: ["海外展", "非洲", "中小展位"], region: "海外" },
  { id: 12, co: "锦浪科技", coEn: "Solis", seg: "逆变器", urg: "upcoming", title: "Intersolar South America 2026", expo: "Intersolar SA 2026 巴西", expoDate: "2026.08", area: "~100㎡", budget: "$40-70K", deadline: "2026.05.30", pubDate: "2026.04.11", src: "企业询价", srcUrl: "https://www.ginlong.com", desc: "锦浪科技南美Intersolar展台设计搭建。", tags: ["海外展", "南美"], region: "海外" },
];

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

function StatCard({
  label,
  value,
  sub,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? `${color}12` : colors.card,
        borderRadius: 14,
        padding: "16px 18px",
        border: active ? `1.5px solid ${color}` : `1px solid ${colors.border}`,
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          borderRadius: "0 14px 0 60px",
          background: `${color}08`,
        }}
      />
      <div style={{ fontSize: 11, color: colors.sub, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color, fontFamily: "var(--font-mono)", letterSpacing: -1, lineHeight: 1 }}>
        {value}
      </div>
      {sub ? <div style={{ fontSize: 11, color: colors.muted, marginTop: 6 }}>{sub}</div> : null}
    </div>
  );
}

export function ExpoRadar() {
  const [filter, setFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [now, setNow] = useState("14:32");

  useEffect(() => {
    setNow(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  const filtered = useMemo(() => {
    let list = FEEDS;

    if (filter !== "all") list = list.filter((f) => f.urg === filter);
    if (regionFilter === "overseas") list = list.filter((f) => f.region === "海外");
    if (regionFilter === "domestic") list = list.filter((f) => f.region === "国内");
    if (regionFilter === "bidding") list = list.filter((f) => f.bidding);

    return [...list].sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));
  }, [filter, regionFilter]);

  const stats = useMemo(() => {
    const totalBudget = FEEDS.reduce((s, f) => s + fmtMoney(f.budget), 0);
    return {
      total: FEEDS.length,
      hot: FEEDS.filter((f) => f.urg === "hot").length,
      active: FEEDS.filter((f) => f.urg === "active").length,
      upcoming: FEEDS.filter((f) => f.urg === "upcoming").length,
      bidding: FEEDS.filter((f) => f.bidding).length,
      overseas: FEEDS.filter((f) => f.region === "海外").length,
      totalBudget: Math.round(totalBudget),
    };
  }, []);

  const overseasRatio = Math.round((stats.overseas / stats.total) * 100);
  const domesticCount = stats.total - stats.overseas;
  const latestPublishDate = useMemo(() => [...FEEDS].sort((a, b) => b.pubDate.localeCompare(a.pubDate))[0]?.pubDate ?? "", []);
  const todayNewCount = useMemo(() => FEEDS.filter((item) => item.pubDate === latestPublishDate).length, [latestPublishDate]);

  const actionBoard = useMemo(() => {
    const sorted = [...FEEDS].sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));

    return {
      thisWeek: sorted.filter((item) => daysLeft(item.deadline) > 3 && daysLeft(item.deadline) <= 10),
      pipeline: sorted.filter((item) => daysLeft(item.deadline) > 10).slice(0, 5),
    };
  }, []);

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
      items: [...FEEDS].sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline)).slice(0, 3),
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
      title: "区域分布",
      subtitle: "项目所属市场结构",
      tone: "#8B5CF6",
      stats: [
        { label: "国内展", value: `${domesticCount}` },
        { label: "国外展", value: `${stats.overseas}` },
        { label: "海外占比", value: `${overseasRatio}%` },
      ],
    },
  ] as const;

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
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#F8FAFC", margin: 0, letterSpacing: -0.5 }}>ExpoRadar</h1>
                <p style={{ fontSize: 13, color: "#94A3B8", margin: "6px 0 0", lineHeight: 1.4 }}>
                  新能源产业链 · 展览招标监控中心 · XpandExpo 接单看板
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>最近同步</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color: "#E2E8F0" }}>{now}</div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>2026.04.13</div>
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
          <StatCard label="今日新增" value={todayNewCount} sub={`最新录入日 ${latestPublishDate || "--"}`} color={colors.accent} />
          <StatCard label="国内展" value={domesticCount} sub="当前国内项目总数" color={colors.warn} active={regionFilter === "domestic"} onClick={() => setRegionFilter(regionFilter === "domestic" ? "all" : "domestic")} />
          <StatCard label="国外展" value={stats.overseas} sub={`海外占比 ${overseasRatio}%`} color={"#8B5CF6"} active={regionFilter === "overseas"} onClick={() => setRegionFilter(regionFilter === "overseas" ? "all" : "overseas")} />
          <StatCard label="预计发出" value={stats.upcoming} sub="提前布局项目" color={colors.ok} active={filter === "upcoming"} onClick={() => setFilter(filter === "upcoming" ? "all" : "upcoming")} />
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
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, padding: "3px 10px", borderRadius: 999, background: u.bg, color: u.dot, border: `1px solid ${u.border}` }}>{u.label}</span>
                          <Deadline d={f.deadline} />
                        </div>

                        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, marginBottom: 4 }}>{f.co}</div>
                        <div style={{ fontSize: 12, color: colors.muted, marginBottom: 14 }}>{f.coEn}</div>

                        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, minHeight: 64, marginBottom: 14 }}>{f.title}</div>

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
