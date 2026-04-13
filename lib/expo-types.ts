export type FeedItem = {
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
  isLive?: boolean;
  liveHeadline?: string;
  livePublishedAt?: string;
  liveSourceType?: "官网" | "平台" | "新闻聚合";
  liveEvidence?: string;
  recordType?: "既有项目" | "全网线索";
};

export type ExpoRadarPayload = {
  feeds: FeedItem[];
  updatedAt: string;
  liveCount: number;
};
