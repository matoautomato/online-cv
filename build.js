import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const resumePath = process.argv[2] || resolve(__dirname, 'resume.example.yaml');
const templatePath = resolve(__dirname, 'template.hbs');
const outputDir = resolve(__dirname, 'dist');
const outputPath = resolve(outputDir, 'index.html');

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

// Read and compile template
const templateSource = readFileSync(templatePath, 'utf-8');
const template = Handlebars.compile(templateSource);

// Render and write
const html = template(data);
mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, html, 'utf-8');

console.log(`Built: ${outputPath}`);
