export type CompanySource = {
  company: string;
  url: string;
  sourceName: string;
  keywords: string[];
  matchers: string[];
  procurementKeywords?: string[];
  expoKeywords?: string[];
  preferredPathHints?: string[];
};

export const companySources: CompanySource[] = [
  {
    company: "阳光电源",
    sourceName: "阳光电源官网",
    url: "https://cn.sungrowpower.com/newsList",
    keywords: ["SNEC", "展会", "储能", "新品", "上海"],
    matchers: ["阳光电源", "sungrow", "snec"],
    procurementKeywords: ["招标", "采购", "供应商", "征集", "比选", "邀标"],
    expoKeywords: ["SNEC", "展会", "储能", "上海", "展台", "搭建"],
    preferredPathHints: ["news", "media", "article"],
  },
  {
    company: "晶科能源",
    sourceName: "晶科能源官网",
    url: "https://www.jinkosolar.com/news",
    keywords: ["Intersolar", "欧洲", "组件", "展会", "慕尼黑"],
    matchers: ["晶科能源", "jinkosolar", "intersolar"],
    procurementKeywords: ["招标", "采购", "tender", "rfp", "vendor"],
    expoKeywords: ["Intersolar", "Europe", "展会", "慕尼黑", "组件"],
    preferredPathHints: ["news", "press", "media"],
  },
  {
    company: "宁德时代",
    sourceName: "宁德时代官网",
    url: "https://www.catl.com/news/",
    keywords: ["储能", "展会", "论坛", "发布", "电池"],
    matchers: ["宁德时代", "catl", "储能"],
    procurementKeywords: ["招标", "采购", "供应商", "框架", "入库"],
    expoKeywords: ["储能", "展会", "论坛", "电池", "发布"],
    preferredPathHints: ["news", "media", "press"],
  },
  {
    company: "隆基绿能",
    sourceName: "隆基官网",
    url: "https://www.longi.com/cn/news/",
    keywords: ["SNEC", "BC", "氢能", "展会", "发布"],
    matchers: ["隆基", "longi", "snec"],
    procurementKeywords: ["招标", "采购", "供应商", "搭建", "征集"],
    expoKeywords: ["SNEC", "BC", "氢能", "展会", "展台", "搭建"],
    preferredPathHints: ["news", "media", "press"],
  },
  {
    company: "特隆美",
    sourceName: "特隆美官网",
    url: "https://www.tecloman.com/news",
    keywords: ["Smarter E", "SNEC", "储能", "展会", "慕尼黑"],
    matchers: ["特隆美", "tecloman", "smarter e", "snec"],
    procurementKeywords: ["招标", "采购", "邀标", "竞标", "搭建"],
    expoKeywords: ["Smarter E", "SNEC", "储能", "展会", "慕尼黑", "搭建"],
    preferredPathHints: ["news", "media", "article"],
  },
  {
    company: "海辰储能",
    sourceName: "海辰储能官网",
    url: "https://www.hithium.com/news",
    keywords: ["SNEC", "储能", "电芯", "展会", "发布"],
    matchers: ["海辰", "hithium", "snec"],
    procurementKeywords: ["招标", "比选", "采购", "供应商"],
    expoKeywords: ["SNEC", "储能", "电芯", "展会", "发布"],
    preferredPathHints: ["news", "media", "press"],
  },
  {
    company: "比亚迪储能",
    sourceName: "比亚迪官网",
    url: "https://www.byd.com/cn/news",
    keywords: ["储能", "欧洲", "ees", "展会", "发布"],
    matchers: ["比亚迪", "byd", "ees europe"],
    procurementKeywords: ["招标", "采购", "供应商", "邀标"],
    expoKeywords: ["储能", "ees", "Europe", "展会", "发布"],
    preferredPathHints: ["news", "media", "press"],
  },
  {
    company: "固德威",
    sourceName: "固德威官网",
    url: "https://en.goodwe.com/news",
    keywords: ["Intersolar", "欧洲", "逆变器", "展会", "户用"],
    matchers: ["固德威", "goodwe", "intersolar"],
    procurementKeywords: ["tender", "procurement", "vendor", "招标"],
    expoKeywords: ["Intersolar", "Europe", "逆变器", "展会", "户用"],
    preferredPathHints: ["news", "press", "media"],
  },
  {
    company: "天合光能",
    sourceName: "天合光能官网",
    url: "https://www.trinasolar.com/en-glb/resources/newsroom",
    keywords: ["RE+", "美国", "展会", "组件", "发布"],
    matchers: ["天合", "trina", "re+"],
    procurementKeywords: ["tender", "procurement", "招标", "采购"],
    expoKeywords: ["RE+", "美国", "展会", "组件", "发布"],
    preferredPathHints: ["news", "press", "newsroom"],
  },
  {
    company: "古瑞瓦特",
    sourceName: "古瑞瓦特官网",
    url: "https://www.growatt.com/media/news",
    keywords: ["Africa", "Solar Show", "展会", "逆变器", "发布"],
    matchers: ["古瑞瓦特", "growatt", "solar show"],
    procurementKeywords: ["tender", "招标", "采购", "vendor"],
    expoKeywords: ["Africa", "Solar Show", "展会", "逆变器", "发布"],
    preferredPathHints: ["news", "media", "press"],
  },
  {
    company: "锦浪科技",
    sourceName: "锦浪科技官网",
    url: "https://www.ginlong.com/news",
    keywords: ["South America", "Intersolar", "南美", "展会", "逆变器"],
    matchers: ["锦浪", "solis", "ginlong", "intersolar"],
    procurementKeywords: ["tender", "招标", "采购", "供应商"],
    expoKeywords: ["South America", "Intersolar", "南美", "展会", "逆变器"],
    preferredPathHints: ["news", "media", "press"],
  },
];
