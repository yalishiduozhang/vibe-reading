# OpenVibeRead Plan

文档状态：Approved Baseline  
最后更新：2026-03-25 20:36 (Asia/Shanghai)
当前阶段：Phase 3 completed + Phase 4 in progress + Phase 5 in progress + WP-H in progress  
执行原则：严格按本计划逐步推进；阶段性突破后进行本地 git commit；除非你明确要求，否则不 push 到云端。

## 1. 文档目的

这份 `plan.md` 是项目的总计划文档，用于：

1. 固定项目目标、范围和边界。
2. 固定第一版功能优先级。
3. 固定技术路线与外部参考。
4. 固定分阶段任务拆解、依赖关系和验收标准。
5. 固定后续每次协作时的进展记录方式。

这不是单纯的想法文档，而是后续执行、汇报、审批、复盘的基线文件。

## 2. 当前共识

截至 2026-03-24，我们已经达成以下共识：

### 2.1 项目不是普通 AI PDF 阅读器

项目的目标不是“在 PDF 旁边放一个聊天框”，而是做一个开源研究阅读工作台，让用户在读论文时同时完成三件事：

- 更好地理解论文
- 更快地连接代码实现
- 更自然地长出自己的 idea，并沉淀成文档

### 2.2 项目三大主线

- `Read With Context`：贴着原文理解
- `Read With Code`：把论文和实现连起来
- `Read To Create`：把阅读中的灵感变成输出

### 2.3 当前第一版 P0 功能已经确定

P0 功能为：

1. 原文内联段落卡片
2. 阅读意图模式
3. 论文-代码联动
4. 段落旁 idea 捕获
5. AI 扩展 idea 文档
6. 证据链解释

### 2.4 当前执行约束

当前已经进入实现阶段，但仍要遵守以下约束：

- 不跳过 P0，擅自开始未批准的 P1 / P2 功能。
- 每次阶段性突破后必须更新本计划中的进展日志与里程碑状态。
- 默认只做本地提交，不 push 到云端，除非你明确要求。

## 3. 已完成的前期工作

以下工作已经完成，并已沉淀成文档：

- 视频与评论研究归档：`docs/research_archive.md`
- 初步开源版方案：`docs/vibe_reading_open_source_plan.md`
- 开源生态调研：`docs/opensource_reference_research.md`
- 已有实现覆盖度矩阵：`docs/existing_implementation_gap_matrix.md`
- 功能边界文档：`docs/feature_scope_v1.md`
- 信息架构文档：`docs/information_architecture.md`
- 低保真线框文档：`docs/wireframes_v1.md`
- 论文-代码联动示范样本基线：`docs/demo_sample_candidates.md`
- 初始 idea 原始资料：`docs/idea1.md`、`docs/idea2.md`

这意味着：

- 项目问题定义已经完成
- 竞品/参考开源调研已经完成
- 第一版功能边界已经初步收敛
- 第一轮信息架构与交互蓝图已经成形
- 现在正式进入 Reader Core 执行期

## 4. 项目目标

### 4.1 总目标

做出一个开源、可演示、可扩展、具有人机交互研究价值的论文阅读工作台原型。

### 4.2 第一阶段目标

第一阶段不是做“全功能成品”，而是做出一个足够完整、足够可信、足够有辨识度的第一版系统原型，能支撑：

- 课程项目展示
- HCI 研究说明
- 用户测试
- 后续扩展开发

### 4.3 成功标准

如果第一版成功，应该能让人明确感受到：

1. 它明显不同于普通 PDF + AI 聊天框。
2. 它在论文-代码联动上有真实价值。
3. 它在阅读中记录 idea 并扩展为文档这件事上有真实价值。
4. 它的 AI 输出比普通阅读器更可信，因为可以回到原文证据。

## 5. 非目标与边界

为了避免失控，第一版明确不追求以下目标：

1. 不做完整文献管理器替代品。
2. 不做完整 Zotero 替代品。
3. 不追求“自动百分百正确”的论文-代码映射。
4. 不追求“理论上无误”的复杂数学证明解释。
5. 不在第一版解决协作式阅读和多用户同步。
6. 不在第一版构建跨论文知识图谱。

## 6. 外部参考与约束

### 6.1 已调研参考

最重要的外部参考包括：

- Lumi
- Open Paper
- PapersGPT for Zotero
- AnnotateAI
- Paperlib
- Sioyek
- PDF.js
- react-pdf-highlighter
- Docling
- docling-parse
- GROBID
- PDFFigures2
- Papers with Code data

### 6.2 关键判断

目前没有发现一个成熟开源仓库，已经完整实现我们想要的全部功能链。

这意味着项目策略应是：

- 不重复造成熟底层轮子
- 不盲目 fork 某个现有大项目
- 以整合和交互设计为主要创新点

### 6.3 许可约束

需要特别注意 Zotero 的 AGPL 路线。

当前计划中的策略是：

- 第一版不走“改壳 Zotero 再分发”的路线
- 优先采用独立产品 + bridge / adapter 的方式
- 所有后续 Zotero 集成需单独做许可审查

## 7. 建议技术路线

这一部分是当前冻结的默认方案。若后续调整，必须更新本文件中的决策记录。

### 7.1 前端路线

建议：

- `Vite + React + TypeScript`
- PDF 渲染基于 `PDF.js`
- Web-first 方案优先
- 桌面壳后续再评估 `Tauri`

选择理由：

- 交互复杂度高，前端是主战场
- Vite 更适合当前阶段快速搭骨架和做原型验证
- PDF.js 是最稳妥的 Web PDF 底层之一
- 先做 Web 原型，更利于快速验证 HCI 交互

### 7.2 数据与存储路线

建议：

- 本地元数据：SQLite
- 客户端状态：前端本地 store
- idea / 笔记 / 映射结果：本地持久化

选择理由：

- 适合原型和 Local-first 路线
- 有利于后续支持桌面端

### 7.3 文档解析路线

建议采用分层策略：

第一层：

- PDF.js 文本层
- 基础段落切分

第二层：

- Docling / docling-parse 做结构化增强
- 在需要时评估 GROBID

第三层：

- 图表/公式等复杂内容按需引入专门模块

选择理由：

- 先保证可用，再做高精度
- 避免一开始把系统绑死在单一重型解析链路上

### 7.4 代码仓库解析路线

建议：

- 本地路径优先支持真实文件系统索引
- GitHub URL 支持 clone 或远程拉取元信息
- 使用 repo tree + README + config + code symbols 的多信号映射
- 后续可引入 tree-sitter 做结构增强

第一版映射策略：

- 候选生成
- 用户确认
- 映射记忆

不追求第一版端到端全自动。

### 7.5 AI 能力路线

建议先支持两类 provider：

- OpenAI-compatible API
- Ollama

AI 任务拆分为：

1. 段落摘要/翻译/术语解释
2. 阅读意图驱动的段落打分
3. 证据链生成
4. idea 文档扩展
5. 代码映射候选生成

## 8. 目标系统的模块划分

建议先按下面的模块组织系统，而不是按页面随意拼接。

### 8.1 Reader Core

职责：

- 加载 PDF
- 渲染页面
- 提供文本层与段落锚点
- 管理页面位置与回跳

### 8.2 Inline Assist Layer

职责：

- 段落卡片展开/收起
- 摘要/翻译/术语解释
- 与阅读意图联动

### 8.3 Evidence Layer

职责：

- 记录 AI 输出对应的页码、段落、句子
- 支持从解释回跳原文
- 区分原文摘取、归纳、推断

### 8.4 Code Link Layer

职责：

- 索引本地或远程 repo
- 生成候选映射
- 保存用户确认结果
- 支持双向跳转

### 8.5 Idea Workspace

职责：

- 在段落旁记录 idea
- 为 idea 加标签
- 汇总、筛选、搜索
- 扩展生成文档草稿

### 8.6 Export Layer

职责：

- 导出 Markdown
- 后续扩展 Obsidian / Anki

## 9. 工作流拆分

为保证执行清晰，建议将整个项目拆成 6 条工作流。

### 9.1 工作流 A：产品与交互

职责：

- 页面结构设计
- 阅读交互设计
- 内联卡片设计
- idea 工作流设计
- 代码联动交互设计

输出：

- 信息架构
- 关键流程图
- 页面线框
- 交互规则

### 9.2 工作流 B：PDF 阅读核心

职责：

- PDF 渲染
- 文本层抽取
- 段落定位
- 页面坐标稳定性

输出：

- 可用 PDF 阅读器基础框架
- 段落锚点系统

### 9.3 工作流 C：AI 上下文辅助

职责：

- 段落摘要/翻译
- 阅读意图模式
- 证据链解释

输出：

- 段落卡片 MVP
- 意图驱动高亮与解释
- 可回跳解释

### 9.4 工作流 D：论文-代码联动

职责：

- repo 索引
- 候选映射
- 人工确认映射
- 双向跳转

输出：

- 论文段落 -> 代码候选
- 代码 -> 论文回链

### 9.5 工作流 E：Idea 工作台

职责：

- idea 捕获
- idea 列表与筛选
- AI 扩展生成文档

输出：

- idea panel
- 文档生成视图

### 9.6 工作流 F：评估与展示

职责：

- Demo 场景准备
- 用户测试任务设计
- 汇报材料与展示逻辑

输出：

- 演示脚本
- 评估任务
- 汇报结构

## 10. 分阶段实施计划

下面的阶段顺序是当前建议的执行顺序。

### Phase 0：规划冻结与仓库准备

#### 目标

完成审批前的全部文档工作，冻结第一版方向。

#### 范围

- 完成 `docs/plan.md`
- 整理 `docs/` 目录
- 初始化 git 仓库
- 记录当前规划状态

#### 交付物

- `docs/plan.md`
- `docs/feature_scope_v1.md`
- `docs/research_archive.md`
- `docs/opensource_reference_research.md`
- `docs/existing_implementation_gap_matrix.md`
- git 仓库初始化

#### 当前状态

- 已完成

#### 完成标准

- 计划获批
- 文档基线与版本管理准备完毕

### Phase 1：信息架构与原型蓝图

#### 目标

在大规模功能开发之前，明确核心界面和主交互流程，同时建立可持续迭代的工程骨架。

#### 子任务

1. 确定页面信息架构
2. 确定主视图布局
3. 确定段落卡片交互
4. 确定代码联动面板交互
5. 确定 idea 工作台交互
6. 确定文档生成视图
7. 固定仓库结构与最小前端骨架

#### 交付物

- 页面结构图
- 用户主流程图
- 核心线框图
- 交互规则说明
- 可运行的前端骨架

#### 验收标准

- 每个 P0 功能都能在界面结构中找到明确位置
- 各模块之间的用户流转路径明确
- 前端骨架可运行、可构建、可作为后续 Reader Core 的落点

#### 当前状态

- 已完成

### Phase 2：Reader Core MVP

#### 目标

做出可读 PDF、可识别段落、可绑定原文位置的阅读核心。

#### 子任务

1. 选择并接入 PDF 渲染底层
2. 搭建基础阅读界面
3. 完成文本层抽取
4. 完成段落切分与段落锚点
5. 完成定位、滚动、回跳机制

#### 交付物

- 可加载 PDF 的阅读器
- 稳定的段落定位系统
- 基础高亮与定位能力

#### 验收标准

- 支持普通学术 PDF 阅读
- 页面滚动后锚点不明显漂移
- 能从段落 ID 回跳到原文位置

#### 当前状态

- 进行中

### Phase 3：内联辅助与证据链 MVP

#### 目标

把 AI 辅助真正接到阅读现场，并保证解释可追溯。

#### 子任务

1. 实现段落卡片 UI
2. 接入摘要/翻译/术语解释能力
3. 实现阅读意图模式
4. 实现段落热区/优先级逻辑
5. 实现证据链记录与回跳

#### 交付物

- 可展开的段落卡片
- 意图驱动高亮
- 可回跳的解释结果

#### 验收标准

- 同一段落在不同阅读意图下显示不同重点
- 解释结果能回到页码与段落
- 不出现大面积遮挡原文的交互问题

#### 当前状态

- 已完成

### Phase 4：论文-代码联动 MVP

#### 目标

让用户从论文真正跳到代码实现，并允许人工修正映射。

#### 子任务

1. 支持 GitHub URL / 本地路径输入
2. 完成 repo 基础索引
3. 生成术语映射候选
4. 在论文端展示候选代码位置
5. 在代码端展示相关论文段落
6. 保存人工确认映射

#### 交付物

- Repo 导入能力
- 论文 -> 代码候选映射
- 双向跳转
- 映射确认机制

#### 验收标准

- 至少在一个真实 repo + 对应论文上可演示
- 用户能手动修正错误映射
- 修正结果可持久化复用

### Phase 5：Idea 工作台 MVP

#### 目标

让用户在阅读中记录 idea，并把它们扩展成结构化文档。

#### 子任务

1. 实现段落旁记录 idea
2. idea 数据结构与标签系统
3. idea 列表/筛选/回跳
4. idea 选集生成文档
5. 文档编辑与 Markdown 导出

#### 交付物

- idea panel
- idea 与原文绑定能力
- AI 文档生成初稿能力

#### 验收标准

