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
};

const COMPANY_MATCHERS = fallbackExpoFeeds.map((feed) => ({
  id: feed.id,
  co: feed.co,
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

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, next: { revalidate: 900 } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return (await response.json()) as T;
}

function normalizeArticles(articles: LiveArticle[]) {
  const unique = new Map<string, LiveArticle>();
  for (const article of articles) {
    if (!article.url || unique.has(article.url)) continue;
    unique.set(article.url, article);
  }
  return [...unique.values()].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

async function fetchGNewsArticles() {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    q: '"SNEC" OR "Intersolar" OR "ees Europe" OR "RE+" OR "solar show" OR "储能" OR "逆变器"',
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
    }));
}

function matchArticleToFeed(feed: FeedItem, articles: LiveArticle[]) {
  const matcher = COMPANY_MATCHERS.find((item) => item.id === feed.id);
  if (!matcher) return null;

  return (
    articles.find((article) => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      return text.includes(matcher.co.toLowerCase()) || text.includes(matcher.coEn) || text.includes(matcher.expo);
    }) ?? null
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
  const liveArticles = normalizeArticles([...(await fetchGNewsArticles().catch(() => [])), ...(await fetchNewsApiArticles().catch(() => []))]);

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
    } satisfies FeedItem;
  });

  return {
    feeds,
    updatedAt: new Date().toISOString(),
    liveCount: feeds.filter((feed) => feed.isLive).length,
  };
}
