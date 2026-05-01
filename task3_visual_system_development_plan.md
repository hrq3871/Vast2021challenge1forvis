# VAST 2021 MC1 Task 3 可交互可视化系统开发计划

## 0. 绝对路径契约（给执行 Agent 必读）

后续执行本计划时，所有路径都以本节为准。不要让执行 Agent 自己猜测数据目录，也不要把 `MC1` 外层目录和内层数据目录混用。

### 0.1 根目录

| 名称 | 绝对路径 | 用途 |
|---|---|---|
| `PROJECT_ROOT` | `D:\HKUST\5005 Data visualization\project-vast2021` | 项目总目录，包含参考 PPT 和 MC1 工作区 |
| `WORKSPACE_ROOT` | `D:\HKUST\5005 Data visualization\project-vast2021\MC1` | 当前工作区目录 |
| `RAW_DATA_ROOT` | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1` | 原始 MC1 数据目录，所有数据读取从这里开始 |
| `CODE_ROOT` | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\code` | 本可视化系统代码目录 |
| `PLAN_DOC` | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\task3_visual_system_development_plan.md` | 本开发计划文档 |
| `REFERENCE_PPT` | `D:\HKUST\5005 Data visualization\project-vast2021\Team8_The_GAStech_Files_Visualizing_the_Threads_Behind_the_Kidnappings.pptx` | 前期 PPT，主要参考 Task 3 交互构思 |

### 0.2 原始数据绝对路径

| 数据 | 绝对路径 | 读取目的 |
|---|---|---|
| 员工记录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\EmployeeRecords.xlsx` | 员工身份、部门、职位、服役经历 |
| 邮件头 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\email headers.csv` | 内部通信网络、异常主题传播 |
| GAStech 组织结构 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\GAStechKronos-org-chart.pdf` | 官方层级和部门 baseline |
| Kronos factbook | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\FACTBOOK-Kronos.docx` | 国家背景、经济与环境背景 |
| Tethys factbook | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\FACTBOOK-Tethys.docx` | Tethys 背景与 GAStech 母国背景 |
| Kronos 地图 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\A Map of Kronos.jpg` | 地理参考，可用于地点视图 |
| 历史文档目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\HistoricalDocuments` | POK 起源、历史动机、个人关系 |
| 10 年历史文档 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\HistoricalDocuments\10 year historical document clean.docx` | POK 起源、创始人、早期政府/GAStech 互动 |
| 5 年分析报告 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\HistoricalDocuments\5 year report clean.docx` | POK 演变、Vann 关系、风险评估 |
| 简历目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\resumes` | 员工履历、过去组织、军事经历 |
| 新闻目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\News Articles` | 新闻事件、绑架线索、媒体证据 |
| 答题模板目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\AnswerSheet` | 如需后续嵌入最终结果时参考 |

### 0.3 已有任务 1/2 结果绝对路径

本系统不重建第 1/2 问页面，但可读取这些结果用于证据权重和偏见提示。

| 数据 | 绝对路径 | 用途 |
|---|---|---|
| 任务 1 结果目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\任务1完成后的结果` | source primary/derivative 结果与处理后的新闻 |
| 任务 1 readme | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\任务1完成后的结果\readme.md` | 理解任务 1 输出字段 |
| 任务 2 结果目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\任务2完成后的结果` | 新闻偏见结果 |
| 任务 2 readme | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\任务2完成后的结果\readme.md` | 理解偏见 CSV 字段 |
| source/entity bias | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\任务2完成后的结果\task2_bias\task2_source_entity_bias.csv` | 人物/组织偏见权重 |
| source/event bias | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\任务2完成后的结果\task2_bias\task2_source_event_bias.csv` | 事件框架强度 |
| source/place bias | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\MC1\任务2完成后的结果\task2_bias\task2_source_place_bias.csv` | 地点偏见权重 |

### 0.4 代码与中间产物绝对路径

| 产物 | 绝对路径 |
|---|---|
| 前端入口 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\index.html` |
| 前端源码目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\src` |
| 数据处理脚本目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\scripts` |
| 前端读取数据目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\public\data` |
| 构建输出目录 | `D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\dist` |

执行脚本时建议在代码中显式声明：

