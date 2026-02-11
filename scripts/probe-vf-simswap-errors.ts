import 'dotenv/config';

/**
 * Vodafone Sandbox SIM Swap — Error Case Probe
 *
 * Tests how the sandbox responds to invalid/edge-case requests,
 * comparing against CAMARA sim-swap.yaml error codes:
 *   400 INVALID_ARGUMENT / OUT_OF_RANGE
 *   401 UNAUTHENTICATED
 *   403 PERMISSION_DENIED
 *   404 NOT_FOUND / IDENTIFIER_NOT_FOUND
 *   422 SERVICE_NOT_APPLICABLE / MISSING_IDENTIFIER / UNNECESSARY_IDENTIFIER
 *   429 QUOTA_EXCEEDED / TOO_MANY_REQUESTS
 *
 * Usage:  npx ts-node scripts/probe-vf-simswap-errors.ts
 */

import * as https from 'https';
import * as querystring from 'querystring';

const VF_SANDBOX_URL =
  process.env.VF_SANDBOX_URL ??
  'api-sandbox.vf-dmp.engineering.vodafone.com';
const SANDBOX_CLIENT_KEY = process.env.SANDBOX_CLIENT_KEY;
const SANDBOX_CLIENT_SECRET = process.env.SANDBOX_CLIENT_SECRET;

if (!SANDBOX_CLIENT_KEY || !SANDBOX_CLIENT_SECRET) {
  console.error('❌  Missing SANDBOX_CLIENT_KEY or SANDBOX_CLIENT_SECRET');
  process.exit(1);
}

// ── helpers ──────────────────────────────────────────────────────────────────

function post(
  path: string,
  headers: Record<string, string>,
  body: string,
): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: VF_SANDBOX_URL,
        port: 443,
        path,
        method: 'POST',
        headers: { ...headers, Host: VF_SANDBOX_URL },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            status: res.statusCode!,
            headers: res.headers as Record<string, string>,
            body: Buffer.concat(chunks).toString(),
          }),
        );
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function basicAuth(): string {
  return (
    'Basic ' +
    Buffer.from(`${SANDBOX_CLIENT_KEY}:${SANDBOX_CLIENT_SECRET}`).toString('base64')
  );
}