- idea 必须带原文引用锚点
- 用户可批量勾选 idea 生成 proposal / 计划 / 提纲
- 生成结果可编辑和导出

### Phase 6：P1 增强与课程展示准备

#### 目标

补强易展示、易提升体验的功能，并准备最终课程展示。

#### 子任务

1. 双语对照阅读
2. 图表解释模式
3. Markdown / Obsidian / Anki 导出增强
4. 自定义模型配置
5. 演示脚本与用户测试场景

#### 交付物

- 更完整的可演示原型
- 课程展示版本
- 用户测试脚本

#### 验收标准

- 至少能完成一条完整 demo 路径
- 支持从读论文到记 idea 到生成文档的闭环演示

## 11. 里程碑表

| 里程碑 | 内容 | 状态 | 通过标准 |
| --- | --- | --- | --- |
| M0 | 计划与文档冻结 | Completed | `plan.md` 获批，文档与仓库基线完成 |
| M1 | 信息架构与原型蓝图 | Completed | 核心页面、流程、线框与前端骨架确定 |
| M2 | Reader Core 可用 | Completed | 稳定 PDF 阅读、段落锚点、多页状态记忆与回跳能力已经可演示 |
| M3 | 内联辅助与证据链可用 | Completed | 工作台已支持规则基线 + 真实 AI provider 生成、意图驱动解释、翻译/改写、证据回跳 |
| M4 | 论文-代码联动可用 | In Progress | 至少 1 个真实案例跑通 |
| M5 | Idea 工作台可用 | In Progress | idea -> 文档闭环跑通 |
| M6 | 展示版与测试版完成 | Pending | 支持课程展示与测试 |

## 12. 风险与应对

### 12.1 PDF 坐标漂移风险

风险：

- 多栏论文、复杂排版、缩放变化会导致段落锚点不稳定。

应对：

- 先选稳定样本论文做 MVP
- 段落卡片基于可回跳锚点，而不是纯视觉浮层猜测
- 先保证正文段落，再扩展复杂元素

### 12.2 论文-代码错误映射风险

风险：

- 自动映射容易“看起来合理但其实错误”。

应对：

- 第一版只做候选映射 + 用户确认
- 不宣称自动精确对应
- 持久化人工修正结果

### 12.3 AI 不忠于原文风险

风险：

- 摘要、解释、实验结论可能幻觉化。

应对：

- 强制证据链输出
- 区分原文摘取、归纳、推断
- 高风险场景下减少自由生成

### 12.4 功能范围膨胀风险

风险：

- 一边做阅读器、一边做文献管理器、一边做知识库，项目会失控。

应对：

- 严格遵守 P0/P1/P2 边界
- 未批准功能不进入当前阶段
- 每次新增功能必须先更新 `plan.md`

### 12.5 许可风险

风险：

- 深度使用 Zotero 内部实现可能带来 AGPL 相关问题。

应对：

- 第一版不改壳 Zotero
- 仅在 bridge 层考虑集成
- 后续集成前单独审查

## 13. 后续执行规则

### 13.1 本文件是活文档

后续每次重要推进后，都要更新本文件中的以下部分：

- 当前阶段
- 里程碑状态
- 进展日志
- 决策记录
- 开放问题

### 13.2 进展更新规则

每次更新至少包含：

1. 时间戳，精确到分钟，格式为 `YYYY-MM-DD HH:MM`，默认时区为 `Asia/Shanghai`
2. 做了什么
3. 产出了什么
4. 遇到什么问题
5. 下一步是什么

补充规则：

- 自 `2026-03-24 21:21` 起，新增进展记录统一使用分钟级时间。
- 更早的历史记录如果只有日期级粒度，可以保留原样，不补写推测时间。

### 13.3 决策更新规则

一旦发生以下变化，必须更新计划：

- P0 功能变化
- 技术栈变化
- 里程碑变化
- 许可策略变化
- 阶段目标变化

## 14. 当前进展日志

说明：

- 自 `2026-03-24 21:21` 起，日志标题统一采用 `YYYY-MM-DD HH:MM / 阶段名`。
- 更早记录保留日期级粒度，避免补写不准确时间。

### 2026-03-24 / 规划阶段已完成

#### 已完成

- 分析目标视频和公开评论
- 完成研究归档文档
- 完成初步方案文档
- 完成开源生态调研
- 完成已有实现覆盖度矩阵
- 完成功能边界文档 v1
- 建立 `docs/` 目录并整理已有文档
- 初始化 git 仓库并建立首个文档基线提交
- 创建私有 GitHub 仓库 `yalishiduozhang/vibe-reading`
- 本计划已获得批准

#### 结论

- M0 已完成
- 可以正式进入实现阶段

### 2026-03-24 / Phase 1 已完成

#### 已完成

- 选择并冻结 Web-first 技术路线：`Vite + React + TypeScript`
- 固定仓库初始结构：`docs/`、`src/app`、`src/features/*`、`src/components`、`src/lib`、`src/styles`
- 搭建最小前端骨架并替换默认模板首页
- 增加根目录 `README.md`
- 安装前端依赖
- 完成 `npm run build`
- 完成 `npm run lint`
- 输出 `docs/information_architecture.md`
- 输出 `docs/wireframes_v1.md`

#### 结论

- M1 已完成
- Reader Core 开发边界与主界面结构已经具备基线

### 2026-03-24 / Phase 2 kickoff

#### 当前状态

- 前端骨架已可运行、可构建、可继续承接 Reader Core
- 已明确 Reader Workspace 的结构、主任务流和关键线框
- 尚未开始 PDF 渲染与段落锚点实现

#### 下一步

- 选择并接入 PDF 渲染底层
- 建立 Workspace 页面骨架
- 启动段落锚点与基础阅读视图实现


### 2026-03-24 21:21 / Phase 2 Reader Core milestone #1

#### 已完成

- 引入 `react-router-dom` 与 `pdfjs-dist`
- 将首页与 `/workspace` 拆分为独立路由
- 建立 Reader Workspace 三栏工作台结构
- 支持本地 PDF 上传、单页渲染与分页切换
- 基于 PDF 文本层完成当前页段落切分与锚点生成
- 实现 Context / Code / Idea 邻场面板骨架
- Code 面板加入启发式候选映射占位逻辑
- Idea 面板支持段落绑定与 `localStorage` 本地保存
- 对 Workspace 路由做懒加载，避免 PDF 运行时拖重首页
- 完成 `npm run build`
- 完成 `npm run lint`

#### 当前判断

- Reader Core 已具备首个可演示工作版本
- 当前实现已经证明：PDF 渲染、当前页段落锚点、段落绑定侧栏与 idea 记录可以在同一工作台中成立
- 仍需继续补强：更稳定的段落回跳、多页段落状态、真实 repo 索引与证据链

#### 下一步

- 补强 Reader Core 的段落定位稳定性与回跳机制
- 开始内联辅助卡片与证据链数据结构
- 为代码联动接入真实 repo 输入与索引


### 2026-03-24 21:39 / Phase 2 Reader Core milestone #2

#### 已完成

- 将段落 ID 从“页内顺序号”升级为“页码 + 文本指纹”的稳定锚点策略
- 为段落增加 `sentenceCount` 等元数据，补强后续证据链基础
- 引入按 `page + intent` 组织的最小快照缓存
- 实现翻页返回时的段落恢复与缓存快照回填
- 实现 idea -> 段落的回跳能力
- 实现 Context 面板中的 evidence -> 段落回跳能力
- 引入独立的 `context.ts`，固定 explanation card 与 evidence ref 的最小 schema
- 在 Context 面板中加入 attribution 标签：`quoted` / `summary` / `inference`
- 补齐 Reader Core 新交互的样式层
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- WP-A 已完成主要目标，Reader Core 已从“单页演示版”提升为“具备多页状态记忆与回跳能力的原型”
- WP-B 已完成第一轮数据结构准备，Phase 3 不需要再从零设计 Context / Evidence schema
- 当前最大未解项已经从 Reader Core 稳定性转移到示范样本选择与真实 repo 索引

#### 下一步

- 开始 WP-C：锁定论文-代码联动示范样本
- 开始 WP-D：定义 repo 输入边界、归一化规则与首轮索引信号
- 在形成真实 repo 联动的首个可演示版本后再次提交


### 2026-03-24 22:03 / Phase 2-4 bridge milestone #3

#### 已完成

- 输出 `docs/demo_sample_candidates.md`，比较 `Segment Anything`、`LoRA`、`CLIP` 三组候选，并冻结 `Segment Anything` 为主样本
- 在 `src/features/code-link/demoSamples.ts` 中固化 demo sample 元数据，接入 Workspace 的示范样本选择器
- 在 `src/features/code-link/source.ts` 中补强 repo 输入分类与 GitHub URL 归一化，明确 repo root 作为首轮索引边界
- 在 `src/features/code-link/mappings.ts` 中定义人工确认结果的持久化字段，并接入 `localStorage`
- 让 Code 面板具备 Demo Pair、Source Analysis、Confirmation Memory 三段结构
- 为代码候选加入 sample-aware 启发式映射，并支持 `Confirm / Dismiss` 决策记忆
- 更新首页、`README.md` 与 demo 样本文档，保证文档状态和实际实现同步
- 完成 `npm run build`
- 完成 `npm run lint`

#### 当前判断

- WP-C 已完成，论文-代码联动 MVP 的首个演示样本已经冻结
- WP-D 已完成第一轮输入边界与持久化设计，后续不需要再回到“先支持什么 repo 输入”的讨论
- M2 可以判定为完成，Reader Core 不再是当前阶段的主阻塞项
- 下一阶段的关键路径已经转到“真实 GitHub repo 索引”与“idea -> 文档骨架”

#### 下一步

- 基于主样本实现第一轮真实 GitHub repo 索引：repo tree、README、关键源码文件
- 用真实 repo artifact 替换当前 sample-aware 启发式候选
- 为 Idea 工作台准备最小 Composer 骨架，避免后续文档生成链路堵塞


### 2026-03-24 22:23 / Phase 4 groundwork milestone #1

#### 已完成

- 新增 `src/features/code-link/github.ts`，为公开 GitHub 仓库建立首轮远程索引链路
- 首轮远程索引覆盖：repo root contents、README、优先目录扫描、少量关键源码文件抓取
- 新增 `src/features/code-link/candidates.ts`，把代码候选生成从 `WorkspacePage` 下沉到 feature 模块
- Code 面板现在可以手动触发 `Index Repo`，并展示远程索引到的目录与关键文件预览
- 代码候选会优先消费真实 repo artifact，再回退到 sample-aware 启发式候选
- 在 `WorkspacePage` 中引入最小的 repo index cache，避免同一 repo 反复拉取
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- WP-E 已有首个可工作的公开 GitHub 远程索引版本
- WP-F 已启动，候选生成逻辑不再完全依赖样本常量
- WP-H 也已启动，代码联动相关逻辑开始从页面层下沉为独立模块
- 下一阶段的主阻塞已逐步从“能否索引 repo”转向“如何把 idea 组织成文档草稿”

#### 下一步

- 开始 WP-G：建立最小 Composer 骨架
- 深化远程索引质量：更好的 artifact 排序、更多文件跳转信息与缓存策略
- 评估是否引入第二组备选样本做回归验证


### 2026-03-24 22:33 / Phase 5 groundwork milestone #1

#### 已完成

- 新增 `src/features/idea-workspace/composer.ts`，建立最小的 idea -> draft 规则生成模块
- 在 Idea 面板中加入多条 idea 选择能力，不再只支持“保存后结束”
- 在 Workspace 中加入 `Composer Preview`，支持 `Project proposal`、`Experiment plan`、`Reading memo` 三种草稿模式
- 草稿预览已能把选中的 idea、原文锚点和下一步建议组织成 Markdown 结构
- 为 Composer 预览补齐基础样式
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- WP-G 已启动，而且最小闭环已经成立：idea 工作台开始从“记录容器”转向“产出起点”
- Phase 5 仍未完成，因为编辑、导出和 AI 扩展还未接入
- 当前系统已经具备一条更完整的演示路径：读段落 -> 记 idea -> 选 idea -> 生成草稿

#### 下一步

- 继续补强 Composer：编辑、导出、结构优化
- 继续深化 GitHub 远程索引与真实候选质量
- 评估是否用第二组样本做回归验证


### 2026-03-25 16:28 / Phase sync + Phase 5 continuation

#### 已完成

- 重新对照 `docs/plan.md`、里程碑表和当前仓库实现，校准阶段判断
- 将 `M3`、`M4`、`M5` 的状态从 `Pending` 更新为 `In Progress`
- 同步修正文档中的当前阶段描述、开放问题和下一批执行项
- 将 Composer 从“只读预览”推进为“可编辑 Markdown 草稿”
- 为 Composer 加入 `Reset Draft`、`Copy Markdown`、`Download .md`
- 按 `Project proposal`、`Experiment plan`、`Reading memo` 重组草稿 section 结构
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- Phase 5 已不再只是 groundwork，而是进入可继续收敛验收差距的 in-progress 状态
- 当前系统已经具备更完整的闭环演示：读段落 -> 记 idea -> 选 idea -> 编辑草稿 -> 导出 Markdown
- `M5` 仍未完成，因为 idea 管理能力、AI 扩展和导出层整合还未到位
- 当前主阻塞已收敛到两条：一条是 Code Link 的真实跳转深度，一条是 Idea Workspace 的管理与持久化能力

