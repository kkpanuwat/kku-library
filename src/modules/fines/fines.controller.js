const { query } = require("../../shared/db");
const { asyncHandler } = require("../../shared/utils/asyncHandler");
const { HttpError } = require("../../shared/utils/httpError");

const list = asyncHandler(async (_req, res) => {
  const result = await query(
    `select f.id,
            f.user_id as "userId",
            u.name as "userName",
            b.title as "bookTitle",
            f.days_overdue as "daysOverdue",
            f.amount,
            f.status
     from fine f
     join app_user u on u.id = f.user_id
     join book b on b.id = f.book_id
     order by f.id desc`
  );
  res.json(result.rows);
});

const pay = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await query(
    `update fine
     set status = 'Paid'
     where id = $1
     returning id, borrow_id as "borrowId", user_id as "userId", book_id as "bookId",
               days_overdue as "daysOverdue", amount, status`,
    [id]
  );
  if (result.rowCount === 0) throw new HttpError(404, "FINE_NOT_FOUND", "fine not found");
  res.json(result.rows[0]);
});

module.exports = { list, pay };

