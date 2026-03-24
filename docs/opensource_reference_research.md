# 开源生态与参考代码调研

更新时间：2026-03-24
调研目的：确认是否已有开源项目实现了与我们目标接近的“vibe reading / AI 论文阅读工作台”思路，并筛选可直接参考的开源代码与技术路线。

## 1. 结论先行

结论很明确：

1. 已经有人做了不少“局部相似”的开源项目。
2. 但我没有找到一个成熟开源项目，已经把下面这些能力完整合在一起：
   - 原文优先的 PDF 内联 AI 辅助
   - 段落级、贴着上下文发生的解释
   - 对公式/图表/证明过程的忠实解释
   - 论文与代码仓库联动
   - Zotero / Obsidian / Anki / Markdown 工作流闭环
   - Local-first + 自定义模型/API
3. 现有开源生态更像是“拼图”：
   - 有的强在 AI 阅读体验
   - 有的强在 Zotero 插件生态
   - 有的强在 PDF 解析与坐标
   - 有的强在图表/公式/代码数据

这意味着我们不需要从零开始，但也不能直接 fork 一个仓库就得到目标产品。

## 2. 最接近我们目标的开源项目

### 2.1 Lumi

仓库：<https://github.com/PAIR-code/lumi>

Lumi 是目前最接近“AI 增强论文阅读器”方向的公开实现之一。

它已经公开的能力包括：

- AI 增强批注
- 多粒度摘要
- 智能高亮
- 针对图片/figure 的解释
- 本地运行入口

从 README 可确认：

- “AI-augmented annotations - read summaries at multiple granularities”
- “Smart highlights - highlight text + ask questions”
- “Figure explanations - ask Lumi about images in the paper”

它的价值：

- 证明“AI 在阅读现场辅助理解”这条路是可实现的。
- figure explanation 这点对我们很有参考价值。
- 有完整前后端结构，可以参考其系统拆分方式。

它的不足：

- 目前聚焦 arXiv 论文，而且 README 明确提到只能处理特定许可条件下的 arXiv 论文。
- 更像研究原型，不是完整科研工作台。
- 我没有看到它明确覆盖 Zotero/笔记闭环，也没看到我们想要的“阅读意图模式”。

最适合借鉴的部分：

- 论文阅读场景中的 AI 增强交互范式
- 图片/figure 解释能力
- 前后端分层方式

## 2.2 Open Paper

仓库：<https://github.com/khoj-ai/openpaper>

Open Paper 是另一个非常值得看的项目。它更像“研究文献工作台”，不是单纯的 PDF 聊天器。

README 明确写了：

- 上传 paper 后可获得 AI-generated brief 和 starter questions
- 支持 highlight、comments、notes、chat all in one place
- 有 parallel view
- 支持知识库搜索
- 支持在上下文里做 inline menu 操作

它最值得参考的点：

- 它非常接近“研究工作台”的产品形态。
- 它明确强调 grounded responses，并允许点击回到文档中对应位置。
- 它把注释、笔记、聊天和 PDF 放在一个地方，而不是割裂成多个工具。

它与我们目标的差异：

- 它更偏 split view / copilot workbench，不是我们追求的“更强的原文内联氛围阅读”。
- grounding 逻辑目前 README 里也承认用了 string matching，精度并不完美。
- 还没有明显看到“阅读意图模式”“公式忠实解释”“论文-代码映射”的完整实现。

最适合借鉴的部分：

- AI 回答可回跳原文的 grounding 机制
- 研究工作台式 UI 架构
- 注释、笔记、搜索的一体化组织方式

## 2.3 PapersGPT for Zotero

仓库：<https://github.com/papersgpt/papersgpt-for-zotero>

如果我们关心 Zotero 生态，这个项目必须看。

它已经实现了：

- Zotero 内聊天/读 PDF
- 多模型支持
- MCP 接入
- 自动读取多篇论文
- 结果写回 Zotero Notes
- Windows / Mac / Linux 支持