#### 遇到的问题

- `M3` 已有意图、evidence 和回跳结构，但仍未接入真正的模型输出与翻译能力
- `M4` 虽已具备真实 GitHub 索引和 confirmation memory，但仍缺代码侧回链与更明确的文件/符号跳转
- `M5` 已有编辑与导出起点，但编辑结果当前仍是局部工作台态，尚未形成完整的 draft 持久化与管理链路

#### 下一步

- 继续补强 Composer：idea 筛选、编辑/删除、draft 持久化边界
- 继续深化 GitHub 远程索引：artifact 排序、文件跳转和第二样本回归
- 把 Code Link 从“候选展示”继续推进到“更明确的代码目标跳转 + 代码侧回链”


### 2026-03-25 17:00 / Phase 5 management pass + Code Link target pass

#### 已完成

- 为 idea 数据补上论文名元信息，开始支持按 paper 维度过滤
- Idea Workspace 新增 search、paper、tag、time 四类过滤控件
- Idea 列表新增编辑、删除、复制与筛选后的可见计数
- Composer 新增本地 draft 持久化，刷新后可按选集和模式恢复已编辑草稿
- 新增 `src/features/idea-workspace/storage.ts`，把 idea / composer 的本地存储逻辑从页面层下沉
- Code candidate 与 confirmation memory 开始保存明确的 `targetUrl`
- Code 面板中的候选、确认结果、repo file 预览都已可直接打开对应 GitHub 目标
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M5` 又向前推进了一步：Idea Workspace 已不再只是“记录 + 预览”，而是开始具备管理、恢复和导出前整理能力
- `M4` 也有收敛：当前 prototype 已从“看路径字符串”提升为“能直接打开明确代码目标”
- 这一轮之后，`plan.md` 中原先关于 Composer 是否进入本地持久化的问题可以视为已回答
- 当前更核心的剩余缺口已经变成：代码侧回链展示、候选排序质量、以及多草稿/多文档管理

#### 遇到的问题

- 代码联动当前仍以 file-level deep link 为主，距离更明确的 symbol-level 跳转还有差距
- Idea 工作台虽然已有筛选和编辑，但仍缺更完整的草稿列表、命名与多 draft 管理
- 现有本地存储仍是 browser localStorage 级别，尚未进入更稳定的 local-first 数据层

#### 下一步

- 继续推进 `M4`：补强 artifact 排序、第二样本回归和代码侧回链展示
- 继续推进 `M5`：从“单草稿可恢复”走向“多草稿可管理”
- 评估是否开始为本地持久化引入更明确的数据层边界（例如独立 store / SQLite 前置设计）


### 2026-03-25 17:13 / Phase 4 backlink pass + Phase 5 snapshot pass

#### 已完成

- 在 Code 面板中新增 `Code-side Backlinks`，按代码目标聚合已确认的论文段落回链
- 当前已确认映射现在可以从“代码目标 -> 相关论文段落”完成最小回链浏览与跳转
- 为 Composer 新增 named snapshot 管理，支持保存、加载、删除多个草稿快照
- 保持 active draft 恢复与 named snapshot 并存，不互相覆盖
- 继续复用 `src/features/idea-workspace/storage.ts`，把 snapshot 持久化留在 feature 层
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 已从“论文 -> 代码候选”进一步收敛到“代码目标 -> 论文段落”的最小双向形态
- `M5` 已从“单草稿恢复”推进到“多快照管理”，开始具备轻量版本管理能力
- 当前 Idea Workspace 已经有了记录、筛选、编辑、恢复、导出、快照这条连续链路
- 下一阶段更像是质量收敛，而不是从零补骨架

#### 遇到的问题

- Code-side backlink 仍然建立在人工确认映射之上，尚未形成更自动化的代码侧浏览入口
- Snapshot 目前是轻量快照，不是完整 draft 实体，仍缺更强的命名、归档和组织能力
- 现有持久化仍以 browser localStorage 为主，后续迁移成本需要提前控制

#### 下一步

- 继续推进 `M4`：补强候选排序质量、第二样本回归和更细粒度的目标定位
- 继续推进 `M5`：评估快照是否升级为正式 draft 实体，并补充更强的命名与组织能力
- 继续推进 `WP-H`：逐步把页面层状态往 feature 边界下沉


### 2026-03-25 17:24 / Phase 4 symbol target pass

#### 已完成

- 为 `CodeCandidate` 与 confirmation memory 补上可选的 `lineNumber`
- GitHub indexed candidate 现在会从已抓取的关键文件中抽取 `class` / `def` / `function` / 常见导出定义，做第二轮 symbol 匹配
- 当前候选会优先显示更具体的 symbol，并在可识别时落到 `#L<line>` 级别 GitHub deep link
- Code-side backlink 的聚合键已从“同文件”收紧到“同代码目标”，避免不同 symbol 混在一个回链组里
- Code 面板中的 active candidate、confirmation memory、code backlink 都开始显式展示 `Lxx` 定位
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 已不再只停在 file-level deep link；对于已索引的 GitHub 关键文件，prototype 现在具备最小的 symbol / line 级目标定位能力
- 当前论文 -> 代码 -> 论文的双向链路已经更具体，确认记忆也从“文件记忆”收敛成“目标记忆”
- 这轮推进回答了此前关于 `M4` 是否需要停在文件级深链的开放问题：当前执行线应继续保留 file fallback，但默认优先 symbol / line 目标

#### 遇到的问题

- 现有 symbol 抽取仍是启发式正则，暂时只覆盖常见 Python / JS / TS 定义形态
- line-level 定位只在远程索引到源码文本的情况下可用，sample fallback 和本地 repo bridge 仍可能退回 file-level
- 候选排序仍未做跨样本回归，第二样本验证还没补上

#### 下一步

- 继续推进 `M4`：补第二样本回归，观察当前 symbol ranking 在 LoRA / CLIP 上是否稳定
- 继续推进 `M4`：评估是否为 repo index 增加更强的 symbol cache / snippet 展示
- 继续推进 `M5`：继续评估 snapshot 是否升级为正式 draft 实体，并补强组织能力


### 2026-03-25 17:30 / Phase 5 snapshot organization pass

#### 已完成

- 为 Composer snapshot 补上 paper 和 tag 元数据，保存时开始记录当前选中 idea 集的文档归属与标签分布
- Saved Draft Snapshots 新增 search / paper filter，开始支持按名称、标签和论文维度筛选
- snapshot 卡片现在会显示所属 paper、标签摘要和更新时间，不再只有名称和 mode
- 新增 snapshot rename 流程，支持对已保存的 snapshot 重命名并做同 selection 下的重名冲突检查
- 继续完成 `npm run build`
- 继续完成 `npm run lint`

#### 当前判断

- `M5` 已经不再只是“能保存多个快照”，而是开始具备轻量 draft library 的组织能力
- 当前 snapshot 仍不是完整 draft 实体，但它已经逐步具备元信息、过滤和管理动作，离正式文档层更近了一步
- 这条路径继续符合前面关于 Local-first 和 lightweight snapshot 的执行策略，没有过早引入更重的数据模型

#### 遇到的问题

- snapshot 目前仍没有正文级别的独立列表页、归档状态和备注字段
- 当前组织能力仍建立在 localStorage 上，后续若继续扩展为更正式的 draft library，需要提前考虑迁移边界
- 现有 snapshot 管理还没有和代码联动结果形成更强的 cross-link

#### 下一步

- 继续推进 `M4`：补第二样本回归与更稳定的 symbol ranking
- 继续推进 `M5`：评估 snapshot 是否升级为正式 draft 实体，并补充备注、归档或更强的组织动作
- 继续推进 `WP-H`：把 snapshot / confirmation memory 等状态继续下沉到更清晰的 feature store


### 2026-03-25 17:37 / Phase 4 cross-sample regression pass

#### 已完成

- 在 Code 面板新增 `Cross-sample Regression` 视图，固定对当前段落同时展示 `Segment Anything / LoRA / CLIP` 三个 preset 的候选结果
- 回归视图直接复用现有 `buildCodeCandidates` 逻辑，不额外复制第二套映射规则
- 当前回归卡片会显示每个 sample 的 mapping-focus 命中数、top candidate、定位路径和是否使用 indexed repo
- 对当前匹配 sample，若已完成 GitHub 远程索引，则回归视图会优先使用 indexed candidate；其余 sample 保持 preset fallback
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里原先“第二样本回归还没补上”的缺口已经开始收口，当前 prototype 至少具备了段落级的跨样本可视化对照入口
- 这让 candidate ranking 的变化不再只能靠手动切 sample 检查，后续调 ranking 时可以直接在同一段落下观察 SAM / LoRA / CLIP 的差异
- 当前这一步更像是把“回归验证能力”内建到产品原型里，而不是仅靠一次性人工验收

#### 遇到的问题

- 当前回归仍以 top candidate 预览为主，还没有形成更系统的 ranking score 面板
- 非当前匹配 sample 仍主要走 preset fallback，尚未接入它们各自的真实远程索引结果
- 回归视图目前是观察入口，还没有自动记录“哪个 sample 更稳定”这类统计结论

#### 下一步

- 继续推进 `M4`：评估是否把 LoRA / CLIP 的真实 GitHub 索引也纳入同一回归链路
- 继续推进 `M4`：在不让 UI 过重的前提下补更明确的 ranking signal / snippet 展示
- 继续推进 `M5`：继续评估 snapshot 是否升级为正式 draft 实体，并补更强的组织动作


### 2026-03-25 17:40 / Phase 4 ranking signal pass

#### 已完成

- 为 `CodeCandidate` 增加可选 `signals` 字段，并把 indexed candidate 的匹配信号从内部排序过程显式暴露出来
- sample fallback candidate 现在也会带最小 signal 集合，不再只有长段 reason
- confirmation memory 开始持久化并显示 ranking signals，避免“确认后只剩结果、不剩解释”
- Active candidates 与 `Cross-sample Regression` 都开始显示 signal chips，ranking 过程比之前更可见
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 当前已经从“能打开代码目标”继续推进到“能解释为什么是这个目标”
- 当前候选链路开始具备 `target + signal + reason` 三层解释结构，后续无论是调 ranking 还是做演示都更稳
- 这一轮把 Code Link 的 explainability 从页面文案层推进到了数据结构层，后续 confirmation memory 和回归视图可以继续复用

#### 遇到的问题

- signal 目前仍是轻量字符串摘要，不是统一的结构化 score 明细
- 旧的本地 confirmation memory 记录不会自动补齐新 signal，只会在后续新确认时逐步积累
- 还没有把 repo snippet 和 signal 更直接绑定起来，当前仍以短标签解释为主

#### 下一步

- 继续推进 `M4`：评估是否为 indexed candidate 增加 snippet 预览，让 signal 和源码片段更直接对应
- 继续推进 `M4`：评估 LoRA / CLIP 是否也进入真实远程索引链路，而不只停在 preset fallback
- 继续推进 `M5`：继续收敛 snapshot 的组织动作与正式 draft 边界


### 2026-03-25 17:46 / Phase 4 snippet pass

#### 已完成

- indexed candidate 现在会基于命中的 symbol / term 位置生成带行号的最小源码 snippet
- `CodeCandidate`、confirmation memory 和 code backlink 都开始支持持久化 snippet
- Active candidates、`Cross-sample Regression`、confirmation memory、code backlink 现在都可直接显示源码预览
- snippet 预览统一采用轻量 monospace block，不额外引入独立代码浏览器
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 现在已经从 `target + signal + reason` 继续推进到 `target + signal + snippet + reason`
- 这让 Code Link 的证据层更直接，用户不需要立刻离开当前工作区就能看到候选附近的源码上下文
- 当前工作区里的代码联动已经更接近“最小代码浏览入口”，而不只是跳 GitHub 链接

#### 遇到的问题

- snippet 仍是基于已索引的少量 key files 生成，不是完整 repo 范围的代码浏览
- 对 sample fallback candidate，目前仍然大多没有真实 snippet，主要覆盖 indexed candidate 和后续新确认记录
- 还没有把 snippet 和更细粒度的 symbol score 明细绑定，当前仍是轻量解释模式

#### 下一步

- 继续推进 `M4`：评估是否把 LoRA / CLIP 的真实远程索引纳入回归链路，让更多 sample 也有 snippet
- 继续推进 `M4`：评估是否为 indexed repo preview 增加更明确的 snippet / symbol cache
- 继续推进 `M5`：继续收敛 snapshot 的组织动作与正式 draft 边界


### 2026-03-25 17:52 / Phase 4 sample indexing pass

#### 已完成

- `Cross-sample Regression` 新增 `Warm Sample Indexes / Refresh Sample Indexes`
- demo sample 的真实 GitHub index 现在可以显式预热并写入现有 repo index cache，而不是只服务当前 repo source
- 回归视图开始复用已缓存的 sample index，因此 LoRA / CLIP 一旦预热成功，也能进入 indexed candidate 路径
- 回归面板开始显示当前已有多少 preset 处于 indexed 状态
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里原先“LoRA / CLIP 真实远程索引链路”已经不再只是待评估项，而是有了第一版可执行入口
- 当前 cross-sample regression 已经从“同一段落看多个 preset fallback”推进到“可逐步转成多个真实 repo artifact 对照”
- 这一步保持了当前 Web-first prototype 的交互原则：索引动作是显式触发的，不是后台隐式抓取

