#!/usr/bin/env node
/**
 * Runs contract tests for all APIs:
 * 1. Generates collections (skips up-to-date ones)
 * 2. Generates JWT token
 * 3. Discovers and runs all *.collection.json files with newman
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONTRACT_DIR = __dirname;

// Step 1: Generate collections (smart skip for up-to-date ones)
console.log('=== Generating collections ===\n');
execSync('node test/contract/generate-collections.js', {
  cwd: path.join(__dirname, '../..'),
  stdio: 'inherit',
});

// Step 2: Generate JWT token
console.log('\n=== Generating JWT token ===\n');
execSync('node test/contract/generate-token.js', {
  cwd: path.join(__dirname, '../..'),
  stdio: 'inherit',
});

// Step 3: Discover all collection files
const collections = fs
  .readdirSync(CONTRACT_DIR)
  .filter(f => f.endsWith('.collection.json'));

if (collections.length === 0) {
  console.log('\nNo collection files found. Skipping contract tests.');
  process.exit(0);
}

const envFile = path.join(CONTRACT_DIR, 'environment.json');

console.log(`\n=== Running ${collections.length} contract test suite(s) ===\n`);

// Step 4: Run newman on each collection
let failed = false;

collections.forEach(collection => {
  const collectionPath = path.join(CONTRACT_DIR, collection);
  const name = collection.replace('.collection.json', '');
  console.log(`▶ ${name}`);

  try {
    execSync(`npx newman run "${collectionPath}" -e "${envFile}"`, {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit',
    });
    console.log(`✓ ${name} passed\n`);
  } catch {
    console.error(`✗ ${name} failed\n`);
    failed = true;
  }
});

if (failed) {
  console.error('\n❌ Some contract tests failed.');
  process.exit(1);
}

console.log('\n✅ All contract tests passed.');
