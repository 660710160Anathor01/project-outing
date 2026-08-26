/**
 * Verifies that concurrent POST /registrations never hand out the same
 * registration number.
 *
 * Run against a started API:
 *   pnpm start:dev            # in one terminal
 *   node test/concurrency.mjs # in another
 *
 * Set API_URL to point somewhere other than http://localhost:3001.
 * Requires WRITE_THROTTLE_LIMIT to be raised above the request count, otherwise
 * the rate limiter (correctly) rejects most of the burst with 429.
 */
const BASE = process.env.API_URL ?? 'http://localhost:3001';
const ROUNDS = Number(process.env.ROUNDS ?? 8);
const PARALLEL = Number(process.env.PARALLEL ?? 8);

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no JSON body */
  }
  return { status: res.status, body: json };
}

const locations = await call('GET', '/locations');
if (locations.status !== 200 || !locations.body?.length) {
  console.error('No destinations found. Run `pnpm prisma db seed` first.');
  process.exit(1);
}
const locationId = locations.body[0].id;

const created = [];
const failures = [];

for (let round = 0; round < ROUNDS; round++) {
  const results = await Promise.all(
    Array.from({ length: PARALLEL }, (_, i) =>
      call('POST', '/registrations', {
        fullName: `Concurrent R${round}-${i}`,
        phone: '0812345678',
        lineId: `r${round}i${i}`,
        locationId,
        hasCompanions: false,
        hasCar: false,
      }),
    ),
  );

  for (const result of results) {
    if (result.status === 201) created.push(result.body.registrationNumber);
    else failures.push(result.status);
  }

  const ok = results.filter((r) => r.status === 201).length;
  console.log(`round ${round + 1}/${ROUNDS}: ${ok}/${PARALLEL} created`);
}

const total = ROUNDS * PARALLEL;
const unique = new Set(created);
const formatOk = created.every((n) => /^OUT-\d{4}-\d{5}$/.test(n));
const seqs = created.map((n) => Number(n.split('-')[2])).sort((a, b) => a - b);

console.log(`\ntotal requested  : ${total}`);
console.log(`created          : ${created.length}`);
console.log(
  `non-201          : ${failures.length}${
    failures.length ? ` (statuses: ${[...new Set(failures)].join(', ')})` : ''
  }`,
);
console.log(`distinct numbers : ${unique.size}`);
console.log(`format OUT-YYYY-NNNNN: ${formatOk}`);
if (seqs.length) {
  console.log(`sequence range   : ${seqs[0]} .. ${seqs[seqs.length - 1]}`);
}

const noDuplicates = unique.size === created.length;
console.log(`\nno duplicate registration numbers: ${noDuplicates ? 'YES' : 'NO'}`);

const pass = noDuplicates && formatOk && created.length === total;
console.log(
  pass
    ? `PASS: all ${total} concurrent registrations received a distinct, well-formed number.`
    : `PARTIAL: ${created.length}/${total} succeeded with ${unique.size} distinct numbers (duplicates: ${!noDuplicates}).`,
);

process.exit(noDuplicates && formatOk ? 0 : 1);
