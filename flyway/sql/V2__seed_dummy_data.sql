-- Seed data (matches kku-library-design-kit/src/data/dummy.ts)

INSERT INTO book (id, title, author, category, isbn, published_year, quantity, available, description)
VALUES
  ('B001', 'Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', '978-0262033848', 2009, 5, 3, 'หนังสืออัลกอริทึมพื้นฐานสำหรับนักศึกษา'),
  ('B002', 'Clean Code', 'Robert C. Martin', 'Computer Science', '978-0132350884', 2008, 3, 0, 'แนวทางเขียนโค้ดที่ดีและสะอาด'),
  ('B003', 'Calculus', 'James Stewart', 'Mathematics', '978-1285740621', 2015, 4, 2, 'ตำราแคลคูลัสสำหรับระดับมหาวิทยาลัย'),
  ('B004', 'Physics for Scientists', 'Raymond A. Serway', 'Science', '978-1133947271', 2013, 6, 4, 'ฟิสิกส์สำหรับนักวิทยาศาสตร์และวิศวกร'),
  ('B005', 'Database System Concepts', 'Abraham Silberschatz', 'Computer Science', '978-0078022159', 2019, 3, 1, 'แนวคิดระบบฐานข้อมูลเบื้องต้น'),
  ('B006', 'The Art of War', 'Sun Tzu', 'History', '978-1599869773', 2005, 2, 0, 'ตำราพิชัยสงคราม'),
  ('B007', 'Digital Design', 'M. Morris Mano', 'Engineering', '978-0132774208', 2012, 4, 3, 'การออกแบบวงจรดิจิทัล'),
  ('B008', 'Marketing Management', 'Philip Kotler', 'Business', '978-0133856460', 2016, 3, 2, 'การจัดการการตลาดเบื้องต้น');

INSERT INTO app_user (id, name, email, role, status)
VALUES
  ('U001', 'สมชาย ใจดี', 'somchai@kku.ac.th', 'Student', 'Active'),
  ('U002', 'สมหญิง รักเรียน', 'somying@kku.ac.th', 'Student', 'Active'),
  ('U003', 'ประจักษ์ วิชาการ', 'prajak@kku.ac.th', 'Librarian', 'Active'),
  ('U004', 'วิภา แสงทอง', 'wipa@kku.ac.th', 'Admin', 'Active'),
  ('U005', 'กิตติ พัฒนา', 'kitti@kku.ac.th', 'Student', 'Blocked'),
  ('U006', 'นภา สดใส', 'napa@kku.ac.th', 'Student', 'Active');

INSERT INTO borrow_record (id, user_id, book_id, borrow_date, due_date, return_date, status)
VALUES
  ('BR001', 'U001', 'B002', DATE '2025-02-10', DATE '2025-02-17', NULL, 'overdue'),
  ('BR002', 'U002', 'B006', DATE '2025-02-15', DATE '2025-02-22', NULL, 'borrowing'),
  ('BR003', 'U001', 'B003', DATE '2025-02-01', DATE '2025-02-08', DATE '2025-02-07', 'returned'),
  ('BR004', 'U006', 'B002', DATE '2025-02-12', DATE '2025-02-19', NULL, 'overdue'),
  ('BR005', 'U002', 'B005', DATE '2025-02-18', DATE '2025-02-25', DATE '2025-02-24', 'returned'),
  ('BR006', 'U001', 'B001', DATE '2025-02-03', DATE '2025-02-05', DATE '2025-02-07', 'returned');

INSERT INTO fine (id, borrow_id, user_id, book_id, days_overdue, amount, status)
VALUES
  ('F001', 'BR001', 'U001', 'B002', 5, 50, 'Unpaid'),
  ('F002', 'BR004', 'U006', 'B002', 3, 30, 'Unpaid'),
  ('F003', 'BR006', 'U001', 'B001', 2, 20, 'Paid');

SELECT setval('user_seq', 6, true);
SELECT setval('book_seq', 8, true);
SELECT setval('borrow_seq', 6, true);
SELECT setval('fine_seq', 3, true);
