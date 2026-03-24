# 已有开源实现覆盖度矩阵

更新时间：2026-03-24
目的：判断是否已经存在“几乎就是我们要做的那个东西”的开源实现，并明确各仓库的能力覆盖范围。

## 1. 总结结论

截至本次调研，我没有发现一个成熟开源仓库，已经完整实现了我们想做的这一整条功能链：

- 原文优先的 PDF 阅读体验
- 段落级、上下文内联的 AI 解释
- 可信的公式/图表解释
- 论文与代码仓库联动
- 与 Zotero / Obsidian / Anki / Markdown 的工作流闭环
- Local-first / 自定义模型 API / Linux 友好

最接近的两个开源项目是：

1. `PAIR-code/lumi`
2. `khoj-ai/openpaper`

但它们仍然没有完整等于我们的目标产品。

## 2. 覆盖度矩阵

说明：

- `是`：README 或公开说明中明确支持。
- `部分`：能做相近功能，但不是我们要的最终形态。
- `未见明确支持`：公开说明里没看到，不代表绝对没有。
- `推断`：根据项目定位或说明做的合理推断，我会显式标出来。

| 项目 | 开源 | PDF 阅读 | 上下文内联 AI | 段落摘要/批注 | 图表解释 | 公式/证明忠实解释 | 论文-代码联动 | Zotero/笔记工作流 | 本地/自托管 | 结论 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lumi | 是 | 是 | 部分 | 是 | 是 | 未见明确支持 | 未见明确支持 | 未见明确支持 | 是 | 最像 AI 增强论文阅读器 |
| Open Paper | 是 | 是 | 部分 | 是 | 未见明确支持 | 未见明确支持 | 未见明确支持 | 是 | 是 | 最像研究工作台，但偏 split view |
| PapersGPT for Zotero | 是 | 是 | 否 | 部分 | 未见明确支持 | 未见明确支持 | 未见明确支持 | 是 | 部分 | 最像 Zotero 增强层，不是 vibe reading |
| AnnotateAI | 是 | 部分 | 否 | 是 | 未见明确支持 | 未见明确支持 | 否 | 否 | 是 | 很像“注意力分配引擎” |
| AnnotateGPT | 是 | 是 | 部分 | 是 | 否 | 部分 | 否 | 部分 | 部分 | 更偏 peer review 场景 |
| Paperlib | 是 | 部分 | 否 | 部分 | 否 | 否 | 否 | 是 | 是 | 更像文献管理器 |
| Scholar-PDF-Reader-with-Annotations | 是 | 是 | 否 | 否 | 否 | 否 | 否 | 部分 | 部分 | 只是带标注的 PDF 阅读器 |
| Sioyek | 是 | 是 | 否 | 否 | 部分 | 否 | 部分 | 否 | 是 | 研究型 PDF 阅读器，交互灵感强 |

## 3. 最接近我们目标的仓库

### 3.1 Lumi

仓库：<https://github.com/PAIR-code/lumi>

公开可确认的功能：

- AI-augmented annotations
- multiple granularities summaries
- smart highlights
- figure explanations
- local running

为什么说它接近：

- 它已经把 AI 放到了论文阅读过程里，而不是只做单纯问答。
- 它有 figure explanation，这点非常接近我们的“图表理解”目标。

为什么它还不等于我们的目标：

- 没看到明确的 Zotero/Anki/Obsidian 闭环。
- 没看到论文-代码联动。
- 没看到“阅读意图模式”。
- 没看到我们想强调的公式/证明忠实解释。

结论：

- 如果问“有没有已经做出半个 vibe reading 的开源实现”，Lumi 是答案之一。
- 如果问“有没有已经做出我们最终目标成品的开源实现”，还不是。

### 3.2 Open Paper

仓库：<https://github.com/khoj-ai/openpaper>

公开可确认的功能：

