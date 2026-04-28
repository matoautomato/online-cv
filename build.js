import { readFileSync, writeFileSync, mkdirSync, watch } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import Handlebars from 'handlebars';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const resumePath = process.argv.includes('--watch')
  ? (process.argv.filter(a => a !== '--watch')[2] || resolve(__dirname, 'resume.example.yaml'))
  : (process.argv[2] || resolve(__dirname, 'resume.example.yaml'));
const templatePath = resolve(__dirname, 'template.hbs');
const outputDir = resolve(__dirname, 'dist');
const outputPath = resolve(outputDir, 'index.html');

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
  const html = template(data);
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
