# Data files

The public collection is maintained from four complementary files:

- `references.json` is the complete, website-ready index and the source used to render the repository README.
- `survey-references.bib` is the bibliographic source of record.
- `role-citations.json` maps citation keys to the six research roles and supporting context.
- `catalog-seed.json` preserves curated topics and role metadata from the earlier public collection.

`references.json` and the root `README.md` are generated deterministically:

```sh
node tools/sync-references.mjs
node tools/render-readme.mjs
node tools/check.mjs
```

Each work has one `primaryRole` for navigation and may have several `roles` when it connects multiple parts of the game lifecycle. The six core roles are `play`, `model`, `design`, `build`, `runtime`, and `test`; `context` is reserved for foundations and adjacent references.
