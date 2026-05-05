'use strict';

require('dotenv').config();

const mongoose = require('mongoose');

/**
 * Migration runner — applies pending migration scripts in order.
 * Migrations live in scripts/migrations/ and are plain JS files
 * that export an `up()` async function.
 */

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected for migration');

  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, 'migrations');

  if (!fs.existsSync(dir)) {
    console.log('No migrations directory found. Nothing to run.');
    await mongoose.connection.close();
    return;
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort();

  for (const file of files) {
    const migration = require(path.join(dir, file));
    console.log(`Running migration: ${file}`);
    await migration.up();
    console.log(`Done: ${file}`);
  }

  await mongoose.connection.close();
  console.log('All migrations complete');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