```python
from pathlib import Path

PROJECT_ROOT = Path(r"D:\HKUST\5005 Data visualization\project-vast2021")
WORKSPACE_ROOT = PROJECT_ROOT / "MC1"
RAW_DATA_ROOT = WORKSPACE_ROOT / "MC1"
CODE_ROOT = WORKSPACE_ROOT / "code"
DATA_OUT = CODE_ROOT / "public" / "data"
```

所有 Python 脚本必须只从 `RAW_DATA_ROOT`、任务 1/2 结果目录和 `REFERENCE_PPT` 读取；只向 `D:\HKUST\5005 Data visualization\project-vast2021\MC1\code\public\data` 写入中间数据。

### 0.5 UI/UX Pro Max Skill 绝对路径

后续执行 Agent 在实现任何页面、组件、图表、交互或视觉样式前，必须先读取并遵守该 skill：

```text
C:\Users\头头\.codex\skills\ui-ux-pro-max\SKILL.md
```

可选查询工具：

```bash
python "C:\Users\头头\.codex\skills\ui-ux-pro-max\scripts\search.py" "network graph timeline evidence dashboard" --domain chart --max-results 8 --format markdown
python "C:\Users\头头\.codex\skills\ui-ux-pro-max\scripts\search.py" "dark analytical dashboard" --domain style --max-results 5 --format markdown
python "C:\Users\头头\.codex\skills\ui-ux-pro-max\scripts\search.py" "dashboard accessibility chart interaction" --domain ux --max-results 8 --format markdown
```

本项目采用该 skill 的设计原则：

- 可访问性优先：文本对比度至少 4.5:1，所有按钮/筛选器/节点操作支持键盘访问。
- 触控目标：所有按钮、tab、chip、筛选器点击区域不小于 44x44px，间距至少 8px。
- 图表不能只靠颜色表达：关系强度同时使用线型、标签、图例和 tooltip。
- 动效必须服务理解：150-300ms，使用 opacity/transform，尊重 `prefers-reduced-motion`。
- 数据密集但不拥挤：主图留足操作空间，证据面板负责承载文字细节。

## 1. 建设目标

本系统只服务 Mini-Challenge 1 的第 3 问，不重复构建第 1/2 问结果页面。目标是做一个可交互的数据可视化分析系统，帮助用户从原始数据出发，逐步识别 `GAStech`、`POK`、`APA`、`Government` 之间的官方关系、非官方关系、个人关系和共同目标，并能在录屏视频中展示“如何通过可视分析找到结论”。

系统最终应支持三类分析路径：

1. 官方关系路径：`GAStech <-> Kronos Government`
2. 冲突与动机路径：`POK <-> GAStech/Government`
3. 绑架假设路径：`Sanjorge 作为目标/动机核心`、`Vann/POK 作为潜在内部桥接`、`APA/Arise 作为弱外部风险线索`

本开发计划关注“可视化系统代码如何构建”，不是最终答题报告。

## 2. 推荐技术栈

### 2.1 前端

使用 `Vite + D3.js`。

自然语言解释：

Vite 用来搭建本地浏览器应用，方便开发、刷新、调试和最终打包。D3.js 用来实现知识图谱、时间线、邮件网络和交互筛选。该系统本质上仍是一个前端静态应用，不需要后端和数据库。

技术口径：

- `Vite`：负责本地 dev server、模块加载、最终 `dist/` 打包。
- `D3.js`：负责 force-directed graph、timeline scale、arc/network layout、brush/filter、tooltip、linked highlighting。
- `CSS`：统一界面布局和视觉系统。
- `JSON/CSV`：作为前端读取的中间数据格式。

### 2.2 数据处理

使用 `Python + pandas + openpyxl + python-docx + pypdf + networkx`。

自然语言解释：

原始数据格式分散，包括 Excel、CSV、PDF、DOCX、TXT。先用 Python 将它们整理成统一的数据表，再交给 D3 展示。这样前端代码只负责呈现和交互，不负责复杂清洗。

技术口径：

- `pandas`：读取 CSV、整理表格、生成边表。
- `openpyxl`：读取 `EmployeeRecords.xlsx`。
- `python-docx` 或解压 DOCX XML：读取简历、历史文档和 factbook。
- `pypdf`：读取组织结构 PDF 的文本。
- `networkx`：计算网络中心性、社群、边权重。
- 输出到 `public/data/*.json` 和 `public/data/*.csv`。

