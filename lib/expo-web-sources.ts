export type WebSource = {
  name: string;
  url: string;
  sourceType: "平台";
  keywords: string[];
  preferredPathHints?: string[];
};

export const webSources: WebSource[] = [
  {
    name: "剑鱼标讯",
    url: "https://www.jianyu360.cn",
    sourceType: "平台",
    keywords: ["展台设计搭建", "展览设计搭建", "展位搭建", "海外展台", "国外展台", "欧洲展台", "美国展台"],
    preferredPathHints: ["detail", "bid", "notice"],
  },
  {
    name: "乙方宝",
    url: "https://www.yfbzb.com",
    sourceType: "平台",
    keywords: ["展台设计搭建", "展览展示", "会展搭建", "国外展台", "欧洲展台", "美洲展台"],
    preferredPathHints: ["detail", "invite", "bid"],
  },
  {
    name: "中国招标网",
    url: "https://www.bidcenter.com.cn",
    sourceType: "平台",
    keywords: ["展台设计搭建", "展览搭建", "特装搭建", "美国展台", "欧洲展台", "国外展台设计搭建"],
    preferredPathHints: ["news", "zb", "details"],
  },
  {
    name: "中国采购与招标网",
    url: "https://www.chinabidding.com.cn",
    sourceType: "平台",
    keywords: ["展台设计搭建", "展台搭建", "展览展示", "国外展台", "欧洲", "美国"],
    preferredPathHints: ["detail", "notice", "news"],
  },
  {
    name: "中国招标投标公共服务平台",
    url: "https://bulletin.cebpubservice.com",
    sourceType: "平台",
    keywords: ["展台设计搭建", "展览展示", "展位搭建", "国外展台", "欧洲展台", "美洲展台"],
    preferredPathHints: ["bulletin", "details"],
  },
  {
    name: "必联网招标",
    url: "https://www.ebnew.com",
    sourceType: "平台",
    keywords: ["展台设计搭建", "展台搭建", "展览搭建", "国外展台", "欧洲展台", "美国展台"],
    preferredPathHints: ["projects", "announcement", "notice"],
  },
  {
    name: "采招网",
    url: "https://www.bidchance.com",
    sourceType: "平台",
    keywords: ["展台设计搭建", "展览展示", "会展搭建", "海外展台", "美洲展台", "欧洲"],
    preferredPathHints: ["detail", "notice", "bid"],
  },
];

export const globalLeadKeywords = [
  "展台设计搭建",
  "展览设计搭建",
  "展位搭建",
  "特装搭建",
  "会展搭建",
  "展会设计",
  "展位设计",
  "展览展示",
  "国外展台",
  "海外展台",
  "欧洲展台",
  "美洲展台",
  "美国展台",
  "慕尼黑",
  "德国",
  "欧洲",
  "美国",
  "北美",
  "南美",
  "中东",
  "英国",
  "法国",
  "意大利",
  "西班牙",
  "荷兰",
  "SNEC",
  "Intersolar",
  "ees Europe",
  "RE+",
  "Solar Show",
  "The smarter E",
  "SPI",
  "World Future Energy Summit",
  "Booth Design",
  "Booth Construction",
  "Exhibition Booth",
  "Exhibition Stand",
  "Stand Design",
];
