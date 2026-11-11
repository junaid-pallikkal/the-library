-- ==============================================================================
-- THE LIBRARY — MASTER DATABASE MIGRATION
-- Schema, Enums, Tables, Indexes, Stored Procedures, and Row Level Security
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMERATED TYPES
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'librarian', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE member_status AS ENUM ('active', 'suspended', 'expired', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE copy_condition AS ENUM ('excellent', 'good', 'fair', 'damaged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE copy_status AS ENUM ('available', 'borrowed', 'reserved', 'maintenance', 'lost', 'retired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE borrowing_status AS ENUM ('active', 'returned', 'overdue', 'lost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('waiting', 'allocated', 'fulfilled', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role app_role DEFAULT 'member'::app_role NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    assigned_by UUID REFERENCES profiles(id),
    UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    member_code TEXT UNIQUE NOT NULL,
    status member_status DEFAULT 'active'::member_status NOT NULL,
    max_borrow_limit INT DEFAULT 5 NOT NULL,
    membership_expiry TIMESTAMPTZ NOT NULL,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS librarians (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    department TEXT DEFAULT 'Circulation' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATALOG (AUTHORS, CATEGORIES, BOOKS)
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    born_year INT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    isbn TEXT UNIQUE,
    description TEXT,
    publisher TEXT,
    publication_year INT,
    edition TEXT,
    language TEXT DEFAULT 'English' NOT NULL,
    cover_image_url TEXT,
    shelf_location TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS book_authors (
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY(book_id, author_id)
);

CREATE TABLE IF NOT EXISTS book_categories (
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY(book_id, category_id)
);

-- 5. PHYSICAL COPIES INVENTORY
CREATE TABLE IF NOT EXISTS book_copies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE RESTRICT NOT NULL,
    barcode TEXT UNIQUE NOT NULL,
    copy_number INT NOT NULL,
    shelf_location TEXT,
    condition copy_condition DEFAULT 'excellent'::copy_condition NOT NULL,
    status copy_status DEFAULT 'available'::copy_status NOT NULL,
    acquisition_date DATE DEFAULT CURRENT_DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(book_id, copy_number)
);

-- 6. CIRCULATION (BORROWINGS, RETURNS, FINES)
CREATE TABLE IF NOT EXISTS borrowings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE RESTRICT NOT NULL,
    copy_id UUID REFERENCES book_copies(id) ON DELETE RESTRICT NOT NULL,
    issued_by UUID REFERENCES librarians(id) ON DELETE SET NULL,
    borrowed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    status borrowing_status DEFAULT 'active'::borrowing_status NOT NULL,
    renewal_count INT DEFAULT 0 NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrowing_id UUID UNIQUE REFERENCES borrowings(id) ON DELETE RESTRICT NOT NULL,
    processed_by UUID REFERENCES librarians(id) ON DELETE SET NULL,
    returned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    condition_on_return copy_condition NOT NULL,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS fines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE RESTRICT NOT NULL,
    borrowing_id UUID REFERENCES borrowings(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    is_paid BOOLEAN DEFAULT false NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. APPROVALS & RESERVATIONS
CREATE TABLE IF NOT EXISTS borrowing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    status request_status DEFAULT 'pending'::request_status NOT NULL,
    request_type TEXT DEFAULT 'borrow' NOT NULL,
    reviewed_by UUID REFERENCES librarians(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    queue_position INT NOT NULL,
    status reservation_status DEFAULT 'waiting'::reservation_status NOT NULL,
    allocated_copy_id UUID REFERENCES book_copies(id) ON DELETE SET NULL,
    hold_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. AUDIT LOGS & SETTINGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_role app_role NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS library_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by UUID REFERENCES profiles(id)
);

-- ==============================================================================
-- 9. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_copies_barcode ON book_copies(barcode);
CREATE INDEX IF NOT EXISTS idx_copies_book_status ON book_copies(book_id, status);

CREATE INDEX IF NOT EXISTS idx_borrowings_active ON borrowings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_borrowings_due_date ON borrowings(due_date);
CREATE INDEX IF NOT EXISTS idx_borrowings_member ON borrowings(member_id);

CREATE INDEX IF NOT EXISTS idx_reservations_queue ON reservations(book_id, queue_position) WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_audit_timeline ON audit_logs(created_at DESC);

-- ==============================================================================
-- 10. STORED PROCEDURES (ATOMIC CONCURRENCY TRANSACTIONS)
-- ==============================================================================

-- Stored Procedure: Atomic Loan Issuance
CREATE OR REPLACE FUNCTION issue_book_copy(
    p_member_id UUID,
    p_copy_id UUID,
    p_librarian_id UUID,
    p_loan_days INT DEFAULT 14
) RETURNS UUID AS $$
DECLARE
    v_borrowing_id UUID;
    v_member_status member_status;
    v_active_loans INT;
    v_max_loans INT;
    v_copy_status copy_status;
BEGIN
    -- 1. Lock and verify member record
    SELECT status, max_borrow_limit INTO v_member_status, v_max_loans
    FROM members WHERE id = p_member_id FOR UPDATE;

    IF v_member_status <> 'active' THEN
        RAISE EXCEPTION 'Member account is not active.';
    END IF;

    -- Check active loan limit
    SELECT COUNT(*) INTO v_active_loans
    FROM borrowings WHERE member_id = p_member_id AND status = 'active';

    IF v_active_loans >= v_max_loans THEN
        RAISE EXCEPTION 'Member has reached maximum borrowing limit (%).', v_max_loans;
    END IF;

    -- 2. Lock and verify physical copy
    SELECT status INTO v_copy_status
    FROM book_copies WHERE id = p_copy_id FOR UPDATE;

    IF v_copy_status <> 'available' THEN
        RAISE EXCEPTION 'Physical copy is not available (Current status: %).', v_copy_status;
    END IF;

    -- 3. Create borrowing record
    INSERT INTO borrowings (member_id, copy_id, issued_by, due_date, status)
    VALUES (p_member_id, p_copy_id, p_librarian_id, NOW() + (p_loan_days || ' days')::INTERVAL, 'active')
    RETURNING id INTO v_borrowing_id;

    -- 4. Transition copy status to borrowed
    UPDATE book_copies SET status = 'borrowed', updated_at = NOW() WHERE id = p_copy_id;

    -- 5. Record immutable audit entry
    INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, new_data)
    VALUES (p_librarian_id, 'librarian', 'copy_issued', 'borrowings', v_borrowing_id, jsonb_build_object('copy_id', p_copy_id, 'member_id', p_member_id));

    RETURN v_borrowing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stored Procedure: Atomic Return & Reservation Auto-Allocation
CREATE OR REPLACE FUNCTION process_book_return(
    p_borrowing_id UUID,
    p_librarian_id UUID,
    p_condition copy_condition,
    p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_copy_id UUID;
    v_book_id UUID;
    v_next_res_id UUID;
BEGIN
    -- 1. Lock borrowing record
    SELECT copy_id INTO v_copy_id
    FROM borrowings WHERE id = p_borrowing_id AND status IN ('active', 'overdue') FOR UPDATE;

    IF v_copy_id IS NULL THEN
        RAISE EXCEPTION 'Active borrowing transaction not found.';
    END IF;

    -- Get parent book ID
    SELECT book_id INTO v_book_id FROM book_copies WHERE id = v_copy_id;

    -- 2. Record return transaction
    INSERT INTO returns (borrowing_id, processed_by, condition_on_return, notes)
    VALUES (p_borrowing_id, p_librarian_id, p_condition, p_notes);

    UPDATE borrowings SET status = 'returned' WHERE id = p_borrowing_id;

    -- 3. Check for waiting reservation on this book title
    SELECT id INTO v_next_res_id
    FROM reservations
    WHERE book_id = v_book_id AND status = 'waiting'
    ORDER BY queue_position ASC
    LIMIT 1
    FOR UPDATE;

    IF v_next_res_id IS NOT NULL AND p_condition <> 'damaged' THEN
        -- Allocate copy to reservation and place on 48h hold
        UPDATE reservations
        SET status = 'allocated', allocated_copy_id = v_copy_id, hold_expires_at = NOW() + INTERVAL '48 hours'
        WHERE id = v_next_res_id;

        UPDATE book_copies
        SET status = 'reserved', condition = p_condition, updated_at = NOW()
        WHERE id = v_copy_id;
    ELSE
        -- Return to shelf or maintenance bin
        UPDATE book_copies
        SET status = CASE WHEN p_condition = 'damaged' THEN 'maintenance'::copy_status ELSE 'available'::copy_status END,
            condition = p_condition,
            updated_at = NOW()
        WHERE id = v_copy_id;
    END IF;

    -- 4. Audit Log
    INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, new_data)
    VALUES (p_librarian_id, 'librarian', 'copy_returned', 'returns', p_borrowing_id, jsonb_build_object('copy_id', v_copy_id, 'condition', p_condition));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE librarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_settings ENABLE ROW LEVEL SECURITY;

-- Helper security functions
CREATE OR REPLACE FUNCTION current_user_role() RETURNS app_role AS $$
    SELECT role FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Public read access to catalog
CREATE POLICY "Public read books" ON books FOR SELECT USING (true);
CREATE POLICY "Public read authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read book_authors" ON book_authors FOR SELECT USING (true);
CREATE POLICY "Public read book_categories" ON book_categories FOR SELECT USING (true);
CREATE POLICY "Public read book_copies" ON book_copies FOR SELECT USING (true);

-- Member RLS policies
CREATE POLICY "Members view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Members view own borrowings" ON borrowings FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Members insert borrow requests" ON borrowing_requests FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY "Members view own requests" ON borrowing_requests FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Members insert reservations" ON reservations FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY "Members view own reservations" ON reservations FOR SELECT USING (member_id = auth.uid());

-- Librarian & Admin write policies
CREATE POLICY "Staff manage catalog" ON books FOR ALL USING (current_user_role() IN ('librarian', 'admin'));
CREATE POLICY "Staff manage copies" ON book_copies FOR ALL USING (current_user_role() IN ('librarian', 'admin'));
CREATE POLICY "Staff manage borrowings" ON borrowings FOR ALL USING (current_user_role() IN ('librarian', 'admin'));
CREATE POLICY "Staff manage requests" ON borrowing_requests FOR ALL USING (current_user_role() IN ('librarian', 'admin'));
CREATE POLICY "Staff manage reservations" ON reservations FOR ALL USING (current_user_role() IN ('librarian', 'admin'));

-- Admin-only policies
CREATE POLICY "Admin view audit logs" ON audit_logs FOR SELECT USING (current_user_role() = 'admin');
CREATE POLICY "Admin manage settings" ON library_settings FOR ALL USING (current_user_role() = 'admin');
