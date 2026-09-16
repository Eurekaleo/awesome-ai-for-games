# Data files

The public collection is maintained from complementary source and generated files:

- `paper-references.bib` is synchronized with the current manuscript bibliography.
- `living-additions.bib` records catalog-only works that are not in the current manuscript bibliography.
- `survey-references.bib` combines those two sources for public download.
- `references.json` is the website-ready index and the source used to render the repository README.
- `role-citations.json` maps citation keys to manuscript roles, including primary and secondary badges in the system index.
- `catalog-seed.json` preserves curated topics and role metadata from the earlier public collection.
- `official-resources.json` records verified author- or institution-maintained code and project links.

`survey-references.bib`, `references.json`, and the root `README.md` are generated deterministically:

```sh
node tools/sync-references.mjs
node tools/render-readme.mjs
node tools/check.mjs
```

Each work has one `primaryRole` for navigation and may have several `roles` when it connects multiple parts of the game lifecycle. The six core roles are `play`, `model`, `design`, `build`, `runtime`, and `test`; `context` is reserved for foundations and adjacent references.
