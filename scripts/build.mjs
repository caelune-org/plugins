#!/usr/bin/env node
/**
 * Builds the plugin registry: validates every plugins/<slug>/ folder and
 * emits dist/index.json plus one dist/<slug>.json bundle per plugin
 * ({id,name,version,description,tools,components,files:{relpath:text}}).
 */
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PLUGINS = join(ROOT, 'plugins');
const DIST = join(ROOT, 'dist');

function listFiles(dir, base = dir, out = {}) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) listFiles(p, base, out);
    else out[relative(base, p).replaceAll('\\', '/')] = readFileSync(p, 'utf8');
  }
  return out;
}

/** Minimal frontmatter read matching the app's YAML-subset parser. */
function frontmatter(skill) {
  const text = skill.replace(/^﻿/, '');
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const block = text.slice(3, end);
  const fm = {};
  let section = null;
  for (const line of block.split('\n')) {
    const kv = /^(\w[\w-]*)\s*:\s*(.*)$/.exec(line);
    if (kv && !line.startsWith(' ') && !line.startsWith('\t')) {
      section = ['tools', 'components', 'capabilities'].includes(kv[1]) ? kv[1] : null;
      if (section) fm[section] = [];
      else fm[kv[1]] = kv[2].trim();
      continue;
    }
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && section) {
      const kvi = /^(\w[\w-]*)\s*:\s*(.*)$/.exec(item[1]);
      fm[section].push(kvi ? { [kvi[1]]: kvi[2].trim() } : item[1].trim());
      continue;
    }
    const prop = /^\s+(\w[\w-]*)\s*:\s*(.*)$/.exec(line);
    if (prop && section && fm[section].length) {
      fm[section][fm[section].length - 1][prop[1]] = prop[2].trim();
    }
  }
  return fm;
}

const slugs = readdirSync(PLUGINS).filter((d) => statSync(join(PLUGINS, d)).isDirectory());
if (!slugs.length) {
  console.error('no plugins found under plugins/');
  process.exit(1);
}

mkdirSync(DIST, { recursive: true });
const index = [];
let failed = false;

for (const slug of slugs.sort()) {
  const files = listFiles(join(PLUGINS, slug));
  const fail = (msg) => {
    console.error(`✗ ${slug}: ${msg}`);
    failed = true;
  };
  const skill = files['SKILL.md'];
  if (!skill) {
    fail('missing SKILL.md');
    continue;
  }
  const fm = frontmatter(skill);
  if (!fm?.name) {
    fail('SKILL.md frontmatter missing or has no name');
    continue;
  }
  for (const t of fm.tools ?? []) {
    if (!t.run) fail(`tool ${t.name ?? '?'} has no run file`);
    else if (!files[t.run]) fail(`tool ${t.name ?? '?'} run file missing: ${t.run}`);
  }
  for (const c of fm.components ?? []) {
    for (const key of ['html', 'css', 'js']) {
      if (c[key] && !files[c[key]]) fail(`component ${c.name ?? '?'} missing file: ${c[key]}`);
    }
  }
  if (failed) continue;
  const entry = {
    id: slug,
    name: fm.name,
    version: fm.version ?? '',
    description: fm.description ?? '',
    tools: (fm.tools ?? []).length,
    components: (fm.components ?? []).length,
    capabilities: (fm.capabilities ?? []).filter((c) => typeof c === 'string'),
  };
  index.push(entry);
  writeFileSync(join(DIST, `${slug}.json`), JSON.stringify({ ...entry, files }));
  console.log(`✓ ${slug} — ${fm.name} v${fm.version ?? '-'}`);
}

writeFileSync(
  join(DIST, 'index.json'),
  JSON.stringify({ repo: 'caelune-org/plugins', generated: new Date().toISOString(), plugins: index }),
);
console.log(`\n${index.length} plugin(s) → dist/`);
process.exit(failed ? 1 : 0);
