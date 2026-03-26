const { query } = require('../config/db');

async function createHospital({ name, licenseNumber, address }) {
  const { rows } = await query(
    `INSERT INTO hospitals (name, license_number, address)
     VALUES ($1, $2, $3)
     RETURNING id, name, license_number, address, created_at`,
    [name, licenseNumber, address || null]
  );
  return rows[0];
}

module.exports = { createHospital };

