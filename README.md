# OpenVibeRead

OpenVibeRead is an open-source research reading workbench focused on three linked workflows:

- Read papers with contextual, inline AI assistance.
- Map paper ideas to real code repositories.
- Capture reading-time ideas and expand them into structured documents.

## Current Status

The project is in the approved planning and initial scaffold stage.

Primary planning documents live in [`docs/`](./docs):

- [`docs/plan.md`](./docs/plan.md)
- [`docs/feature_scope_v1.md`](./docs/feature_scope_v1.md)
- [`docs/opensource_reference_research.md`](./docs/opensource_reference_research.md)
- [`docs/existing_implementation_gap_matrix.md`](./docs/existing_implementation_gap_matrix.md)
- [`docs/research_archive.md`](./docs/research_archive.md)

## Local Development

```bash
npm install
npm run dev
```

## Planned Module Structure

- `src/app`: app shell and top-level views
- `src/features/reader`: PDF reader and inline context layer
- `src/features/code-link`: paper-to-code mapping workflow
- `src/features/idea-workspace`: idea capture and document expansion workflow
- `src/components`: shared UI components
- `src/lib`: utilities and adapters
- `src/styles`: global and app-level styles