README 中非常关键的两点：

- “saves key insights directly into your Zotero Notes”
- “Windows, Mac and Linux are all supported”

它对我们的价值：

- 说明 Zotero 插件路线完全可行。
- 说明“不是重做一个文献管理器，而是在 Zotero 上做增强”是现实路径。
- 它已经处理了不少多模型、多平台和插件形态的问题。

它的不足：

- 更强的是聊天、自动批处理和 Zotero 集成，而不是我们想要的 PDF 页面内联交互。
- 仍然更接近“AI plugin”而不是“vibe reading”。

最适合借鉴的部分：

- Zotero 插件结构
- 多模型 provider 适配
- 结果写回 Zotero Note 的工作流闭环
- MCP / library search 的集成思路

## 2.4 Paperlib

仓库：<https://github.com/Future-Scholars/paperlib>

Paperlib 不是 vibe reading，但它是目前很强的开源文献管理与工作流参考。

它公开提供：

- 多 scraper 元数据抓取
- 全文搜索
- 智能筛选
- note / tag / folder
- RSS 跟踪新论文
- macOS / Linux / Windows
- 扩展机制
- 通过扩展支持 summarize / auto-tag / semantic search / chat

这对我们特别有意义，因为：

- 它证明“现代 UI 的开源文献管理器”是能做出来的。
- 它在生态与扩展性上很强。
- 它支持 Linux，这正好回应了评论区需求。

但它不是我们的直接替代目标，因为：

- 它更像 paper manager，而不是阅读交互创新产品。
- LLM 能力目前偏 extension，而不是阅读体验核心。

最适合借鉴的部分：

- 文献库管理模型
- 多平台桌面应用组织方式
- 扩展机制
- 视图与工作台布局

## 3. 强相关但不是完整产品的开源参考

### 3.1 AnnotateAI

仓库：<https://github.com/neuml/annotateai>

这个项目非常有意思，因为它的目标不是“和论文聊天”，而是“在你阅读时给你上下文”。

README 写得很直接：

- 它会读取 paper
- 找 title 和重要 key concepts
- 逐页找到最强调 key concepts 的 sections
- 为这些 sections 构建 concise short topic
- annotate the paper and highlight those sections

它非常接近我们想做的“注意力分配引擎”。

最适合借鉴的部分：

- 自动发现重要 section 的逻辑
- 先找关键词再回到原文标注的思路
- “给人类读者提供上下文，而不是直接替代阅读”的设计立场

不足：

- 它更偏自动批注，不是完整 UI 工作台。
- 没看到强交互、笔记闭环或 Zotero 生态。

### 3.2 Sioyek

仓库：<https://github.com/ahrm/sioyek>

Sioyek 本身不带 AI，但它是研究论文阅读器里非常强的开源基础设施。

它最值得我们注意的是“portal”这个功能：

- 当一段文字引用远处的 figure 时，可以把当前位置与目标位置链接起来
- 在另一个窗口持续显示目标内容

这和我们做“论文文本 - 图表/公式/代码联动”非常像。

它的价值：

- 提供研究论文阅读器真正有用的导航交互灵感。
- 说明“为论文而优化”的阅读器和普通 PDF 阅读器是不同物种。

最适合借鉴的部分：

- portal / mark / bookmark / highlight 这些阅读器级交互
- 面向研究阅读的窗口联动设计

### 3.3 react-pdf-highlighter

仓库：<https://github.com/agentcooper/react-pdf-highlighter>

这是 Web 端做 PDF 标注非常实用的基础组件。

它已经有：

- 基于 PDF.js
- text and image highlights
- popover text for highlights
- scroll to highlights

如果我们走 React + PDF.js 路线，这类组件非常适合做第一版原型。

适合借鉴的部分：

- 高亮数据结构
- 滚动回跳
- PDF 文本/图片标注交互

注意：

- 它只能解决“高亮/气泡/回跳”的基础层，不解决论文结构理解。

## 4. 可直接借的底层解析与结构化能力