#### 遇到的问题

- sample index 预热目前仍是手动动作，不会自动保持新鲜度
- 回归面板还没有显示每个 sample 的索引失败原因，只给出整体状态摘要
- 当前索引缓存仍完全驻留在内存 ref 中，刷新页面后不会保留

#### 下一步

- 继续推进 `M4`：评估是否为 sample index cache 增加更明确的持久化边界
- 继续推进 `M4`：补更直接的 indexed snippet / symbol cache 组织方式
- 继续推进 `M5`：继续收敛 snapshot 的组织动作与正式 draft 边界


### 2026-03-25 18:07 / Phase 4 cache persistence pass

#### 已完成

- 新增 `src/features/code-link/storage.ts`，开始承接 repo index cache 的本地持久化与校验
- `WorkspacePage` 的 repo index cache 现在会从 feature storage 初始化，而不是每次刷新都从空 ref 开始
- 当前 repo 索引与 sample regression 预热出的索引结果都会写回同一份 local-first cache
- 持久化层会按 `generatedAt` 保留最近的少量 repo index，避免无限增长
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里关于 sample index cache 的“持久化边界”现在已经从待评估变成了已落地能力
- 当前 code-link 的索引链路不再只是会话内存态，而是开始具备跨刷新保留的 local-first 行为
- 这一步也让 `WP-H` 往前走了一点：repo index cache 已经从页面层 ref 逻辑开始下沉到 feature storage

#### 遇到的问题

- 当前 repo index cache 仍保留在 browser localStorage，不是更稳的数据库或文件级缓存
- 现有 cache 裁剪策略仍很轻，只按最近时间保留少量条目
- 还没有把 cache hit / stale 状态直接展示给用户

#### 下一步

- 继续推进 `M4`：评估是否为 indexed repo preview 增加更明确的 snippet / symbol cache 组织方式
- 继续推进 `M4`：评估是否为 repo index cache 加入更可见的命中 / 过期状态
- 继续推进 `M5`：继续收敛 snapshot 的组织动作与正式 draft 边界


### 2026-03-25 18:13 / Phase 4 cache visibility pass

#### 已完成

- 当前 `Remote Repo Index` 会直接显示 cache hit / live refresh / fresh cache / stale cache 等状态信号
- `Cross-sample Regression` 里的每个 sample 现在也会显示自身的 cache 状态，而不再只标 `Indexed / Preset`
- 新增相对时间表达，当前缓存是否新鲜会直接体现在工作区里
- 继续完成 `npm run build`
- 继续完成 `npm run lint`

#### 当前判断

- `M4` 里关于 cache 命中与过期状态的可见性已经开始收口，索引链路不再像黑盒
- 当前 repo index 和 sample regression 的状态反馈已经更接近“可调试、可演示”的产品原型
- 这一步补的是解释层，不改变当前 fetch 和 cache 的主逻辑，因此推进风险较低

#### 遇到的问题

- 当前 freshness 仍是简单时间阈值，不是更严格的缓存策略
- 还没有提供显式的 per-sample 失败详情或过期刷新建议
- 当前 cache 状态仍停留在 UI 信号层，没有更细的统计视图

#### 下一步

- 继续推进 `M4`：评估是否把 indexed repo preview 再收敛成更明确的 symbol / snippet cache 组织方式
- 继续推进 `M4`：评估是否给 sample regression 增加更直接的失败详情与刷新建议
- 继续推进 `M5`：继续收敛 snapshot 的组织动作与正式 draft 边界


### 2026-03-25 18:20 / Phase 4 symbol cache pass

#### 已完成

- 新增 `src/features/code-link/symbols.ts`，把 symbol 提取、snippet 组装和 GitHub line target 这些能力从 `candidates.ts` 中抽出
- 当前候选生成与 `Remote Repo Index` 开始共用同一层 symbol/snippet helper，而不是各自维护解析逻辑
- `Remote Repo Index` 下新增 `Indexed Symbol Cache`，直接展示当前已索引 key files 中抽出的 symbol、行号和 snippet
- 这让 repo preview 已经不只是“看文件摘要”，而是开始显式暴露索引后的代码结构缓存
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里关于 symbol / snippet cache 的组织方式已经开始落地，不再只是后续设想
- 当前 code-link 的 repo preview、candidate generation 和 snippet 证据层开始共享同一套 helper，结构更稳
- 这一步也让 `WP-H` 往前走了一点：symbol 解析逻辑正在从页面使用态变成 feature 级能力

#### 遇到的问题

- 当前 symbol cache 仍是从少量 indexed key files 中推导出来，不是完整 repo 级别
- 还没有给 symbol cache 加筛选或搜索，当前主要服务于可视化和调试理解
- 现有 symbol cache 仍是运行时派生，而不是持久化到 repo index 本体

#### 下一步

- 继续推进 `M4`：评估是否把 symbol cache 进一步并入 repo index 的持久化结构
- 继续推进 `M4`：评估是否给 sample regression 增加更直接的失败详情与刷新建议
- 继续推进 `M5`：继续收敛 snapshot 的组织动作与正式 draft 边界


### 2026-03-25 18:49 / Phase 4 regression diagnostics pass

#### 已完成

- `Cross-sample Regression` 开始记录并展示 per-sample 的索引结果状态，而不是只保留顶部汇总消息
- warm 流程现在会区分 `cached / refreshed / failed`，并把简短 detail 写回对应 sample 卡片
- 回归卡片现在会在需要时直接给出刷新建议，避免用户只知道“失败了”却不知道下一步
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里关于 sample regression 的失败详情与刷新建议已经开始落地，回归区比之前更像真实可调试工作区
- 当前多 sample 索引链路不再只有成功路径可见，失败路径也已经开始有最小反馈
- 这一步继续遵守当前的轻量原型原则：补的是诊断层，不是复杂监控面板

#### 遇到的问题

- 当前 diagnostics 仍停留在本次会话内，不做更长期的历史统计
- per-sample detail 还是简短文本，不是结构化错误分类
- 失败建议目前是通用提示，还没有根据具体错误类型给出差异化建议

#### 下一步

- 继续推进 `M4`：评估是否把 symbol cache 进一步并入 repo index 的持久化结构
- 继续推进 `M4`：评估是否把 regression diagnostics 做成更明确的错误类型与刷新建议
- 继续推进 `M5`：继续收敛 snapshot 的组织动作与正式 draft 边界


### 2026-03-25 18:53 / Phase 5 snapshot archive pass

#### 已完成

- 为 snapshot 数据补上 `note` 与 `archivedAt`，开始支持更像正式 draft 实体的元信息
- Snapshot 保存时现在可以同步写入备注，后续也支持在列表内编辑元信息
- Saved Draft Snapshots 新增 `Visibility` 过滤，可在 `All / Active only / Archived only` 间切换
- snapshot 卡片开始支持 `Archive / Restore`，并显示归档时间与备注
- 继续完成 `npm run build`
- 继续完成 `npm run lint`

#### 当前判断

- `M5` 已经不再只是“多 snapshot 可保存与筛选”，而是开始具备更明确的生命周期动作
- 当前 snapshot 虽然还不是完整文档实体，但已经有了备注、归档、恢复这些更接近 draft library 的组织行为
- 这一步继续符合当前 Local-first 策略，没有过早引入更重的文档列表系统

#### 遇到的问题

- snapshot 仍没有独立详情页或更强的文档级浏览结构
- 当前备注仍是轻量文本，没有更细的标签或状态体系
- archive 目前只是本地软归档，不涉及更深的存储分层

#### 下一步

- 继续推进 `M5`：评估是否把 snapshot 再向正式 draft 实体推进，例如更稳定的详情视图或实体级操作
- 继续推进 `M4`：评估是否把 symbol cache 进一步并入 repo index 的持久化结构
- 继续推进 `M4`：评估是否把 regression diagnostics 做成更明确的错误类型与刷新建议


### 2026-03-25 18:56 / Phase 5 snapshot detail pass

#### 已完成

- Snapshot 列表开始支持行内 `Preview / Hide Preview`
- 每个 snapshot 卡片现在可以直接展开 Markdown 详情预览，而不必先 Load 回 active draft
- 当前详情预览与现有 snippet block 复用同一套轻量呈现方式，没有额外引入新页面
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M5` 已经从“能保存、能筛选、能归档”继续推进到“能在列表里直接看 draft 内容”
- 这让 snapshot 更接近轻量 draft 实体，而不是只有名字和元信息的版本点
- 当前这一步仍然是轻量详情视图，不会过早把系统拉向更复杂的文档页结构

#### 遇到的问题

- 详情预览目前仍是截断后的 Markdown 片段，不是完整阅读页
- snapshot 之间还没有更强的关系结构，例如版本链或父子草稿
- 当前详情视图仍然只服务于列表内快速判断，不承担完整编辑职责

#### 下一步

- 继续推进 `M5`：评估是否给 snapshot 增加更稳定的 detail / entity 视图，而不只是列表内预览
- 继续推进 `M4`：评估是否把 symbol cache 进一步并入 repo index 的持久化结构
- 继续推进 `M4`：评估是否把 regression diagnostics 做成更明确的错误类型与刷新建议


### 2026-03-25 18:59 / Phase 4 symbol cache persistence pass

#### 已完成

- `GitHubRepoIndex` 开始显式支持 `symbolCache` 字段，repo index 的最小结构不再只停留在 `keyFiles`
- 新增 `enrichRepoIndex`，在读取旧缓存、写入新缓存和运行时接入网络索引时都会统一补齐 `symbolCache`
- `WorkspacePage` 中的 `Remote Repo Index` 不再每次重新运行 `buildRepoSymbolCache`，而是直接复用 `repoIndex.symbolCache`
- 这让 repo preview、candidate generation 和 repo index cache 的组织方式进一步对齐
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里关于 symbol cache 的持久化边界已经进一步收敛，不再只是运行时派生能力
- 当前 repo index cache 结构更接近真正可复用的 artifact cache，后续继续做 cache 诊断或排序时更稳
- 这一步也继续推进了 `WP-H`：页面层开始直接消费 feature 层已经归一化的数据结构

#### 遇到的问题

- 当前 `symbolCache` 仍然来自少量 indexed key files，不是完整 repo 范围
- 旧缓存虽然会在读取时自动 enrich，但还没有单独的版本迁移字段
- 目前还没有围绕 `symbolCache` 建更细的搜索、排序或淘汰策略

#### 下一步

- 继续推进 `M4`：评估是否给 `symbolCache` 增加更明确的排序和命中解释
- 继续推进 `M4`：评估是否把 regression diagnostics 做成更明确的错误类型与刷新建议
- 继续推进 `M5`：继续评估 snapshot 是否需要升级为更稳定的 draft/entity 视图


### 2026-03-25 19:03 / Phase 4 symbol cache ranking pass

#### 已完成

- `Indexed Symbol Cache` 开始根据当前段落做 paragraph-aware 排序，而不是只按缓存原顺序平铺
- 新增 symbol-cache ranking helper，会综合 `symbol token / path / snippet / prompt-mask-encoder-decoder` 这些信号给出 focused hits
- 当前命中的 symbol 会直接显示 `score` 与 signal chips，让 repo preview 更接近可解释的调试面板
- 当没有直接命中时，界面会明确退回到 top cached symbols，而不是无提示地混用两种状态
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里关于 symbol cache 的可排序、可解释层已经继续落地，不再只是“持久化了但不会用”
- 当前 `Remote Repo Index` 和 active candidate 区的 explainability 风格更接近，代码联动区内部的一致性更好
- 这一步继续符合轻量原型路线：增强的是现有面板的诊断价值，而不是新开一个复杂子页面

#### 遇到的问题

- 当前 ranking 仍然是启发式，不是更严格的 IR / embedding 检索
- `score` 目前只服务于相对排序，没有校准成更稳定的跨 repo 指标
- 目前 focused hits 只展示前几项，尚未提供完整展开或搜索

#### 下一步

- 继续推进 `M4`：评估是否把 regression diagnostics 做成更明确的错误类型与刷新建议
- 继续推进 `M4`：评估是否给 symbol cache 增加更细的搜索或展开策略
- 继续推进 `M5`：继续评估 snapshot 是否需要升级为更稳定的 draft/entity 视图


### 2026-03-25 19:05 / Phase 4 regression error classification pass

#### 已完成

- `Cross-sample Regression` 的失败诊断开始带上最小错误类型，不再只有一段 detail 文本
- 当前 warm 失败会区分 `network / repo not found / rate limit / unsupported source / unknown`
- 刷新建议开始根据错误类型分流，而不是所有失败都回到同一句通用提示
- 这让回归区已经具备更明确的失败路径解释，而不是只展示“失败了，请重试”
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里关于 regression diagnostics 的错误类型层已经补上，回归区更接近真正可调试工作台
- 当前失败分类仍保持轻量，但已经足够支撑“看懂失败原因 + 决定下一步动作”
- 这一步继续避免把系统拉向复杂监控面板，而是优先补足可解释性短板

#### 遇到的问题

- 当前错误分类仍依赖 detail 文本启发式解析，不是更严格的错误码系统
- 还没有跨次统计不同错误类型的频率或历史
- 如果未来接入本地 repo bridge，还需要扩展新的失败类型

#### 下一步

- 继续推进 `M5`：继续评估 snapshot 是否需要升级为更稳定的 draft/entity 视图
- 继续推进 `M4`：评估是否给 symbol cache 增加更细的搜索或展开策略
- 继续推进 `WP-H`：评估是否把 repo/index diagnostics 进一步下沉出页面层


### 2026-03-25 19:09 / Phase 5 snapshot detail card pass

#### 已完成

- `Saved Draft Snapshots` 现在不再只靠列表内小预览判断内容，而是支持在工作台内打开稳定的 snapshot detail card
- detail card 会展示 snapshot 的 paper、tag summary、更新时间、archive 状态、备注和完整 Markdown 内容
- detail card 里也补上了 `Load Snapshot / Copy Markdown / Download .md / Close Detail`
- 这让 snapshot 更接近轻量 draft entity，而不是只有列表项与临时 preview
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M5` 已经从“snapshot 可保存、可筛选、可归档、可预览”进一步推进到“有稳定 detail/card 视图”
- 当前 detail 仍留在工作台内，没有扩展成独立页面，但已经足够支撑更像实体的浏览和操作
- 这一步比直接开新页面更稳，能继续验证 snapshot 是否真的需要升级为完整文档层

