const { query } = require("../../shared/db");
const { asyncHandler } = require("../../shared/utils/asyncHandler");
const { HttpError } = require("../../shared/utils/httpError");

const list = asyncHandler(async (_req, res) => {
  const result = await query(
    `select id, title, author, category, isbn, published_year as "publishedYear",
            quantity, available, description, status
     from book
     order by id asc`
  );
  res.json(result.rows);
});

const getById = asyncHandler(async (req, res) => {
  const result = await query(
    `select id, title, author, category, isbn, published_year as "publishedYear",
            quantity, available, description, status
     from book
     where id = $1`,
    [req.params.id]
  );
  if (result.rowCount === 0) throw new HttpError(404, "BOOK_NOT_FOUND", "book not found");
  res.json(result.rows[0]);
});

const create = asyncHandler(async (req, res) => {
  const { title, author, category, isbn, publishedYear, quantity, description } = req.body || {};
  if (!title || !author || !category || !isbn) throw new HttpError(400, "VALIDATION_ERROR", "missing required fields");

  const qty = quantity != null ? Number(quantity) : 1;
  const pub = publishedYear != null && publishedYear !== "" ? Number(publishedYear) : 0;

  const result = await query(
    `insert into book (title, author, category, isbn, published_year, quantity, available, description)
     values ($1,$2,$3,$4,$5,$6,$6,$7)
     returning id, title, author, category, isbn, published_year as "publishedYear",
               quantity, available, description, status`,
    [title, author, category, isbn, pub, qty, description || ""]
  );
  res.status(201).json(result.rows[0]);
});

const update = asyncHandler(async (req, res) => {
  const { title, author, category, isbn, publishedYear, quantity, description, available } = req.body || {};
  const id = req.params.id;

  const pub = publishedYear != null && publishedYear !== "" ? Number(publishedYear) : null;
  const qty = quantity != null ? Number(quantity) : null;
  const avail = available != null ? Number(available) : null;

  const result = await query(
    `update book
     set title = coalesce($2, title),
         author = coalesce($3, author),
         category = coalesce($4, category),
         isbn = coalesce($5, isbn),
         published_year = coalesce($6, published_year),
         quantity = coalesce($7, quantity),
         available = coalesce($8, available),
         description = coalesce($9, description)
     where id = $1
     returning id, title, author, category, isbn, published_year as "publishedYear",
               quantity, available, description, status`,
    [id, title ?? null, author ?? null, category ?? null, isbn ?? null, pub, qty, avail, description ?? null]
  );
  if (result.rowCount === 0) throw new HttpError(404, "BOOK_NOT_FOUND", "book not found");
  res.json(result.rows[0]);
});

const remove = asyncHandler(async (req, res) => {
  const result = await query("delete from book where id = $1", [req.params.id]);
  if (result.rowCount === 0) throw new HttpError(404, "BOOK_NOT_FOUND", "book not found");
  res.status(204).end();
});

module.exports = { list, getById, create, update, remove };

