# Online CV — Progress Tracker

## Phase 1: Minimal buildable CV — COMPLETE

- [x] `npm run build` reads `resume.example.yaml` and produces `dist/index.html`
- [x] Output HTML contains sample person's name, title, and experience entries
- [x] Handlebars template uses semantic HTML5 (`header`, `section`, `article`, etc.)
- [x] Basic CSS is inlined in the output
- [x] Build fails with a clear error if YAML file is missing

## Phase 2: All sections + screen typography — COMPLETE

- [x] All 12 sections render (header, summary, competencies, achievements, experience, board roles, volunteering, education, certifications, languages, publications, interests)
- [x] Sections with no data are conditionally hidden
- [x] Core Competencies renders as tag/chip layout
- [x] Experience entries: role, company, location (italic), workmode, dates, summary, highlights
- [x] Inter font from Google Fonts
- [x] Contact line: pipe-separated, smaller font, medium weight
- [x] Section order approved by user

## Phase 3: Print CSS + PDF download — COMPLETE

- [x] `@page` rule: A4, 12mm margins
- [x] Print font: 9.5pt, line-height 1.4
- [x] Section break preferences, orphan/widow control
- [x] Download button hidden in print
- [x] Print-clean styling (no backgrounds on tags, plain links)
- [x] Demo content fits ~1.5 pages

## Phase 4: Dev experience + validation — COMPLETE

- [x] `npm run dev` watch mode with local server at localhost:3000
- [x] YAML validation: required fields (name, title) error, recommended fields warn
- [x] README with docs and screenshot

## Phase 5: Public repo CI + tests — COMPLETE

- [x] GitHub Actions workflow on push/PR
- [x] 7 tests: build output, sections, experience details, validation (required, empty, missing file, recommended)
- [x] All tests pass

## Phase 6: Private repo pipeline — SCAFFOLDED

- [x] `online-cv-ml` repo initialised with package.json, .gitignore, README
- [x] `online-cv` pulled in as npm dependency from GitHub
- [x] Build pipeline works (validation catches placeholder data correctly)
- [x] Placeholder `resume.yaml` with Matthias's name and Karlsruhe location
- [ ] Fill in real CV content (next session)
- [ ] Configure Cloudflare Pages (build cmd: `npm run build`, output: `dist`, route: `terminalvelocity.me/cv`)

## Phase 7: Portfolio integration + cross-browser polish — NOT STARTED

- [ ] Wire portfolio "CV / Resume" card to `/cv` (new tab)
- [ ] Cross-browser print testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness check
- [ ] Final typography/spacing review

---

## Section order (approved)

1. Header (name, title, contact with pipe separators)
2. Executive Summary
3. Core Competencies (tags)
4. Key Achievements (pulled up before experience)
5. Professional Experience (with role summary + achievement bullets)
6. Board Roles & Advisory
7. Volunteering
8. Education
9. Certifications
10. Languages
11. Publications & Speaking
12. Interests

## Design decisions (approved)

- Font: Inter (Google Fonts)
- Style: minimal, classic, white, strong typography
- Contact line: small (0.75rem), medium weight (500), pipe-separated
- Location line: italic, with optional workmode (Hybrid | Remote | On-site)
- Experience entries: brief summary paragraph, then achievement bullets with numbers
- Print: A4, 12mm margins, 9.5pt, break-inside avoid on entries

## Repos

- **`online-cv`** (matoautomato/online-cv) — template, build tooling, sample data
- **`online-cv-ml`** (matoautomato/online-cv-ml) — real CV data + deploy
- **Portfolio** (matoautomato/terminalvelocity.me) — main site, CV at `/cv`

## GitHub Issues

Phase 1–7 filed as issues #1–#7 on matoautomato/online-cv.

## Next session

1. User provides current CV (any format)
2. Refine content into `resume.yaml` in `online-cv-ml` with proper C-level framing
3. Build locally, review, iterate until happy
4. Optionally: user shares C-level CV guidelines for structure/framing
5. Configure Cloudflare Pages deploy
6. Wire portfolio card (Phase 7)