#### 遇到的问题

- detail card 仍然是工作台内视图，不是独立路由或列表页
- 目前 snapshot 之间还没有版本关系、比较视图或派生链
- 复制和下载动作仍复用当前 composer 状态提示，没有单独的 snapshot 通知区

#### 下一步

- 继续推进 `M5`：评估 snapshot 是否需要更明确的 entity 操作，例如 compare、duplicate 或版本链
- 继续推进 `M4`：评估是否给 symbol cache 增加更细的搜索或展开策略
- 继续推进 `WP-H`：评估是否把 snapshot/detail 操作进一步下沉出页面层


### 2026-03-25 19:18 / Phase 4 symbol cache browse pass

#### 已完成

- `Indexed Symbol Cache` 现在支持按 `symbol / path / snippet` 搜索，不再只能看固定排序结果
- 新增 `Focused hits / All cached` 视图模式，可以在 paragraph-aware ranking 和直接浏览缓存之间切换
- symbol cache 区开始支持 `Show All / Collapse`，避免只有前几条可见而看不到完整 cache
- 当前标题统计也会同时显示 `visible / matching / cached`，让筛选后的范围更可见
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里关于 symbol cache 的浏览层已经补上，repo preview 不再只是“能解释”，也开始“能查找、能展开”
- 当前这个能力与前面的 ranking pass 形成闭环：先按段落聚焦，再允许用户切回完整 cache 自己探索
- 这一步继续保持轻量，不需要额外的新页面或复杂面板，就能明显提高 repo cache 的可用性

#### 遇到的问题

- 当前搜索仍是简单文本包含，不是更高级的模糊匹配或多字段权重检索
- `All cached` 视图仍复用当前缓存顺序，没有单独的 path/symbol 排序控制
- 目前还没有把 symbol cache 搜索词持久化到 local storage

#### 下一步

- 继续推进 `M5`：评估 snapshot 是否需要更明确的 entity 操作，例如 compare、duplicate 或版本链
- 继续推进 `M4`：评估是否要给 `All cached` 增加更明确的排序方式
- 继续推进 `WP-H`：评估是否把 repo/index diagnostics 进一步下沉出页面层


### 2026-03-25 19:20 / Phase 5 snapshot duplicate pass

#### 已完成

- `Saved Draft Snapshots` 和 snapshot detail card 现在都支持 `Duplicate`
- duplicate 出来的新 snapshot 会自动生成同 selection 下唯一的 `copy / copy 2 / copy 3` 命名
- 复制时会保留 markdown、selection、mode、note 等核心信息，但默认恢复为 active snapshot，而不是继续继承 archived 状态
- duplicate 完成后会直接展开新的 snapshot，便于继续编辑或导出
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M5` 已经开始具备真正的 draft entity 操作，而不只是查看、改名、归档和删除
- `Duplicate` 让 snapshot 更像可派生的草稿节点，为后续 compare/version-chain 留出了更自然的路径
- 这一步继续维持 Local-first 原则，没有引入新的页面或更重的文档系统

#### 遇到的问题

- 当前 duplicate 仍然只是平铺复制，没有记录 parent/derived 关系
- 还没有 compare 视图，复制后的差异仍需用户自己判断
- 当前唯一命名规则仍限制在同一 selection 内，不是全局 snapshot namespace

#### 下一步

- 继续推进 `M5`：评估是否给 snapshot 增加 compare 或 parent/derived 关系
- 继续推进 `M4`：评估是否要给 `All cached` 增加更明确的排序方式
- 继续推进 `WP-H`：评估是否把 snapshot/detail 操作进一步下沉出页面层


### 2026-03-25 19:22 / Phase 5 snapshot compare summary pass

#### 已完成

- snapshot detail card 现在会和当前 active composer draft 做最小 comparison summary
- 当前 comparison 会直接显示 selection overlap、draft mode 是否一致，以及 markdown 行数差异
- 如果当前没有 active draft，detail card 也会明确提示这是单独浏览状态，而不是静默缺省
- 这让 snapshot detail 不再只是静态内容查看，而开始具备最小 compare 能力
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M5` 已经从“可查看、可复制”继续推进到“可快速对照 active draft”，snapshot 的实体感更强
- 当前 compare 仍然是轻量 summary，而不是复杂 diff，但已经足够帮助用户判断要不要 load / duplicate /继续改
- 这一步为后续是否要做真正 compare view 提供了低成本验证路径

#### 遇到的问题

- 当前 comparison 仍是 summary，不显示具体哪几行变化
- 还没有 parent/derived 元数据，因此 compare 仍然只针对“当前 active draft”
- markdown 差异目前只展示行数变化，不是更细的 section-level 对比

#### 下一步

- 继续推进 `M5`：评估是否要为 snapshot 增加 parent/derived 关系或更明确的 compare 视图
- 继续推进 `M4`：评估是否要给 `All cached` 增加更明确的排序方式
- 继续推进 `WP-H`：评估是否把 snapshot/detail 操作进一步下沉出页面层


### 2026-03-25 19:25 / Phase 4 symbol cache sort pass

#### 已完成

- `Indexed Symbol Cache` 新增 `Best match / Path A-Z / Symbol A-Z / Line number` 排序方式
- 当前 `Focused hits` 和 `All cached` 两种浏览模式都会经过同一套排序层，而不再只能依赖默认缓存顺序
- 这让 `All cached` 视图从“能展开”继续推进到“能按目标方式浏览”，更接近真正的轻量 cache browser
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M4` 里关于 symbol cache 的排序和浏览控制已经进一步收敛，repo preview 的探索路径比之前更完整
- 当前用户已经可以按匹配优先、路径优先、符号名优先或行号顺序去检查缓存，不再被单一路径锁死
- 这一步继续支撑 `WP-F` 和 `WP-H`：repo cache 更稳定，页面层上的调试操作也更清晰

#### 遇到的问题

- 当前排序仍然是前端本地规则，不涉及更复杂的多维 ranking 配置
- `Focused hits` 下如果用户切到非 `Best match`，会更偏浏览而不是严格相关性优先
- 目前还没有把排序选择持久化到 local storage

#### 下一步

- 继续推进 `M5`：评估是否要为 snapshot 增加 parent/derived 关系
- 继续推进 `WP-H`：评估是否把 snapshot/detail 操作进一步下沉出页面层
- 继续推进 `M4`：评估是否把 repo cache 的浏览控制继续抽成独立 helper


### 2026-03-25 19:28 / Phase 5 snapshot relation pass

#### 已完成

- `StoredComposerSnapshot` 开始支持 `parentSnapshotId / parentSnapshotName`
- `Duplicate Snapshot` 现在会记录派生来源，而不只是复制一份内容
- snapshot detail card 和列表卡片都会显示 `derived from ...` 与 `N derived copies` 这类关系信号
- 即使父 snapshot 后续被删除，当前派生 snapshot 也仍能通过 `parentSnapshotName` 保留来源提示
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M5` 已经从“可复制、可比较”进一步推进到“有最小关系结构”的 draft entity
- 这一步虽然还不是完整版本链，但已经让 snapshot 不再只是平铺列表，而开始具备派生语义
- 当前这条路径和之前的 duplicate / compare summary 能自然衔接，继续符合 Local-first 的轻量推进策略

#### 遇到的问题

- 当前 relation 仍然是单父节点语义，没有 root chain 或更完整的 lineage
- 还没有基于这些关系做真正的 compare history 或 tree 视图
- 目前派生关系主要服务于理解上下文，不会限制后续 rename/archive/delete 操作

#### 下一步

- 继续推进 `WP-H`：评估是否把 snapshot/detail/relation 逻辑进一步下沉出页面层
- 继续推进 `M5`：评估是否真的需要更重的 lineage/tree 视图
- 继续推进 `M4`：继续收敛 repo cache helper 的边界


### 2026-03-25 19:31 / WP-H snapshot helper extraction pass

#### 已完成

- 新增 `src/features/idea-workspace/snapshots.ts`
- snapshot 的 `duplicate naming / relation signals / compare summary` helper 开始从 `WorkspacePage` 下沉回 `features/idea-workspace`
- `WorkspacePage` 继续保留状态与交互接线，但不再承担这些纯数据推导 helper 的定义
- 这让刚补出来的 snapshot entity 能力开始形成独立 feature 边界，而不是继续堆在页面底部
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `WP-H` 已经不再只是口头目标，snapshot 这条线开始有了真正的模块下沉动作
- 当前页面层虽然仍然偏大，但至少新增长出来的 entity 逻辑没有继续全部留在页面里
- 这一步对后续继续补 snapshot lineage / compare 或导出动作都有利，因为 feature 边界开始更清晰

#### 遇到的问题

- 当前下沉还只覆盖 snapshot helper，一部分列表过滤、编辑状态和交互动作仍在页面层
- code-link 这条线也还有不少 cache/ranking helper 仍然留在页面里
- 目前还没有把 snapshot action reducer/store 抽出来，只是先拆 helper

#### 下一步

- 继续推进 `WP-H`：评估是否把 snapshot action 和 list/detail 视图逻辑继续下沉
- 继续推进 `M5`：评估是否真的需要更重的 lineage/tree 视图
- 继续推进 `M4`：继续收敛 repo cache helper 的边界


### 2026-03-25 19:34 / WP-H symbol cache helper extraction pass

#### 已完成

- `symbol cache` 的 `sort mode / query match / list ordering` helper 开始从 `WorkspacePage` 下沉到 `src/features/code-link/symbols.ts`
- `WorkspacePage` 现在只保留 symbol cache 的 view state 和 UI 控件，不再定义这层 helper 细节
- 这让 `M4` 刚补出来的轻量 cache browser 开始真正形成 feature 级能力，而不是继续固化为页面私有逻辑
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `WP-H` 又往前走了一步：snapshot helper 和 symbol cache helper 都已经开始往 feature 层回收
- 当前 `WorkspacePage` 仍然偏大，但最近新增的两条能力链已经不再全部堆在页面底部
- 这一步也让后续继续调 symbol cache 浏览行为时，不需要反复在页面里找局部 helper

#### 遇到的问题

- 当前 repo index diagnostics 和 sample regression helper 仍然主要留在页面层
- `symbols.ts` 现在同时承担 symbol 提取和 cache browser helper，后续可能还要再拆
- 页面状态本身还没有进入更独立的 reducer/store 结构

#### 下一步

- 继续推进 `WP-H`：评估是否把 repo index / regression diagnostics helper 继续下沉
- 继续推进 `M5`：评估是否真的需要更重的 lineage/tree 视图
- 继续推进 `M4`：继续打磨 cache browser，但尽量优先在 feature 层完成


### 2026-03-25 19:49 / Phase 5 snapshot lineage view pass

#### 已完成

