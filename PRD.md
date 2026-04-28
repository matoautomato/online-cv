# PRD: Online CV — Static Resume Page for terminalvelocity.me/cv

## Problem Statement

As a senior technology leader, I need a professional, polished CV page at `terminalvelocity.me/cv` that presents my experience in a format appropriate for C-level audiences. The page must render beautifully on screen and produce clean A4 PDF output via browser print. The CV data lives in a private repo (sensitive personal information), while the template and build tooling should be open-sourced as a reusable project.

## Solution

A two-repo architecture:

- **Public repo (`online-cv`)**: A reusable CV template built with Node.js + Handlebars, using JSON Resume schema in YAML format. Ships with a fictional sample CV and full build pipeline. Anyone can fork it and plug in their own data.
- **Private repo (`online-cv-ml`)**: Contains the real `resume.yaml` and a GitHub Actions workflow that builds the CV and deploys it to the portfolio site's `/cv` path on Cloudflare Pages.

The CV page is minimal, classic, white with strong typography — a print-document aesthetic. A "Download as PDF" button triggers `window.print()`, and `@media print` CSS ensures clean A4 output.

## User Stories

1. As a recruiter, I want to view Matthias's CV at a stable URL, so that I can quickly assess his qualifications.
2. As a recruiter, I want to download the CV as a PDF, so that I can share it internally or print it.
3. As a hiring manager, I want the PDF to look professionally typeset on A4, so that it meets the standard I expect from a senior leader.
4. As a visitor on the portfolio site, I want a clear link to the CV page, so that I can find it without hunting.
5. As a CV visitor, I want the page to load fast and render cleanly on mobile, so that I can read it on any device.
6. As the site owner, I want my real CV data in a private repo, so that my personal details aren't exposed in a public template repo.
7. As the site owner, I want the CV to auto-deploy when I push changes to the private repo, so that updates go live without manual steps.
8. As the site owner, I want to edit my CV as a simple YAML file, so that I don't have to touch HTML or CSS to update content.
9. As the site owner, I want `@media print` CSS that prevents orphaned sections, so that the PDF output doesn't break awkwardly across pages.
10. As the site owner, I want the "Download as PDF" button hidden in print output, so that the PDF looks clean.
11. As an open-source user, I want to fork the public repo and plug in my own YAML, so that I get a professional CV page without building one from scratch.
12. As an open-source user, I want a fictional sample CV included, so that I can see what the template looks like before customizing it.
13. As an open-source user, I want clear README instructions, so that I can set up and build the project without guessing.
14. As the site owner, I want the CV page style to complement (but not copy) the portfolio site's terminal aesthetic, so that the two feel related but the CV remains classic and print-appropriate.
15. As a visitor, I want the CV to include all standard C-level sections (summary, competencies, experience, achievements, education, board roles, certifications, languages, publications/speaking), so that the profile is comprehensive.
16. As the site owner, I want a dev watch mode, so that I can iterate on the template with live feedback.

## Implementation Decisions

### Modules

1. **Data Schema & Validation**: JSON Resume-based YAML schema extended with C-level sections (board roles, advisory, key achievements, publications/speaking). The build script reads and validates the YAML before rendering.

2. **Template Engine**: A single Handlebars template (`template.hbs`) with inline `<style>` blocks for both screen and print CSS. Semantic HTML5 structure. Handlebars helpers for formatting dates, lists, and conditional sections.

3. **Build Pipeline**: A Node.js script (`build.js`) that reads the YAML source, compiles the Handlebars template, and writes a self-contained `index.html`. Two npm scripts: `npm run build` (one-shot) and `npm run dev` (watch mode with file-system watcher).

4. **CI/CD — Public Repo**: GitHub Actions workflow that runs `npm run build` with the sample data on every push/PR, ensuring the template stays buildable.

5. **CI/CD — Private Repo**: GitHub Actions workflow that checks out the private repo, pulls in the public repo's template + build tooling (via git submodule or npm dependency — TBD), builds with the real `resume.yaml`, and pushes the output to the portfolio repo's `/cv` folder. Requires a deploy key or PAT stored as a GitHub secret.

6. **Portfolio Integration**: A clickable card in the portfolio site's About section (the existing "CV / Resume" card) that opens `/cv` in a new tab.

### Architectural decisions

- **Self-contained output**: The build produces a single `index.html` with all CSS inlined. No external stylesheets or JS dependencies at runtime.
- **No framework**: Plain HTML + CSS. The CV is a document, not an app.
- **YAML over JSON**: More readable for hand-editing personal data.
- **Handlebars over other templaters**: Simple logic-less templates, well-suited for document rendering. No need for anything heavier.
- **Public/private split**: Template and tooling are open-sourced; personal data stays private. The private repo consumes the public repo.
- **Browser print for PDF**: No server-side PDF generation (Puppeteer, wkhtmltopdf, etc.). `window.print()` with `@media print` CSS is simpler, zero-dependency, and produces native-quality output.

### CV sections (in order)

1. Header (name, title, contact info)
2. Executive Summary
3. Core Competencies (tag/chip layout)
4. Professional Experience (reverse chronological)
5. Key Achievements
6. Education
7. Board Roles & Advisory
8. Certifications
9. Languages
10. Publications & Speaking

## Testing Decisions

Good tests for this project verify external behavior: given a YAML input, does the build produce the expected HTML output? Tests should not assert on internal template logic or helper implementation details.

### What to test

- **Build pipeline**: Given a valid YAML file, `build.js` produces an `index.html` that contains expected sections, headings, and content.
- **Schema validation**: Invalid or missing YAML fields produce clear error messages, not silent failures.
- **Template rendering**: Snapshot tests for the sample CV output — ensures template changes don't accidentally break the rendered HTML.

### Approach

- Use Node.js built-in `node:test` runner (no external test framework needed).
- Test the build script as a function (import and call) rather than shelling out.
- Snapshot the sample CV HTML output for regression detection.

## Out of Scope

- **CV content authoring**: The actual text of the real `resume.yaml` will be created in a separate session. This PRD covers the template, tooling, and pipeline only.
- **Custom domain or hosting changes**: The portfolio site's Cloudflare Pages setup already exists. No infrastructure changes needed.
- **Interactive features**: No JavaScript interactivity on the CV page beyond the download button. No animations, no dynamic content.
- **Multi-language support**: English only.
- **Dark mode**: The CV is a print-style document. White background only.
- **Analytics or tracking**: Not adding any tracking to the CV page.

## Further Notes

- The portfolio site already has a "CV / Resume" card in the About section that will link to `/cv`. The card exists; it just needs the correct href and target.
- The CV's visual style should be intentionally different from the portfolio site's terminal aesthetic. The CV is a classic, typeset document — think white paper, strong serif or sans-serif headings, generous whitespace. It should feel like it belongs to the same person but serves a different purpose.
- The public repo serves as a portfolio piece itself — clean code, good README, useful to others.
