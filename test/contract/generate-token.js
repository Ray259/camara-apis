#!/usr/bin/env node
/**
 * Generates JWT token and updates environment.json before running tests
 */
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = 'test-secret-key';
const ENV_FILE = path.join(__dirname, 'environment.json');

// Generate token and write to environment.json
const token = jwt.sign({ iss: 'test-issuer' }, JWT_SECRET, { expiresIn: '1h' });
const env = JSON.parse(fs.readFileSync(ENV_FILE, 'utf8'));
const authTokenIndex = env.values.findIndex(v => v.key === 'authToken');
if (authTokenIndex >= 0) {
  env.values[authTokenIndex].value = token;
} else {
  env.values.push({ key: 'authToken', value: token, enabled: true });
}

// Write back
fs.writeFileSync(ENV_FILE, JSON.stringify(env, null, 2));

console.log('JWT token generated and saved to environment.json');