## 3. 建议工程目录

在 `code/` 下建设系统：

```text
code/
  task3_visual_system_development_plan.md
  package.json
  vite.config.js
  index.html
  scripts/
    build_task3_data.py
    extract_news.py
    extract_documents.py
    extract_emails.py
    extract_employees.py
  public/
    data/
      employees.json
      org_edges.json
      news_articles.json
      historical_claims.json
      relationship_nodes.json
      relationship_edges.json
      timeline_events.json
      email_edges.json
      evidence_items.json
      hypotheses.json
  src/
    main.js
    state.js
    dataLoader.js
    styles.css
    views/
      relationshipGraph.js
      timelineView.js
      emailNetwork.js
      evidencePanel.js
      hypothesisExplorer.js
      searchPanel.js
    utils/
      entityNormalize.js
      filters.js
      evidenceScoring.js
      colors.js
```

## 4. 数据解释与处理设计

### 4.1 EmployeeRecords.xlsx

自然语言解释：

该表说明 GAStech 员工的正式身份，包括姓名、邮箱、部门、职位、入职时间、出生地、公民身份和服役经历。它用于建立“官方员工身份”和“部门归属”。

技术口径：

读取 `Employee Records` sheet，生成 `employees.json`：

```json
{
  "id": "Isia.Vann@gastech.com.kronos",
  "name": "Isia Vann",
  "lastName": "Vann",
  "department": "Security",
  "title": "Perimeter Control",
  "email": "Isia.Vann@gastech.com.kronos",
  "birthCountry": "Kronos",
  "militaryService": "ArmedForcesOfKronos",
  "employmentStartDate": "2007-01-01"
}
```

处理重点：

- 用邮箱作为员工唯一 ID。
- 统一姓名格式，解决 `Mies Haber`、`Sanjorge Jr.`、`Vasco-Pais` 等复合姓名。
- 将 `CurrentEmploymentType` 映射为部门颜色。
- 将 `MilitaryServiceBranch` 标为潜在非正式关系线索，但不能单独作为结论。

### 4.2 GAStechKronos-org-chart.pdf

自然语言解释：

组织图是 GAStech 官方关系 baseline。它说明 Executive、Engineering、IT、Security、Facilities 等正式汇报关系。

技术口径：

解析 PDF 文本后人工或半自动映射为 `org_edges.json`：

```json
{
  "source": "Felix Resumir",
  "target": "Security Department",
  "relation": "group_manager_of",
  "evidenceType": "official_org_chart",
  "confidence": "confirmed"
}
```

处理重点：

- CEO、CFO、COO、CIO、ESA 属于 Executive。
- 白框人员是 administrative assistants。
- Security 部门中的 `Isia Vann`、`Edvard Vann`、`Loreto Bodrogi`、`Hennie Osvaldo`、`Minke Mies` 后续会与 POK 历史人物关系进行联动分析。

### 4.3 email headers.csv

自然语言解释：

邮件头数据没有正文，但有发件人、收件人、时间和主题。它适合做通信网络和异常主题传播分析，尤其是跨部门沟通、Security 内部沟通、IPO 管理邮件和 `ARISE` 邮件链。

技术口径：

读取编码使用 `cp1252`，展开 `To` 中的多收件人。生成 directed edge：

```json
{
  "source": "Ruscella.Mies.Haber@gastech.com.kronos",
  "target": "Isia.Vann@gastech.com.kronos",
  "datetime": "2014-01-13T16:48:00",
  "subject": "FW: ARISE - Inspiration for Defenders of Kronos",
  "weight": 1,
  "sourceDepartment": "Administration",
  "targetDepartment": "Security",
  "topic": "arise",
  "isAnomalous": true
}
```

过滤规则：

- 默认隐藏普通公告：`birthday`、`daily announcement`、`all staff`、`virus detected`、`service anniversaries`。
- 保留并突出：`ARISE`、`IPO`、`VIP visit`、`security procedures`、`missing`、`kidnapping`、`reporters`。
- 对同一发件人-收件人聚合边权重。
- 支持按日期、部门、主题筛选。

### 4.4 HistoricalDocuments/*.docx

