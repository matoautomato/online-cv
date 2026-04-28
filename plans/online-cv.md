# Plan: Online CV — Static Resume Page

> Source PRD: `./PRD.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **URL**: `terminalvelocity.me/cv` — standalone page, opens in new tab from portfolio
- **Data format**: JSON Resume schema in YAML, extended with C-level sections (board roles, advisory, key achievements, publications/speaking)
- **Build tooling**: Node.js + Handlebars. Single build script reads YAML, renders template, outputs self-contained `index.html` with all CSS inlined.
- **Output**: One `index.html` file. No external stylesheets, no JS dependencies at runtime.
- **PDF**: Browser `window.print()` + `@media print` CSS. No server-side PDF generation.
- **Repo split**: Public repo (`online-cv`) has template + tooling + sample data. Private repo (`online-cv-ml`) has real data + deploy pipeline.
- **Private repo consumes public repo** via git submodule or npm dependency (TBD at Phase 6).
- **Deploy target**: Portfolio repo's `/cv` folder, served by Cloudflare Pages.
- **Style**: Minimal, classic, white background, strong typography, print-document aesthetic. Intentionally different from the portfolio site's terminal theme.
- **Sections (in order)**: Header, Executive Summary, Core Competencies, Professional Experience, Key Achievements, Education, Board Roles & Advisory, Certifications, Languages, Publications & Speaking.
- **Testing**: `node:test` runner, no external framework. Build pipeline tested as importable function. Snapshot tests for regression.

---

## Phase 1: Minimal buildable CV

**User stories**: 8, 11, 12, 13

### What to build

A working end-to-end build: Node.js project with `package.json`, a YAML schema definition, a minimal sample `resume.example.yaml` (header + one experience entry), a Handlebars template, and a `build.js` that reads YAML and outputs `index.html`. The output should render in a browser with basic structural styling — not polished yet, but proving the full data-to-HTML pipeline works.

### Acceptance criteria

- [ ] `npm run build` reads `resume.example.yaml` and produces `dist/index.html`
- [ ] Output HTML contains the sample person's name, title, and one experience entry
- [ ] Handlebars template uses semantic HTML5 (`header`, `section`, `article`, etc.)
- [ ] Basic CSS is inlined in the output (enough to be readable, not yet polished)
- [ ] Build fails with a clear error if YAML file is missing

---

## Phase 2: All sections + screen typography

**User stories**: 15

### What to build

Extend the template and sample data to cover all 10 CV sections. Flesh out `resume.example.yaml` with a complete fictional "Jane Doe, CTO" profile. Implement the screen CSS: minimal, classic, white background, strong typographic hierarchy, generous whitespace, professional feel appropriate for C-level audiences.

### Acceptance criteria

- [ ] All 10 sections render from sample data (header, summary, competencies, experience, achievements, education, board roles, certifications, languages, publications)
- [ ] Sections with no data are gracefully hidden (not rendered as empty blocks)
- [ ] Core Competencies renders as a tag/chip layout
- [ ] Professional Experience entries show role, company, dates, and bullet points
- [ ] Typography has clear hierarchy: name > section headings > subheadings > body
- [ ] Page looks professional and print-document-like in a desktop browser

---

## Phase 3: Print CSS + PDF download

**User stories**: 2, 3, 9, 10

### What to build

Add `@media print` CSS that produces clean A4 output. Add a "Download as PDF" button that triggers `window.print()`. The button is hidden in print output. Print styles prevent orphaned sections and ensure page breaks land between logical blocks.

### Acceptance criteria

- [ ] "Download as PDF" button visible on screen, hidden in print
- [ ] Button triggers `window.print()` on click
- [ ] Print output fits A4 cleanly with proper margins
- [ ] No section heading appears at the bottom of a page without its content
- [ ] Page breaks occur between sections, not mid-entry
- [ ] Colors and backgrounds are print-friendly (no dark backgrounds bleeding through)

---

## Phase 4: Dev experience + validation

**User stories**: 8, 16

### What to build

Add `npm run dev` watch mode that rebuilds on file changes and serves locally. Add YAML schema validation in the build script that catches missing or invalid fields with clear error messages. Write a README with setup instructions, usage, and a screenshot of the sample CV.

### Acceptance criteria

- [ ] `npm run dev` starts a local server and rebuilds on changes to YAML or template files
- [ ] Build fails with a descriptive error for missing required fields (e.g. name, title)
- [ ] Build warns for optional but recommended fields (e.g. summary)
- [ ] README documents: prerequisites, install, build, dev, customization, and PDF generation
- [ ] README includes a screenshot of the rendered sample CV

---

## Phase 5: Public repo CI + tests

**User stories**: 11

### What to build

GitHub Actions workflow that runs `npm run build` with the sample data on every push and PR. Add build pipeline tests using `node:test`: given valid YAML, output contains expected content; given invalid YAML, build fails with correct error. Add a snapshot test for the sample CV output.

### Acceptance criteria

- [ ] GitHub Actions workflow runs on push to main and on PRs
- [ ] Workflow installs dependencies, runs tests, and runs the build
- [ ] Build pipeline test: valid YAML produces HTML containing expected sections
- [ ] Validation test: missing required fields produce clear error messages
- [ ] Snapshot test: sample CV output matches stored snapshot (with update mechanism)
- [ ] CI passes on a clean checkout

---

## Phase 6: Private repo pipeline + deploy

**User stories**: 6, 7

### What to build

In the private repo (`online-cv-ml`): wire up the public repo as a dependency (submodule or npm — decide at implementation time). Create a GitHub Actions workflow that checks out the private repo, pulls in the public template + build tooling, builds with the real `resume.yaml`, and pushes the output to the portfolio repo's `/cv` folder. Requires GitHub secrets for authentication.

### Acceptance criteria

- [ ] Private repo references the public repo's template and build tooling
- [ ] `npm run build` works in the private repo with the real `resume.yaml`
- [ ] GitHub Actions workflow triggers on push to main
- [ ] Workflow builds the CV and pushes `index.html` to the portfolio repo's `/cv` folder
- [ ] Deploy key or PAT is configured as a GitHub secret (not committed)
- [ ] Page is accessible at `terminalvelocity.me/cv` after a successful pipeline run

---

## Phase 7: Portfolio integration + cross-browser polish

**User stories**: 1, 4, 5, 14

### What to build

Wire the existing "CV / Resume" card on the portfolio site to open `/cv` in a new tab. Test PDF output across Chrome, Firefox, and Safari. Final review of typography, spacing, and mobile responsiveness. Ensure the CV page feels related to the portfolio but maintains its own classic, print-document identity.

### Acceptance criteria

- [ ] Portfolio site's "CV / Resume" card links to `/cv` and opens in a new tab
- [ ] PDF output is clean in Chrome, Firefox, and Safari
- [ ] Page is readable and well-laid-out on mobile devices
- [ ] Typography and spacing pass a final visual review
- [ ] The CV's visual style complements the portfolio without copying its terminal aesthetic
