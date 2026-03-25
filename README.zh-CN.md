<div align="center">
  <img src="./docs/logo.svg" alt="OpenVibeRead Logo" width="160" height="160" />
  <h1>OpenVibeRead</h1>
  <p><em>一个围绕论文、代码与想法的开源研究阅读工作台。</em></p>
</div>

<br/>

[English](./README.md)

OpenVibeRead 是一个开源研究阅读工作台，围绕三条彼此联动的工作流展开：

- **Read With Context（带上下文阅读）** — 直接贴着原文段落进行内联 AI 辅助，不脱离原文语境。
- **Read With Code（结合代码阅读）** — 将论文中的方法名、符号与真实 GitHub 仓库中的实现代码一一对应。
- **Read To Create（阅读并创作）** — 在阅读过程中捕捉 idea，并将其扩展成结构化的输出文档。

这不是一个普通的"PDF + 聊天框"应用，而是一个将三条工作流整合在同一个连贯阅读体验中的工具，研究人员无需离开文档即可完成理解、溯源与创作。

## 功能简介

### 1. 带上下文阅读（Read With Context）

AI 辅助以内联卡片的形式紧贴每个段落显示，不遮挡原文主体：

- **段落级上下文卡片** — 包含段落摘要、翻译、术语解释和"这段话为什么重要"
- **带证据链的解释** — 每条 AI 输出都可追溯到具体段落锚点
- **阅读意图模式** — 选择阅读目标（快速概览、方法深度解读、复现路径、批判性阅读），系统将据此调整段落的重要性排序
- **跳回行为** — 点击证据链接可跳回对应原文段落

### 2. 结合代码阅读（Read With Code）

不离开工作区，直接将论文术语关联到真实源代码：

- **GitHub 仓库索引** — 输入任意 `owner/repo` URL，自动索引类定义、函数名、配置键和文件路径
- **每段落的代码候选** — 针对每个段落，自动生成排序后的代码候选目标（高 / 中 / 低置信度）
- **人工确认映射** — 确认或拒绝每条建议，决策持久化保存并改善后续建议
- **代码侧反向链接** — 从已确认的映射跳回引用它的论文段落
- **支持文件类型** — `.py`、`.ts`、`.tsx`、`.js`、`.jsx`、`.md`、`.yaml`、`.yml`、`.ipynb`

### 3. 阅读并创作（Read To Create）

将阅读中的洞察转化为结构化文档：

- **段落锚定的 idea 捕捉** — 在阅读时为段落打标签（改进点、问题、实验、项目）
- **idea 筛选** — 按标签、时间范围或关键词过滤已捕捉的 idea
- **AI 文档扩展** — 选择一组 idea，一键生成以下三种模式的结构化 Markdown 草稿：
  - **项目提案（Project Proposal）** — 问题框架、论文观点、动机与开放性问题
  - **实验计划（Experiment Plan）** — 方法论、验证策略、预期结果
  - **阅读备忘录（Reading Memo）** — 综合分析、反思与后续行动
- **Snapshot 版本管理** — 为任意草稿保存命名快照，对比版本，追踪 idea 演进
- **草稿恢复** — 未保存的内容自动存入本地存储，避免丢失
- **Markdown 导出** — 复制或下载任意草稿，在外部工具中继续使用

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + React Router 7 |
| 开发语言 | TypeScript 5（严格模式） |
| PDF 处理 | pdf.js（文本提取与渲染） |
| 构建工具 | Vite 8 |
| 数据持久化 | 浏览器 LocalStorage（本地优先，无需后端） |
| API 集成 | GitHub REST API（浏览器直接 fetch） |
| 样式 | 自定义 CSS，深色主题 + 毛玻璃效果 |

应用完全在客户端运行，不需要任何服务器。用户数据（idea、代码链接决策、仓库缓存）均保存在浏览器的 LocalStorage 中。

## 当前状态

项目正处于 MVP 实现阶段（Phase 4–5）。

**已完成：**
- 规划基线与功能范围已锁定
- 开源竞品调研已归档
- 信息架构与线框图已提交
- 阅读核心：PDF 段落锚点、证据 schema、跳回行为
- Demo 样本已锁定（以 Segment Anything Model 论文为主要测试用例）
- Idea 工作区：筛选、编辑、草稿恢复、命名 Snapshot 均已实现

**进行中：**
- 双向代码链接管理
- 真实 GitHub 仓库索引与代码目标跳转
- 代码侧反向链接解析
- 轻量级草稿版本管理（Snapshot）

## 本地开发

### 环境要求

