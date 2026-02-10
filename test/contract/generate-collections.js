#!/usr/bin/env node
/**
 * Generates Postman collections from all OpenAPI YAML files in docs/
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../../docs');
const OUTPUT_DIR = path.join(__dirname);
const CONFIG_FILE = path.join(__dirname, '../../portman-config.json');

// Find all .yaml files in docs subdirectories
function findYamlFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findYamlFiles(fullPath));
    } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
      files.push(fullPath);
    }
  });
  return files;
}

const yamlFiles = findYamlFiles(DOCS_DIR);

if (yamlFiles.length === 0) {
  console.log('No YAML files found in docs/');
  process.exit(0);
}

console.log(`Found ${yamlFiles.length} OpenAPI spec(s):\n`);

yamlFiles.forEach(yamlPath => {
  const relativePath = path.relative(process.cwd(), yamlPath);
  const baseName = path.basename(yamlPath, path.extname(yamlPath));
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.collection.json`);

  // Skip if collection is newer than both the YAML spec and portman config
  if (fs.existsSync(outputPath)) {
    const collectionMtime = fs.statSync(outputPath).mtimeMs;
    const yamlMtime = fs.statSync(yamlPath).mtimeMs;
    const configMtime = fs.statSync(CONFIG_FILE).mtimeMs;
    if (collectionMtime > yamlMtime && collectionMtime > configMtime) {
      console.log(`  ⏭  ${relativePath} (up-to-date, skipping)`);
      return;
    }
  }

  console.log(`  📄 ${relativePath}`);
  console.log(`     → ${path.relative(process.cwd(), outputPath)}`);
  
  try {
    execSync(`npx portman -l "${yamlPath}" -o "${outputPath}" -c "${CONFIG_FILE}"`, {
      stdio: 'pipe'
    });
    console.log('     ✓ Generated\n');
  } catch (err) {
    console.error(`     ✗ Failed: ${err.message}\n`);
  }
});

console.log('Done!');
