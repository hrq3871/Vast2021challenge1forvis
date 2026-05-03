# VAST 2021 MC1 Task 3 Relationship Workbench

这是一个用于分析 VAST 2021 Mini-Challenge 1 Task 3 的交互式关系分析系统。系统围绕 GAStech、Kronos Government、Protectors of Kronos（POK）、Asterian People's Army（APA）以及关键人物，帮助使用者解释“官方关系”和“非官方关系”如何共同影响绑架事件的叙事。

系统的目标不是自动给出唯一结论，而是把员工记录、新闻、历史文档和邮件头数据整理成可点击、可追踪、可复核的证据网络。用户可以从组织关系、异常邮件、时间线或假设路径进入分析，并在右侧证据面板查看每个判断背后的来源。

## 适合回答的问题

- GAStech 与 Kronos Government 有哪些公开、正式、制度化的关系？
- POK 为什么与 GAStech 和政府形成冲突？
- Isia Vann 为什么是连接 GAStech Security 和 POK 叙事的关键人物？
- Sanjorge 为什么可能成为高价值目标？
- APA / ARISE 是确定参与者，还是只能作为弱风险信号？
- 哪些证据是直接确认的，哪些只是合理推测？

## 数据来源

系统使用原始材料生成前端 JSON 数据。普通用户运行网页时只需要 `public/data/*.json`，不需要重新读取原始文件。

### Employee Records

来源：`EmployeeRecords.xlsx`

含义：

- 记录 GAStech 员工的姓名、邮箱、部门、职位、入职时间和部分履历信息。
- 用于建立 GAStech 内部的官方组织结构。
- 例如，Isia Vann 被放入 GAStech Security，Sanjorge 被识别为 GAStech 高层。

在系统中的作用：

- `Org Chart` 视图展示各部门和员工。
- 点击员工后，系统会把该员工作为当前分析对象，并切换到相关邮件流。
- 关系图中的“雇佣关系”“部门归属”主要来自这里。

### Email Headers

来源：`email headers.csv`

含义：

- 记录邮件的发件人、收件人、时间和主题。
- 系统没有展示所有日常邮件，而是先根据主题筛出与案件逻辑有关的异常邮件。

关键词分类：

- `arise`：主题包含 `arise`。
  - 意义：追踪 ARISE / APA 相关思想或外部风险信号是否进入 GAStech 内部。
- `ipo`：主题包含 `ipo`。
  - 意义：追踪上市、财富和高管经济价值，辅助解释绑架目标价值。
- `security`：主题包含 `security` 或 `patrol`。
  - 意义：追踪安全、巡逻、路线和内部防护相关的信息流。

过滤结果：

- 只有命中上述三类主题的邮件才进入前端分析。
- 当前数据中生成了 `220` 条异常邮件流向：
  - `security`：136 条
  - `ipo`：57 条
  - `arise`：27 条
- 大量普通日常邮件不会出现在邮件网络中，避免干扰案件主线。

在系统中的作用：

- `Email Network` 展示异常邮件在发件人和收件人之间如何流动。
- 点击邮件路径可以查看具体主题、时间、发件人和收件人。
- 搜索框会同时搜索邮件主题、参与者和时间信息。

### Historical Documents

来源：`HistoricalDocuments/*.docx`

含义：

- 提供 POK 起源、Tiskele 水污染、Juliana Vann 死亡、Vann 家族关系、Mandor Vann 政治角色等长期背景。
- 这些材料主要用来解释非官方关系：冲突、动机、个人桥梁和历史积怨。

在系统中的作用：

- 支撑 POK 与 GAStech 的冲突关系。
- 支撑 POK 对 Kronos Government 的问责关系。
- 支撑 Isia Vann 与 Juliana Vann、Mandor Vann、POK 之间的个人关系。

### News Articles

来源：`News Articles/*`

含义：

- 提供 2014 年事件附近的公开报道。
- 包括 GAStech 与政府合作、政府接待活动、Sanjorge 逃脱绑架、GAStech 高层失踪、POK 赎金声明、APA / ARISE 风险报道等。

在系统中的作用：

- 支撑官方合作关系和绑架当天的公开事件。
- 支撑 Sanjorge 作为高价值目标的故事线。
- 支撑 APA / ARISE 作为弱风险信号，但不把它升级成确定结论。

## 生成后的数据文件

前端实际读取的是 `public/data` 里的 JSON 文件：

