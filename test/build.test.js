import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildScript = resolve(__dirname, '..', 'build.js');
const sampleYaml = resolve(__dirname, '..', 'resume.example.yaml');
const distHtml = resolve(__dirname, '..', 'dist', 'index.html');

function runBuild(yamlPath) {
  return execFileSync('node', [buildScript, yamlPath], {
    encoding: 'utf-8',
  });
}

function runBuildExpectError(yamlPath) {
  try {
    execFileSync('node', [buildScript, yamlPath], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    assert.fail('Expected build to fail');
  } catch (err) {
    return err.stderr;
  }
}

describe('build pipeline', () => {
  it('builds successfully from sample YAML', () => {
    const output = runBuild(sampleYaml);
    assert.match(output, /Built:/);
  });

  it('output contains expected sections', () => {
    runBuild(sampleYaml);
    const html = readFileSync(distHtml, 'utf-8');

    assert.match(html, /Jane Doe/);
    assert.match(html, /Chief Technology Officer/);
    assert.match(html, /Executive Summary/);
    assert.match(html, /Core Competencies/);
    assert.match(html, /Key Achievements/);
    assert.match(html, /Professional Experience/);
    assert.match(html, /Board Roles/);
    assert.match(html, /Volunteering/);
    assert.match(html, /Education/);
    assert.match(html, /Certifications/);
    assert.match(html, /Languages/);
    assert.match(html, /Publications/);
    assert.match(html, /Interests/);
  });

  it('output contains experience details', () => {
    runBuild(sampleYaml);
    const html = readFileSync(distHtml, 'utf-8');

    assert.match(html, /Acme Corp/);
    assert.match(html, /Frankfurt am Main/);
    assert.match(html, /Hybrid/);
    assert.match(html, /200-person engineering/);
  });
});

describe('validation', () => {
  let tmpDir;

  function writeTempYaml(content) {
    tmpDir = mkdtempSync(join(tmpdir(), 'cv-test-'));
    const path = join(tmpDir, 'test.yaml');
    writeFileSync(path, content, 'utf-8');
    return path;
  }

  it('fails on missing required fields', () => {
    const yamlPath = writeTempYaml('basics:\n  email: test@example.com\n');
    const stderr = runBuildExpectError(yamlPath);
    assert.match(stderr, /Missing required field: basics\.name/);
    assert.match(stderr, /Missing required field: basics\.title/);
    rmSync(tmpDir, { recursive: true });
  });

  it('fails on empty YAML', () => {
    const yamlPath = writeTempYaml('');
    const stderr = runBuildExpectError(yamlPath);
    assert.match(stderr, /empty/i);
    rmSync(tmpDir, { recursive: true });
  });

  it('fails on missing file', () => {
    const stderr = runBuildExpectError('/nonexistent/path/resume.yaml');
    assert.match(stderr, /not found/i);
  });

  it('warns on missing recommended fields', () => {
    const yamlPath = writeTempYaml(
      'basics:\n  name: Test\n  title: Engineer\n'
    );
    const { status, stderr } = spawnSync('node', [buildScript, yamlPath], {
      encoding: 'utf-8',
    });
    assert.equal(status, 0, 'Build should succeed');
    assert.match(stderr, /Missing recommended field/);
    rmSync(tmpDir, { recursive: true });
  });
});
