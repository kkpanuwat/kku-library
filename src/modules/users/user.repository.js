const { query } = require("../../shared/db");

async function findByEmail(email) {
  const result = await query(
    `select id, name, email, role, status
     from app_user
     where email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

async function findAuthByEmail(email) {
  const result = await query(
    `select id, name, email, role, status, password_hash as "passwordHash"
     from app_user
     where email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

async function create({ name, email, role, status, passwordHash }) {
  const result = await query(
    `insert into app_user (name, email, role, status, password_hash)
     values ($1,$2,$3,$4,$5)
     returning id, name, email, role, status`,
    [name, email, role, status, passwordHash]
  );
  return result.rows[0];
}

const userRepository = { findByEmail, findAuthByEmail, create };

module.exports = { userRepository };