| 文件 | 含义 |
| --- | --- |
| `task3_bundle.json` | 总数据包，包含所有员工、邮件、关系、事件、证据和假设 |
| `employees.json` | GAStech 员工、部门、职位和邮箱 |
| `email_edges.json` | 经过关键词筛选后的异常邮件流向 |
| `relationship_nodes.json` | 人物、组织、事件、主题节点 |
| `relationship_edges.json` | 节点之间的关系 |
| `timeline_events.json` | 1994-2014 的关键事件 |
| `evidence_items.json` | 可显示在右侧面板的证据卡片 |
| `hypotheses.json` | 三条预设分析路径 |

当前数据规模：

- 54 名员工
- 220 条异常邮件流向
- 20 个关系节点
- 16 条关系边
- 9 个时间线事件
- 15 条证据
- 3 条假设路径

## 证据强度规则

系统把每条关系和证据分成三个强度等级：

- `confirmed`
  - 有直接材料支持，例如员工记录、历史文档或明确新闻文本。
  - 写故事线时可以表述为“证据显示”。
- `probable`
  - 多条线索共同支持，但没有直接证明。
  - 写故事线时应表述为“很可能”“可以合理推断”。
- `hypothesis`
  - 只有间接或弱线索，适合探索，不适合作为最终证明。
  - 写故事线时应表述为“可能暗示”“需要谨慎看待”。

特别注意：APA / ARISE 相关内容在系统中被刻意保持为 `hypothesis`。新闻能证明 APA 与 ARISE 有联系，邮件能证明 ARISE 主题进入 GAStech 邮件流，但没有证据证明 APA 与 POK 或 GAStech 内部人员存在确定合作。

## 系统模块

### Top Bar

顶部控制栏是整个系统的全局控制区。

功能：

- `Search`：输入关键词，同时搜索关系、节点、证据、时间线和异常邮件。
- `Topic`：切换分析主题，例如 Government、POK Motive、Vann Bridge、ARISE、IPO、Kidnapping、Security。
- `Path`：选择系统预设的假设路径。
- `Reset`：清空搜索、主题、假设路径和当前选择。

联动逻辑：

- 搜索词会影响关系图、证据面板、时间线和邮件网络。
- Topic 会让多个模块同时聚焦到同一主题。
- Path 会高亮一条完整故事线需要用到的关系和证据。

### Relations

`Relations` 是主关系网络图，用于观察官方和非官方关系如何交织。

节点含义：

- 圆形：人物
- 圆角矩形：组织或部门
- 菱形：事件
- 六边形：主题

颜色含义：

- GAStech：公司内部角色和主题
- Government：Kronos 政府相关节点
- POK：Protectors of Kronos 相关节点
- APA：Asterian People's Army / ARISE 相关节点
- Conflict：绑架、污染等冲突事件

线条含义：

- 蓝色线：偏官方关系，例如政府合作、职位、部门归属。
- 琥珀色线：偏非官方关系，例如冲突、家庭桥梁、弱风险信号。
- 实线：`confirmed`。
- 虚线：`probable` 或 `hypothesis`。

常见操作：

- 点击节点：查看这个人物、组织、事件或主题相关的证据。
- 点击关系线：查看这条关系背后的证据。
- 选择 Topic：只看当前主题下的关系。
- 选择 Path：只看某条故事线需要用到的关系。

### Org Chart

`Org Chart` 用来解释官方结构和外部组织面板。

GAStech 部分：

- 按部门展示员工。
- Executive、Security 等关键部门默认更容易展开和观察。
- 点击员工后，系统会把该员工作为当前对象，并跳转到邮件网络查看其异常邮件联系。

外部组织部分：

- `Protectors of Kronos`：展示 POK 的角色、目标和证据链接。
- `APA / Arise`：展示 APA 与 ARISE 的弱风险线索。
- `Kronos Government`：展示政府作为官方合作方、接待活动主办方和 POK 问责对象的关系。

适合用于：

- 写“官方关系”段落。
- 明确 GAStech 内部谁是什么职位。
- 对比政府合作关系和 POK / APA 的非官方关系。

### Email Network

`Email Network` 展示异常邮件在发件人和收件人之间的流向。

系统不会展示所有邮件，只展示经过主题筛选后的异常邮件。邮件主题被分为：

- `ARISE`
- `IPO`
- `SECURITY`
- `All Email`

图中含义：

- 左侧是主要发件人。
- 右侧是主要收件人。
- 曲线越粗，说明这两个方向上的异常邮件越多。
- 点击曲线可以查看该路径下的邮件主题、时间、发件人和收件人。

联动操作：

