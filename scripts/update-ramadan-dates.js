#!/usr/bin/env node
/*
  Update Ramadan dates for all users in Firestore.
  Skips users who have ramadanStartDateOverride === true.

  Usage:
    GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \
      node scripts/update-ramadan-dates.js --start=2026-02-19 --length=30 --region="Likely start (Expected Feb 19)"
*/

const admin = require('firebase-admin');

const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  acc[key] = value;
  return acc;
}, {});

const startDate = args.start || '2026-02-19';
const length = Number(args.length || 30);
const region = args.region || 'Likely start (Expected Feb 19)';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Missing GOOGLE_APPLICATION_CREDENTIALS env var (service account JSON path).');
  process.exit(1);
}

if (![29, 30].includes(length)) {
  console.error('Invalid --length. Use 29 or 30.');
  process.exit(1);
}

admin.initializeApp();
const db = admin.firestore();

const run = async () => {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  let updated = 0;
  let skipped = 0;
  const batchSize = 400;
  let batch = db.batch();
  let opCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data() || {};
    if (data.ramadanStartDateOverride === true) {
      skipped += 1;
      return;
    }

    batch.update(doc.ref, {
      ramadanStartDate: startDate,
      ramadanLength: length,
      ramadanLengthConfirmed: length === 29,
      ramadanRegion: region
    });
    updated += 1;
    opCount += 1;

    if (opCount >= batchSize) {
      batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  });

  if (opCount > 0) {
    await batch.commit();
  }

  console.log(`Done. Updated ${updated} users, skipped ${skipped} (override=true).`);
};

run().catch(err => {
  console.error('Failed to update users:', err);
  process.exit(1);
});
