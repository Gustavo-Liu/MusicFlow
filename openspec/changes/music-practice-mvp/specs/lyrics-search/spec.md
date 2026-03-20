## ADDED Requirements

### Requirement: 用户可以搜索艺术歌曲原文歌词
系统 SHALL 优先通过 `lyrics.ovh` API 搜索歌词（快速、无 key），找不到时 fallback 到 `supermind-agent-v1` 网页搜索，根据曲名和作曲家获取原文歌词。

#### Scenario: 搜索成功返回歌词
- **WHEN** 用户在某首歌曲的详情页触发"搜索歌词"操作
- **THEN** 系统从数据源获取歌词并在页面中展示，保留原文语言的排版（分节/分行）

#### Scenario: 主数据源未找到时 fallback
- **WHEN** `lyrics.ovh` 未找到歌词
- **THEN** 系统 SHALL 自动尝试 `supermind-agent-v1` 网页搜索作为后备，用户无感知

#### Scenario: 歌词未找到时的处理
- **WHEN** 所有数据源均无法找到对应歌词
- **THEN** 系统 SHALL 显示"未找到歌词"提示，并提供手动输入歌词的入口

#### Scenario: 搜索失败（网络/API 错误）
- **WHEN** 歌词搜索请求因网络或 API 错误失败
- **THEN** 系统 SHALL 显示错误信息，不展示空内容，保持页面可用状态

### Requirement: 歌词可以被保存到歌曲条目
系统 SHALL 将获取到的歌词持久化到对应歌曲的记录中，以便离线访问。

#### Scenario: 歌词自动保存
- **WHEN** 歌词搜索成功返回结果
- **THEN** 系统自动将歌词保存，用户下次打开该歌曲时无需重新搜索