- upload paper
- highlight / comments / notes / chat all in one place
- parallel view
- grounded responses with citations navigation
- markdown notes
- self-hostable

为什么说它接近：

- 它已经不只是“chat with PDF”，而是一个研究工作台。
- grounding + 回跳原文这点很重要，和我们的证据链方向高度相关。

为什么它还不等于我们的目标：

- 更偏平行视图 copilot，而不是“更强的原文内联氛围阅读”。
- 没看到图表/公式/代码三联动。
- 没看到明确的阅读意图驱动注意力分配。

结论：

- 如果问“有没有开源研究工作台已经很接近我们的外形”，Open Paper 是最接近的之一。
- 如果问“有没有已经把 vibe reading 的交互哲学做透”，仍然没有。

## 4. 明显只覆盖局部能力的项目

### 4.1 PapersGPT for Zotero

仓库：<https://github.com/papersgpt/papersgpt-for-zotero>

它证明的是：

- Zotero 插件路线可行
- 多模型支持可行
- 结果写回 Zotero Notes 可行
- Linux 跨平台可行

但它不是我们要的完整产品，因为它仍然更像“Zotero 里的 AI 助手”。

### 4.2 AnnotateAI

仓库：<https://github.com/neuml/annotateai>

它最像我们的一块核心算法模块：

- 自动发现重要 sections
- 自动批注 paper
- 更偏“注意力引导”而不是问答

这点非常值得借鉴，但它本身不是完整阅读系统。

### 4.3 AnnotateGPT

仓库：<https://github.com/onekin/AnnotateGPT>

它展示了另一条值得关注的路线：

- 直接在 PDF 上做高亮与批注
- LLM 生成注释
- 可以对选中文本做 clarify / fact checking 等操作

它和我们的差异在于：

- 场景偏 peer review，而不是科研阅读工作流
- 没有我们想做的论文-代码、图表/公式、知识工作流闭环

## 5. 目前还没有被很好覆盖的空白

以下几项，是我目前没看到被单个开源仓库整合得很好的部分：

### 5.1 真正原文优先的内联氛围阅读

不是 split view，不是 sidebar chat，而是 AI 支持就长在 PDF 阅读流上。

### 5.2 可信公式/证明解释

尤其是：

- 不跳步骤
- 不编造引理
- 标明哪些来自原文、哪些是模型推断
- 能回到具体公式和句子证据

### 5.3 阅读意图驱动的注意力引擎

目前看到的项目，多数是“统一摘要/统一问答”，不是按用户目标动态重排阅读重点。

### 5.4 论文-代码-笔记工作流闭环

很多项目最多做到其中一段：

- 读论文
- 或做笔记
- 或在 Zotero 里聊天

但还没有看到成熟开源项目把这三者很好串起来。

## 6. 对我们项目的意义

这轮判断之后，我们可以更明确地说：

1. 这个方向不是没人做过，但也远没有被做透。
2. 我们不是要重复发明“PDF 聊天器”。
3. 我们的创新空间，主要在于把几个已有方向整合成一个更符合 HCI 目标的系统。
4. 如果后面写 `plan.md`，最合理的说法不是“从零发明一个新物种”，而是：
   - 站在已有开源拼图上
   - 做出第一个更完整的开源 vibe reading 工作台

## 7. 参考链接

- Lumi: <https://github.com/PAIR-code/lumi>
- Open Paper: <https://github.com/khoj-ai/openpaper>
- PapersGPT for Zotero: <https://github.com/papersgpt/papersgpt-for-zotero>
- AnnotateAI: <https://github.com/neuml/annotateai>
- AnnotateGPT: <https://github.com/onekin/AnnotateGPT>
- Paperlib: <https://github.com/Future-Scholars/paperlib>
- Sioyek: <https://github.com/ahrm/sioyek>
- Scholar PDF Reader with Annotations: <https://github.com/salcc/Scholar-PDF-Reader-with-Annotations>
