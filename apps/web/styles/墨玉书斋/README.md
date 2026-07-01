# 墨玉书斋 · Ink & Jade Study

> **东方意境 + 现代化**的完美平衡
> 竹青外壳 + 米白纸面 + 玉色焦点 + 衬线大字 = 书斋式知识沉淀,但**不复古**

## 与"仙府云笺"的区别

| 维度 | 仙府云笺(老土) | **墨玉书斋(本项目适配版)** |
| --- | --- | --- |
| 字体 | STKaiti 行楷 + STLiti 隶书 | **Source Han Serif 衬线 + Sans** |
| 选中 | 朱砂"录"字方印(篆体) | **3px 竹青竖条 + 玉色背景** |
| 装饰 | 卷云 / "道"字底纹 / 竹简 | **无装饰,纯几何** |
| 调性 | 古风修仙(过载) | **书斋温润(克制)** |
| 侧栏 | 米黄底 | **竹青渐变 `#e5f0d9` → `#f3f8ec`** |
| 编辑区 | 米黄底 | **米白纸面 `#fffdf7`** |
| 批注 | 普通卡片 | **2px 玉色左边框("行间批注"语义)** |

## 视觉关键词

- **竹青外壳** — `#668e50` 竹青-500,降低深墨绿压迫感,带青绿生机
- **米白纸面** — `#fbf8ef` / `#f8f2e6` 米色系,长文阅读舒适
- **玉色焦点** — `#4d8064` 玉色-500,温润如玉,带书卷气
- **古铜点缀** — `#a9844e` 古铜,温润不刺眼
- **墨色文字** — `#151d17` 浓墨绿,文人气
- **朱砂印章** — `#b44736` 仅用于危险操作 / 印章红

## 5 项视觉特色(适配本项目结构)

| # | 特色 | 实现 | 适配 class |
| --- | --- | --- | --- |
| ① | **竹青侧栏** | `.kb-sidebar` 竹青渐变背景,`.icon-rail` 竹青外壳 | 本项目原有 class |
| ② | **玉色选中** | `.library-note-node.is-selected .library-row` 玉色背景 + 竹青竖条 | 本项目原有 class |
| ③ | **米纸编辑器** | `.kb-editor` 米白底,`.preview-rendered h1/h2` 衬线大字 | 本项目原有 class |
| ④ | **批注知识点** | `.knowledge-point-card` 2px 玉色左边框,行间批注感 | 本项目原有 class |
| ⑤ | **玉色焦点** | `.ui-input:focus` 玉色实线边 + 软晕,温润 | 本项目原有 class |

## 本项目适配关键

**保留了本项目 21 个 id**:
```
app, module-rail, global-search-shell, kb-workspace, kb-sidebar,
secondary-nav-toggle, folder-tree, note-tabs, editor-menu-bar,
editor-content, preview-content, kb-aside, aside-tabs, aside-content,
status-indicators, status-meta, library-context-menu,
library-section-menu, note-tab-menu, editor-context-menu,
markdown-import-input
```

**使用了本项目 30+ 个 class**:
- `.workspace-shell`、`.icon-rail`、`.rail-brand`、`.rail-item`
- `.top-bar`、`.top-bar-search`、`.top-bar-user`
- `.kb-workspace`、`.kb-sidebar`、`.kb-editor`、`.kb-aside`
- `.library-tree`、`.library-node`、`.library-row`、`.library-folder-node`、`.library-note-node`
- `.note-tab`、`.note-tab.is-active`、`.editor-menu-bar`、`.editor-content`
- `.preview-pane`、`.preview-rendered`、`.preview-lede`
- `.aside-tabs`、`.aside-tab`、`.aside-card`、`.aside-card-header`
- `.knowledge-point-list`、`.knowledge-point-card`、`.knowledge-point-tag`
- `.status-bar`、`.status-group`、`.status-inline`

**事件层与 controller 完全不破坏** — 所有 `data-*` 属性 / id 选择器都未变。

## 设计哲学

墨玉书斋的核心是"**温润如玉,不刺眼**":
- 不像仙府云笺那么"古风"——不用篆体、楷书、卷云
- 不像玄青那么"现代极简"——保留衬线大字、保留东方色彩
- 不像晨光纸笺那么"古铜温润"——竹青+玉色更清新
- 平衡在"东方意境"与"现代克制"之间

## 颜色映射(完整 9 类 token)

| 类别 | 关键 token | hex |
| --- | --- | --- |
| 竹青(主品牌) | `--color-bamboo-500` | `#668e50` |
| 玉色(强调) | `--color-jade-500` | `#4d8064` |
| 米纸(背景) | `--color-paper-50/100` | `#fffdf7` / `#f8f2e6` |
| 墨色(文字) | `--color-ink-200/300` | `#424b3c` / `#273127` |
| 古铜(点缀) | `--color-brass-500` | `#a9844e` |
| 朱砂(危险) | `--color-seal` | `#b44736` |
| 字体 | display=衬线 / body=无衬线 | Source Han Serif / Sans |
| 间距 | 8 基准 | 4/8/12/16/20/24/32/40/56/72 |
| 圆角 | 4/8/12/16/24/pill | 温和(中等圆角) |
| 阴影 | flat/paper/float/modal | 轻巧温润 |
| 焦点 | 玉色软晕 | `0 0 0 3px var(--color-jade-ring)` |

## 选完后

确认**墨玉书斋**为最终风格后,阶段 1 会按这个 token 体系重写 `tokens.css`,所有 9 类 token 完整落地。

未选中的 6 套 demo(晨光/光年/修远/学海/仙府/玄青)会在阶段 5 时**统一归档到 `docs/已归档/`**。
