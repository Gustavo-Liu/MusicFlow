## Context

这是一个单用户个人工具，目标用户是正在学习艺术歌曲的用户本人。MVP 阶段不需要多用户体系，优先快速可用。技术栈选择以"能部署、能用"为标准，不过度设计。

当前状态：项目从零开始，无遗留代码。

## Goals / Non-Goals

**Goals:**
- 构建可在手机浏览器正常使用的 Web 应用（响应式布局）
- 实现 6 个核心 capability 的基础功能（能用，不需要完美）
- 数据本地持久化，刷新后不丢失
- 外部 API 集成：AI Builders Space（统一入口，覆盖搜索+翻译）

**Non-Goals:**
- 多用户 / 账号体系（MVP 不需要）
- 离线模式 / PWA（后续可考虑）
- 移动 App（Web 先行）
- 自动化乐谱识别（OMR）/ 乐谱转 MIDI
- 音频录制和播放功能

## Decisions

### 1. 前端框架：Next.js (App Router)

**选择 Next.js 理由：**
- 同时支持 SSR 和客户端渲染，方便 API 路由集成（歌词/翻译 API 代理）
- 部署到 Vercel 零配置，个人项目合适
- 替代方案考虑：纯 React SPA（无 API 代理能力，CORS 问题多）、Remix（学习成本高，生态小）

### 2. 存储方案：本地 SQLite（通过 Prisma） + 文件系统

**选择理由：**
- MVP 单用户场景，SQLite 足够，无需额外服务
- 乐谱图片文件存储在服务器本地 `public/uploads/`
- 替代方案：PostgreSQL（过度复杂，需要单独数据库服务）、IndexedDB（纯前端，无法存大文件）
- **风险**：部署到 Vercel 时文件系统为只读 → 迁移方案见下方 Migration Plan

### 3. 歌词搜索 + 参考录音搜索：AI Builders `supermind-agent-v1`

**选择理由：**
- `supermind-agent-v1` 是内置 web search 的多工具 agent，可以自主搜索歌词来源和 YouTube 视频，无需单独注册 Genius API 或 YouTube Data API
- 通过标准 OpenAI SDK 调用（`base_url=https://space.ai-builders.com/backend/v1`），统一 API 入口
- 替代方案：Genius API（覆盖率有限，需额外 key）、YouTube Data API v3（配额限制，需额外 key）
- **降级策略**：supermind 搜索失败时，允许用户手动粘贴歌词

### 4. 歌词翻译：Google Translate API（逐行翻译）

**选择理由：**
- Google Translate REST API 响应极快（< 1s），远优于 LLM 方案（5-10s）
- 逐行翻译质量稳定，不存在 JSON 解析失败风险
- 使用现有 Google API key（`GOOGLE_API_KEY`），无需额外账号
- 替代方案：`gpt-5`（慢，有 JSON 解析问题）、DeepL（需单独注册）

### 5. AI 模型分工

| 任务 | 服务 | 理由 |
|------|------|------|
| 歌词搜索（主） | `lyrics.ovh` 免费 API | 快速，无 key，覆盖主流曲目 |
| 歌词搜索（fallback） | `supermind-agent-v1` | 冷门曲目兜底 |
| 视频搜索 | YouTube Data API v3 | < 1s，真实缩略图，有 YouTube key |
| 逐行翻译 | Google Translate 免费端点 | < 1s，无 key 限制 |

所有 AI 调用通过同一个 OpenAI SDK 实例：
```typescript
import OpenAI from 'openai'
const ai = new OpenAI({
  baseURL: 'https://space.ai-builders.com/backend/v1',
  apiKey: process.env.AI_BUILDER_TOKEN,
})
```

**supermind 响应提取规则：** `supermind-agent-v1` 会在 response content 中混入内部推理过程。必须在 prompt 末尾要求模型输出 `===OUTPUT===` 分隔标记，然后只取标记之后的内容。代码逻辑：`raw.slice(raw.indexOf('===OUTPUT===') + 12).trim()`，未找到标记时 fallback 到完整响应。

### 6. 乐谱标注：Canvas 覆盖层方案

**选择理由：**
- 在 `<img>` 上叠加透明 `<canvas>`，记录点击坐标的相对位置（%），不依赖乐谱分辨率
- 标注数据以 JSON 存储在数据库中（位置 x%、y%、类型、内容）
- 替代方案：SVG overlay（同等复杂度，Canvas 更熟悉）、fabric.js（功能过剩）

### 7. PDF 导出：jsPDF + html2canvas

**选择理由：**
- 纯前端生成，无需服务器端处理
- 替代方案：服务端 Puppeteer（重量级，部署复杂）

## Risks / Trade-offs

- **Vercel 文件存储**：Vercel serverless 环境文件系统为只读，图片上传无法直接存本地 → 短期 workaround：使用 Vercel Blob 或 Cloudinary 免费 tier；长期迁移到 S3
- **supermind-agent-v1 响应较慢**：搜索类 agent 响应时间 5-15 秒 → 前端显示 loading 状态，结果缓存到数据库（同一曲目 24 小时内复用）
- **supermind 搜索质量不稳定**：冷门艺术歌曲可能搜不到 → 手动输入歌词兜底
- **Canvas 标注在图片缩放时的位置偏移**：用相对坐标（%）可以规避大部分问题，但极端缩放比例下可能有偏差

## Migration Plan

**开发阶段（本地）：**
1. SQLite + 本地文件系统
2. 直接运行 `next dev`

**部署阶段（Vercel）：**
1. 将文件存储迁移到 Vercel Blob（`@vercel/blob`，免费 tier 1GB）
2. SQLite 换为 Vercel Postgres（免费 tier）或保留 SQLite 通过 Turso 托管
3. 环境变量配置：`AI_BUILDER_TOKEN`、`BLOB_READ_WRITE_TOKEN`

**回滚策略：** MVP 无需正式回滚流程，出问题直接 revert commit。

## Open Questions

- **逐词翻译的输出格式？** 需要测试 prompt 效果，确认最适合展示的 JSON 结构（如 `[{word, translation}]` 数组 vs 纯文本对照）
- **supermind 搜索 prompt 需要调优**：针对艺术歌曲的搜索 prompt（歌词来源、YouTube 视频筛选指令）需实际测试几首曲目后迭代
- **乐谱图片是否需要自动旋转/矫正？** 手机拍照可能歪斜，MVP 先跳过，后期可用 OpenCV.js 做客户端矫正