### 4.1 PDF.js

仓库：<https://github.com/mozilla/pdf.js>

这是 Web PDF 渲染的基础设施，不多解释。我们的 Web 原型几乎一定会以它为底层之一。

### 4.2 Docling

仓库：<https://github.com/docling-project/docling>

这是非常强的现代文档解析底座。

它的优势在于：

- advanced PDF understanding
- page layout
- reading order
- table structure
- code
- formulas
- image classification
- local execution
- lossless JSON / Markdown / HTML 等输出

对我们很关键，因为它不只是抽文本，而是更接近“理解页面结构”。

### 4.3 Docling Parse

仓库：<https://github.com/docling-project/docling-parse>

这个库明确支持：

- extract text, paths and bitmap images with coordinates
- char / word / line level 输出

这对我们很重要，因为“氛围阅读”最终要靠稳定坐标层和可追溯锚点。

### 4.4 GROBID

仓库：<https://github.com/grobidOrg/grobid>

GROBID 是学术 PDF 结构提取的老牌强工具。

它的价值不只是元数据，而是：

- full text extraction and structuring
- section title / paragraph / figures / tables 等结构
- PDF coordinates for extracted information

如果我们后续需要更学术、论文导向的结构化抽取，GROBID 很值得评估。

### 4.5 PDFFigures2

仓库：<https://github.com/allenai/pdffigures2>

非常适合做 scholarly PDF 的 figure / table / caption / section title 抽取。

如果我们要做图表解释、正文引用到图表的联动，它是高价值组件。

### 4.6 Nougat

仓库：<https://github.com/facebookresearch/nougat>

Nougat 的定位是 academic document PDF parser，并强调理解 LaTeX math and tables。

它对我们更像“后备武器”而不是主渲染栈：

- 对扫描版/复杂论文可能有帮助
- 对公式与表格恢复很有价值
- 但它更偏 OCR/转写，不直接提供阅读器交互

## 5. 论文-代码联动的参考资源

### 5.1 Papers with Code 数据集

仓库：<https://github.com/paperswithcode/paperswithcode-data>

这个仓库非常重要，因为它公开提供：

- all papers with abstracts
- links between papers and code
- evaluation tables
- methods
- datasets

对我们意味着：

- 不一定非要自己从零做 paper-code 映射
- 第一版完全可以借用现成 paper-code link 数据做联动增强

这会大幅降低“论文与代码联动”的 MVP 难度。

## 6. Zotero 插件开发的参考入口

### 6.1 Zotero 官方源码

仓库：<https://github.com/zotero/zotero>

关键事实：

- Zotero 源码仓库明确包含 `reader` 等目录
- `COPYING` 文件中写明其采用 GNU Affero General Public License v3 (AGPLv3)

这意味着：

- 评论区关于 AGPL 的担忧不是空穴来风
- 如果我们未来想做深度改壳或分发改造版，必须非常谨慎
- 更稳妥的工程路线是：独立产品 + bridge / 插件，而不是直接改壳闭源分发

### 6.2 Zotero 插件模板与生态

可参考：

- <https://github.com/windingwind/zotero-plugin-template>
- <https://github.com/MuiseDestiny/zotero-addon-template>
- <https://github.com/topics/zotero-plugin>

这些仓库的价值：

- 说明 Zotero 插件生态非常活跃
- 有成熟模板可直接起步
- 有现成插件案例可研究，例如翻译、笔记、GPT 集成等

额外值得关注的插件：

- `windingwind/zotero-pdf-translate`
- `windingwind/zotero-better-notes`
- `MuiseDestiny/zotero-gpt`

它们不能直接代替我们的产品，但非常适合借鉴：

- PDF 翻译
- 笔记导出
- AI 对话入口
- Zotero UI 扩展方式

## 7. 我们现在可以明确回答的问题

### 7.1 有没有人做过类似 idea？

有，而且不止一个。

最像的开源参考包括：

- Lumi
- Open Paper
- AnnotateAI
- PapersGPT for Zotero
- Paperlib

