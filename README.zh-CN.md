<div align="center">
  <img src="./docs/logo.svg" alt="OpenVibeRead Logo" width="160" height="160" />
  <h1>OpenVibeRead</h1>
  <p><em>一个围绕论文、代码与想法的开源研究阅读工作台。</em></p>
</div>

<br/>

[English](./README.md)

OpenVibeRead 是一个开源研究阅读工作台，围绕三条彼此联动的工作流展开：

- 贴着论文原文进行上下文增强阅读与内联 AI 辅助。
- 把论文中的方法与真实代码仓库连接起来。
- 捕捉阅读过程中的 idea，并将其扩展成结构化文档。

## 当前状态

项目已经结束单纯规划阶段，正在持续推进 MVP 实现。

当前重点包括：

- 稳定的 PDF 阅读流程，支持段落锚点与跳回
- 在阅读工作区中提供带证据链的上下文卡片
- 真实 GitHub 仓库索引、直接代码目标跳转、代码侧反向链接
- idea 捕捉、筛选、编辑、草稿恢复、命名 snapshot 与 Markdown 导出

主要规划与研究文档位于 [`docs/`](./docs)：

- [`docs/plan.md`](./docs/plan.md)
- [`docs/feature_scope_v1.md`](./docs/feature_scope_v1.md)
- [`docs/demo_sample_candidates.md`](./docs/demo_sample_candidates.md)
- [`docs/opensource_reference_research.md`](./docs/opensource_reference_research.md)
- [`docs/existing_implementation_gap_matrix.md`](./docs/existing_implementation_gap_matrix.md)
- [`docs/research_archive.md`](./docs/research_archive.md)

## 本地开发

```bash
npm install
npm run dev
```

## 计划中的模块结构

- `src/app`：应用壳层与顶层页面
- `src/features/reader`：PDF 阅读器与上下文理解层
- `src/features/code-link`：论文到代码的映射工作流
- `src/features/idea-workspace`：idea 捕捉与文档扩展工作流
- `src/components`：共享 UI 组件
- `src/lib`：工具函数与适配层
- `src/styles`：全局样式与应用样式
