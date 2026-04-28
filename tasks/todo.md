# Online CV — Progress Tracker

## Phase 1: Minimal buildable CV — COMPLETE

- [x] `npm run build` reads `resume.example.yaml` and produces `dist/index.html`
- [x] Output HTML contains sample person's name, title, and experience entries
- [x] Handlebars template uses semantic HTML5 (`header`, `section`, `article`, etc.)
- [x] Basic CSS is inlined in the output
- [x] Build fails with a clear error if YAML file is missing
- [x] All 10 sections already rendered with full sample data (ahead of Phase 2)

## Phase 2: All sections + screen typography — IN PROGRESS

All sections render, but typography/styling/layout needs user review and refinement.

### Awaiting user feedback on:
- Block arrangement and section ordering
- Machine-readability of the HTML document
- Typography and styling choices

### Not yet addressed:
- [ ] Typography hierarchy refinement based on feedback
- [ ] Spacing and layout adjustments based on feedback
- [ ] Competency tag styling polish

## Phase 3: Print CSS + PDF download — NOT STARTED

Current state: basic `@media print` exists but needs work for multi-page CVs:
- [ ] `@page` rule for A4 margins
- [ ] Widow/orphan control
- [ ] Section break hints for 2-3 page documents
- [ ] Cross-browser print testing (Chrome, Firefox, Safari)
- [ ] "Download as PDF" button — already wired up

## Phase 4–7: Not started

See `plans/online-cv.md` for full plan.

---

## Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js project, handlebars + js-yaml deps |
| `build.js` | Reads YAML, compiles Handlebars template, outputs `dist/index.html` |
| `template.hbs` | Handlebars HTML template with inlined CSS (screen + print) |
| `resume.example.yaml` | Fictional "Jane Doe, CTO" sample data — all 10 sections |
| `dist/index.html` | Built output (self-contained, all CSS inlined) |
| `PRD.md` | Product requirements document |
| `plans/online-cv.md` | Phased implementation plan |

## Repos

- **`online-cv`** (matoautomato/online-cv) — public template, build tooling, sample data. This is where we're building.
- **`online-cv-ml`** (matoautomato/online-cv-ml) — private repo for real CV data + deploy pipeline (Phase 6).
- **Portfolio** (matoautomato/terminalvelocity.me) — the main site. CV will live at `/cv`.

## GitHub Issues

Phase 1–7 filed as issues #1–#7 on matoautomato/online-cv.
