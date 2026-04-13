import { companySources } from "@/lib/expo-company-sources";
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
  return [...unique.values()].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

function extractOfficialArticlesFromHtml(baseUrl: string, sourceName: string, company: string, keywords: string[], html: string) {
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const articles: LiveArticle[] = [];
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(html)) !== null) {
    const href = match[1];
    const text = stripHtml(match[2]);
    if (!href || text.length < 8 || text.length > 180) continue;

    const haystack = text.toLowerCase();
    const keywordHit = keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
    const companyHit = haystack.includes(company.toLowerCase());
    if (!keywordHit && !companyHit) continue;

    const snippet = html.slice(Math.max(0, match.index - 180), Math.min(html.length, match.index + match[0].length + 180));

    articles.push({
      title: text,
      description: stripHtml(snippet).slice(0, 220),
      publishedAt: inferDateFromSnippet(snippet),
      url: absoluteUrl(baseUrl, href),
      source: sourceName,
      sourceType: "官网",
      company,
    });
  }

  return articles;
}

async function fetchCompanyOfficialArticles() {
  const results = await Promise.all(
    companySources.map(async (source) => {
      try {
        const html = await fetchText(source.url);
        return extractOfficialArticlesFromHtml(source.url, source.sourceName, source.company, source.keywords, html);
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
  const officialHit = articles.find((article) => article.sourceType === "官网" && articleMatchesFeed(feed, article));
  if (officialHit) return officialHit;
  return articles.find((article) => articleMatchesFeed(feed, article)) ?? null;
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
    } satisfies FeedItem;
  });

  return {
    feeds,
    updatedAt: new Date().toISOString(),
    liveCount: feeds.filter((feed) => feed.isLive).length,
  };
}
