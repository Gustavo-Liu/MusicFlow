## ADDED Requirements

### Requirement: 用户可以上传乐谱图片
系统 SHALL 支持用户通过拍照或从相册选择图片的方式上传乐谱，支持 JPEG、PNG、HEIC 格式。

#### Scenario: 成功上传单张乐谱图片
- **WHEN** 用户选择一张图片文件并确认上传
- **THEN** 系统将图片保存并在乐谱列表中显示缩略图

#### Scenario: 不支持的文件格式被拒绝
- **WHEN** 用户上传非图片文件（如 .docx、.mp3）
- **THEN** 系统 SHALL 显示"仅支持图片格式（JPEG/PNG/HEIC）"错误，不保存文件

#### Scenario: 上传多页乐谱
- **WHEN** 用户连续上传多张图片作为同一乐谱的不同页
- **THEN** 系统将多张图片归组为一个乐谱文档，保持上传顺序

### Requirement: 乐谱图片可以导出为 PDF
系统 SHALL 将上传的乐谱图片（单页或多页）合并生成一个 PDF 文件，供用户下载保存。

#### Scenario: 单页乐谱导出 PDF
- **WHEN** 用户对单张乐谱图片触发"导出 PDF"操作
- **THEN** 系统生成包含该图片的单页 PDF 并提供下载

#### Scenario: 多页乐谱导出 PDF
- **WHEN** 用户对多页乐谱触发"导出 PDF"操作
- **THEN** 系统按顺序将所有图片合并为多页 PDF 并提供下载
