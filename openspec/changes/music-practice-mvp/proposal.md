## Why

作为一名学习艺术歌曲的用户，目前没有一个整合工具来管理歌词、翻译、参考录音和乐谱笔记——需要在多个 app 和网站之间切换。这个 MVP 将把所有学习材料集中到一个专属的音乐练习笔记本中。

## What Changes

- 新增歌曲管理入口，用户可添加正在学习的艺术歌曲
- 新增歌词搜索功能，根据曲名自动获取原文歌词
- 新增歌词翻译功能，提供对应的中文翻译
- 新增参考录音搜索功能，搜索 YouTube 视频并根据标题/描述/评论筛选合适的范唱/范读
- 新增乐谱上传功能，支持拍照上传并保存为 PDF/图片格式
- 新增乐谱标注功能，可在乐谱上添加评论、标记换气点等练习笔记

## Capabilities

### New Capabilities

- `song-management`: 歌曲库管理——添加、浏览、删除正在学习的艺术歌曲条目
- `lyrics-search`: 歌词搜索——根据曲名和作曲家搜索获取原文歌词
- `lyrics-translation`: 歌词翻译——获取或生成艺术歌曲的中文逐词/逐句翻译
- `reference-recordings`: 参考录音搜索——搜索 YouTube，基于标题/描述/评论筛选适合跟练的范唱视频
- `sheet-music-upload`: 乐谱上传——拍照或上传图片，转换并保存为高质量 PDF
- `sheet-music-annotation`: 乐谱标注——在上传的乐谱上添加文字评论、标记换气点

### Modified Capabilities

（无现有 spec，全为新功能）

## Impact

- **前端**：Web 单页应用（React / Next.js），支持移动端拍照上传
- **后端**：需要 YouTube Data API v3（参考录音搜索）、歌词数据源 API 或爬虫、翻译 API（DeepL / Google Translate 或 LLM）
- **存储**：用户上传的乐谱图片/PDF 文件存储（本地或云存储）
- **依赖**：YouTube API key、歌词 API（如 Genius API）、翻译服务
- **用户范围**：单用户个人工具，无需多用户认证体系（MVP 阶段）