自然语言解释：

历史文档解释 POK 为什么产生、如何从水污染抗议发展成反 GAStech 和反政府腐败运动。它也是个人关系证据的重要来源。

技术口径：

提取段落，按关键词和实体生成 `historical_claims.json`：

```json
{
  "claimId": "claim_isia_vann_pok",
  "entities": ["Isia Vann", "Juliana Vann", "Mandor Vann", "POK"],
  "relation": "family_and_pok_affiliation",
  "date": "2009",
  "sourcePath": "HistoricalDocuments/5 year report clean.docx",
  "snippet": "Isia Vann ... older brother of Juliana Vann ... nephew to Mandor Vann ... advocate for a more forceful approach...",
  "confidence": "confirmed"
}
```

关键抽取对象：

- POK 起源：Elodis、Tiskele River、水污染、GAStech drilling。
- POK 创始人：Henk Bodrogi、Carmine Osvaldo、Jeroen Karel、Valentine Mies 等。
- 目标演变：clean water -> government accountability/corruption -> anti-GAStech。
- Vann 关系：Juliana Vann、Mandor Vann、Isia Vann。
- GAStech/政府关系：政府保护 GAStech、POK 指控腐败与勾结。

### 4.5 News Articles/**/*.txt

自然语言解释：

新闻数据提供事件时间线、不同媒体叙事和绑架当天线索。第 3 问不需要重做第 1/2 问，但需要借用新闻来源分类和偏见判断来决定证据可信度。

技术口径：

解析每篇新闻：

```json
{
  "articleId": "International News/689.txt",
  "source": "International News",
  "title": "GAStech's Sanjorge Escapes Kidnapping at GAStech HQ",
  "published": "2014-01-21",
  "entities": ["Sanjorge", "GAStech", "Kronos", "Government"],
  "topics": ["kidnapping", "sanjorge", "executive"],
  "sourceRole": "Primary/Derivative/Unknown",
  "biasWeight": 0.72
}
```

关键词组：

- 绑架：`kidnapped`, `missing`, `ransom`, `abducted`, `escaped kidnapping`
- Sanjorge：`Sanjorge`, `CEO`, `IPO`, `executive`, `government reception`
- POK：`Protectors of Kronos`, `POK`, `terrorist`, `rally`, `protest`
- APA：`Asterian People's Army`, `APA`, `Arise`, `drug trafficking`
- 政府：`Government`, `President`, `Minister`, `police`, `reception`

### 4.6 任务 1/2 结果的使用方式

自然语言解释：

任务 1/2 的成果不作为页面重建目标，只作为证据质量控制。比如某个新闻来源偏见很强，那么它的说法在系统里不能单独作为 confirmed evidence。

技术口径：

- 读取 source role：`Primary / Derivative / Unknown`
- 读取 source/entity/event/place bias。
- 给证据添加 `sourceReliabilityWeight`。
- 多个低偏或 primary-like 来源重复出现的关系，证据等级提高。

## 5. 核心数据模型

### 5.1 节点

```json
{
  "id": "person_sanjorge",
  "label": "Sten Sanjorge Jr.",
  "type": "person",
  "group": "GAStech",
  "role": "CEO",
  "importance": 0.95
}
```

节点类型：

- `person`
- `organization`
- `event`
- `place`
- `document`
- `topic`

### 5.2 关系边

```json
{
  "source": "person_sanjorge",
  "target": "org_government",
  "relation": "official_partnership",
  "evidenceIds": ["ev_1993_deal", "ev_2014_reception"],
  "confidence": "confirmed",
  "visualStyle": "solid"
}
```

关系类型：

- `official_partnership`
- `employment`
- `department_membership`
- `conflict`
- `shared_goal`
- `family_or_personal_link`
- `email_contact`
- `media_claim`
- `hypothesis_link`

证据强度：

- `confirmed`：原文直接说明。
- `probable`：多源共同支持，但不是直接证明。
- `hypothesis`：同姓、共现、可疑邮件等弱线索。

## 6. 可视化页面设计

### 6.0 视觉方向与参考模板

本系统不是普通课程表格页，应做成“调查分析工作台”。视觉目标是：专业、紧张、清晰、可追溯，类似情报分析界面，但不能做成低可读性的赛博朋克装饰页面。

