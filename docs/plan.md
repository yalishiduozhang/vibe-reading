# OpenVibeRead Plan

文档状态：Approved Baseline  
最后更新：2026-03-25 17:46 (Asia/Shanghai)  
当前阶段：Phase 4 in progress + Phase 5 in progress  
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
| M3 | 内联辅助与证据链可用 | In Progress | 卡片和回跳可演示 |
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

## 16. 当前开放问题

这些问题不阻塞当前执行，但会影响后续 Phase 3 到 Phase 5 的细化实现：

1. Reader Core 的段落切分第一版只用规则，还是直接引入 Docling？
2. 第一版图表解释是否进 Phase 6，还是提前做一个轻量版？
3. 桌面壳何时介入，是否在 Web 原型稳定后再评估？
4. Web-first 原型里，本地仓库读取是先通过后端桥接，还是先以 GitHub URL 演示为主？
5. `named snapshots` 加上元数据与管理动作后是否已经足够，还是仍需要升级为真正的 draft 实体与列表页？

## 17. 审批后的固定规则

本计划已批准，后续默认规则如下：

1. 先完成 P0 主链路，再评估 P1。
2. 每次阶段性突破后都要更新进展日志。
3. 每次阶段性突破后都要做本地 git commit，并写明进展内容。
4. 不新增未讨论功能，不擅自改主路线。

## 18. 当前阶段的下一批执行项

接下来应按以下顺序继续：

1. 继续深化 GitHub 远程索引：补强 artifact 排序、文件跳转与缓存策略。
2. 继续推进 Code Link：从已有的 symbol / line 目标定位走向第二样本回归与更稳的 ranking。
3. 继续补强 Idea Workspace：评估 snapshot 是否升级为正式 draft 实体，并继续收敛组织能力。
4. 评估是否把 repo index / confirmation memory / composer selection / idea storage 继续抽成独立 store，推进 WP-H。
5. 评估是否需要把主样本之外的 LoRA / CLIP 作为回归样本加入验证。
6. 在形成下一次阶段性突破后做本地提交，并按分钟级时间更新进展日志。

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