- [Node.js](https://nodejs.org/) 18 及以上
- npm（随 Node.js 一同安装）

### 安装与启动

```bash
# 安装依赖
npm install

# 启动开发服务器（默认地址：http://localhost:5173）
npm run dev
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动带热更新（HMR）的 Vite 开发服务器 |
| `npm run build` | 类型检查并构建生产包到 `dist/` |
| `npm run preview` | 本地预览生产构建产物 |
| `npm run lint` | 对所有 `.ts` 和 `.tsx` 文件运行 ESLint |

### 项目结构

```
src/
├── app/
│   ├── App.tsx               # 根路由（/、/workspace）
│   └── pages/
│       ├── HomePage.tsx      # 落地页
│       └── WorkspacePage.tsx # 主应用界面
├── features/
│   ├── reader/               # PDF 加载、渲染与上下文卡片
│   │   ├── pdf.ts            # pdf.js 封装、段落提取
│   │   ├── context.ts        # 上下文卡片生成逻辑
│   │   └── types.ts          # 共享领域类型
│   ├── code-link/            # 论文到代码的映射工作流
│   │   ├── github.ts         # GitHub API 集成与仓库索引
│   │   ├── candidates.ts     # 代码候选生成与排序
│   │   ├── symbols.ts        # 符号缓存与置信度排序
│   │   ├── mappings.ts       # 用户决策追踪
│   │   ├── storage.ts        # 仓库索引的 LocalStorage 持久化
│   │   ├── source.ts         # GitHub URL 解析
│   │   └── demoSamples.ts    # 预配置的 Demo 论文
│   └── idea-workspace/       # idea 捕捉与文档扩展
│       ├── composer.ts       # 草稿文档生成
│       ├── snapshots.ts      # Snapshot 版本管理与对比
│       └── storage.ts        # idea 与草稿的 LocalStorage 持久化
├── components/               # 共享 UI 组件
├── lib/                      # 工具函数与适配层
├── styles/
│   ├── global.css            # CSS 变量与基础元素样式
│   └── app.css               # 页面与工作区组件样式
└── main.tsx                  # React 入口
```

### 关键数据流

**阅读流程**
1. 用户上传 PDF 文件。
2. pdf.js 提取带 y 轴坐标锚点的文本块。
3. 根据所选的 `ReadingIntent`，对段落重要性进行评分。
4. 点击段落，触发 `buildContextCard()` 生成摘要、术语和证据引用。

**代码链接流程**
1. 用户输入 GitHub 仓库 URL（`owner/repo`）。
2. `fetchGitHubRepoIndex()` 调用 GitHub API，提取符号索引。
3. `buildCodeCandidates()` 将段落文本与索引符号进行匹配。
4. 用户确认或拒绝每条建议，决策保存至 LocalStorage。

**Idea 捕捉流程**
1. 用户为段落打标签并添加备注，创建带有锚点的 idea。
2. Idea 绑定到 `(pageNumber, paragraphId)`。
3. 用户选择 idea，调用 `buildIdeaDocumentDraft(ideas, mode)` 生成草稿。
4. 生成的 Markdown 草稿可保存快照或导出。

### LocalStorage 键名

所有数据均使用命名空间和版本号进行隔离：

```
openviberead.ideas.v1
openviberead.code-links.v1
openviberead.repo-source.v1
openviberead.composer-draft.v1
openviberead.composer-snapshots.v1
```

### 扩展代码库

`src/features/` 下的每个功能模块都是自包含的，拥有独立的类型定义、存储辅助函数和业务逻辑。添加新工作流的方式：

1. 在 `src/features/` 下创建新文件夹。
2. 在 `types.ts` 中定义领域类型。
3. 在 `storage.ts` 中封装 LocalStorage 的读写操作。
4. 在功能聚焦的模块中实现核心逻辑（每个文件只负责一件事）。
5. 在 `WorkspacePage.tsx` 中接入新功能。

项目未使用外部状态管理库。各功能模块通过 props 和共享 LocalStorage 键名进行通信。

## 文档资源

详细的规划与调研文档位于 [`docs/`](./docs) 目录：

| 文件 | 说明 |
|------|------|
| [`docs/plan.md`](./docs/plan.md) | 总计划文档，包含阶段、里程碑与约束 |
| [`docs/feature_scope_v1.md`](./docs/feature_scope_v1.md) | P0 / P1 / P2 功能分层清单 |
| [`docs/information_architecture.md`](./docs/information_architecture.md) | 应用结构与导航模型 |
| [`docs/wireframes_v1.md`](./docs/wireframes_v1.md) | 低保真交互原型 |
| [`docs/demo_sample_candidates.md`](./docs/demo_sample_candidates.md) | 预选的测试用学术论文 |
| [`docs/opensource_reference_research.md`](./docs/opensource_reference_research.md) | 同类工具竞品分析 |
| [`docs/existing_implementation_gap_matrix.md`](./docs/existing_implementation_gap_matrix.md) | 功能完成度追踪 |
| [`docs/research_archive.md`](./docs/research_archive.md) | 参考文献与参考视频 |
