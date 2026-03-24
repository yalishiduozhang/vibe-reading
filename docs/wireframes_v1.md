# Wireframes v1

更新时间：2026-03-24  
阶段：Phase 1  
用途：给 OpenVibeRead 第一版提供低保真线框说明，确保后续实现阶段不在页面结构上反复摇摆。

说明：以下线框以“结构与交互优先”为目标，不追求视觉细节保真。

## 1. Home

```text
+--------------------------------------------------------------------------------+
| OpenVibeRead                                                                   |
| Read papers, map code, grow ideas.                                             |
|                                                                                |
| [ Read With Context ] [ Read With Code ] [ Read To Create ]                    |
|                                                                                |
| P0 Scope: inline cards / reading intent / code links / ideas / docs / evidence |
|                                                                                |
| [ Open Workspace ]                                                             |
+--------------------------------------------------------------------------------+
```

### 重点

- Home 只是入口页。
- 主要动作只有一个：进入 Workspace。

## 2. Reader Workspace - Desktop

```text
+--------------------------------------------------------------------------------------------------+
| Top Bar                                                                                          |
| Paper title | Reading Intent [v] | Connect Repo | Export | View Mode                             |
+--------------------------------------+--------------------------------------+--------------------+
|                                      |                                      |                    |
|                                      |  Context / Code Tabs                 |  Idea Workspace    |
|          Paper Reader                |  ----------------------------------  |  ----------------  |
|                                      |  Context Tab                         |  Quick Add Idea    |
|  PDF page                            |  - summary                           |  [input........]   |
|  paragraph hotspots                  |  - translation                       |  tag [v]  Save     |
|  inline triggers                     |  - terms                             |                    |
|  highlighted key sections            |  - why this matters                  |  Idea List         |
|                                      |  - evidence links                    |  [ ] idea A        |
|                                      |                                      |  [ ] idea B        |
|                                      |  Code Tab                            |  [ ] idea C        |
|                                      |  - mapped file / symbol              |                    |
|                                      |  - match rationale                   |  [Generate Doc]    |
|                                      |  - confirm / reject                  |                    |
|                                      |                                      |                    |
+--------------------------------------+--------------------------------------+--------------------+
```

### 重点

- 视觉中心必须是 PDF。
- 右侧是近场辅助，不是第二主战场。
- idea 区必须可快速录入，不能强迫用户离开阅读现场。

## 3. Reader Workspace - Mobile / Narrow Mode

```text
+--------------------------------------+
| Top Bar                              |
| Title | Intent | Repo | More         |
+--------------------------------------+
| Paper Reader                         |
| PDF page                             |
| inline trigger                       |
|                                      |
+--------------------------------------+
| Bottom Tabs                          |
| [Context] [Code] [Ideas]             |
+--------------------------------------+
| Active Panel                         |
| summary / code mapping / ideas       |
+--------------------------------------+
```

### 重点

- 小屏下不强求三栏并列。
- 用底部 tab 复用同一个辅助面板区域。

## 4. Inline Paragraph Card

```text
Paragraph text .................................................... [*]

[*] click

+---------------------------------------------------------+
| Summary: ...                                             |
| Translation: ...                                         |
| Key Terms: ...                                           |
| Why it matters: ...                                      |
| Evidence: p3 para-12 / sentence 2                        |
| [Add Idea] [View Code Link] [Pin] [Copy]                |
+---------------------------------------------------------+
```

### 重点

- 卡片要轻，不要像大块聊天气泡一样占空间。
- 默认折叠，按需展开。
- 所有高价值解释都要有 evidence。

## 5. Code Mapping Panel

```text
+------------------------------------------------+
| Code Mapping                                   |
| Current paragraph: Method description          |
|                                                |
| Candidate Matches                              |
| 1. src/model/encoder.py::EncoderBlock          |
|    reason: method name + symbol similarity     |
|    [Open] [Confirm] [Reject]                   |
|                                                |
| 2. configs/train.yaml::encoder.layers          |
|    reason: experiment config mention           |
|    [Open] [Confirm] [Reject]                   |
|                                                |
| Manual Link                                    |
| [Search repo symbol........................]   |
| [Bind manually]                                |
+------------------------------------------------+
```

### 重点

- 第一版不装作全自动。
- 候选映射 + 手动确认必须直接可见。

## 6. Idea Workspace Panel

```text
+------------------------------------------------+
| Idea Workspace                                 |
| Triggered by: p5 / para-21                     |
| Quote: "..."                                  |
|                                                |
| Idea Input                                     |
| [This could be extended by ...            ]    |
| Tag: [Improvement v]                           |
| [Save Idea]                                    |
|                                                |
| Existing Ideas                                 |
| [ ] Better baseline experiment                 |
| [ ] Compare with paper X                       |
| [ ] Could turn into semester project           |
|                                                |
| [Generate Proposal] [Generate Plan]            |
+------------------------------------------------+
```

### 重点

- idea 的来源段落必须被看见。
- 否则用户很快会失去“这条想法是从哪里来的”的上下文。

## 7. Document Composer

```text
+--------------------------------------------------------------------------------+
| Document Composer                                                              |
| Type: Proposal [v]     Based on 4 selected ideas                               |
+--------------------------------------+-----------------------------------------+
| Source Ideas                         | Generated Draft                         |
| ----------------------------------   | -------------------------------------   |
| - idea A                             | Title                                   |
| - idea B                             | 1. Background                           |
| - idea C                             | 2. Problem                              |
| - idea D                             | 3. Proposed Direction                   |
|                                      | 4. Experiments                          |
| [Back to Workspace]                  |                                         |
|                                      | [Expand] [Rewrite] [Export Markdown]    |
+--------------------------------------+-----------------------------------------+
```

### 重点

- 这一页不是纯输出页，它要保留“来源 idea”与“生成草稿”的对应关系。

## 8. 第一版必须保住的交互判断

第一版无论怎么调整视觉样式，都不要破坏下面这几个结构性判断：

1. PDF 必须始终是主视觉中心。
2. 段落卡片必须贴近原文触发，而不是退化成右侧聊天框。
3. 代码映射必须在当前段落上下文中出现。
4. idea 记录必须短路径完成。
5. idea 到文档生成必须是同一工作流，而不是另一个孤立工具。

## 9. 下一步实现映射

这份线框文档之后，建议立刻映射到实现任务：

1. 顶部控制区组件
2. Reader Workspace 布局容器
3. 段落触发点与卡片组件
4. Code Mapping Panel 组件
5. Idea Workspace Panel 组件
6. Document Composer 页面骨架
