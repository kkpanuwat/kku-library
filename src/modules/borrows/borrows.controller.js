const { query, withClient } = require("../../shared/db");
const { asyncHandler } = require("../../shared/utils/asyncHandler");
const { HttpError } = require("../../shared/utils/httpError");

const list = asyncHandler(async (_req, res) => {
  const result = await query(
    `select br.id,
            br.user_id as "userId",
            u.name as "userName",
            br.book_id as "bookId",
            b.title as "bookTitle",
            to_char(br.borrow_date, 'YYYY-MM-DD') as "borrowDate",
            to_char(br.due_date, 'YYYY-MM-DD') as "dueDate",
            case when br.return_date is null then null else to_char(br.return_date, 'YYYY-MM-DD') end as "returnDate",
            br.status
     from borrow_record br
     join app_user u on u.id = br.user_id
     join book b on b.id = br.book_id
     order by br.id desc`
  );
  res.json(result.rows);
});

const create = asyncHandler(async (req, res) => {
  const { userId, bookId, dueDate } = req.body || {};
  if (!userId || !bookId) throw new HttpError(400, "VALIDATION_ERROR", "userId and bookId are required");

  const result = await withClient(async (client) => {
    await client.query("begin");
    try {
      const user = await client.query("select id from app_user where id = $1", [userId]);
      if (user.rowCount === 0) return { status: 404, body: { error: "USER_NOT_FOUND" } };

      const book = await client.query("select id, available from book where id = $1 for update", [bookId]);
      if (book.rowCount === 0) return { status: 404, body: { error: "BOOK_NOT_FOUND" } };
      if (book.rows[0].available <= 0) return { status: 409, body: { error: "BOOK_NOT_AVAILABLE" } };

      if (dueDate) {
        const d = new Date(dueDate);
        if (Number.isNaN(d.getTime())) return { status: 400, body: { error: "INVALID_DUE_DATE" } };
      }

      const borrowInsert = await client.query(
        `insert into borrow_record (user_id, book_id, due_date, status)
         values ($1,$2,coalesce($3::date, current_date + 7), 'borrowing')
         returning id`,
        [userId, bookId, dueDate || null]
      );

      await client.query("update book set available = available - 1 where id = $1", [bookId]);
      await client.query("commit");

      const borrowId = borrowInsert.rows[0].id;
      const view = await client.query(
        `select br.id,
                br.user_id as "userId",
                u.name as "userName",
                br.book_id as "bookId",
                b.title as "bookTitle",
                to_char(br.borrow_date, 'YYYY-MM-DD') as "borrowDate",
                to_char(br.due_date, 'YYYY-MM-DD') as "dueDate",
                case when br.return_date is null then null else to_char(br.return_date, 'YYYY-MM-DD') end as "returnDate",
                br.status
         from borrow_record br
         join app_user u on u.id = br.user_id
         join book b on b.id = br.book_id
         where br.id = $1`,
        [borrowId]
      );
      return { status: 201, body: view.rows[0] };
    } catch (err) {
      await client.query("rollback");
      throw err;
    }
  });

  res.status(result.status).json(result.body);
});

const returnById = asyncHandler(async (req, res) => {
  const borrowId = req.params.borrowId;

  const result = await withClient(async (client) => {
    await client.query("begin");
    try {
      const borrow = await client.query(
        `select id, user_id, book_id, due_date, status
         from borrow_record
         where id = $1
         for update`,
        [borrowId]
      );
      if (borrow.rowCount === 0) return { status: 404, body: { error: "BORROW_NOT_FOUND" } };
      if (borrow.rows[0].status === "returned") return { status: 409, body: { error: "ALREADY_RETURNED" } };

      const dueDate = new Date(borrow.rows[0].due_date);
      const now = new Date();
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysOverdue = Math.max(0, Math.ceil((now.getTime() - dueDate.getTime()) / msPerDay));

      await client.query(
        `update borrow_record
         set return_date = current_date,
             status = 'returned'
         where id = $1`,
        [borrowId]
      );

      await client.query("update book set available = available + 1 where id = $1", [borrow.rows[0].book_id]);

      let fineRow = null;
      if (daysOverdue > 0) {
        const fineInsert = await client.query(
          `insert into fine (borrow_id, user_id, book_id, days_overdue, amount, status)
           values ($1,$2,$3,$4,$5,'Unpaid')
           on conflict (borrow_id) do nothing
           returning id, borrow_id as "borrowId", user_id as "userId", book_id as "bookId",
                     days_overdue as "daysOverdue", amount, status`,
          [borrowId, borrow.rows[0].user_id, borrow.rows[0].book_id, daysOverdue, daysOverdue * 10]
        );
        fineRow = fineInsert.rows[0] || null;
      }

      await client.query("commit");
      return { status: 200, body: { ok: true, daysOverdue, fine: fineRow } };
    } catch (err) {
      await client.query("rollback");
      throw err;
    }
  });

  res.status(result.status).json(result.body);
});

module.exports = { list, create, returnById };

