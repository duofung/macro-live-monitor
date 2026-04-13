import { companySources, type CompanySource } from "@/lib/expo-company-sources";
import { fallbackExpoFeeds } from "@/lib/expo-data";
import type { ExpoRadarPayload, FeedItem } from "@/lib/expo-types";

type GNewsArticle = {
  title?: string;
  description?: string;
  publishedAt?: string;
  url?: string;
  source?: { name?: string };
};

type GNewsResponse = {
  articles?: GNewsArticle[];
};

type NewsApiArticle = {
  title?: string;
  description?: string;
  publishedAt?: string;
  url?: string;
  source?: { name?: string };
};

type NewsApiResponse = {
  articles?: NewsApiArticle[];
};

type LiveArticle = {
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  source: string;
  sourceType: "官网" | "新闻聚合";
  company?: string;
  score?: number;
  evidence?: string;
};

const COMPANY_MATCHERS = fallbackExpoFeeds.map((feed) => ({
  id: feed.id,
  co: feed.co.toLowerCase(),
  coEn: feed.coEn.toLowerCase(),
  expo: feed.expo.toLowerCase(),
}));

function formatDate(dateLike: string) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function htmlDecode(input: string) {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(input: string) {
  return htmlDecode(input.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function absoluteUrl(baseUrl: string, href: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

function inferDateFromSnippet(snippet: string) {
  const normalized = snippet.replace(/\//g, "-").replace(/\./g, "-");
  const match = normalized.match(/(20\d{2})-(\d{1,2})-(\d{1,2})/);
  if (!match) return new Date().toISOString();
  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, next: { revalidate: 900 } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return (await response.json()) as T;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; ExpoRadarBot/1.0; +https://vercel.app)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    next: { revalidate: 900 },
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.text();
}

function normalizeArticles(articles: LiveArticle[]) {
  const unique = new Map<string, LiveArticle>();
  for (const article of articles) {
    if (!article.url || unique.has(article.url)) continue;
    unique.set(article.url, article);
  }
  return [...unique.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

function countKeywordHits(text: string, keywords: string[] = []) {
  return keywords.reduce((count, keyword) => count + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function buildEvidence(parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" · ");
}

function scoreOfficialArticle(source: CompanySource, url: string, text: string, snippet: string) {
  const combined = `${text} ${snippet}`.toLowerCase();
  const procurementHits = countKeywordHits(combined, source.procurementKeywords);
  const expoHits = countKeywordHits(combined, source.expoKeywords ?? source.keywords);
  const matcherHits = countKeywordHits(combined, source.matchers);
  const pathHits = countKeywordHits(url.toLowerCase(), source.preferredPathHints);
  const score = procurementHits * 5 + expoHits * 3 + matcherHits * 2 + pathHits;

  return {
    score,
    evidence: buildEvidence([
      procurementHits > 0 ? `招采词 ${procurementHits}` : undefined,
      expoHits > 0 ? `展会词 ${expoHits}` : undefined,
      matcherHits > 0 ? `品牌词 ${matcherHits}` : undefined,
      pathHits > 0 ? `栏目命中 ${pathHits}` : undefined,
    ]),
  };
}

function extractOfficialArticlesFromHtml(source: CompanySource, html: string) {
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const articles: LiveArticle[] = [];
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(html)) !== null) {
    const href = match[1];
    const text = stripHtml(match[2]);
    if (!href || text.length < 8 || text.length > 180) continue;

    const haystack = text.toLowerCase();
    const keywordHit = source.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
    const companyHit = haystack.includes(source.company.toLowerCase());
    if (!keywordHit && !companyHit) continue;

    const snippet = html.slice(Math.max(0, match.index - 180), Math.min(html.length, match.index + match[0].length + 180));
    const cleanSnippet = stripHtml(snippet).slice(0, 220);
    const url = absoluteUrl(source.url, href);
    const { score, evidence } = scoreOfficialArticle(source, url, text, cleanSnippet);

    articles.push({
      title: text,
      description: cleanSnippet,
      publishedAt: inferDateFromSnippet(snippet),
      url,
      source: source.sourceName,
      sourceType: "官网",
      company: source.company,
      score,
      evidence,
    });
  }

  return articles;
}

async function fetchCompanyOfficialArticles() {
  const results = await Promise.all(
    companySources.map(async (source) => {
      try {
        const html = await fetchText(source.url);
        return extractOfficialArticlesFromHtml(source, html);
      } catch {
        return [];
      }
    }),
  );

  return results.flat();
}

async function fetchGNewsArticles() {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    q: '"SNEC" OR "Intersolar" OR "ees Europe" OR "RE+" OR "solar show" OR "battery storage" OR "inverter"',
    lang: "en",
    max: "20",
    sortby: "publishedAt",
    token: apiKey,
  });

  const data = await fetchJson<GNewsResponse>(`https://gnews.io/api/v4/search?${params.toString()}`);
  return (data.articles ?? [])
    .filter((article): article is Required<Pick<GNewsArticle, "title" | "publishedAt" | "url">> & GNewsArticle => Boolean(article.title && article.publishedAt && article.url))
    .map((article) => ({
      title: article.title!,
      description: article.description ?? article.title!,
      publishedAt: article.publishedAt!,
      url: article.url!,
      source: article.source?.name ?? "GNews",
      sourceType: "新闻聚合" as const,
      score: 1,
      evidence: "新闻聚合匹配",
    }));
}

async function fetchNewsApiArticles() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    q: '"SNEC" OR "Intersolar" OR "ees Europe" OR "RE+" OR "solar show" OR "battery storage" OR "inverter"',
    pageSize: "20",
    sortBy: "publishedAt",
    language: "en",
    apiKey,
  });

  const data = await fetchJson<NewsApiResponse>(`https://newsapi.org/v2/everything?${params.toString()}`);
  return (data.articles ?? [])
    .filter((article): article is Required<Pick<NewsApiArticle, "title" | "publishedAt" | "url">> & NewsApiArticle => Boolean(article.title && article.publishedAt && article.url))
    .map((article) => ({
      title: article.title!,
      description: article.description ?? article.title!,
      publishedAt: article.publishedAt!,
      url: article.url!,
      source: article.source?.name ?? "NewsAPI",
      sourceType: "新闻聚合" as const,
      score: 1,
      evidence: "新闻聚合匹配",
    }));
}

function articleMatchesFeed(feed: FeedItem, article: LiveArticle) {
  const matcher = COMPANY_MATCHERS.find((item) => item.id === feed.id);
  if (!matcher) return false;

  const text = `${article.title} ${article.description}`.toLowerCase();

  if (article.company && article.company === feed.co) return true;

  return text.includes(matcher.co) || text.includes(matcher.coEn) || text.includes(matcher.expo);
}

function matchArticleToFeed(feed: FeedItem, articles: LiveArticle[]) {
  return (
    articles
      .filter((article) => articleMatchesFeed(feed, article))
      .sort((a, b) => (b.sourceType === "官网" ? 100 : 0) + (b.score ?? 0) - ((a.sourceType === "官网" ? 100 : 0) + (a.score ?? 0)))[0] ?? null
  );
}

function inferUrgency(publishedAt: string, fallbackUrgency: FeedItem["urg"]) {
  const time = new Date(publishedAt).getTime();
  if (Number.isNaN(time)) return fallbackUrgency;
  const diffDays = Math.floor((Date.now() - time) / 86400000);
  if (diffDays <= 2) return "hot";
  if (diffDays <= 7) return "active";
  return fallbackUrgency;
}

export async function getExpoRadarPayload(): Promise<ExpoRadarPayload> {
  const officialArticles = await fetchCompanyOfficialArticles().catch(() => []);
  const newsArticles = normalizeArticles([...(await fetchGNewsArticles().catch(() => [])), ...(await fetchNewsApiArticles().catch(() => []))]);
  const liveArticles = normalizeArticles([...officialArticles, ...newsArticles]);

  const feeds = fallbackExpoFeeds.map((feed) => {
    const article = matchArticleToFeed(feed, liveArticles);
    if (!article) return feed;

    return {
      ...feed,
      urg: inferUrgency(article.publishedAt, feed.urg),
      pubDate: formatDate(article.publishedAt) || feed.pubDate,
      src: article.source || feed.src,
      srcUrl: article.url || feed.srcUrl,
      desc: article.description || feed.desc,
      isLive: true,
      liveHeadline: article.title,
      livePublishedAt: article.publishedAt,
      liveSourceType: article.sourceType,
      liveEvidence: article.evidence,
    } satisfies FeedItem;
  });

  return {
    feeds,
    updatedAt: new Date().toISOString(),
    liveCount: feeds.filter((feed) => feed.isLive).length,
  };
}
