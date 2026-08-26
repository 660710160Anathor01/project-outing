/**
 * End-to-end check of every endpoint and every documented business rule,
 * against a running API and a real PostgreSQL database.
 *
 *   pnpm start:dev       # in one terminal
 *   node test/smoke.mjs  # in another
 *
 * Set API_URL to point somewhere other than http://localhost:3001.
 * This writes real rows; run it against a development database only.
 */
const BASE = process.env.API_URL ?? 'http://localhost:3001';

let pass = 0;
let fail = 0;

function check(name, ok, detail = '') {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name} ${detail}`);
  }
}

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

console.log('\n== GET /locations ==');
const locations = await call('GET', '/locations');
check('200', locations.status === 200, `got ${locations.status}`);
check(
  'Khao Yai seeded',
  locations.body?.some((l) => l.name === 'Khao Yai'),
  JSON.stringify(locations.body),
);
const location = locations.body.find((l) => l.name === 'Khao Yai');
const locationId = location.id;
check('has description', typeof location.description === 'string');
check('has imageUrl', typeof location.imageUrl === 'string');

const oneLocation = await call('GET', `/locations/${locationId}`);
check('GET /locations/:id -> 200', oneLocation.status === 200);
const noLocation = await call(
  'GET',
  '/locations/11111111-1111-4111-8111-111111111111',
);
check('unknown location -> 404', noLocation.status === 404, `got ${noLocation.status}`);

console.log('\n== POST /registrations (minimal) ==');
const minimal = await call('POST', '/registrations', {
  fullName: '  Somchai Jaidee  ',
  phone: '+66 81-234-5678',
  lineId: 'somchai.j',
  locationId,
  hasCompanions: false,
  hasCar: false,
});
check('201', minimal.status === 201, `got ${minimal.status} ${JSON.stringify(minimal.body)}`);
check(
  'registrationNumber format OUT-YYYY-NNNNN',
  /^OUT-\d{4}-\d{5}$/.test(minimal.body?.registrationNumber ?? ''),
  minimal.body?.registrationNumber,
);
check('fullName trimmed', minimal.body?.fullName === 'Somchai Jaidee', minimal.body?.fullName);
check('phone normalised to local form', minimal.body?.phone === '0812345678', minimal.body?.phone);
check('status defaults to PENDING', minimal.body?.status === 'PENDING', minimal.body?.status);
check(
  'car columns null when hasCar=false',
  minimal.body?.carModel === null && minimal.body?.totalSeats === null,
  JSON.stringify(minimal.body),
);
check('location embedded in response', minimal.body?.location?.name === 'Khao Yai');

console.log('\n== POST /registrations (companions + car) ==');
const full = await call('POST', '/registrations', {
  fullName: 'Naree Suksan',
  department: 'Engineering',
  phone: '0899999999',
  lineId: 'naree',
  locationId,
  hasCompanions: true,
  companions: [
    { fullName: 'Ploy Suksan', phone: '0811111111', relationship: 'Spouse' },
    { fullName: 'Nong Suksan', relationship: 'Child' },
  ],
  hasCar: true,
  carModel: 'Toyota Fortuner',
  totalSeats: 7,
  availableSeats: 4,
  canTakeOthers: true,
  foodAllergy: 'Peanuts',
  note: 'Can leave Friday morning',
});
check('201', full.status === 201, `got ${full.status} ${JSON.stringify(full.body)}`);
check('both companions saved', full.body?.companions?.length === 2);
check('companion without phone stored as null', full.body?.companions?.[1]?.phone === null);
check('car fields saved', full.body?.availableSeats === 4 && full.body?.totalSeats === 7);
check('registration numbers increment', full.body?.registrationNumber !== minimal.body?.registrationNumber);
const fullId = full.body?.id;

console.log('\n== Business rules rejected with 400 ==');
const cases = [
  [
    'hasCompanions=true, companions omitted',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId, hasCompanions: true, hasCar: false },
  ],
  [
    'hasCompanions=true, companions empty',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId, hasCompanions: true, companions: [], hasCar: false },
  ],
  [
    'companion without a name',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId, hasCompanions: true, companions: [{ phone: '0811111111' }], hasCar: false },
  ],
  [
    'hasCar=true, car fields omitted',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId, hasCompanions: false, hasCar: true },
  ],
  [
    'hasCar=true, carModel missing',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId, hasCompanions: false, hasCar: true, totalSeats: 4, availableSeats: 2, canTakeOthers: true },
  ],
  [
    'availableSeats > totalSeats',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId, hasCompanions: false, hasCar: true, carModel: 'Jazz', totalSeats: 4, availableSeats: 5, canTakeOthers: true },
  ],
  [
    'totalSeats below 1',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId, hasCompanions: false, hasCar: true, carModel: 'Jazz', totalSeats: 0, availableSeats: 0, canTakeOthers: true },
  ],
  [
    'location does not exist',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId: '11111111-1111-4111-8111-111111111111', hasCompanions: false, hasCar: false },
  ],
  [
    'locationId not a uuid',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId: 'nope', hasCompanions: false, hasCar: false },
  ],
  ['phone too short', { fullName: 'A', phone: '12345', lineId: 'x', locationId, hasCompanions: false, hasCar: false }],
  ['fullName missing', { phone: '0812345678', lineId: 'x', locationId, hasCompanions: false, hasCar: false }],
  ['lineId missing', { fullName: 'A', phone: '0812345678', locationId, hasCompanions: false, hasCar: false }],
  ['hasCompanions missing', { fullName: 'A', phone: '0812345678', lineId: 'x', locationId, hasCar: false }],
  [
    'client-supplied status / registrationNumber / id',
    { fullName: 'A', phone: '0812345678', lineId: 'x', locationId, hasCompanions: false, hasCar: false, status: 'CONFIRMED', registrationNumber: 'OUT-2026-99999', id: 'spoofed' },
  ],
];

for (const [name, payload] of cases) {
  const res = await call('POST', '/registrations', payload);
  check(name, res.status === 400, `got ${res.status} ${JSON.stringify(res.body)}`);
}

const seatMessage = await call('POST', '/registrations', {
  fullName: 'A', phone: '0812345678', lineId: 'x', locationId,
  hasCompanions: false, hasCar: true, carModel: 'Jazz',
  totalSeats: 4, availableSeats: 5, canTakeOthers: true,
});
check(
  'seat error message names the rule',
  JSON.stringify(seatMessage.body).includes('availableSeats must be less than or equal to totalSeats'),
  JSON.stringify(seatMessage.body),
);

console.log('\n== GET /registrations/:id ==');
const fetched = await call('GET', `/registrations/${fullId}`);
check('200', fetched.status === 200, `got ${fetched.status}`);
check('returns the same row', fetched.body?.id === fullId);
check(
  'unknown id -> 404',
  (await call('GET', '/registrations/11111111-1111-4111-8111-111111111111')).status === 404,
);
check('malformed id -> 400', (await call('GET', '/registrations/not-a-uuid')).status === 400);

console.log('\n== PATCH /registrations/:id ==');
const patched = await call('PATCH', `/registrations/${fullId}`, {
  fullName: 'Naree Suksan-Updated',
  status: 'CONFIRMED',
});
check('200', patched.status === 200, `got ${patched.status} ${JSON.stringify(patched.body)}`);
check('name updated', patched.body?.fullName === 'Naree Suksan-Updated');
check('status updated', patched.body?.status === 'CONFIRMED');
check('companions preserved when omitted', patched.body?.companions?.length === 2);
check('car preserved when omitted', patched.body?.carModel === 'Toyota Fortuner');
check('registrationNumber immutable', patched.body?.registrationNumber === full.body?.registrationNumber);

const replaced = await call('PATCH', `/registrations/${fullId}`, {
  companions: [{ fullName: 'Only One', relationship: 'Friend' }],
});
check('supplying companions replaces the set', replaced.body?.companions?.length === 1, JSON.stringify(replaced.body?.companions));

check(
  'patch availableSeats > totalSeats -> 400',
  (await call('PATCH', `/registrations/${fullId}`, { availableSeats: 99 })).status === 400,
);
check(
  'patch invalid status -> 400',
  (await call('PATCH', `/registrations/${fullId}`, { status: 'BOGUS' })).status === 400,
);
check(
  'patch unknown id -> 404',
  (await call('PATCH', '/registrations/11111111-1111-4111-8111-111111111111', { fullName: 'Valid Name' })).status === 404,
);
check(
  'patch fullName below min length -> 400',
  (await call('PATCH', `/registrations/${fullId}`, { fullName: 'X' })).status === 400,
);

const carOff = await call('PATCH', `/registrations/${fullId}`, { hasCar: false });
check(
  'hasCar=false clears every car column',
  carOff.body?.carModel === null &&
    carOff.body?.totalSeats === null &&
    carOff.body?.availableSeats === null &&
    carOff.body?.canTakeOthers === null,
  JSON.stringify(carOff.body),
);

const companionsOff = await call('PATCH', `/registrations/${fullId}`, { hasCompanions: false });
check('hasCompanions=false removes companions', companionsOff.body?.companions?.length === 0);
check(
  'hasCompanions=true with none stored -> 400',
  (await call('PATCH', `/registrations/${fullId}`, { hasCompanions: true })).status === 400,
);

console.log('\n== DELETE /registrations/:id is a soft delete ==');
const cancelled = await call('DELETE', `/registrations/${fullId}`);
check('200', cancelled.status === 200, `got ${cancelled.status}`);
check('status becomes CANCELLED', cancelled.body?.status === 'CANCELLED', cancelled.body?.status);
const afterCancel = await call('GET', `/registrations/${fullId}`);
check('row still readable (not hard-deleted)', afterCancel.status === 200, `got ${afterCancel.status}`);
check('still CANCELLED', afterCancel.body?.status === 'CANCELLED');
check('companions relation intact', Array.isArray(afterCancel.body?.companions));
const cancelAgain = await call('DELETE', `/registrations/${fullId}`);
check('cancelling twice is idempotent', cancelAgain.status === 200 && cancelAgain.body?.status === 'CANCELLED');
check(
  'cancel unknown id -> 404',
  (await call('DELETE', '/registrations/11111111-1111-4111-8111-111111111111')).status === 404,
);

console.log(`\n==== ${pass} passed, ${fail} failed ====\n`);
process.exit(fail === 0 ? 0 : 1);
