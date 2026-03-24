# Information Architecture v1

更新时间：2026-03-24  
阶段：Phase 1  
用途：明确 OpenVibeRead 第一版的信息架构、核心页面、主任务流和对象模型，作为后续 Reader Core 与交互实现的基线。

## 1. 设计原则

第一版的信息架构必须服务于三个核心主线：

- `Read With Context`
- `Read With Code`
- `Read To Create`

因此，系统结构不能按“功能插件堆叠”来组织，而要按“阅读过程中的连续任务流”来组织。

## 2. 顶层信息架构

第一版建议采用 `2 + 1` 结构：

1. `Home`：项目入口与工作台入口
2. `Reader Workspace`：核心阅读与研究工作台
3. `Document Composer`：由 idea 集合生成文档的专用视图

其中，真正的主战场是 `Reader Workspace`。

## 3. 顶层页面定义

## 3.1 Home

### 目的

- 解释项目定位
- 展示当前阶段与核心能力
- 提供进入阅读工作台的入口

### 第一版内容

- 项目一句话定位
- 三大主线说明
- P0 功能摘要
- 当前实现阶段
- 进入 Reader Workspace 的主按钮

### 第一版角色

这是轻入口页，不承担复杂功能。

## 3.2 Reader Workspace

### 目的

这是第一版最重要的页面。

它必须把以下动作整合到一个连续视图中：

- 读论文
- 看 AI 辅助解释
- 切换阅读意图
- 看代码映射候选
- 记录 idea
- 汇总 idea
- 发起文档生成

### 为什么它是核心

如果这一页设计失败，项目会退化成几个分裂的工具面板；如果这一页设计成功，项目才会真正体现“阅读工作台”的价值。

## 3.3 Document Composer

### 目的

- 承接 idea 集合
- 生成 proposal / 实验计划 / 提纲等文档草稿
- 允许继续编辑和导出

### 第一版定位

它是 Reader Workspace 的延伸页，不是独立产品模块。

## 4. Reader Workspace 的页面结构

第一版建议采用三栏逻辑，但视觉上允许在窄屏时折叠为单栏切换。

## 4.1 主体区：Paper Reader

这是核心区域，负责：

- PDF 显示
- 段落定位
- 页码定位
- 段落边缘触发点
- 热区高亮

用户的视觉焦点必须长期停留在这一块。

## 4.2 右侧辅助区：Context / Code 切换侧栏

这一栏不应该默认抢占主视线，而是作为阅读时的“近场扩展层”。

建议分成两个 tab：

- `Context`
  - 当前段落解释
  - 证据链
  - 阅读意图摘要
- `Code`
  - 代码映射候选
  - 文件/函数跳转
  - 论文段落到代码的关系

## 4.3 底部或左侧次级区：Idea Workspace

这一块承接用户产出行为。

建议支持：

- 当前段落记想法
- idea 列表
- 按标签/时间/论文筛选
- 勾选生成文档

### 关键要求

idea workspace 必须和阅读行为紧连，而不是独立弹窗。

## 5. Reader Workspace 的核心区域拆分

## 5.1 顶部控制区

建议包含：

- 文档标题
- 阅读意图切换
- 代码仓库接入入口
- 导出入口
- 视图切换（例如 Context / Code / Ideas）

## 5.2 论文显示区

建议包含：

- PDF 页面视图
- 页码定位
- 段落悬停触发点
- 重要段落热区提示

## 5.3 段落交互层

每个段落至少要支持：

- 展开解释卡片
- 添加 idea
- 查看证据链
- 查看可能对应代码

这是第一版最关键的微交互层。

## 5.4 代码联动面板

建议内容：

- 当前段落可能对应的文件/函数
- 仓库树缩略导航
- 候选映射可信度或来源依据
- 手动确认 / 修正映射按钮

## 5.5 Idea 面板

建议内容：

- 当前段落快速记录框
- idea 列表
- 标签过滤
- 勾选与批量生成文档

## 6. 主任务流

第一版必须优先保障以下 4 条任务流。

## 6.1 任务流 A：理解一段论文

1. 打开 Reader Workspace
2. 选择阅读意图
3. 阅读当前段落
4. 点击段落触发点
5. 查看摘要 / 翻译 / 术语解释
6. 点击证据链回跳原文

目标：验证 `Read With Context`

## 6.2 任务流 B：从论文跳到代码

1. 接入 GitHub 仓库或本地仓库
2. 在论文中定位方法段落
3. 打开代码映射候选
4. 查看候选文件/函数
5. 点击跳转
6. 人工确认或修正映射

目标：验证 `Read With Code`

## 6.3 任务流 C：记录阅读中的想法

1. 读到触发灵感的段落
2. 点击“记录 idea”
3. 输入内容并选标签
4. 系统保存页码、段落、引用
5. 在 idea 面板里查看该条记录

目标：验证 `Read To Create` 的基础环节

## 6.4 任务流 D：把 idea 扩展成文档

1. 在 idea 面板中勾选若干条 idea
2. 选择文档类型
3. 进入 Document Composer
4. 生成结构化草稿
5. 编辑、整理、导出 Markdown

目标：验证从阅读到产出的闭环

## 7. 信息对象模型

第一版最重要的对象不是“页面”，而是下面这些数据实体。

## 7.1 Paper

字段建议：

- id
- title
- source
- file path
- current page
- reading intent

## 7.2 Paragraph

字段建议：

- id
- page number
- bbox / anchor
- raw text
- section
- importance score

## 7.3 Explanation Card

字段建议：

- paragraph id
- summary
- translation
- terms
- why it matters
- evidence refs
- inference tag

## 7.4 Repo Source

字段建议：

- id
- type: github / local
- path or url
- indexed files
- symbols
- config entries

## 7.5 Mapping Candidate

字段建议：

- paragraph id
- repo file
- symbol name
- match rationale
- user confirmed status

## 7.6 Idea

字段建议：

- id
- paper id
- paragraph id
- page number
- quote snippet
- content
- tags
- created at

## 7.7 Generated Document

字段建议：

- id
- source idea ids
- type
- title
- content
- created at
- export format

## 8. 第一版导航策略

第一版不要做复杂路由系统。

建议：

- `/`：Home
- `/workspace`：Reader Workspace
- `/composer/:id`：Document Composer

原因：

- 第一版真正复杂的是工作台内部状态，不是多页面导航。
- 过早引入复杂页面切换只会增加实现负担。

## 9. 状态分层建议

为了让后续实现不混乱，建议把状态分成三层：

## 9.1 View State

- 当前页
- 当前选中的段落
- 当前打开的面板
- 当前阅读意图

## 9.2 Domain State

- Paper
- Paragraphs
- Explanations
- Repo index
- Mapping candidates
- Ideas
- Generated documents

## 9.3 Persistence State

- 本地存储的阅读记录
- 确认后的代码映射
- idea 列表
- 文档草稿

## 10. 第一版最重要的界面判断

第一版最重要的不是做很多页面，而是把 `Reader Workspace` 做对。

如果 Reader Workspace 只是：

- 左边 PDF
- 右边聊天框

那项目会失去独特性。

如果 Reader Workspace 能做到：

- 原文始终是视觉中心
- 解释在段落附近发生
- 代码映射就在当前上下文出现
- idea 捕获不打断阅读

那这个项目就成立了。

## 11. 下一步对接

这份信息架构文档之后，下一步应立即对接：

1. 关键页面线框
2. Reader Workspace 的区域划分
3. Reader Core MVP 的组件拆分
