#!/usr/bin/env node

/**
 * Scans every t('key', 'fallback') call in src/ and reports any key that
 * doesn't exist in src/i18n/ar.js and/or src/i18n/en.js. Those calls always
 * render the literal fallback string (usually English) regardless of the
 * active language, which is how untranslated text leaks into the Arabic UI.
 *
 * Usage: node scripts/find-missing-t-keys.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import enModule from '../src/i18n/en.js';
import arModule from '../src/i18n/ar.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, '..', 'src');

function getValueByKey(obj, key) {
  return key.split('.').reduce((current, k) => {
    if (current && typeof current === 'object') return current[k];
    return undefined;
  }, obj);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'i18n') continue;
      walk(fullPath, files);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Matches t('some.key') or t('some.key', 'fallback text') / t("...", "...")
const T_CALL_RE = /\bt\(\s*(['"])([a-zA-Z0-9_.]+)\1\s*(?:,\s*(['"])((?:(?!\3).)*?)\3\s*)?\)/g;

const files = walk(SRC_DIR);
const results = []; // { key, fallback, file, line, missingInAr, missingInEn }

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let match;
  T_CALL_RE.lastIndex = 0;
  while ((match = T_CALL_RE.exec(content))) {
    const [, , key, , fallback] = match;
    const upToMatch = content.slice(0, match.index);
    const line = upToMatch.split('\n').length;

    const enValue = getValueByKey(enModule, key);
    const arValue = getValueByKey(arModule, key);

    const missingInEn = typeof enValue !== 'string';
    const missingInAr = typeof arValue !== 'string';

    if (missingInEn || missingInAr) {
      results.push({
        key,
        fallback: fallback || null,
        file: path.relative(path.join(__dirname, '..'), file),
        line,
        missingInAr,
        missingInEn,
      });
    }
  }
}

if (results.length === 0) {
  console.log('✅ No t() calls reference missing translation keys.');
  process.exit(0);
}

console.log(`⚠️  Found ${results.length} t() calls referencing keys missing from i18n files:\n`);

const byKey = new Map();
for (const r of results) {
  if (!byKey.has(r.key)) byKey.set(r.key, []);
  byKey.get(r.key).push(r);
}

for (const [key, occurrences] of byKey) {
  const { fallback, missingInAr, missingInEn } = occurrences[0];
  const where = missingInAr && missingInEn ? 'missing in BOTH en+ar' : missingInAr ? 'missing in ar' : 'missing in en';
  console.log(`Key: ${key}  [${where}]`);
  if (fallback) console.log(`  Fallback text: "${fallback}"`);
  for (const o of occurrences) {
    console.log(`  ${o.file}:${o.line}`);
  }
  console.log('');
}

console.log(`📊 Summary: ${byKey.size} distinct missing keys across ${results.length} call sites.`);
process.exit(1);