- snapshot detail card 现在不只显示 relation chips，还能直接展示 parent snapshot 与 direct derived snapshots
- lineage 区支持从 detail card 内直接 `Open Parent / Load Parent / Open Derived / Load Derived`
- 如果父 snapshot 已不在本地存储中，detail card 也会明确显示缺失提示，而不是只剩抽象 relation 文案
- 这让 snapshot 的 lineage 已经从“有关系元数据”推进到“可浏览、可跳转的轻量关系视图”
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M5` 已经不再只是把 snapshot 当作平铺列表项，而是开始具备真正的轻量 lineage 浏览能力
- 当前 lineage view 仍然保持在 detail card 内，没有扩展成单独树视图，但已经足够支撑日常分叉与回看
- 这一步继续符合当前原型节奏：优先验证“关系是否真的常用”，再决定是否升级为更重的 tree/history 界面

#### 遇到的问题

- 当前 lineage 仍然只覆盖单层 parent 和 direct derived，不会展开更深层历史
- derived snapshot 列表仍是简单卡片，不提供批量 compare 或 collapse tree
- 目前 lineage view 还没有按时间或活跃度切换排序

#### 下一步

- 继续推进 `WP-H`：评估是否把 repo index / regression diagnostics helper 继续下沉
- 继续推进 `M5`：评估 lineage 是否真的需要升级为更深层 tree/history
- 继续推进 `M4`：继续打磨 cache browser，但尽量优先在 feature 层完成


### 2026-03-25 19:53 / WP-H regression helper extraction pass

#### 已完成

- 新增 `src/features/code-link/regression.ts`
- sample regression 的 `diagnostic classification / cache signals / refresh hint / preview building` helper 开始从 `WorkspacePage` 下沉到 feature 层
- `WorkspacePage` 现在继续保留 warm-up 状态与交互触发，但不再定义整组 regression 推导逻辑
- 这让 `M4` 里的 cross-sample regression 不再只是页面局部实现，开始形成可复用的 code-link feature 能力
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `WP-H` 继续向前走了一步：snapshot helper、symbol cache helper、regression helper 都已经开始从页面层回收
- 当前 `WorkspacePage` 仍然很大，但最近这一段增长最快的复杂逻辑已经不再继续全部堆在页面底部
- 这一步也让后续继续迭代 regression diagnostics 时更稳，因为逻辑边界已经开始明确

#### 遇到的问题

- 当前 warm-up 触发流程与局部状态仍然在页面层，没有继续抽成 action/store
- repo index 状态与 confirmation memory 也还没有同步下沉
- `regression.ts` 当前同时承载类型和 helper，后续可能还会再细分

#### 下一步

- 继续推进 `WP-H`：评估是否把 repo index / confirmation memory 的页面 helper 继续下沉
- 继续推进 `M5`：评估 lineage 是否真的需要升级为更深层 tree/history
- 继续推进 `M4`：继续打磨 cache browser，但尽量优先在 feature 层完成


### 2026-03-25 20:00 / WP-H code memory helper extraction pass

#### 已完成

- `confirmation memory / rejected count / paragraph decision keys / code-side backlink grouping` helper 开始从 `WorkspacePage` 下沉到 `src/features/code-link/mappings.ts`
- `WorkspacePage` 现在直接消费这些 selector/grouping helper，而不再维护对应的本地实现
- 这让 code-link 的“确认记忆 + backlink”不再只是页面局部拼装，而开始成为 feature 层的稳定能力
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `WP-H` 又往前走了一段：snapshot helper、symbol cache helper、regression helper、code memory helper 都已经开始脱离页面层
- 当前页面层依然大，但最近最常改的 code-link 组织逻辑已经逐步回收到 feature 目录
- 这一步对后续继续补 confirmation memory 的排序、筛选或导出都更有利，因为边界已经开始收紧

#### 遇到的问题

- 当前 repo index warm-up 触发和部分 UI 状态仍然在页面层
- mappings 现在同时承载 persistence 和 selector/grouping helper，后续可能还要再拆
- 还没有把 code-link 的完整 local state 抽成独立 store

#### 下一步

- 继续推进 `WP-H`：评估是否把 repo index warm-up / indexing 状态周边 helper 继续下沉
- 继续推进 `M5`：评估 lineage 是否真的需要升级为更深层 tree/history
- 继续推进 `M4`：继续打磨 cache browser，但尽量优先在 feature 层完成


### 2026-03-25 20:05 / WP-H repo indexing helper extraction pass

#### 已完成

- 新增 `src/features/code-link/indexing.ts`
- repo index 的 `cache read / cache write / warm diagnostic copy / warm status summary` helper 开始从 `WorkspacePage` 下沉到 feature 层
- `WorkspacePage` 现在继续负责触发 indexing 和 warm-up，但不再直接维护这些缓存与状态文案 helper
- 这让 repo indexing 不再只是页面里的临时逻辑，而开始形成更明确的 code-link 子模块边界
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `WP-H` 又往前推进了一步：snapshot、symbol cache、regression、code memory、repo indexing 这几段增长最快的 helper 都已经开始回收到 feature 层
- 当前页面层仍然承担大量状态协调，但索引链路的本地逻辑已经没有继续全部堆在页面里
- 这一步也让后续继续调 warm-up 文案、缓存行为和 repo index 接线时更稳，因为边界开始更清楚

#### 遇到的问题

- 当前真正的 indexing 状态机和异步触发仍然在页面层
- `indexing.ts` 目前主要承载 cache/warm helper，还没有覆盖更完整的 index-flow orchestration
- repo index 与 regression/status helper 目前还分布在 `indexing.ts` 和 `regression.ts` 两个文件，后续还需要再观察是否要合并或细拆

#### 下一步

- 继续推进 `WP-H`：评估是否把 repo indexing 的异步触发与状态协调继续下沉
- 继续推进 `M5`：评估 lineage 是否真的需要升级为更深层 tree/history
- 继续推进 `M4`：继续打磨 cache browser，但尽量优先在 feature 层完成


### 2026-03-25 20:11 / WP-H repo indexing orchestration pass

#### 已完成

- 重新对照当前文件夹、`WorkspacePage` 结构和最近 git 提交，确认 `WP-H` 的主问题已经从“helper 散落”转向“异步编排仍堆在页面层”
- 将 repo index 单仓库拉取与 sample warm-up 的异步编排继续下沉到 `src/features/code-link/indexing.ts`
- 新增 `resolveRepoIndex` 与 `warmSampleRegressionIndexes`，统一处理 cache reuse、network refresh、diagnostic 聚合和 active repo resolution
- `WorkspacePage` 中的 `handleIndexRepo` 与 `handleWarmSampleRegressionIndexes` 现在只保留按钮触发、UI 状态同步和结果落盘，不再自己循环 demo sample 或拼 diagnostics
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `WP-H` 在 code-link 这条线上已经不只是在抽纯 helper，而开始触及真正的异步编排边界
- `WorkspacePage` 仍然很大，但 repo indexing / sample warm-up 这一块的耦合已经继续收紧，后续若抽 custom hook 或 controller 会更自然
- 当前阶段判断不需要改档：`M4`、`M5` 仍在持续收敛，同时结构治理开始跟上功能增长速度

#### 遇到的问题

- repo indexing 的 loading / error / source 状态仍在页面层，尚未形成完整 controller/store
- sample regression 与 repo index 现在分布在 `indexing.ts`、`regression.ts` 和页面层三处，边界还需要再观察
- `M3` 的最小模型接线仍未启动，当前 Context 仍主要是 schema 和规则卡片

#### 下一步

- 继续推进 `WP-H`：评估是否把 repo indexing 的 loading / error / source 状态进一步下沉到 custom hook 或 controller
- 继续推进 `WP-H`：开始清理 snapshot/detail/selection 这条线的页面状态密度
- 继续推进 `M3`：定义最小 AI provider 接线边界，避免计划长期只在 Phase 4 / Phase 5 横向扩张


### 2026-03-25 20:21 / Phase 3 live AI assist breakthrough

#### 已完成

- 新增 `src/features/ai/storage.ts`，为工作台引入本地持久化的 AI provider 配置，统一承接 `disabled / openai-compatible / ollama`
- 新增 `src/features/ai/client.ts`，建立浏览器侧的 provider 请求适配层，统一处理 OpenAI-compatible 与 Ollama 的文本 / JSON 返回
- 新增 `src/features/ai/context.ts`，让 Context 面板可对当前段落发起真实模型请求，生成 `summary / translation / focusNote / whyItMatters / terms`
- 当前 Context 面板已支持 provider 配置、响应语言、温度、API key（可选）、`Generate With AI / Use Rule Baseline`
- AI 生成结果会继续复用既有的 evidence ref 跳转链路，因此解释仍能回到页码与段落
- 当前 Context 卡片会显式标记 `Rule baseline` 或 `provider + relative time`，不再把规则输出和模型输出混在一起
- Composer 现在可用同一套 provider 执行 `Expand With AI`，在保留 anchor 引用的前提下重写草稿 Markdown
- 再次完成 `npm run build`
- 再次完成 `npm run lint`

#### 当前判断

- `M3` 可以判定为完成：Phase 3 不再只是规则卡片和 evidence schema，而是已经具备最小可运行的真实 AI 辅助链路
- 当前工作台已经形成更完整的闭环：读段落 -> 生成 AI 上下文 -> 回跳证据 -> 记 idea -> 生成草稿 -> AI 扩写
- 这一轮是阶段性突破，而不是局部修补，因此顶部阶段判断、里程碑表和下一批执行项都需要同步重排

#### 遇到的问题

- 当前 AI 请求仍是浏览器直连 provider，后续若考虑分享、部署或更强的密钥控制，可能还需要 proxy / backend bridge
- AI context 结果目前是工作台内存态缓存，不是持久化 artifact
- `WorkspacePage` 继续膨胀，虽然能力上去了，但 `WP-H` 仍然需要继续治理状态密度

#### 下一步

- 继续推进 `WP-H`：清理 `WorkspacePage` 中围绕 AI assist / snapshot detail / selection 的局部状态与交互接线
- 继续推进 `M4`：在 Phase 3 已收口后，把主火力重新放回 repo bridge、local path 方案与 code-link 深度
- 继续推进 `M5`：判断当前 snapshot library 是否足够，还是升级为正式 draft entity


### 2026-03-25 20:29 / Verification pass + AI reliability hardening

#### 已完成

- 对当前已完成功能做了一轮严谨检查，重点复核 live AI assist、composer AI 扩写、provider 配置切换和缓存键边界
- 修复 AI context cache key 未纳入 `temperature` 的问题，避免改温度后误复用旧结果
- 修复 provider 切换时 base URL 只做字符串直比的隐患，统一改为规范化 URL 判定
- 为官方 `https://api.openai.com/v1` 路径补上前置 API key 校验，避免用户点击生成后才在请求层失败
- 为 Context AI 生成和 Composer AI 扩写补上 stale request guard，避免请求返回时覆盖用户已经切走或已修改的当前状态
- 再次完成 `npm run build`
- 再次完成 `npm run lint`
- 追加完成 `git diff --check`，确认没有额外的空白或补丁格式问题

#### 当前判断

- 当前 Phase 3 的能力不仅“能用”，而且已经比刚接线时更可控，特别是异步请求返回与工作台状态错位这类高频原型 bug 已被提前压掉
- 当前最明确的残余工程项不是功能缺失，而是 `WorkspacePage` 体量仍大，以及构建后 `WorkspacePage` chunk 仍略高于 500 kB 警戒线
- 这轮验证没有推翻之前对 `M3` 完成的判断，但确实补强了这个判断的可信度

#### 遇到的问题

- 目前仍没有自动化测试框架，验证仍以 build、lint 和针对状态边界的代码审查为主
- AI 请求仍然是浏览器直连 provider，若后续需要更稳的部署与密钥控制，仍要评估 proxy / backend bridge
- `WorkspacePage` 的体积和职责仍需继续治理，否则后续 Phase 4 / 5 继续增长时风险会重新抬头

#### 下一步

- 继续推进 `WP-H`：优先拆解 `WorkspacePage` 中的 AI assist / composer / snapshot 局部状态，降低单文件密度
- 继续推进验证基础设施：评估是否为纯函数模块补最小自测入口，而不急着引入重测试栈
- 继续推进 `M4` / `M5`：在可靠性收口后再扩功能，避免“边长功能边放大旧 bug”


### 2026-03-25 20:36 / WP-H helper extraction + minimal test baseline

#### 已完成

- 新增 `src/features/idea-workspace/selectors.ts`，把 idea / snapshot / composer selection 相关的纯函数 helper 从 `WorkspacePage` 底部抽离到 feature 层
- 新增 `src/features/ai/utils.ts`，把 AI context cache key 与 provider base URL 重置判定从页面层抽离
- `WorkspacePage` 不再维护这批底部 helper 的定义，页面层继续缩小为“状态 + 接线 + 渲染”
- 新增 `test/ai-storage.test.ts`、`test/ai-context.test.ts`、`test/idea-workspace-selectors.test.ts`、`test/snapshots.test.ts`
- 当前自测已覆盖 AI 配置校验、cache key、provider base URL 逻辑、AI context JSON 解析、snapshot lineage / compare、selection key、snapshot filter、time filter 等纯逻辑
- 在 `package.json` 中加入 `npm run test`
- 修复 `eslint.config.js` 中原有的语法错误，避免 lint 链路本身失效
- 当前已验证通过：`npm run test`、`npm run build`、`npm run lint`、`git diff --check`

#### 当前判断

- `WP-H` 已经不再只是“继续拆 helper”，而是开始把页面底部的零散纯逻辑系统性回收到 feature 模块
- “最小自测入口”这个计划项可以视为已启动并形成基线，而且已经不只覆盖两个 helper 文件，后续继续补纯函数测试不需要从零搭链路
- 当前最明确的剩余压力仍是 `WorkspacePage` 体量与功能密度，而不是验证入口缺失

#### 遇到的问题

