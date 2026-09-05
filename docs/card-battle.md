# 字灵秘境

入口 `/card-battle?lesson=g5v1-l01`；首页和练习中心会传入当前课文。页面按课加载原题，支持五年级上册全部26课。服务端题目适配保留原选项、答案和解析，排除书写、多选和无文本选项的题目。

## 战斗

每回合选择法术牌，答对才会施法。守关者提前显示下一次行动。攻击、护盾、治疗、冷却和连续正确加伤构成策略。三名Boss生命96/128/160，玩家生命100，过关恢复24；生命归零可重开，三关完成获胜。战斗不会写入正式学习过关记录；刷新页面会重开。

输入：鼠标/触屏点选，数字1–5选择，Enter继续，Escape暂停。手机手牌横向滑动。选课会重新开局。音效可关闭；系统减少动态效果设置会关闭剧烈动画。暂停、玩法和选课对话框包含焦点限制及返回焦点。

## 结构

- `app/lib/card-battle.ts`：题目适配与纯状态转换。
- `app/card-battle/page.tsx`：按课服务端加载。
- `app/card-battle/card-battle.tsx`：交互、渲染和事件音效。
- `public/card-battle/battle.css`：本路由加载的样式，避免增大原有学习页面的共享CSS。
- `public/card-battle/*.webp`：原创生成的场景、人物、Boss和法术画作。

采用CSS 2.5D卡牌，未引入WebGL引擎。所有生成资产均为不透明插画，以画框裁切呈现。三关使用独立背景、色调和Boss。下一关背景与Boss提前加载，过关时使用入场动画。16个环境光点和短时施法粒子；没有每帧React状态更新。音效由Web Audio合成，用户手势解锁，组件卸载时关闭。

## 验证

`node --test tests/card-battle.test.mjs` 覆盖26课真实题库、重复提交保护、反击、护盾/治疗、冷却、三关胜利、失败重开。

构建检查：`npm run build`、`npm run check`、`npm run check:bundle`；全量本地单元测试 `npm run test:unit`。

浏览器实际输入已覆盖13回合通关、7次答错失败、暂停恢复、重开、选课、手机最后一张牌和答题，以及320/390/768/844/1440宽度。性能数字仅为本地Chromium观测，不代表所有实体手机表现。

## 原创资产

内置imagegen生成，WebP压缩。未使用炉石传说或游戏王的角色、商标或卡框。图片提示词围绕原创东方幻想书卷、古金、墨绿、法术与灵兽。

| 文件 | 题材 |
| --- | --- |
| arena.webp | 遗忘之森：古老森林书院，中央圆形战台 |
| arena-2.webp | 月隐冰庭：蓝银月光与冰封书院 |
| arena-3.webp | 烬日天阙：赤金云海与凤凰天宫 |
| boss-1.webp | 墨羽书灵：书页、鹿角、墨羽构成的灵兽 |
| boss-2.webp | 月蚀霜龙：东方霜龙、银鳞、月光 |
| boss-3.webp | 烬日神凰：赤金羽翼与凤凰 |
| hero.webp | 持灵笔、书卷的青绿披风唤字师 |
| card-ember.webp | 火羽法术 |
| card-aegis.webp | 玉金守护结界 |
| card-thunder.webp | 雷霆剑光 |
| card-bloom.webp | 生息灵莲 |
| card-star.webp | 星河天仪 |

Tripo/Gemini/ElevenLabs凭证探测均为MISSING，因此图片使用内置imagegen；没有调用这些提供方，也没有将密钥放入运行时代码。
