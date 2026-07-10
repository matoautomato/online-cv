import { readFileSync, writeFileSync, mkdirSync, watch } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import Handlebars from 'handlebars';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const flags = ['--watch', '--output'];
const args = process.argv.slice(2).filter(a => {
  if (flags.includes(a)) return false;
  const prev = process.argv[process.argv.indexOf(a) - 1];
  return !flags.includes(prev);
});
const resumePath = args[0]
  ? resolve(process.cwd(), args[0])
  : resolve(__dirname, 'resume.example.yaml');
const templatePath = resolve(__dirname, 'template.hbs');
const outputIdx = process.argv.indexOf('--output');
const outputDir = outputIdx !== -1 && process.argv[outputIdx + 1]
  ? resolve(process.cwd(), process.argv[outputIdx + 1])
  : resolve(__dirname, 'dist');
const outputPath = resolve(outputDir, 'index.html');

// Template helpers
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ISO "YYYY-MM" -> "MMM YYYY"; "present" -> "Present"; year-only and anything else pass through.
// Keeps clean ISO data in the YAML while rendering ATS-friendly dates.
Handlebars.registerHelper('fmtDate', (value) => {
  if (value === undefined || value === null) return '';
  const s = String(value).trim();
  if (!s) return '';
  if (/^present$/i.test(s)) return 'Present';
  const m = s.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const month = MONTHS[parseInt(m[2], 10) - 1];
    if (month) return `${month} ${m[1]}`;
  }
  return s;
});

// Strip scheme and trailing slash so a URL renders as clean, parseable text (e.g. linkedin.com/in/handle).
Handlebars.registerHelper('stripScheme', (value) => {
  if (value === undefined || value === null) return '';
  return String(value).replace(/^https?:\/\//i, '').replace(/\/+$/, '');
});

// Self-hosted Inter (OFL) inlined as data URIs so the output stays one self-contained,
// GDPR-clean HTML file with no external font requests.
function fontDataUri(file) {
  const b64 = readFileSync(resolve(__dirname, 'assets/fonts', file)).toString('base64');
  return `data:font/woff2;base64,${b64}`;
}

const FONTS = {
  interNormal: fontDataUri('inter-latin-wght-normal.woff2'),
  interItalic: fontDataUri('inter-latin-wght-italic.woff2'),
};

const REQUIRED_FIELDS = ['basics.name', 'basics.title'];
const RECOMMENDED_FIELDS = ['basics.summary', 'competencies', 'experience'];

function getNestedField(obj, path) {
  return path.split('.').reduce((o, k) => o && o[k], obj);
}

function validate(data) {
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    errors.push('YAML file is empty or not a valid object');
    return { errors, warnings };
  }

  for (const field of REQUIRED_FIELDS) {
    const val = getNestedField(data, field);
    if (!val || (typeof val === 'string' && !val.trim())) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  for (const field of RECOMMENDED_FIELDS) {
    const val = getNestedField(data, field);
    if (!val || (Array.isArray(val) && val.length === 0)) {
      warnings.push(`Missing recommended field: ${field}`);
    }
  }

  return { errors, warnings };
}

function build() {
  // Read and parse YAML
  let raw;
  try {
    raw = readFileSync(resumePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Error: Resume file not found: ${resumePath}`);
      process.exit(1);
    }
    throw err;
  }

  const data = yaml.load(raw);

  // Validate
  const { errors, warnings } = validate(data);

  for (const w of warnings) {
    console.warn(`Warning: ${w}`);
  }

  if (errors.length > 0) {
    for (const e of errors) {
      console.error(`Error: ${e}`);
    }
    process.exit(1);
  }

  // Read and compile template
  const templateSource = readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  // Render and write
  const html = template({ ...data, _fonts: FONTS });
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, html, 'utf-8');

  return html;
}

// Single build
build();
console.log(`Built: ${outputPath}`);

// Watch mode
if (process.argv.includes('--watch')) {
  const PORT = 3000;

  const server = createServer((req, res) => {
    try {
      const html = readFileSync(outputPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch {
      res.writeHead(404);
      res.end('Not found — run a build first');
    }
  });

  server.listen(PORT, () => {
    console.log(`Dev server: http://localhost:${PORT}`);
    console.log('Watching for changes...');
  });

  let debounce;
  for (const file of [resumePath, templatePath]) {
    watch(file, () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        try {
          build();
          console.log(`Rebuilt: ${new Date().toLocaleTimeString()}`);
        } catch (err) {
          console.error(`Build error: ${err.message}`);
        }
      }, 100);
    });
  }
}
