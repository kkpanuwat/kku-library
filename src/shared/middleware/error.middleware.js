const { HttpError } = require("../utils/httpError");

function errorHandler(err, _req, res, _next) {
  if (err && err.code === "23505") {
    if (err.constraint === "app_user_email_key") {
      return res.status(409).json({ error: { code: "EMAIL_ALREADY_EXISTS", message: "email already registered" } });
    }
    if (err.constraint === "book_isbn_key") {
      return res.status(409).json({ error: { code: "ISBN_ALREADY_EXISTS", message: "isbn already exists" } });
    }
    return res.status(409).json({ error: { code: "CONFLICT" } });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_SERVER_ERROR" } });
}

module.exports = { errorHandler };

