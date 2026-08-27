# 知字微信原生小程序

这是与 Web 版同仓库维护的微信原生 TypeScript 客户端。页面使用 WXML/WXSS 重建，课程完整内容从现有 Sites API 按课加载并缓存在本机，进度、学习事件和录音继续写入现有 D1/R2。430 条正式旁白在构建时转为 32 kHz 单声道 AAC M4A，并作为不可变 Site 资源随同版本发布，避免依赖平台内部 R2 桶名。

- 仓库中的 `touristappid` 只是未绑定身份时的占位值；新版开发者工具可能拒绝它。导入后请使用你自己的小程序 AppID，或在开发者工具里明确创建测试号。
- 获得正式小程序 AppID 后，只需修改 `project.config.json` 的 `appid`。
- 正式联调前，需要在 Sites 后端配置 `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET`，并在微信公众平台添加合法的 request/download 域名。
- 课程索引由根目录 `npm run generate:miniprogram` 自动生成，不手工维护重复数据。
