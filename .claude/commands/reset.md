---
description: Delete generated PetalPress artifacts (index.html, report.html, fetched images) so the template is clean for the next demo. Leaves source code untouched.
---

Reset the PetalPress workspace for the next demo run.

Delete the contents of the `output/` directory (keep the directory itself):

```bash
rm -rf output/index.html output/report.html output/images output/country-images
mkdir -p output/images output/country-images
```

After running, confirm to the user:
- `output/index.html`, `output/report.html` removed
- `output/images/`, `output/country-images/` cleared
- Source code (`src/`, `mcp-servers/`, `.claude/`) is untouched
- Ready for a new `/build-page` invocation

Do **not** delete: `package.json`, `node_modules/`, `src/`, `mcp-servers/`, `.claude/`, `myArchitecture.md`, `README.md`, `CLAUDE.md`, `.vscode/`, or anything outside `output/`.
