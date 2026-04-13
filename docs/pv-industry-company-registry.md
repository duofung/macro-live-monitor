# 光伏能源行业官网监控清单

本清单用于 ExpoRadar 的官网优先监控策略。目标不是一次性覆盖全行业所有企业，而是先覆盖主流参展商、组件厂、逆变器厂、储能厂与薄膜路线企业，并为后续站点解析器扩展保留统一入口。

## 当前已纳入的核心企业

| 企业 | 赛道 | 官网资讯入口 | 监控重点 |
| --- | --- | --- | --- |
| 阳光电源 | 逆变器/储能 | https://cn.sungrowpower.com/newsList | SNEC、储能展区、招标、搭建 |
| 晶科能源 | 光伏组件 | https://www.jinkosolar.com/news | Intersolar、欧洲展、组件 |
| 宁德时代 | 储能/动力电池 | https://www.catl.com/news/ | 储能论坛、框架采购、年度入库 |
| 隆基绿能 | 光伏组件 | https://www.longi.com/cn/news/ | SNEC、BC、氢能、搭建 |
| 特隆美 | 储能系统 | https://www.tecloman.com/news | Smarter E、SNEC、竞标 |
| 海辰储能 | 储能电芯 | https://www.hithium.com/news | 储能、电芯、SNEC |
| 比亚迪储能 | 储能系统 | https://www.byd.com/cn/news | ees Europe、储能展会 |
| 固德威 | 逆变器 | https://en.goodwe.com/news | Intersolar、户用逆变器 |
| 天合光能 | 光伏组件 | https://www.trinasolar.com/en-glb/resources/newsroom | RE+、组件、美国展 |
| 古瑞瓦特 | 逆变器 | https://www.growatt.com/media/news | Solar Show Africa、逆变器 |
| 锦浪科技 | 逆变器 | https://www.ginlong.com/news | 南美 Intersolar、逆变器 |
| 爱旭股份 | 光伏组件/BC 技术 | https://aikosolar.com/en/news/ | ABC、SNEC、Intersolar |
| 华晟新能源 | 异质结/薄膜化场景 | https://www.huasunsolar.com/news/ | HJT、异质结、展会 |
| 正泰新能 Astronergy | 光伏组件 | https://www.astronergy.com/news/ | ASTRO、展会、招采词 |
| 阿特斯 | 光伏组件/储能 | https://investors.canadiansolar.com/news-releases/ | 模组、储能项目、合同 |
| 一道新能 | 光伏组件 | https://www.das-solar.com/en/site/news | DBC、N 型、展会 |
| 协鑫集成 | 光伏组件/系统集成 | https://en.gclsi.com/news_detail/ | SNEC、组件、采购 |
| First Solar | 薄膜组件 | https://investor.firstsolar.com/news/default.aspx | thin-film、CdTe、供应合同 |

## 当前抓取策略

1. 官网源优先于新闻聚合源。
2. 含“招标 / 采购 / 供应商 / 比选 / 邀标 / contract / procurement”等词的内容优先级最高。
3. 含“SNEC / Intersolar / ees / RE+ / 展会 / 展台 / 搭建”等词的内容次优先。
4. 同时命中品牌词、栏目路径词时，评分继续上升。

## 下一轮需要补的企业

- 通威股份 / 通威太阳能
- 东方日升
- TCL 中环
- 正泰电源 / 华为数字能源
- 上能电气
- 科华数能
- 派能科技
- 亿纬锂能
- 鹏辉能源
- 禾迈股份

## 下一轮需要做的事

1. 为重点企业写单站点解析器，而不是只靠通用锚点提取。
2. 把官网里的新闻、公告、采购、展会栏目做结构分层。
3. 抽取发布时间、栏目名、命中词、原文链接，作为项目卡的命中证据。
