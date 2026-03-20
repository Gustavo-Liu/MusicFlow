## 1. 项目初始化

- [ ] 1.1 用 `create-next-app` 初始化 Next.js 项目（App Router，TypeScript）
- [ ] 1.2 安装依赖：Prisma、@prisma/client、openai、jsPDF、html2canvas
- [ ] 1.3 配置 Prisma + SQLite，创建数据库 schema（Song、Lyric、Translation、SheetMusic、Annotation 模型）
- [ ] 1.4 运行 `prisma migrate dev` 创建初始数据库
- [ ] 1.5 配置 `.env.local`，添加 `AI_BUILDER_TOKEN` 并创建共用 AI 客户端模块 `lib/ai.ts`（baseURL + apiKey）
- [ ] 1.6 搭建基础布局：导航栏 + 歌曲列表主页面（空状态 UI）

## 2. Song Management（歌曲管理）

- [ ] 2.1 创建 `Song` 数据库模型（id、title、composer、createdAt）
- [ ] 2.2 实现 POST `/api/songs` 接口：添加歌曲
- [ ] 2.3 实现 GET `/api/songs` 接口：获取歌曲列表（按 createdAt 倒序）
- [ ] 2.4 实现 DELETE `/api/songs/[id]` 接口：删除歌曲及关联数据
- [ ] 2.5 前端：添加歌曲表单（曲名 + 作曲家输入，提交后刷新列表）
- [ ] 2.6 前端：歌曲列表页，每条显示曲名、作曲家、删除按钮（含确认弹窗）
- [ ] 2.7 前端：点击歌曲跳转到歌曲详情页

## 3. Lyrics Search（歌词搜索）

- [ ] 3.1 实现 POST `/api/lyrics` 接口：调用 `supermind-agent-v1`，prompt 要求搜索"[曲名] [作曲家] lyrics"并返回完整原文歌词文本，保存到数据库
- [ ] 3.2 设计搜索 prompt：指示 supermind 返回纯文本歌词，保留分行，不含版权说明等无关内容
- [ ] 3.3 前端：歌曲详情页歌词 Tab，显示"搜索歌词"按钮 + loading 状态（supermind 响应约 5-15 秒）
- [ ] 3.4 前端：歌词搜索成功后展示原文（分行/分段），失败时显示错误 + 手动输入入口
- [ ] 3.5 前端：手动输入歌词的 textarea + 保存功能

## 4. Lyrics Translation（歌词翻译）

- [ ] 4.1 实现 POST `/api/translation` 接口：读取已保存歌词，调用 AI Builders chat completions（`grok-4-fast`），生成逐词翻译，保存结果
- [ ] 4.2 设计翻译 prompt：要求返回 JSON 数组 `[{"word": "原词", "translation": "中文"}]`，按原文分行分组
- [ ] 4.3 前端：歌词页面添加"获取逐词翻译"按钮（仅在歌词已保存时可用）
- [ ] 4.4 前端：翻译成功后展示逐词注解视图——每行原词下方显示对应中文，样式类似语言学习 app
- [ ] 4.5 前端：翻译失败时显示错误提示，原文保持正常可见

## 5. Reference Recordings（参考录音）

- [ ] 5.1 实现 GET `/api/recordings?songId=` 接口：调用 `supermind-agent-v1`，prompt 要求搜索 YouTube 上的"[曲名] [作曲家] vocal performance"，返回结构化视频列表（标题、URL、频道、简介）
- [ ] 5.2 设计搜索 prompt：要求 supermind 优先返回独唱范唱视频，过滤纯器乐/教程/混剪，以 JSON 格式输出
- [ ] 5.3 实现搜索结果缓存：结果保存到数据库，同一 songId 24 小时内复用，避免重复调用
- [ ] 5.4 前端：歌曲详情页"参考录音" Tab，显示视频卡片列表（标题 + 频道）+ loading 状态
- [ ] 5.5 前端：点击视频卡片，提取 YouTube 视频 ID，在页面内弹出内嵌播放器（`<iframe>`）

## 6. Sheet Music Upload（乐谱上传）

- [ ] 6.1 创建 `SheetMusic` 数据库模型（id、songId、pages: JSON 存储图片路径数组）
- [ ] 6.2 配置文件上传目录 `public/uploads/`（本地开发），确保 .gitignore 排除
- [ ] 6.3 实现 POST `/api/sheet-music` 接口：接收图片文件，保存到 `public/uploads/`，记录路径到数据库
- [ ] 6.4 前端：乐谱 Tab，提供"拍照 / 选择图片"上传按钮（支持多文件选择）
- [ ] 6.5 前端：上传后显示缩略图列表（按上传顺序），支持拖拽调整顺序
- [ ] 6.6 实现前端 PDF 导出：用 jsPDF + html2canvas 将图片列表生成 PDF 并触发下载

## 7. Sheet Music Annotation（乐谱标注）

- [ ] 7.1 创建 `Annotation` 数据库模型（id、sheetMusicId、pageIndex、type: comment|breath、x、y、content）
- [ ] 7.2 实现 POST `/api/annotations` 接口：创建标注
- [ ] 7.3 实现 GET `/api/annotations?sheetMusicId=` 接口：获取某乐谱的所有标注
- [ ] 7.4 实现 DELETE `/api/annotations/[id]` 接口：删除标注
- [ ] 7.5 前端：乐谱图片页，在 `<img>` 上叠加透明 `<div>` 点击层，记录点击的相对坐标（x%、y%）
- [ ] 7.6 前端：点击乐谱弹出选择菜单（添加评论 / 添加换气点）
- [ ] 7.7 前端：添加评论 → 弹出文字输入框，确认后在该位置显示评论标记（圆形气泡图标）
- [ ] 7.8 前端：添加换气点 → 直接在该位置显示换气符号（✓），无需文字输入
- [ ] 7.9 前端：点击已有标记可展开查看评论全文 / 删除该标注
- [ ] 7.10 前端：标注数据在页面加载时从 API 获取并恢复到对应位置

## 8. 部署

- [ ] 8.1 创建 Vercel 项目，连接 GitHub 仓库
- [ ] 8.2 将文件上传迁移到 Vercel Blob（安装 `@vercel/blob`，替换本地文件保存逻辑）
- [ ] 8.3 将 SQLite 迁移到 Vercel Postgres（或 Turso），更新 Prisma datasource
- [ ] 8.4 在 Vercel Dashboard 配置环境变量（`AI_BUILDER_TOKEN`、`BLOB_READ_WRITE_TOKEN`）
- [ ] 8.5 部署并在手机浏览器验证核心功能可用
