import 'dotenv/config';

/**
 * Vodafone Sandbox SIM Swap Flow Probe
 *
 * Tests the 3-step CIBA OAuth flow:
 *   1. POST /openIDConnectCIBA/v1/bc-authorize  → get auth_req_id
 *   2. POST /openIDConnectCIBA/v1/token          → exchange for access_token
 *   3. POST /sim-swap/v1/retrieve-date            → call the actual API
 *
 * Usage:  npx ts-node scripts/probe-vf-simswap.ts
 */

import * as https from 'https';
import * as querystring from 'querystring';

// ── env ──────────────────────────────────────────────────────────────────────
const VF_SANDBOX_URL =
  process.env.VF_SANDBOX_URL ??
  'api-sandbox.vf-dmp.engineering.vodafone.com';
const SANDBOX_CLIENT_KEY = process.env.SANDBOX_CLIENT_KEY;
const SANDBOX_CLIENT_SECRET = process.env.SANDBOX_CLIENT_SECRET;

if (!SANDBOX_CLIENT_KEY || !SANDBOX_CLIENT_SECRET) {
  console.error(
    '❌  Missing SANDBOX_CLIENT_KEY or SANDBOX_CLIENT_SECRET in env',
  );
  process.exit(1);
}

const PHONE_HINT = 'tel:+447123456789'; // sandbox test number from docs

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
        headers: {
          ...headers,
          Host: VF_SANDBOX_URL,
        },
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
    Buffer.from(`${SANDBOX_CLIENT_KEY}:${SANDBOX_CLIENT_SECRET}`).toString(
      'base64',
    )
  );
}

function separator(title: string) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

function logResponse(res: {
  status: number;
  headers: Record<string, string>;
  body: string;
}) {
  console.log(`Status : ${res.status}`);
  console.log(`Headers: x-correlator=${res.headers['x-correlator'] ?? 'N/A'}`);
  try {
    console.log('Body   :', JSON.stringify(JSON.parse(res.body), null, 2));
  } catch {
    console.log('Body   :', res.body);
  }
}

// ── steps ────────────────────────────────────────────────────────────────────

async function step1_authorize(): Promise<string> {
  separator('Step 1 — bc-authorize');

  const body = querystring.stringify({
    login_hint: PHONE_HINT,
    scope: 'openid retrieve-sim-swap-date',
  });

  const res = await post(
    '/openIDConnectCIBA/v1/bc-authorize',
    {
      Authorization: basicAuth(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'vf-trace-transaction-id': crypto.randomUUID(),
    },
    body,
  );

  logResponse(res);

  if (res.status !== 200) {
    throw new Error(`bc-authorize failed with status ${res.status}`);
  }

  const parsed = JSON.parse(res.body);
  console.log(`\n✅  auth_req_id : ${parsed.auth_req_id}`);
  console.log(`   expires_in  : ${parsed.expires_in}s`);
  console.log(`   interval    : ${parsed.interval}`);
  return parsed.auth_req_id;
}

async function step2_token(authReqId: string): Promise<string> {
  separator('Step 2 — token exchange');

  const body = querystring.stringify({
    auth_req_id: authReqId,
    grant_type: 'urn:openid:params:grant-type:ciba',
  });

  const res = await post(
    '/openIDConnectCIBA/v1/token',
    {
      Authorization: basicAuth(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'vf-trace-transaction-id': crypto.randomUUID(),
    },
    body,
  );

  logResponse(res);

  if (res.status !== 200) {
    throw new Error(`token exchange failed with status ${res.status}`);
  }

  const parsed = JSON.parse(res.body);
  console.log(`\n✅  access_token : ${parsed.access_token?.slice(0, 30)}...`);
  console.log(`   token_type   : ${parsed.token_type}`);
  console.log(`   expires_in   : ${parsed.expires_in}s`);
  return parsed.access_token;
}

async function step3_retrieveDate(accessToken: string): Promise<void> {
  separator('Step 3 — retrieve-date');

  const res = await post(
    '/sim-swap/v1/retrieve-date',
    {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      vf_ext_bp_id: 'Acme_Co',
      'vf-trace-transaction-id': crypto.randomUUID(),
    },
    JSON.stringify({}),
  );

  logResponse(res);

  if (res.status === 200) {
    const parsed = JSON.parse(res.body);
    console.log(`\n✅  latestSimChange : ${parsed.latestSimChange ?? 'null'}`);
    if (parsed.monitoredPeriod !== undefined) {
      console.log(`   monitoredPeriod : ${parsed.monitoredPeriod}`);
    }
  } else {
    console.log(`\n⚠️  retrieve-date returned status ${res.status}`);
  }
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Probing Vodafone Sandbox SIM Swap flow...');
  console.log(`   Host       : ${VF_SANDBOX_URL}`);
  console.log(`   Phone hint : ${PHONE_HINT}`);

  try {
    const authReqId = await step1_authorize();
    const accessToken = await step2_token(authReqId);
    await step3_retrieveDate(accessToken);

    separator('Summary');
    console.log('✅  Full 3-step CIBA flow completed successfully.');
  } catch (err) {
    separator('FAILURE');
    console.error('❌ ', err);
    process.exit(1);
  }
}

main();