- 目前自测只覆盖纯函数模块，还没有进入 React 交互层或端到端场景
- `WorkspacePage` 构建后的 chunk 仍略高于 500 kB，说明仅靠 helper 抽离还不足以消化页面体积
- 现有测试仍依赖 Node 直跑 TypeScript 模块，适合当前轻量阶段，但还不是完整测试体系

#### 下一步

- 继续推进 `WP-H`：优先拆 AI assist / composer / snapshot detail 这些局部状态密集区，而不再只拆底部 helper
- 继续推进 `M4`：把注意力切回本地路径 / repo bridge 与 code-link 深度
- 继续推进自测：沿着已建好的入口，优先补 `indexing.ts` 及 repo/index diagnostics 相关纯逻辑测试

## 15. 决策记录

### D-001（2026-03-24）

决定：项目第一版以“研究阅读工作台”定义，而不是“AI PDF 阅读器”。

原因：

- 这样更准确反映项目的独特价值。
- 可以同时覆盖阅读、代码联动、idea 生成三个主线。

### D-002（2026-03-24）

决定：论文-代码联动进入 P0。

原因：

- 这是项目差异化最强的一项能力。
- 它直接对应真实研究与复现场景。

### D-003（2026-03-24）

决定：idea 捕获与 idea 文档扩展进入 P0。

原因：

- 它让项目从“阅读工具”升级为“研究工作台”。
- 是当前项目非常有辨识度的功能。

### D-004（2026-03-24）

决定：第一版论文-代码联动采用“候选映射 + 用户确认”策略。

原因：

- 全自动高精度映射在第一版风险太高。
- 人工确认更符合真实可用性与稳健性。

### D-005（2026-03-24）

决定：前端基础路线采用 `Vite + React + TypeScript`，并以 Web-first 原型优先。

原因：

- 当前阶段更看重快速迭代、交互验证和最小工程负担。
- 这条路线最适合先把 Reader Core 和主工作流落下来。

### D-006（2026-03-24）

决定：默认版本管理策略为“阶段性本地提交，除非明确要求否则不 push”。

原因：

- 这样更符合当前逐步推进、分阶段验收的协作方式。
- 可以在每个突破点形成可回滚的本地里程碑。

### D-007（2026-03-24）

决定：Reader Workspace 采用“PDF 主体区 + Context/Code 近场侧栏 + Idea Workspace 次级区”的工作台结构。

原因：

- 这样最能同时承载三大主线。
- 可以避免界面退化成“左 PDF，右聊天框”的普通形态。


### D-008（2026-03-24）

决定：Workspace 路由采用懒加载，避免 `PDF.js` 运行时拖重首页首屏。

原因：

- Reader Core 依赖体积明显大于普通静态页面。
- 首页主要承担项目说明，不应为 PDF 运行时支付首屏成本。
- 这能为后续继续拆分 Composer 等重模块提供模式。


### D-009（2026-03-24）

决定：段落锚点 ID 采用“页码 + 文本指纹 + 位置摘要”的稳定生成策略，而不是页内序号。

原因：

- 页内序号在重渲染、多页返回和后续回跳场景下不够稳。
- 稳定 ID 是 evidence ref、idea 绑定和代码联动的共同基础。

### D-010（2026-03-24）

决定：Phase 3 开始前，先用显式 schema 固定 explanation card 与 evidence ref 数据结构。

原因：

- 如果先堆 UI，后面接模型时很容易推翻已有实现。
- Context 面板和未来 inline card 应共享同一套证据链结构。


### D-011（2026-03-24）

决定：论文-代码联动 MVP 的主样本冻结为 `Segment Anything + facebookresearch/segment-anything`。

原因：

- 这组样本在论文术语、仓库结构和演示直观性之间最平衡。
- 第一版可以先做结构级索引，不依赖重训练环境。

### D-012（2026-03-24）

决定：Web-first 原型中，GitHub 输入统一先归一化到 repo root，本地路径保留为“已接受但需 bridge”的输入形态。

原因：

- 这样可以先固定远程索引边界，避免 tree/blob/ssh 形态把 MVP 弄复杂。
- 同时保留本地路径入口，不会把桌面桥接路线彻底排除在后续之外。

### D-013（2026-03-24）

决定：真实 repo 索引完成前，先把 `Confirm / Dismiss` 结果做成可持久化的 confirmation memory。

原因：

- 论文-代码联动第一版的核心不是“自动猜得多准”，而是“人工修正后能留下来并复用”。
- 这样后续把启发式候选替换成真实索引候选时，不需要推翻用户已经确认的结果。


### D-014（2026-03-24）

决定：真实 GitHub repo 索引第一轮采用 `contents + README + 优先目录扫描 + 少量关键文件` 的轻量链路，而不是一开始就上更重的后端解析。

原因：

- 这样更适合当前 Web-first 原型，能先验证公开仓库索引和候选生成链路是否成立。
- 在没有后端桥接的前提下，这是一条更稳、更快、更利于课堂展示的实现路径。


### D-015（2026-03-24）

决定：Idea Composer 第一轮先放在现有 Workspace 的 Idea 面板内，以规则草稿预览验证闭环，而不是立即拆出独立页面或直接接入模型。

原因：

- 这样可以先验证“选择 idea -> 形成结构化草稿”这条链路是否成立。
- 在没有模型配置和导出层之前，内联式 Composer 更适合快速验证交互价值。

### D-016（2026-03-25）

决定：Phase 5 下一步继续采用“生成草稿 -> 本地编辑 -> Markdown 导出”的渐进式路径，暂不拆独立文档页面。

原因：

- 这样能先把 `M5` 的主要验收缺口从“只有预览”缩小到“可编辑、可导出”的原型状态。
- 在 AI 扩展、导出层和 draft 持久化规则都未冻结前，继续留在 Workspace 内更利于快速迭代。

### D-017（2026-03-25）

决定：Idea Workspace 第二轮继续采用 Local-first 的 `idea list + single active draft` 策略，并先把筛选、编辑和恢复做扎实。

原因：

- 在 `M5` 尚未通过前，优先做“能管理、能恢复、能继续写”比过早引入复杂多文档系统更稳妥。
- 这条路径可以先验证真实使用中的管理动作，再决定是否拆成独立 draft 列表和更重的数据层。

### D-018（2026-03-25）

决定：多草稿管理第一轮先采用 `named snapshots`，而不是直接引入完整的独立文档系统。

原因：

- 这样可以先验证用户是否真的需要保存多个版本，而不会过早把状态模型做重。
- 这条路径能与当前 active draft 恢复机制兼容，推进成本更低，也更容易继续迭代。

### D-019（2026-03-25）

决定：`M4` 的当前执行标准不再接受“只做到文件级深链就停止”，而是采用“默认优先 symbol / line，文件级作为回退”的路径。

原因：

- 仅有 file-level deep link 时，confirmation memory 和 code backlink 仍然过粗，无法形成更可信的代码目标记忆。
- 先做最小的 symbol / line 启发式定位，已经足够把 `M4` 从“能打开文件”推进到“更具体地打开代码目标”。

### D-020（2026-03-25）

决定：在是否升级为正式 draft 实体尚未定案前，先把 `named snapshots` 扩展为带元数据、可筛选、可重命名的轻量 draft library。

原因：

- 这样可以继续补 `M5` 的真实管理动作，而不需要立刻引入更重的文档模型和列表页。
- 这条路径能保留当前 Local-first 结构，并为后续是否升级成正式 draft 实体提供更明确的使用证据。

### D-021（2026-03-25）

决定：第二样本回归先以内建的 `Cross-sample Regression` 视图落地，而不是另做独立测试页面或离线脚本。

原因：

- 这样可以直接复用当前 `buildCodeCandidates` 主链路，让回归观察和真实产品行为保持一致。
- 在 `M4` 尚未封板前，把回归入口放进工作区本身，比维护另一套专用验证界面更稳妥。

### D-022（2026-03-25）

决定：Code Link 的 explainability 先采用 `signals + reason` 的轻量双层结构，而不是立即引入完整的评分明细面板。

原因：

- 当前阶段更需要让候选排序“可见、可解释、可持久化”，而不是过早把排序器做成复杂调试系统。
- 这条路径已经能同时服务 active candidate、confirmation memory 和 cross-sample regression，复用价值更高。

### D-023（2026-03-25）

决定：在完整代码浏览器尚未进入范围前，先在 Code Link 中补 lightweight snippet 预览，而不是直接扩展成完整 file viewer。

原因：

- 当前更重要的是让候选映射具备“就地可验证”的最小源码证据，而不是立刻承担完整代码浏览职责。
- 这条路径可以直接复用现有 indexed key files 数据，并同时服务 active candidate、confirmation memory 和 code backlink。

### D-024（2026-03-25）

决定：LoRA / CLIP 的真实索引链路先以 `Cross-sample Regression` 内的手动 warm-up 方式接入，而不是默认自动拉取所有 demo repo。

原因：

- 这样能把多 sample 真实索引带进工作区，同时保持当前原型对网络动作的显式控制。
- 在索引缓存和失败恢复策略还没成熟前，手动 warm-up 比隐式后台抓取更稳妥。

### D-025（2026-03-25）

决定：repo index cache 的第一轮持久化先采用 feature-level localStorage cache，而不是立即引入更重的数据库或文件缓存层。

原因：

- 当前更需要先把“跨刷新保留索引结果”这件事做通，再决定是否升级为更重的数据层。
- 这条路径与现有 local-first prototype 一致，也能尽快服务当前 repo index 和 sample regression 两条链路。

### D-026（2026-03-25）

决定：repo index cache 的状态反馈先采用轻量信号与相对时间展示，而不是立即引入复杂的缓存面板。

原因：

- 当前更需要的是让索引链路“可见、可解释”，而不是把调试界面做重。
- 轻量信号已经足够覆盖当前 repo index 与 cross-sample regression 两个主要使用点。

### D-027（2026-03-25）

决定：symbol / snippet cache 第一轮先采用运行时派生 + 共享 helper 的方式组织，而不是立刻写回 repo index 持久化结构。

原因：

- 当前更需要先统一 candidate generation 与 repo preview 的解析逻辑，避免两套实现漂移。
- 在 symbol cache 的字段和交互还在收敛时，先保持为派生层比过早固化到持久化结构更稳妥。

### D-028（2026-03-25）

决定：sample regression 的第一轮 diagnostics 先采用 per-sample 轻量 detail + refresh hint，而不是立即做结构化错误面板。

原因：

- 当前更需要的是让失败路径“能看见、能继续操作”，而不是把诊断界面做成新的复杂子系统。
- 这种轻量诊断已经足够覆盖当前 warm sample indexes 的主要交互需求，并能继续低成本迭代。

### D-029（2026-03-25）

决定：在是否升级为正式 draft 实体尚未定案前，snapshot 先补 `note + archive/restore + visibility filter` 这类轻量生命周期动作。

原因：

- 这样可以继续收敛 `M5` 的组织能力，而不需要立刻引入新的文档层级和页面结构。
- 这条路径与当前 Local-first snapshot 模型兼容，能更低成本地验证真实使用中的管理动作。

### D-030（2026-03-25）

决定：snapshot 的详情浏览第一轮先采用列表内 Markdown 预览，而不是立即新开独立 detail 页面。

原因：

- 当前更需要验证用户是否真的需要频繁查看 snapshot 内容，而不是立刻扩展页面结构。
- 列表内预览已经能显著提高判断效率，同时保持当前工作区的信息密度和实现成本平衡。

### D-031（2026-03-25）

决定：在 `symbol cache` 的字段和展示方式初步稳定后，开始把它并入 repo index 的持久化结构，而不是继续只保留运行时派生。

原因：

- 当前 repo preview、repo cache 和后续候选生成都已经开始共享这层结构，继续只做运行时派生会重复计算并弱化 cache 的意义。
- 通过 `enrich` 方式并入持久化结构，可以兼容旧缓存，同时保持当前字段仍可继续低成本演化。

### D-032（2026-03-25）

决定：symbol cache 的 paragraph-aware 排序第一轮直接叠加在现有 `Indexed Symbol Cache` 面板内，而不是额外拆出新的命中解释面板。

原因：

- 当前更需要的是让 repo preview 内部直接体现“哪些 cached symbols 对当前段落最相关”，而不是再增加一层新的界面结构。
- 复用现有卡片和 signal chips，可以让 symbol cache explainability 与 active candidate explainability 保持同一视觉语言。

### D-033（2026-03-25）

决定：regression diagnostics 的错误分类第一轮继续采用 detail 文本启发式归类，而不是立即引入更重的结构化错误协议。

原因：

- 当前 warm sample indexes 的失败来源仍然比较少，用轻量归类就足以支撑刷新建议和调试判断。
- 先把 `type + hint` 补齐，可以更快提高可解释性，同时保留后续再升级为结构化错误码的空间。

### D-034（2026-03-25）

决定：snapshot 的下一步 detail 能力先落成工作台内的稳定 detail card，而不是立即扩展为独立页面或新路由。

原因：

- 当前更需要验证用户是否会频繁打开、复制、下载和回装 snapshot，而不是立刻把信息架构升级成新的页面层。
- detail card 已经能显著提升 snapshot 的实体感，同时继续保持当前工作台流畅的 Local-first 交互。

### D-035（2026-03-25）

