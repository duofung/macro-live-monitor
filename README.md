# ExpoRadar

面向专业投资者的宏观经济实时监测看板，采用 Next.js App Router 和 Tailwind CSS 构建。

## 项目定位

- 不做数据库存储，只做实时监测和前端展示
- 重点监测国际新闻、财经新闻、地缘冲突与跨资产联动
- 目标用户是希望快速看清“事件 -> 宏观变量 -> 资产价格”传导链条的专业投资者

## 当前功能

- 顶部宏观脉冲卡片：展示油价、黄金、10Y 利率、通胀预期等关键变量
- 实时新闻流：支持按影响级别和分类筛选
- AI 宏观因果链条：支持节点点击联动解读
- TradingView 图表区：支持 `Brent / Gold / US10Y / DXY` 快速切换
- AI 自动解读：根据新闻与宏观变量动态生成摘要、验证点和失效条件
- 风险矩阵与传导时间线：给专业投资者提供可执行的研究视角

## 推荐数据源

- `GDELT Project`: 地缘政治与全球事件
- `FRED API`: 美国宏观经济数据、利率和收益率曲线
- `GNews API` 或 `NewsAPI.org`: 国际财经新闻
- `Yahoo Finance` 或 `TradingView Widgets`: 资产报价和图表展示

## 当前已接入

- `FRED API`: 读取 WTI、黄金、10Y 利率、通胀预期等序列
- `GDELT DOC API`: 抓取地缘政治与能源相关新闻
- `GNews API`: 抓取宏观与财经 headline

页面通过 `app/api/dashboard/route.ts` 统一聚合数据，前端每 60 秒自动刷新一次，不做本地存储或数据库落地。

## 项目结构

```text
app/
  api/dashboard/route.ts      # 服务端聚合 API
  layout.tsx                  # 根布局
  page.tsx                    # 首页入口
components/
  dashboard-shell.tsx         # 主看板交互层
  tradingview-widget.tsx      # TradingView 图表组件
lib/
  dashboard-data.ts           # fallback 数据和静态配置
  dashboard-service.ts        # 实时数据聚合与动态解读逻辑
  dashboard-types.ts          # 类型定义
```

## 本地开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

然后填入你的免费 API Key。

如果你暂时没有配置 API Key，页面依然能运行，但会使用内置 fallback 数据。

推荐最少配置：

- `FRED_API_KEY`
- `GNEWS_API_KEY`

## 部署建议

GitHub 适合托管代码，不适合作为完整 Next.js 实时项目的最终运行环境。推荐方案：

1. 把代码推送到 GitHub 仓库
2. 用 Vercel 连接 GitHub 仓库自动部署
3. 在 Vercel 后台配置 `.env.local` 里的环境变量
4. 后续每次 push 到 GitHub 都会自动触发部署

## 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial macro dashboard"
git branch -M main
git remote add origin https://github.com/<your-name>/<repo>.git
git push -u origin main
```

## 在 Vercel 部署

1. 在 GitHub 创建仓库并推送代码
2. 打开 Vercel，点击 `Add New Project`
3. 选择这个 GitHub 仓库导入
4. Framework Preset 选择 `Next.js`
5. 在 Environment Variables 中配置：
   - `FRED_API_KEY`
   - `GNEWS_API_KEY`
   - `NEWS_API_KEY`（当前代码还没用到，后续可接）
6. 点击 Deploy

部署完成后，你就会得到一个线上可访问的实时宏观看板地址。

## GitHub 推送完整命令

如果你想从当前目录直接推送：

```bash
git init
git add .
git commit -m "Initial macro dashboard"
git branch -M main
git remote add origin https://github.com/<your-name>/<repo>.git
git push -u origin main
```

## 后续最值得继续做的增强

- 用真正的 LLM API 替换当前规则式 AI 解读
- 接入更多 FRED 指标，如 DXY 替代序列、失业率、期限利差
- 给 TradingView 增加联动 watchlist
- 增加市场 regime 历史回放和日内变化提示

## 为什么不直接部署到 GitHub Pages

GitHub Pages 更适合纯静态站点。这个项目虽然不存储数据，但依然需要：

- 动态拉取第三方新闻与宏观 API
- 在服务端安全保存 API Key
- 保持 Next.js App Router 的正常部署体验

因此更适合部署到 Vercel。
