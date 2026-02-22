const { query } = require("../../shared/db");
const { asyncHandler } = require("../../shared/utils/asyncHandler");

const getDashboard = asyncHandler(async (_req, res) => {
  const totalsResult = await query(
    `select
        coalesce(sum(quantity), 0)::int as "totalBooks",
        coalesce(sum(available), 0)::int as "availableBooks"
     from book`
  );
  const { totalBooks, availableBooks } = totalsResult.rows[0];

  const usersCountResult = await query(`select count(*)::int as "usersCount" from app_user`);
  const { usersCount } = usersCountResult.rows[0];

  const overdueCountResult = await query(
    `select count(*)::int as "overdueCount"
     from borrow_record
     where status = 'overdue'
        or (status = 'borrowing' and due_date < current_date)`
  );
  const { overdueCount } = overdueCountResult.rows[0];

  const recentBorrowsResult = await query(
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
     order by br.borrow_date desc, br.id desc
     limit 5`
  );

  res.json({
    stats: {
      totalBooks,
      availableBooks,
      borrowedBooks: totalBooks - availableBooks,
      usersCount,
      overdueCount,
    },
    recentBorrows: recentBorrowsResult.rows,
  });
});

module.exports = { getDashboard };

