## ADDED Requirements

### Requirement: 用户可以搜索与歌曲相关的 YouTube 视频
系统 SHALL 通过 `supermind-agent-v1` 搜索 YouTube，根据曲名和作曲家返回相关视频列表，帮助用户找到可以跟着练习的视频资源（包括范唱、范读、讲解、演奏等）。

#### Scenario: 搜索返回视频列表
- **WHEN** 用户在歌曲详情页触发"搜索视频"操作
- **THEN** 系统返回 5-8 条相关 YouTube 视频，每条展示：标题、频道名、简介

#### Scenario: 无相关视频时的处理
- **WHEN** 搜索无匹配结果或 AI 无法返回有效结果
- **THEN** 系统 SHALL 显示"未找到相关视频"提示

#### Scenario: 搜索失败时的处理
- **WHEN** 搜索请求失败（网络错误、AI 错误）
- **THEN** 系统 SHALL 显示具体错误提示，不崩溃

### Requirement: 搜索结果被缓存以避免重复请求
系统 SHALL 将搜索结果保存到数据库，同一歌曲 24 小时内复用缓存结果。

#### Scenario: 缓存命中时直接返回
- **WHEN** 用户打开视频 Tab 且该歌曲在 24 小时内已搜索过
- **THEN** 系统直接显示缓存结果，不发起新的 AI 请求

#### Scenario: 用户可以强制重新搜索
- **WHEN** 用户在已有结果时点击"重新搜索"
- **THEN** 系统发起新请求并更新缓存

### Requirement: 用户可以在应用内播放视频
系统 SHALL 允许用户在不离开应用的情况下直接播放所选 YouTube 视频（内嵌播放器）。

#### Scenario: 点击视频后内嵌播放
- **WHEN** 用户选择某条视频
- **THEN** 系统在页面内打开 YouTube 内嵌播放器播放该视频