但它们没有一个完整等于我们想做的版本。

### 7.2 有没有可直接参考的开源代码？

有，而且很多。

如果按模块拆，现成参考几乎足够支撑我们做出第一版：

- 阅读器底层：PDF.js
- 高亮/气泡/回跳：react-pdf-highlighter
- 学术 PDF 结构抽取：GROBID
- 坐标级文本/图像抽取：docling-parse
- 图表/标题/caption 抽取：pdffigures2
- 高级 PDF 理解：Docling
- 公式/表格 OCR 兜底：Nougat
- 论文-代码联动数据：paperswithcode-data
- Zotero 插件集成：papersgpt-for-zotero + zotero-plugin-template

### 7.3 有没有哪块还明显没人做透？

有，至少有四块还缺一个整合得好的开源实现：

1. 真正“原文优先”的 PDF 内联 AI 体验
2. 可信、逐证据链的公式/证明解释
3. 阅读意图驱动的注意力分配
4. 论文阅读 -> 笔记/闪卡/文献库/代码库 的全流程闭环

这恰好就是我们可以建立项目价值的地方。

## 8. 对我们最有价值的参考组合

如果目标是尽快做出一个有说服力的开源版本，我建议重点参考这组组合：

### 产品层参考

- Lumi
- Open Paper
- PapersGPT for Zotero
- Paperlib
- Sioyek

### 工程层参考

- PDF.js
- react-pdf-highlighter
- Docling
- docling-parse
- GROBID
- PDFFigures2
- paperswithcode-data

### 可直接形成我们路线的组合建议

第一阶段最现实的路线不是 fork 一个大仓库，而是自己整合：

- 前端阅读器：PDF.js + 自定义 overlay
- 原型标注层：react-pdf-highlighter 作为参考
- 结构抽取：Docling / docling-parse
- 学术结构增强：GROBID / PDFFigures2
- 论文-代码链接：Papers with Code 数据
- Zotero 路线：独立 app + Zotero bridge，而不是直接魔改 Zotero

## 9. 对 plan.md 的直接影响

这轮调研之后，后面写 `plan.md` 时应该把“参考开源项目与可复用技术栈”单独列一章，不然计划会显得像从零开始。

我建议在 plan 里明确写出：

1. 我们不是闭门造车，有明确外部参考。
2. 我们不重复造已经成熟的轮子。
3. 我们真正创新的地方，是把这些轮子整成一个更符合 HCI 目标的系统。
4. 我们会优先避开 Zotero 改壳带来的许可风险。

## 10. 参考链接总表

### 产品/项目

- Lumi: <https://github.com/PAIR-code/lumi>
- Open Paper: <https://github.com/khoj-ai/openpaper>
- PapersGPT for Zotero: <https://github.com/papersgpt/papersgpt-for-zotero>
- Paperlib: <https://github.com/Future-Scholars/paperlib>
- Sioyek: <https://github.com/ahrm/sioyek>
- AnnotateAI: <https://github.com/neuml/annotateai>

### PDF / 文档解析 / 标注底座

- PDF.js: <https://github.com/mozilla/pdf.js>
- react-pdf-highlighter: <https://github.com/agentcooper/react-pdf-highlighter>
- Docling: <https://github.com/docling-project/docling>
- Docling Parse: <https://github.com/docling-project/docling-parse>
- GROBID: <https://github.com/grobidOrg/grobid>
- PDFFigures2: <https://github.com/allenai/pdffigures2>
- Nougat: <https://github.com/facebookresearch/nougat>

### 数据与生态

- Papers with Code data: <https://github.com/paperswithcode/paperswithcode-data>
- Zotero source: <https://github.com/zotero/zotero>
- Zotero plugin template: <https://github.com/windingwind/zotero-plugin-template>
- Zotero addon template: <https://github.com/MuiseDestiny/zotero-addon-template>
- Zotero plugin topic: <https://github.com/topics/zotero-plugin>
