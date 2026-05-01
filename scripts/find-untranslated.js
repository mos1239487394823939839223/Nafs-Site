#!/usr/bin/env node

/**
 * Script to find missing translations and untranslated content
 * Compares English and Arabic translation files to identify gaps
 */

import enModule from '../src/i18n/en.js';
import arModule from '../src/i18n/ar.js';

const en = enModule;
const ar = arModule;

const missingInArabic = [];
const missingInEnglish = [];

/**
 * Recursively find all keys in a translation object
 */
function getAllKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push({ key: fullKey, value, type: typeof value });
    }
  }

  return keys;
}

/**
 * Get value from nested object using dot notation
 */
function getValueByKey(obj, key) {
  return key.split('.').reduce((current, k) => {
    if (current && typeof current === 'object') {
      return current[k];
    }
    return undefined;
  }, obj);
}

console.log('🔍 Scanning for untranslated content...\n');

// Get all keys from English
const enKeys = getAllKeys(en);

// Check each English key exists in Arabic
for (const { key, value, type } of enKeys) {
  if (type === 'string') {
    const arValue = getValueByKey(ar, key);
    
    // A string is missing if it doesn't exist, is empty, or equals English 
    // AND the English string contains actual letters (to avoid flagging numbers/emails)
    const hasLetters = /[a-zA-Z]/.test(value);
    
    if (!arValue || arValue === '' || (arValue === value && hasLetters)) {
      missingInArabic.push({
        key,
        enValue: value,
        arValue: arValue || 'MISSING'
      });
    }
  }
}

// Get all keys from Arabic
const arKeys = getAllKeys(ar);

// Check each Arabic key exists in English
for (const { key, value } of arKeys) {
  const enValue = getValueByKey(en, key);
  if (!enValue) {
    missingInEnglish.push({
      key,
      arValue: value
    });
  }
}

// Report findings
if (missingInArabic.length > 0) {
  console.log(`⚠️  Found ${missingInArabic.length} missing or untranslated Arabic strings:\n`);
  missingInArabic.forEach(({ key, enValue, arValue }) => {
    console.log(`  Key: ${key}`);
    console.log(`  EN:  "${enValue}"`);
    console.log(`  AR:  "${arValue}"\n`);
  });
} else {
  console.log('✅ All English strings have Arabic translations!\n');
}

if (missingInEnglish.length > 0) {
  console.log(`⚠️  Found ${missingInEnglish.length} strings in Arabic without English version:\n`);
  missingInEnglish.forEach(({ key, arValue }) => {
    console.log(`  Key: ${key}`);
    console.log(`  AR:  "${arValue}"\n`);
  });
} else {
  console.log('✅ All Arabic strings have English counterparts!\n');
}

console.log(`📊 Summary:`);
console.log(`  Total English strings: ${enKeys.filter(k => k.type === 'string').length}`);
console.log(`  Total Arabic strings: ${arKeys.filter(k => k.type === 'string').length}`);
console.log(`  Missing translations: ${missingInArabic.length}`);
console.log(`  Extra Arabic strings: ${missingInEnglish.length}`);

process.exit(missingInArabic.length > 0 || missingInEnglish.length > 0 ? 1 : 0);
