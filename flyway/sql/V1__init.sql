-- KKU Library schema (derived from kku-library-design-kit dummy data)

CREATE TYPE user_role AS ENUM ('Student', 'Librarian', 'Admin');
CREATE TYPE user_status AS ENUM ('Active', 'Blocked');
CREATE TYPE book_status AS ENUM ('available', 'borrowed');
CREATE TYPE borrow_status AS ENUM ('borrowing', 'returned', 'overdue');
CREATE TYPE fine_status AS ENUM ('Unpaid', 'Paid');

CREATE SEQUENCE user_seq START 1;
CREATE SEQUENCE book_seq START 1;
CREATE SEQUENCE borrow_seq START 1;
CREATE SEQUENCE fine_seq START 1;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE app_user (
  id TEXT PRIMARY KEY DEFAULT ('U' || lpad(nextval('user_seq')::text, 3, '0')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'Student',
  status user_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_app_user_updated_at
BEFORE UPDATE ON app_user
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION book_set_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.available > 0 THEN
    NEW.status = 'available';
  ELSE
    NEW.status = 'borrowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE book (
  id TEXT PRIMARY KEY DEFAULT ('B' || lpad(nextval('book_seq')::text, 3, '0')),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  isbn TEXT NOT NULL UNIQUE,
  published_year INT NOT NULL DEFAULT 0 CHECK (published_year BETWEEN 0 AND 3000),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  available INT NOT NULL DEFAULT 1 CHECK (available >= 0 AND available <= quantity),
  description TEXT NOT NULL DEFAULT '',
  status book_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_book_updated_at
BEFORE UPDATE ON book
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_book_set_status
BEFORE INSERT OR UPDATE OF available ON book
FOR EACH ROW EXECUTE FUNCTION book_set_status();

CREATE TABLE borrow_record (
  id TEXT PRIMARY KEY DEFAULT ('BR' || lpad(nextval('borrow_seq')::text, 3, '0')),
  user_id TEXT NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  book_id TEXT NOT NULL REFERENCES book(id) ON DELETE RESTRICT,
  borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE NULL,
  status borrow_status NOT NULL DEFAULT 'borrowing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_borrow_dates CHECK (due_date >= borrow_date),
  CONSTRAINT chk_return_consistency CHECK (
    (status = 'returned' AND return_date IS NOT NULL)
    OR (status <> 'returned' AND return_date IS NULL)
  )
);

CREATE INDEX idx_borrow_user_id ON borrow_record(user_id);
CREATE INDEX idx_borrow_book_id ON borrow_record(book_id);
CREATE INDEX idx_borrow_status ON borrow_record(status);

CREATE TRIGGER trg_borrow_updated_at
BEFORE UPDATE ON borrow_record
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE fine (
  id TEXT PRIMARY KEY DEFAULT ('F' || lpad(nextval('fine_seq')::text, 3, '0')),
  borrow_id TEXT NOT NULL UNIQUE REFERENCES borrow_record(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  book_id TEXT NOT NULL REFERENCES book(id) ON DELETE RESTRICT,
  days_overdue INT NOT NULL CHECK (days_overdue >= 0),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  status fine_status NOT NULL DEFAULT 'Unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fine_user_id ON fine(user_id);
CREATE INDEX idx_fine_status ON fine(status);

CREATE TRIGGER trg_fine_updated_at
BEFORE UPDATE ON fine
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