决定：symbol cache 的搜索与展开能力继续放在 `Indexed Symbol Cache` 原面板内，以 `Focused hits / All cached` 双模式组织，而不是拆成单独的 cache browser 页面。

原因：

- 当前更需要让 repo preview 内部形成“聚焦解释 + 全量浏览”的连续体验，而不是把 symbol cache 再拆成新的信息层级。
- 双模式已经足够覆盖当前调试和探索需求，同时与现有轻量原型的复杂度控制保持一致。

### D-036（2026-03-25）

决定：snapshot 的第一轮实体操作先补 `Duplicate`，并把复制结果视为新的 active draft 节点，而不是一开始就引入完整版本链。

原因：

- `Duplicate` 已经能覆盖当前最常见的“在现有草稿基础上继续分叉”需求，成本比直接做版本关系系统低很多。
- 先把复制与继续编辑路径跑通，再决定是否真的需要 parent/derived 元数据和 compare 视图，更符合当前原型验证节奏。

### D-037（2026-03-25）

决定：snapshot 的第一轮 compare 能力先采用 detail card 内的轻量 summary，对照当前 active draft，而不是立即实现完整 diff 视图。

原因：

- 当前更需要回答的是“这个 snapshot 和我手上的 draft 差多少，值不值得 load/duplicate”，summary 已经足够支撑这个判断。
- 先做轻量 compare 可以验证真实使用频率，再决定是否值得继续投入更重的 diff/版本关系实现。

### D-038（2026-03-25）

决定：symbol cache 的排序能力继续内嵌在当前 `Indexed Symbol Cache` 面板中，先用少量固定 sort mode，而不是立刻开放更复杂的自定义排序配置。

原因：

- 当前最重要的是让缓存浏览“足够可控”，固定的几个排序方式已经能覆盖匹配优先、路径浏览和符号浏览三种主要任务。
- 保持为少量固定 mode，可以避免当前原型因为排序配置过多而失去清晰度。

### D-039（2026-03-25）

决定：snapshot 的第一轮 lineage 先采用 `parentSnapshotId + parentSnapshotName` 的轻量派生关系，而不是立即扩展为完整版本图。

原因：

- 当前更需要的是让 duplicate 不再是匿名复制，并让用户能看懂“这个 snapshot 从哪来、又派生出了什么”。
- 轻量父子关系已经足够验证 snapshot 是否真的需要更重的 lineage / tree / history 视图。

### D-040（2026-03-25）

决定：`WP-H` 的当前切入点先从 snapshot helper 下沉开始，而不是一上来就重写 `WorkspacePage` 成完整 store/reducer 结构。

原因：

- 当前更需要的是优先把最近增长最快的 snapshot entity 逻辑从页面里剥离出来，降低继续演化时的耦合。
- 先拆 helper 比直接大改状态层更稳，可以在持续交付功能的同时逐步清理页面边界。

### D-041（2026-03-25）

决定：symbol cache 的 browse helper 暂时继续收敛到 `symbols.ts`，先和 symbol extraction 保持同一 feature 模块，而不是立即再拆成新的 cache-browser 文件。

原因：

- 当前这几类 helper 都围绕同一份 `RepoSymbolCacheEntry` 结构运作，先放在一起更利于快速稳定接口。
- 等 repo cache browser 的行为再长一轮之后，再判断是否值得进一步拆成独立模块，会更稳妥。

### D-042（2026-03-25）

决定：snapshot 的第一轮 lineage 浏览继续内嵌在 detail card 内，只展示 parent 和 direct derived，而不是立即扩展为完整树视图。

原因：

- 当前更需要验证“用户是否真的会频繁沿 lineage 来回跳转”，而不是先投入复杂的树形页面。
- 只展示一层 parent 和 direct derived，已经能覆盖当前 duplicate 分叉后的主要浏览需求，同时保持实现边界清晰。

### D-043（2026-03-25）

决定：cross-sample regression 的当前抽离先以 `regression.ts` 聚合 helper 和类型为主，不立即把 warm-up 状态机也一起抽成独立 store。

原因：

- 当前更需要先把推导逻辑从页面里移走，降低后续继续补诊断时的耦合；而 warm-up 的交互状态仍然和工作区 UI 紧密绑定。
- 先拆 helper 和类型可以最小成本地推进 `WP-H`，后续再看是否真的值得上更重的状态层重构。

### D-044（2026-03-25）

决定：confirmation memory 和 code-side backlink 的当前抽离先收敛到 `mappings.ts`，保持“持久化 + selector/grouping”同模块，而不是立即再拆成新的 memory 文件。

原因：

- 当前这些能力都围绕同一份 `StoredCodeLinkDecision` 结构运作，先放在同一模块内更利于稳定接口和减少来回跳转。
- 等 code-link 的 memory 交互再长一轮之后，再决定是否值得把 persistence 与 selector 完全拆开，会更稳妥。

### D-045（2026-03-25）

决定：repo indexing 的当前抽离先以 `indexing.ts` 承担 cache 与 warm-up helper 为主，不立即把完整异步流程一起抽出页面层。

原因：

- 当前更需要优先降低页面里关于 repo cache 和 warm 文案的耦合，而异步触发流程仍然紧贴工作区的按钮和状态展示。
- 先拆 helper 能保持连续交付节奏，同时为后续是否继续抽 indexing controller/store 留出空间。

### D-046（2026-03-25）

决定：repo indexing 的下一轮收敛先把单仓库索引与 sample warm-up 的异步编排抽进 `indexing.ts`，页面层只保留 UI state 与触发，不立即上完整 custom hook/store。

原因：

- 这样可以先把网络拉取、缓存复用和 diagnostic 聚合这些真正会继续膨胀的流程从页面里拿走，收益比继续抽零散 helper 更直接。
- 同时可以避免过早把 repo indexing 和工作区其他状态捆进一套还未验证的全局状态模型。

### D-047（2026-03-25）

决定：Phase 3 的第一轮真实模型接线采用“工作台级共享 AI 配置 + Context / Composer 共用 provider”的路线，同时首轮直接支持 `OpenAI-compatible` 与 `Ollama`。

原因：

- 这样能一次性把 `M3` 从规则卡片推进到真实可运行链路，而不是分别在 Context 和 Composer 各做一套孤立接线。
- 共享配置可以减少设置成本，也更符合当前 prototype 的 local-first 工作台定位。

### D-048（2026-03-25）

决定：在 Phase 3 接线完成后，立即对 AI assist 做一轮可靠性加固，优先修正 stale request、缓存键漂移和 provider 配置校验，而不是马上继续堆新功能。

原因：

- 这类问题在原型阶段最容易被“build 能过”掩盖，但一旦用户开始频繁切段落、改配置、改草稿，就会直接影响可信度。
- 先把这些状态边界补稳，后续继续推进 Phase 4 / Phase 5 时才不会反复回头补基础可靠性。

### D-049（2026-03-25）

决定：验证基础设施第一轮采用“Node 内建 test runner + TypeScript 直跑纯函数模块”的轻量路线，并优先覆盖 `ai/*` 与 `idea-workspace` 的 selector/helper。

原因：

- 当前更需要先把最容易回归的纯逻辑纳入可执行检查，而不是为了测试先引入一整套更重的框架和配置负担。
- 这条路径与当前 Web-first、快速迭代的节奏兼容，同时已经足够支撑后续继续补 `indexing.ts`、`snapshots.ts` 等模块自测。

## 16. 当前开放问题

这些问题不阻塞当前执行，但会影响后续 Phase 3 到 Phase 5 的细化实现：

1. Reader Core 的段落切分第一版只用规则，还是直接引入 Docling？
2. 第一版图表解释是否进 Phase 6，还是提前做一个轻量版？
3. 桌面壳何时介入，是否在 Web 原型稳定后再评估？
4. Web-first 原型里，本地仓库读取是先通过后端桥接，还是先以 GitHub URL 演示为主？
5. 当前 `snapshot` 已具备 detail / duplicate / lineage 后，是否已经足够，还是仍需要升级为真正的 draft 实体与列表页？
6. repo indexing / sample warm-up 下一步是抽成 custom hook / controller，还是继续维持“feature function + page state”的半下沉结构？
7. Phase 3 当前采用浏览器直连 provider，后续是继续保持 local-first 直连，还是补 server proxy / backend bridge？
8. 最小自测入口已经建立后，下一批优先补 `indexing.ts`、`snapshots.ts`、`ai/context.ts`，还是先继续集中火力拆 `WorkspacePage`？

## 17. 审批后的固定规则

本计划已批准，后续默认规则如下：

1. 先完成 P0 主链路，再评估 P1。
2. 每次阶段性突破后都要更新进展日志。
3. 每次阶段性突破后都要做本地 git commit，并写明进展内容。
4. 不新增未讨论功能，不擅自改主路线。

## 18. 当前阶段的下一批执行项

接下来应按以下顺序继续：

1. 继续推进 `WP-H`：评估是否把 repo indexing 的 loading / error / source 状态抽成 custom hook 或 controller，进一步压缩页面层异步编排。
2. 继续推进 `WP-H`：开始清理 AI assist / snapshot detail / selection 这条线的页面状态密度，判断是否抽独立 action/helper 或局部 store。
3. 继续推进验证基础设施：沿着现有 `npm run test` 补 `indexing.ts`、`snapshots.ts`、`ai/context.ts` 的纯逻辑测试。
4. 继续推进 `M4`：在 Phase 3 已完成且可靠性补强后，把主火力切回 repo bridge、本地路径方案和 code-link 深度。
5. 继续推进 `M5`：根据 snapshot detail / duplicate / lineage 的真实使用路径，决定是否升级为正式 draft 实体与列表页。
6. 继续推进 Phase 3 后处理：评估 AI 结果是否需要持久化、prompt preset 是否需要拆分，以及是否引入 proxy/bridge。
7. 在形成下一次阶段性突破后做本地提交，并按分钟级时间更新进展日志。

## 19. 当前迭代执行拆解（Iteration B）

时间范围：自 `2026-03-24 22:03` 起，持续到下一次阶段性本地提交。  
定位：这一轮开始把“样本感知的启发式 demo”推进到“真实 repo artifact 驱动的联动 prototype”，同时为 idea -> 文档链路提前打底。

### WP-E：GitHub 远程索引 MVP

目标：让主样本仓库的远程结构信息真正进入系统，而不是继续只靠手写候选。

任务：

1. 设计 GitHub 远程索引的最小拉取链路：repo root、repo tree、README、少量关键源码文件。
2. 先支持主样本 `facebookresearch/segment-anything`，保证至少 1 个真实案例跑通。
3. 定义远程 artifact 的最小结构，供 Code 面板和后续映射逻辑复用。
4. 为远程索引结果加入最小缓存，避免同一 repo 每次都重新拉取。

完成标准：

- 输入主样本 repo 后，系统能拿到真实的 repo artifact，而不是纯前端占位信息。
- Code 面板能展示至少一部分真实 tree / README / file-level 线索。

### WP-F：真实候选生成替换

目标：把当前 sample-aware 启发式候选逐步替换为“真实 artifact + 术语匹配”的候选生成。

任务：

1. 让候选生成消费远程 repo artifact，而不是只消费样本预设。
2. 明确第一轮候选来源：术语相似、路径语义、README 提示、关键源码文件命中。
3. 保持 `Confirm / Dismiss` 持久化结果兼容，不推翻已有 confirmation memory。
4. 至少在主样本上完成一次真实候选 -> 人工确认 -> 回跳展示。

完成标准：

- 代码候选不再完全依赖预设样本常量。
- 人工确认后的结果仍能稳定回跳到论文段落。

### WP-G：Idea Composer 骨架

目标：在不脱离当前工作台的前提下，为后续 idea -> 文档闭环建立最小骨架。

任务：

1. 明确 Composer 是独立页面还是工作台内展开区域。
2. 设计 idea 选集的数据结构，支持多条 idea 合并生成文档草稿。
3. 先实现最小文档草稿视图，哪怕仍使用本地规则模板。
4. 预留后续 Markdown 导出和 AI 扩展接口位置。

完成标准：

- Idea 工作台不再只停留在“记录”，而是开始具备“整理成文档”的落点。
- 后续接入 AI 文档扩展时，不需要推翻当前骨架。

### WP-H：状态与模块边界补强

目标：避免 `WorkspacePage` 在继续扩展后变成单文件瓶颈。

任务：

1. 评估是否把代码联动状态抽成独立 store 或 feature module。
2. 逐步把 demo sample、repo artifact、confirmation memory 的逻辑从页面层下沉。
3. 为后续 Composer 接入保留清晰的数据边界。

完成标准：

- 页面层继续可维护。
- 后续继续推进 Phase 4 / Phase 5 时，不需要大规模返工页面结构。

## 20. 本轮文档维护规则补充

1. 新增进展日志时，标题必须采用 `YYYY-MM-DD HH:MM / 阶段名`。
2. 如果一次推进跨越多个小步骤，但未形成阶段性成果，可以先不单独记日志，避免日志过碎。
3. 只有当某项推进改变了阶段判断、交付物状态或下一步顺序时，才需要同步更新 `plan.md`。
4. 小修小补可以不立即本地提交；阶段性突破再做 commit。
