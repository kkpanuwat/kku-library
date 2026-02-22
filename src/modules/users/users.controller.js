const { query } = require("../../shared/db");
const { asyncHandler } = require("../../shared/utils/asyncHandler");
const { HttpError } = require("../../shared/utils/httpError");
const { isEmailLike, normalizeEmail } = require("../../shared/utils/validators");

const list = asyncHandler(async (_req, res) => {
  const result = await query(
    `select id, name, email, role, status
     from app_user
     order by id asc`
  );
  res.json(result.rows);
});

const getById = asyncHandler(async (req, res) => {
  const result = await query(
    `select id, name, email, role, status
     from app_user
     where id = $1`,
    [req.params.id]
  );
  if (result.rowCount === 0) throw new HttpError(404, "USER_NOT_FOUND", "user not found");
  res.json(result.rows[0]);
});

const create = asyncHandler(async (req, res) => {
  const { name, email, role, status } = req.body || {};
  if (!name || !email) throw new HttpError(400, "VALIDATION_ERROR", "name and email are required");

  const normalizedEmail = normalizeEmail(email);
  if (!isEmailLike(normalizedEmail)) throw new HttpError(400, "VALIDATION_ERROR", "email is invalid");

  const result = await query(
    `insert into app_user (name, email, role, status)
     values ($1,$2,coalesce($3,'Student'),coalesce($4,'Active'))
     returning id, name, email, role, status`,
    [name, normalizedEmail, role ?? null, status ?? null]
  );
  res.status(201).json(result.rows[0]);
});

const update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name, email, role, status } = req.body || {};

  const normalizedEmail = email != null ? normalizeEmail(email) : null;
  if (email != null && !isEmailLike(normalizedEmail)) throw new HttpError(400, "VALIDATION_ERROR", "email is invalid");

  const result = await query(
    `update app_user
     set name = coalesce($2, name),
         email = coalesce($3, email),
         role = coalesce($4, role),
         status = coalesce($5, status)
     where id = $1
     returning id, name, email, role, status`,
    [id, name ?? null, normalizedEmail, role ?? null, status ?? null]
  );
  if (result.rowCount === 0) throw new HttpError(404, "USER_NOT_FOUND", "user not found");
  res.json(result.rows[0]);
});

const remove = asyncHandler(async (req, res) => {
  const result = await query("delete from app_user where id = $1", [req.params.id]);
  if (result.rowCount === 0) throw new HttpError(404, "USER_NOT_FOUND", "user not found");
  res.status(204).end();
});

module.exports = { list, getById, create, update, remove };