/** Get a valid bearer token via the full CIBA flow */
async function getValidToken(): Promise<string> {
  const r1 = await post(
    '/openIDConnectCIBA/v1/bc-authorize',
    {
      Authorization: basicAuth(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    querystring.stringify({
      login_hint: 'tel:+447123456789',
      scope: 'openid retrieve-sim-swap-date',
    }),
  );
  const authReqId = JSON.parse(r1.body).auth_req_id;

  const r2 = await post(
    '/openIDConnectCIBA/v1/token',
    {
      Authorization: basicAuth(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    querystring.stringify({
      auth_req_id: authReqId,
      grant_type: 'urn:openid:params:grant-type:ciba',
    }),
  );
  return JSON.parse(r2.body).access_token;
}

interface TestCase {
  name: string;
  expectedCamara: string;
  run: (validToken: string) => Promise<{ status: number; body: string }>;
}

const tests: TestCase[] = [
  // ─── 401 UNAUTHENTICATED ───────────────────────────────────────────
  {
    name: '401 — No auth header on bc-authorize',
    expectedCamara: '401 UNAUTHENTICATED',
    run: async () =>
      post(
        '/openIDConnectCIBA/v1/bc-authorize',
        { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        querystring.stringify({ login_hint: 'tel:+447123456789', scope: 'openid retrieve-sim-swap-date' }),
      ),
  },
  {
    name: '401 — Wrong credentials on bc-authorize',
    expectedCamara: '401 UNAUTHENTICATED',
    run: async () =>
      post(
        '/openIDConnectCIBA/v1/bc-authorize',
        {
          Authorization: 'Basic ' + Buffer.from('bad:creds').toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        querystring.stringify({ login_hint: 'tel:+447123456789', scope: 'openid retrieve-sim-swap-date' }),
      ),
  },
  {
    name: '401 — No bearer token on retrieve-date',
    expectedCamara: '401 UNAUTHENTICATED',
    run: async () =>
      post(
        '/sim-swap/v1/retrieve-date',
        { 'Content-Type': 'application/json', Accept: 'application/json' },
        JSON.stringify({}),
      ),
  },
  {
    name: '401 — Invalid bearer token on retrieve-date',
    expectedCamara: '401 UNAUTHENTICATED',
    run: async () =>
      post(
        '/sim-swap/v1/retrieve-date',
        {
          Authorization: 'Bearer invalid-token-12345',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        JSON.stringify({}),
      ),
  },

  // ─── 400 INVALID_ARGUMENT ─────────────────────────────────────────
  {
    name: '400 — Missing login_hint on bc-authorize',
    expectedCamara: '400 INVALID_ARGUMENT',
    run: async () =>
      post(
        '/openIDConnectCIBA/v1/bc-authorize',
        {
          Authorization: basicAuth(),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        querystring.stringify({ scope: 'openid retrieve-sim-swap-date' }),
      ),
  },
  {
    name: '400 — Malformed phone number in login_hint',
    expectedCamara: '400 INVALID_ARGUMENT',
    run: async () =>
      post(
        '/openIDConnectCIBA/v1/bc-authorize',
        {
          Authorization: basicAuth(),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        querystring.stringify({
          login_hint: 'not-a-phone',
          scope: 'openid retrieve-sim-swap-date',
        }),
      ),
  },
  {
    name: '400 — Invalid scope on bc-authorize',
    expectedCamara: '400 INVALID_ARGUMENT',
    run: async () =>
      post(
        '/openIDConnectCIBA/v1/bc-authorize',
        {
          Authorization: basicAuth(),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        querystring.stringify({
          login_hint: 'tel:+447123456789',
          scope: 'openid nonexistent-scope',
        }),
      ),
  },

  // ─── 400 — Invalid grant_type on token ─────────────────────────────
  {
    name: '400 — Invalid grant_type on token',
    expectedCamara: '400 INVALID_ARGUMENT',
    run: async () => {
      // get a valid auth_req_id first
      const r1 = await post(
        '/openIDConnectCIBA/v1/bc-authorize',
        {
          Authorization: basicAuth(),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        querystring.stringify({
          login_hint: 'tel:+447123456789',
          scope: 'openid retrieve-sim-swap-date',
        }),
      );
      const authReqId = JSON.parse(r1.body).auth_req_id;
      return post(
        '/openIDConnectCIBA/v1/token',
        {
          Authorization: basicAuth(),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        querystring.stringify({
          auth_req_id: authReqId,
          grant_type: 'invalid_grant_type',
        }),
      );
    },
  },

  // ─── 404 — Unknown phone number ────────────────────────────────────
  {
    name: '404 — Unknown phone number (tel:+440000000000)',
    expectedCamara: '404 NOT_FOUND / IDENTIFIER_NOT_FOUND',
    run: async () => {
      const r1 = await post(
        '/openIDConnectCIBA/v1/bc-authorize',
        {
          Authorization: basicAuth(),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        querystring.stringify({
          login_hint: 'tel:+440000000000',
          scope: 'openid retrieve-sim-swap-date',
        }),
      );
      if (r1.status !== 200) return r1; // error already at authorize
      const authReqId = JSON.parse(r1.body).auth_req_id;
      const r2 = await post(
        '/openIDConnectCIBA/v1/token',
        {
          Authorization: basicAuth(),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        querystring.stringify({
          auth_req_id: authReqId,
          grant_type: 'urn:openid:params:grant-type:ciba',
        }),
      );
      if (r2.status !== 200) return r2;
      const token = JSON.parse(r2.body).access_token;
      return post(
        '/sim-swap/v1/retrieve-date',
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          vf_ext_bp_id: 'Acme_Co',
        },
        JSON.stringify({}),
      );
    },
  },

  // ─── retrieve-date with explicit phoneNumber in body ───────────────
  {
    name: '422 — phoneNumber in body with 3-legged token (UNNECESSARY_IDENTIFIER)',
    expectedCamara: '422 UNNECESSARY_IDENTIFIER',
    run: async (validToken) =>
      post(
        '/sim-swap/v1/retrieve-date',
        {
          Authorization: `Bearer ${validToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          vf_ext_bp_id: 'Acme_Co',
        },
        JSON.stringify({ phoneNumber: '+447123456789' }),
      ),
  },

  // ─── Missing vf_ext_bp_id header ──────────────────────────────────
  {
    name: 'Edge — Missing vf_ext_bp_id header on retrieve-date',
    expectedCamara: 'Vodafone-specific, may 400/403',
    run: async (validToken) =>
      post(
        '/sim-swap/v1/retrieve-date',
        {
          Authorization: `Bearer ${validToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        JSON.stringify({}),
      ),
  },

  // ─── Invalid JSON body on retrieve-date ────────────────────────────
  {
    name: '400 — Invalid JSON body on retrieve-date',
    expectedCamara: '400 INVALID_ARGUMENT',
    run: async (validToken) =>
      post(
        '/sim-swap/v1/retrieve-date',
        {
          Authorization: `Bearer ${validToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          vf_ext_bp_id: 'Acme_Co',
        },
        'not-json',
      ),
  },
];

// ── runner ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Probing Vodafone Sandbox — Error Cases');
  console.log('═'.repeat(70));

  console.log('\n⏳ Obtaining a valid token for tests that need one...');
  const validToken = await getValidToken();
  console.log('✅ Got valid token\n');

  const results: { name: string; expected: string; actual: string; body: string }[] = [];

  for (const test of tests) {
    console.log(`\n── ${test.name} ──`);
    try {
      const res = await test.run(validToken);
      let parsedBody: string;
      try {
        parsedBody = JSON.stringify(JSON.parse(res.body), null, 2);
      } catch {
        parsedBody = res.body;
      }
      console.log(`   Expected : ${test.expectedCamara}`);
      console.log(`   Actual   : ${res.status}`);
      console.log(`   Body     : ${parsedBody}`);
      results.push({
        name: test.name,
        expected: test.expectedCamara,
        actual: `${res.status}`,
        body: parsedBody,
      });
    } catch (err: any) {
      console.log(`   ❌ Error  : ${err.message}`);
      results.push({
        name: test.name,
        expected: test.expectedCamara,
        actual: 'ERROR',
        body: err.message,
      });
    }
  }

  // ── summary table ──
  console.log('\n' + '═'.repeat(70));
  console.log('  SUMMARY');
  console.log('═'.repeat(70));
  console.log(
    'Test'.padEnd(55) + 'Expected'.padEnd(35) + 'Actual',
  );
  console.log('─'.repeat(100));
  for (const r of results) {
    console.log(
      r.name.padEnd(55) + r.expected.padEnd(35) + r.actual,
    );
  }
}

main();
