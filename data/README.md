# Data files

The public collection is maintained from complementary source and generated files:

- `paper-references.bib` is synchronized with the current manuscript bibliography.
- `living-additions.bib` records public works added after the manuscript snapshot.
- `survey-references.bib` combines those two sources for public download.
- `references.json` is the website-ready index and the source used to render the repository README.
- `role-citations.json` maps citation keys to the six research roles and supporting context.
- `catalog-seed.json` preserves curated topics and role metadata from the earlier public collection.

`survey-references.bib`, `references.json`, and the root `README.md` are generated deterministically:

```sh
node tools/sync-references.mjs
node tools/render-readme.mjs
node tools/check.mjs
```

Each work has one `primaryRole` for navigation and may have several `roles` when it connects multiple parts of the game lifecycle. The six core roles are `play`, `model`, `design`, `build`, `runtime`, and `test`; `context` is reserved for foundations and adjacent references.