- 在 `Org Chart` 点击某个员工后，`Email Network` 会自动只看与该员工相关的异常邮件。
- 在顶部搜索 Sanjorge、Vann、ARISE、IPO 等关键词，邮件网络会同步过滤。
- 点击 `ARISE` 时，适合观察 APA / ARISE 是否只是弱信号。
- 点击 `IPO` 时，适合观察高管财富和绑架目标价值。
- 点击 `SECURITY` 时，适合观察安全部门、巡逻和路线相关信息。

### Evidence Panel

右侧 `Evidence Panel` 是证据解释区。

它会根据当前操作自动变化：

- 点击节点：显示与该人物、组织、事件或主题相关的证据。
- 点击关系线：显示支撑这条关系的证据。
- 点击时间线事件：显示这个事件背后的证据。
- 选择假设路径：显示这条路径需要用到的证据。
- 输入搜索词：显示命中的证据卡片。

每张证据卡包含：

- 标题
- 来源
- 摘要
- 日期
- 证据强度
- 来源偏差提示

点击证据卡可以打开更完整的来源文本。`Copy Evidence Summary` 可以复制当前证据列表，方便写报告或故事线。

### Timeline

`Timeline` 用来把长期背景和绑架当天事件连成时间顺序。

它覆盖 1994 到 2014 的关键节点：

- 1994：GAStech 与 Kronos Government 的合作成为经济背景。
- 1997：POK 围绕 Tiskele 水污染形成。
- 1998：Juliana Vann 死亡，成为 POK 叙事符号。
- 2009：Isia Vann 的背景把 GAStech Security 与 POK 家族历史连接起来。
- 2014-01-13：ARISE 和 IPO 相关异常邮件出现。
- 2014-01-19：政府接待活动被报道。
- 2014-01-20：GAStech 高层失踪。
- 2014-01-21：POK 赎金声明和 Sanjorge 逃脱报道出现。

适合用于：

- 把“官方关系”放入政治和商业背景。
- 把“非官方关系”放入污染、家族和激进组织背景。
- 写故事线时避免只按人物讲，而忽略事件因果顺序。

### Hypotheses

`Hypotheses` 提供三条可直接用于讲述的分析路径。

#### Sanjorge as target / motive anchor

强度：`probable`

含义：

- Sanjorge 同时连接 GAStech 高层身份、IPO 财富、政府接待路线和绑架事件。
- 这条路径适合解释为什么他可能是高价值目标。

使用方式：

- 选择该 Path。
- 查看被高亮的 CEO、IPO、Government Reception、Kidnapping 和 POK 冲突关系。
- 在右侧证据面板对比新闻和 IPO 邮件证据。

#### Isia Vann as personal bridge

强度：`confirmed`

含义：

- Isia Vann 同时是 GAStech Security 员工，又有被文档支持的 Vann 家族 / POK 背景。
- 这是系统中最强的个人桥梁线索。

使用方式：

- 选择该 Path。
- 查看 Isia Vann、GAStech Security、POK、Juliana Vann、Mandor Vann 的关系。
- 使用时间线从污染事件、Juliana Vann、Isia Vann 背景逐步讲起。

#### APA / Arise as weak external risk

强度：`hypothesis`

含义：

- APA 与 ARISE 有新闻证据。
- ARISE 主题出现在 GAStech 邮件头中。
- 但没有证据证明 APA 与 POK 或 GAStech 内部人员存在确定合作。

使用方式：

- 打开 `Email Network`。
- 切换到 `ARISE`。
- 再选择该 Path。
- 写报告时必须标明这是弱风险信号，不是 confirmed conclusion。

## 模块联动示例

### 从官方关系开始

1. 点击 `Reset`。
2. 打开 `Org Chart`。
3. 查看 GAStech 内部部门和员工职位。
4. 查看 `Kronos Government` 面板中的政府合作和政府接待关系。
5. 点击 `Evidence Links` 中的关系卡。
6. 在右侧证据面板记录新闻来源、日期和摘要。
7. 到 `Timeline` 中找到 1994 合作背景和 2014-01-19 政府接待事件。

适合写成：

> 官方层面上，GAStech 与 Kronos Government 保持长期合作关系。政府接待活动说明双方关系不只是背景合作，也在绑架发生前后进入公开事件链。

### 从 POK 非官方冲突开始

1. 点击 `Relations`。
2. 在 `Topic` 选择 `POK Motive`。
3. 点击 POK、GAStech、Kronos Government 之间的关系线。
4. 查看右侧历史文档和新闻证据。
5. 在 `Timeline` 中串联 1997 污染、1998 Juliana Vann、2014 赎金声明。

适合写成：