推荐风格：

- 主风格：`Data-Dense Analytical Dashboard + Dark Mode`
- 视觉语气：深色调查工作台、证据卡片、路径高亮、时间线推理
- 背景：深黑蓝或近黑灰，不使用大面积紫蓝渐变
- 强调色：Amber 用于当前推理路径，Cyan 用于信息/邮件，Red 用于冲突/绑架，Green 用于 confirmed evidence
- 字体：系统优先使用清晰无衬线；数字、日期、证据编号可使用 monospace
- 图标：使用 `lucide` 或内联 SVG，不使用 emoji
- 卡片圆角：不超过 8px，避免营销风大圆角卡片
- 布局：左侧导航 + 中央主图 + 右侧证据面板 + 底部时间线，保持分析工具感

### 6.0.1 现成参考页面与模板

执行 Agent 应参考下面页面的交互结构和图表实现方式，但不要直接复制视觉皮肤。

| 用途 | 参考页面/模板 | 如何借鉴 |
|---|---|---|
| 主知识图谱 | [Observable D3 Force-directed Graph](https://observablehq.com/@d3/force-directed-graph) | 借鉴 force graph 的 node/link 数据结构、drag、tick update；用于 `relationshipGraph.js` |
| D3 力导向 API | [D3 d3-force 文档](https://d3js.org/d3-force) | 使用 `forceSimulation`、`forceLink`、`forceManyBody`、`forceCollide` 控制节点布局 |
| 缩放/平移 | [D3 d3-zoom 文档](https://d3js.org/d3-zoom) | 主图、邮件网络和时间线都要支持 zoom/pan 或 reset zoom |
| 时间范围刷选 | [D3 d3-brush 文档](https://d3js.org/d3-brush) | 底部时间线实现 brush，联动过滤图谱和邮件网络 |
| 邮件弧线图 | [Observable D3 Arc Diagram](https://observablehq.com/@d3/arc-diagram) | 借鉴一维节点排列 + 弧线连接，用于 `ARISE` 邮件传播链 |
| Arc 入门模板 | [D3 Graph Gallery Arc Basic](https://d3-graph-gallery.com/graph/arc_basic.html) | 作为 arc diagram 最小实现参考，适合先快速跑通邮件网络 |
| 网络图模板集合 | [D3 Graph Gallery Network](https://d3-graph-gallery.com/network.html) | 借鉴 tooltip、drag、highlight neighbor 等常见交互 |
| 流向/证据链 | [Observable D3 Sankey](https://observablehq.com/@d3/sankey/2) | 如后续需要展示“证据来源 -> 关系 claim -> 假设结论”的流向，可做 Sankey/Alluvial |
| Sankey 入门模板 | [D3 Graph Gallery Sankey](https://d3-graph-gallery.com/sankey.html) | 只在需要展示 evidence flow 时使用，不作为首屏主图 |
| 图表系统规范 | [IBM Carbon Data Visualization](https://carbondesignsystem.com/data-visualization/getting-started/) | 借鉴企业级数据可视化的图例、色彩、可访问性和空状态处理 |
| 可访问性验收 | [W3C WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) | 用于检查对比度、键盘访问、focus、非颜色表达 |
| 探索性图表库 | [Observable Plot](https://observablehq.com/plot/) | 小型辅助图表可参考 Plot 的简洁轴线、tooltip 和 faceting 思路 |

### 6.0.2 推荐页面布局

首屏布局采用固定工作台结构：

```text
┌──────────────────────────────────────────────────────────────┐
│ Top Bar: title, global search, hypothesis switch, reset       │
├──────────────┬───────────────────────────────────┬───────────┤
│ Left Rail    │ Main Canvas                        │ Evidence  │
│ - Overview   │ Relationship Graph / Email Network │ Panel     │
│ - Official   │                                   │ snippets  │
│ - POK motive │                                   │ source    │
│ - Email      │                                   │ confidence│
│ - Hypothesis │                                   │ actions   │
├──────────────┴───────────────────────────────────┴───────────┤
│ Bottom Timeline Brush: 1993 -> 2014                           │
└──────────────────────────────────────────────────────────────┘
```

响应式要求：

- 1440px 以上：三栏布局，右侧证据面板常驻。
- 1024-1439px：左侧 rail 缩成 icon + label，右侧证据面板可折叠。
- 768-1023px：主图在上，证据面板在下，时间线仍固定底部。
- 375-767px：不强求完整网络探索，但必须可查看 hypothesis cards、证据列表和简化邻接表。

### 6.0.3 页面级设计 token

建议在 `src/styles.css` 中先定义 token，不要在组件里散写 hex：

```css
:root {
  color-scheme: dark;
  --bg: #080b10;
  --surface: #101720;
  --surface-2: #16202b;
  --border: rgba(216, 230, 255, 0.14);
  --text: #edf3ff;
  --muted: #8f9db2;
  --accent-path: #f59e0b;
  --accent-info: #38bdf8;
  --accent-confirmed: #22c55e;
  --accent-conflict: #ef4444;
  --accent-hypothesis: #a78bfa;
  --radius-sm: 4px;
  --radius-md: 8px;
  --focus: 0 0 0 3px rgba(56, 189, 248, 0.35);
  --motion-fast: 150ms;
  --motion-base: 220ms;
}
```

### 6.0.4 图表 UI 细节要求

- 节点：不同类型使用 shape + color 双编码，例如 person=circle、organization=rounded rect、event=diamond、place=pin。
- 边：official 用 solid，probable 用 dashed，hypothesis 用 dotted；conflict 使用 red stroke，但仍保留线型差异。
- 高亮路径：当前假设路径使用 amber glow，但 glow 只用于 active path，不做全局装饰。
- Tooltip：hover 只显示短信息；完整证据必须在右侧 evidence panel。
- Legend：固定在主图左下角，必须说明颜色、线型、节点形状。
- Empty state：筛选无结果时显示“没有符合当前筛选的关系”，并提供 reset filter。
- Loading state：数据加载超过 300ms 显示 skeleton，不显示空白画布。
- Keyboard：`Tab` 可进入搜索、导航、hypothesis cards、证据列表；`Esc` 清除选中；`Enter` 激活当前 focused item。

### 6.1 总览知识图谱

参考 PPT 中的 “Hidden Relationships: Interactive Knowledge Graph”。

功能：

- 展示四类主体：GAStech、POK、APA、Government。
- 展示关键人物：Sanjorge、Isia Vann、Edvard Vann、Mandor Vann、Juliana Vann、Karel、Bodrogi、Osvaldo、Mies。
- 节点颜色表示组织归属。
- 边颜色表示关系类型。
- 边线型表示证据强度：实线 confirmed，虚线 probable，点线 hypothesis。
- 点击节点后，其一跳关系高亮，证据面板更新。

### 6.2 官方组织结构视图

参考 PPT 中的 “Official Baseline: Organizational Structure”。

功能：

- 展示 GAStech 的 Executive、Engineering、IT、Security、Facilities。
- 支持点击部门过滤邮件网络。
- 对 Security 部门做特殊标记，因为其与绑架、POK、Vann 线索关系最密切。

### 6.3 事件时间线

在 PPT 原始构思基础上优化为“关系证据时间线”。

功能：

- 时间范围从 1993 到 2014。
- 展示 Tiskele deal、POK 起源、Juliana Vann 死亡、POK 抗议升级、Karel 死亡、IPO、政府招待会、绑架。
- 点击事件会高亮知识图谱相关节点和边。
- 支持事件类型筛选：official deal、pollution conflict、protest、kidnapping、email anomaly。

### 6.4 邮件异常网络

参考 PPT 中的 “Anomalous Emails: Arc Diagram / Email Networks”。

功能：

- 默认显示过滤后的异常邮件网络。
- 重点突出 `FW: ARISE - Inspiration for Defenders of Kronos`：
  - Rachel Pantanal -> Ruscella Mies Haber
  - Ruscella Mies Haber -> Inga Ferro / Loreto Bodrogi / Isia Vann / Hennie Osvaldo / Minke Mies
  - 后续 Security group 内部回复链
- 支持按日期筛选，例如 2014-01-12 到 2014-01-13。
- 支持切换 `all emails / anomalous only / ARISE only / IPO only / Security only`。

### 6.5 证据面板

功能：

- 显示当前点击节点或边的所有证据。
- 每条证据包含：来源文件、日期、标题、原文片段、证据等级、偏见提示。
- 支持 “open source snippet” 展开上下文。
- 支持 “add to finding path” 将证据加入当前分析路径。

### 6.6 假设探索器

这是对 Sanjorge 问题的专门增强。

功能：

提供三条可切换的分析路径：

1. `Sanjorge as target / motive anchor`
2. `Isia Vann as personal bridge`
3. `APA / Arise as weak external risk`

点击某条路径后，系统自动：

- 高亮相关节点。
- 高亮相关事件。
- 展示证据链。
- 在底部生成一句当前假设总结。

## 7. Sanjorge 线索的处理方案

已有其他同学结果指向 Sanjorge，这条线索应纳入系统，而不是忽略。

### 7.1 Sanjorge 路径的自然语言解释

Sanjorge 是 GAStech CEO，也是 IPO 后最大受益者和公司-政府合作的象征。绑架前新闻反复提到他会参加 GAStech 会议和政府招待会；绑架后新闻出现 `Sanjorge escaped kidnapping`，并且 POK 声称索要赎金。这说明 Sanjorge 很可能是绑架事件中的高价值目标或动机中心。

### 7.2 Sanjorge 路径的技术口径

系统中将 Sanjorge 作为 `hypothesis_anchor`：

```json
{
  "hypothesisId": "h_sanjorge_target",
  "title": "Sanjorge as kidnapping target / motive anchor",
  "anchorNode": "person_sanjorge",
  "requiredEvidenceTopics": ["kidnapping", "IPO", "government_reception", "ransom"],
  "confidence": "probable"
}
```

证据来源包括：

- `GAStech's Sanjorge Escapes Kidnapping at GAStech HQ`
- `GASTECH LEADERSHIP CONFIRMED MISSING`
- `GAStech and Kronos Celebrate Partnership`
- `ransom demand from POK`
- IPO 管理邮件主题：`Managing perceptions about the IPO`

### 7.3 与 Isia Vann 路径的关系

Sanjorge 路径和 Isia Vann 路径不是互斥结论。

- Sanjorge 更适合作为“目标/动机中心”。
- Isia Vann 更适合作为“个人桥接/潜在内部关系线索”。
- APA/Arise 更适合作为“弱外部风险或意识形态线索”。

因此系统不预设唯一答案，而是让用户通过交互比较路径强弱。

## 8. 推荐分析操作流程

### 8.1 找 Sanjorge 路径

1. 打开系统首页。
2. 在搜索框输入 `kidnapping`。
3. 时间线自动定位到 2014-01-20 和 2014-01-21。
4. 点击绑架事件节点。
5. 证据面板显示 missing leadership、ransom、POK suspicion 等新闻。
6. 点击 `Sanjorge` 节点。
7. 系统高亮：
   - `Sanjorge -> GAStech`
   - `Sanjorge -> IPO`
   - `Sanjorge -> Government reception`
   - `Sanjorge -> escaped kidnapping`
8. 切换到 Hypothesis Explorer 的 `Sanjorge as target`。
9. 查看证据链是否足以支持“Sanjorge 是绑架目标或动机核心”。

### 8.2 找 GAStech 与政府官方关系

1. 点击 `Official Relations`。
2. 查看 1993 Tiskele Bend deal。
3. 查看政府授予 GAStech 开采权、税收、就业、本地基础设施建设。
4. 点击 2014 government reception。
5. 系统高亮 `GAStech -> Government` 的 official partnership 边。
6. 证据面板显示新闻和历史文档片段。

### 8.3 找 POK 动机路径

1. 点击 `POK Motivation`。
2. 时间线定位到 1997 Elodis 水污染。
3. 点击 `Juliana Vann`。
4. 查看 Juliana 与 POK martyrs、污染、GAStech drilling 的关系。
5. 点击 `Government accountability / corruption` topic。
6. 系统显示 POK 目标从 clean water 扩展到 anti-corruption。

### 8.4 找非官方个人关系

1. 点击 `Unofficial Ties`。
2. 筛选 `Security Department`。
3. 点击 `Isia Vann`。
4. 证据面板显示：
   - EmployeeRecords 中 Isia 是 GAStech Security。
   - Historical document 中 Isia 是 Juliana Vann 的哥哥、Mandor Vann 的侄子。
   - 历史文档提到 Isia 与 POK forceful approach。
5. 系统将该关系标为 confirmed personal bridge。

### 8.5 找 APA / Arise 弱线索

1. 点击 `Email Network`。
2. 选择 `ARISE only`。
3. 查看 `FW: ARISE - Inspiration for Defenders of Kronos` 的传播路径。
4. 点击 `APA` 节点。
5. 证据面板显示新闻中 APA 发布 `Arise`、并与 POK 一起被新闻专家列为 kidnapping risk。
6. 系统将该路径标为 weak/hypothesis，不写成已证实合作。

## 9. 开发步骤

### Step 1: 初始化前端工程

```bash
cd "D:\HKUST\5005 Data visualization\project-vast2021\MC1\code"
npm create vite@latest . -- --template vanilla
npm install
npm install d3
```

### Step 2: 编写数据预处理脚本

实现：

- `extract_employees.py`
- `extract_emails.py`
- `extract_documents.py`
- `extract_news.py`
- `build_task3_data.py`

输出所有前端需要的数据到 `public/data/`。

### Step 3: 开发数据加载层

实现 `src/dataLoader.js`：

- 并行加载所有 JSON。
- 校验必要字段。
- 建立 `nodeById`、`edgeById`、`evidenceById` 索引。

### Step 4: 开发全局状态

实现 `src/state.js`：

- 当前选中节点。
- 当前选中假设。
- 当前时间范围。
- 当前部门筛选。
- 当前主题筛选。
- 当前证据列表。

### Step 5: 开发知识图谱

实现 `relationshipGraph.js`：

- D3 force simulation。
- 支持 zoom、drag、hover、click。
- 支持根据全局筛选重绘。
- 支持高亮一跳关系。

### Step 6: 开发时间线

实现 `timelineView.js`：

- D3 time scale。
- 事件按类型分泳道。
- 点击事件联动图谱和证据面板。

### Step 7: 开发邮件网络

实现 `emailNetwork.js`：

- 支持 force graph 或 arc diagram。
- 默认展示异常邮件。
- 提供主题 toggle。
- 点击邮件边显示邮件主题、时间和参与人。

### Step 8: 开发证据面板

实现 `evidencePanel.js`：

- 显示 evidence snippets。
- 标记 confidence。
- 标记 source role 和 bias warning。
- 支持复制 evidence summary。

### Step 9: 开发假设探索器

实现 `hypothesisExplorer.js`：

- 三条路径卡片。
- 点击后自动设置筛选状态。
- 自动高亮相关节点、边、事件和证据。

### Step 10: 验证和录屏准备

验证三条演示路径：

- Sanjorge 绑架目标路径。
- GAStech-Government 官方利益联盟路径。
- POK/Vann/ARISE 非官方关系路径。

## 10. 验收标准

1. 系统只服务 Task 3，不重做 Task 1/2 页面。
2. 可以本地运行：`npm run dev`。
3. 可以打包：`npm run build`。
4. 知识图谱、时间线、邮件网络、证据面板可以联动。
5. 每条关键结论都能回溯到源文件和原文片段。
6. Sanjorge 路径可被完整交互复现。
7. Isia Vann 路径可被完整交互复现。
8. APA/Arise 路径被明确标记为 weak/hypothesis。
9. 所有 hypothesis 关系不能被显示成 confirmed。
10. 系统能支撑后续录制“如何一步步找到结果”的视频。
11. 实现页面前必须读取 `C:\Users\头头\.codex\skills\ui-ux-pro-max\SKILL.md`。
12. 主界面符合 `Data-Dense Analytical Dashboard + Dark Mode`，不能做成营销落地页。
13. 所有交互控件点击区域不小于 44x44px，间距不小于 8px。
14. 图表不能只用颜色表达信息，必须同时使用线型、形状、标签或图例。
15. 文本对比度至少达到 WCAG AA；focus ring 清晰可见。
16. 支持键盘基本操作：搜索、切换页面、选择 hypothesis、查看证据、清除选择。
17. 动效控制在 150-300ms，且支持 `prefers-reduced-motion`。
18. 移动端至少提供 hypothesis cards、证据列表和简化邻接表，不出现横向滚动。
