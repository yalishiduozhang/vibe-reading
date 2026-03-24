# Demo Sample Candidates

状态：Active Baseline  
最后更新：2026-03-24 21:48 (Asia/Shanghai)

## 1. 目的

这份文档用于完成 `WP-C`：尽快锁定 1 组适合做论文-代码联动 MVP 的真实样本，避免后续只在抽象界面里空转。

## 2. 选择标准

本轮样本选择优先看 4 件事：

1. 论文术语和仓库模块名是否足够一致。
2. 仓库结构是否清晰，能否不跑重训练也完成结构级分析。
3. README / 脚本 / 配置是否能提供映射线索。
4. 是否适合作为课堂展示时的首个 paper-to-code demo。

## 3. 候选矩阵

| 候选 | 论文 | 仓库 | 术语一致性 | 仓库结构清晰度 | 配置/复现线索 | 结论 |
| --- | --- | --- | --- | --- | --- | --- |
| Segment Anything | [arXiv:2304.02643](https://arxiv.org/abs/2304.02643) | [facebookresearch/segment-anything](https://github.com/facebookresearch/segment-anything) | 很高 | 很高 | 中高 | 选为主样本 |
| LoRA | [arXiv:2106.09685](https://arxiv.org/abs/2106.09685) | [microsoft/LoRA](https://github.com/microsoft/LoRA) | 高 | 高 | 高 | 作为 NLP 备选 |
| CLIP | [arXiv:2103.00020](https://arxiv.org/abs/2103.00020) | [openai/CLIP](https://github.com/openai/CLIP) | 中高 | 高 | 中 | 作为轻量备选 |

## 4. 候选分析

### 4.1 Segment Anything

优点：

- 论文与仓库都给出了非常明确的模块语言，适合做术语到代码的第一轮映射。
- 官方仓库结构紧凑，`demo/`、`notebooks/`、`scripts/`、`segment_anything/` 的分层对演示非常友好。
- 官方 README 直接暴露了 `SamAutomaticMaskGenerator`、`sam_model_registry`、ONNX 导出和 web demo 线索，适合构造候选映射。
- 结构级分析即可完成第一版 MVP，不需要实际训练模型。

风险：

- 这是视觉论文，不是 NLP 论文，后续仍需要一个文本方向备选来验证跨领域泛化。

### 4.2 LoRA

优点：

- 论文方法名和仓库名称高度一致，`loralib` 本身就是很强的结构线索。
- 官方 README 明确区分了 `loralib/`、`examples/NLG/`、`examples/NLU/`，非常适合作为“方法 -> 示例实现”的映射样本。
- 对后续“论文术语 -> 层级实现”映射测试很有价值。

风险：

- 很多关键映射是“概念到层”而不是“段落到独立模块文件”，第一版课堂演示不如 SAM 直观。

### 4.3 CLIP

优点：

- 官方仓库非常紧凑，适合轻量 demo。
- README 直接暴露 `encode_image`、`encode_text` 等 API，适合做快速映射展示。
- 环境负担小，适合作为备用样本。

风险：

- 仓库结构较小，能用于展示的结构性映射点比 SAM 少。
- 第一版如果只用 CLIP，项目在“论文-代码联动”上的差异化会弱一些。

## 5. 主样本结论

本轮冻结的主样本是：

- 论文：`Segment Anything`
- 仓库：`facebookresearch/segment-anything`

选择理由：

- 最适合做“论文术语 -> 仓库模块 -> demo 脚本/导出路径”这一条完整链路。
- 不依赖重训练即可完成结构级候选映射演示。
- 课堂展示时更容易让观众直观看到 paper-to-code 的价值。

## 6. 备选顺序

如果主样本后续出现不适配问题，备选顺序为：

1. `LoRA`
2. `CLIP`

## 7. 对实现的直接影响

当前实现阶段应采用以下默认策略：

1. UI 中内置 demo sample selector，并默认落到 `Segment Anything`。
2. 代码联动候选可优先提供样本感知的启发式映射，而不是完全随机占位。
3. 后续真实 repo 索引优先围绕 `repo tree + README + scripts + 关键源码文件` 展开。
4. 在 `WP-D` 中把 GitHub URL 归一化到 repo root，避免被 branch / blob / tree 形态干扰首轮索引。

## 8. 参考来源

- [Segment Anything arXiv](https://arxiv.org/abs/2304.02643)
- [facebookresearch/segment-anything](https://github.com/facebookresearch/segment-anything)
- [LoRA arXiv](https://arxiv.org/abs/2106.09685)
- [microsoft/LoRA](https://github.com/microsoft/LoRA)
- [CLIP arXiv](https://arxiv.org/abs/2103.00020)
- [openai/CLIP](https://github.com/openai/CLIP)