> 非官方层面上，POK 与 GAStech 的冲突来自长期污染和问责叙事。POK 不只针对企业，也把政府视为需要承担责任的官方合作方。

### 从 Isia Vann 个人桥梁开始

1. 在 `Path` 选择 `Isia Vann as personal bridge`。
2. 点击 Isia Vann 节点。
3. 查看右侧员工记录和历史文档证据。
4. 点击 `Org Chart` 中的 Isia Vann，跳到 `Email Network`。
5. 观察与该员工相关的异常邮件是否集中在 Security、ARISE 或其他主题。

适合写成：

> Isia Vann 是关键桥梁：他的正式身份属于 GAStech Security，但历史材料又把他放入 Vann 家族和 POK 背景中。因此，他连接了官方组织结构和非官方冲突网络。

### 从 APA / ARISE 弱线索开始

1. 打开 `Email Network`。
2. 选择 `ARISE`。
3. 点击主要邮件路径，查看邮件主题和参与者。
4. 在 `Path` 选择 `APA / Arise as weak external risk`。
5. 对比 APA 新闻证据和 ARISE 邮件证据。

适合写成：

> APA / ARISE 是一个需要谨慎处理的外部风险信号。系统能显示 ARISE 主题进入了 GAStech 邮件流，也能显示 APA 与 ARISE 的新闻联系，但这些证据不足以证明 APA 与 POK 或 GAStech 内部人员共同策划绑架。

## 推荐故事线结构

可以按以下顺序写分析报告：

1. **官方背景**
   - GAStech 是 Kronos 的重要企业。
   - GAStech 与 Kronos Government 有公开合作。
   - 高层与政府接待活动存在正式联系。

2. **非官方冲突**
   - POK 的动机来自污染、抗议和问责。
   - 冲突对象既包括 GAStech，也包括与其合作的政府。

3. **个人桥梁**
   - Isia Vann 同时连接 GAStech Security 和 Vann / POK 背景。
   - Mandor Vann 和 Juliana Vann 让这条桥梁具有历史和情感动因。

4. **经济和路线价值**
   - IPO 让 GAStech 高层具有更高经济价值。
   - 政府接待活动让高层路线和时间点进入公开事件链。

5. **外部弱风险**
   - APA / ARISE 只能作为辅助风险线索。
   - 不应写成确定参与者。

6. **结论**
   - 绑架事件应被理解为官方合作、环境冲突、个人关系和弱外部信号交织形成的多组织关系网络。

## 运行项目

安装依赖：

```powershell
npm install
```

启动本地开发服务器：

```powershell
npm run dev
```

默认访问：

```text
http://127.0.0.1:5173
```

重新生成数据：

```powershell
npm run data
```

运行测试：

```powershell
npm test
```

构建生产版本：

```powershell
npm run build
```

本地预览 Streamlit 包装版本：

```powershell
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## 部署说明

这个项目的主要界面仍然是 Vite + D3。Streamlit 只作为公开部署外壳，用 `streamlit_app.py` 读取 `dist` 构建产物和 `public/data` 中的 JSON 数据。

部署前需要确保以下内容已提交：

- `streamlit_app.py`
- `requirements.txt`
- `public/data/*.json`
- `dist/index.html`
- `dist/assets/*.js`
- `dist/assets/*.css`

## 主要代码文件

| 文件 | 作用 |
| --- | --- |
| `scripts/build_task3_data.py` | 从原始材料生成前端 JSON 数据 |
| `src/main.js` | 页面结构、模块挂载和初始状态 |
| `src/state.js` | 全局交互状态：搜索、主题、路径、选择对象 |
| `src/dataLoader.js` | 加载并校验 JSON 数据 |
| `src/utils/filters.js` | 关系、时间线、证据的筛选逻辑 |
| `src/utils/evidenceScoring.js` | 证据强度和排序规则 |
| `src/views/searchPanel.js` | 顶部搜索、主题、路径和重置控件 |
| `src/views/relationshipGraph.js` | `Relations` 和 `Org Chart` |
| `src/views/emailNetwork.js` | 异常邮件流向图 |
| `src/views/evidencePanel.js` | 右侧证据卡片和来源文本 |
| `src/views/timelineView.js` | 时间线 |
| `src/views/hypothesisExplorer.js` | 三条假设路径和讲述顺序 |
| `streamlit_app.py` | Streamlit 部署外壳 |

## Git 注意事项

不要提交：

- `node_modules/`
- 本地日志
- 未压缩的原始 VAST 数据
- 临时文件或本地实验输出

`public/data/*.json` 和部署所需的 `dist` 构建产物需要随部署版本一起提交。
