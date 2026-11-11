-- ==============================================================================
-- THE LIBRARY — SEED DATA
-- Authors, Categories, Titles, Physical Copies, Members, and Operational Settings
-- ==============================================================================

-- 1. CATEGORIES
INSERT INTO categories (id, name, slug, description) VALUES
('cat-1', 'Literary Fiction', 'literary-fiction', 'Masterpieces of narrative depth and prose craft'),
('cat-2', 'Historical Romance', 'historical-romance', 'Poignant period romances and personal journeys'),
('cat-3', 'Philosophy & Essays', 'philosophy-essays', 'Meditative essays on human condition and society'),
('cat-4', 'Western & Frontier', 'western-frontier', 'High plains narratives of debt, honor, and survival'),
('cat-5', 'Mystery & Detective', 'mystery-detective', 'Intricate investigative tales and procedural puzzles')
ON CONFLICT (slug) DO NOTHING;

-- 2. AUTHORS
INSERT INTO authors (id, name, bio, born_year) VALUES
('auth-1', 'Leon Vasari', 'Master cinematic narrator and novelist of rural solitude and memory.', 1928),
('auth-2', 'Elena Rostova', 'Celebrated for intimate interiority and Mediterranean harbor sagas.', 1934),
('auth-3', 'Kazuo Shiraishi', 'Existential essayist and chronicler of maritime post-war shifts.', 1922),
('auth-4', 'Mateo Cardenas', 'Frontier poet and chronicler of the southwestern chalk desert.', 1939),
('auth-5', 'Julian Vance', 'Oxford-trained surveyor turned metaphysical mystery writer.', 1941)
ON CONFLICT DO NOTHING;

-- 3. BOOKS
INSERT INTO books (id, title, subtitle, isbn, description, publisher, publication_year, edition, language, shelf_location, cover_image_url, is_featured) VALUES
('b-1', 'The Silent Valley', 'A Chronicle of Exile and Memory', '978-0-14-312774-1', 'A schoolteacher returns to the secluded mountain village that exiled her father thirty years prior, unraveling centuries of guarded family secrets and forgotten salt trade archives.', 'Kanto Heritage Press', 1958, 'First Hardcover Edition', 'English / Japanese Translation', 'Floor 2, Bay 4, Shelf A', null, true),
('b-2', 'The Blue Hour', 'Conversations Along the Harbor Wall', '978-0-374-11487-9', 'Over one long autumn evening in an abandoned harbor town, a solitary widow and an unannounced stranger trade small half-truths until the twilight gives way to midnight.', 'Archipelago Books', 1962, 'Collector Foil Edition', 'English', 'Floor 2, Bay 4, Shelf B', null, true),
('b-3', 'River of Salt', 'An Odyssean Descent', '978-0-553-21311-7', 'Two estranged brothers haul a heavy timber salt barge downriver toward an industrializing port city that no longer has need for anything they carry.', 'Meridian Publishing', 1964, 'Revised Translation', 'English', 'Floor 1, Bay 2, Shelf D', null, true),
('b-4', 'Noon in Ashes', 'The White Desert Reckoning', '978-0-679-73276-1', 'A solitary rider crosses an expansive chalk desert to settle an ancestral debt, only to realize too late the identity of the person who dispatched him.', 'Sundown Classics', 1971, 'Centennial Clothbound', 'English', 'Floor 1, Bay 5, Shelf C', null, true),
('b-5', 'The Green Road', 'Cartography of the Unseen', '978-0-14-044913-6', 'A cartographer surveying a forgotten colonial road deep in the temperate rainforest repeatedly detects solitary fresh footprints that remain exactly one day ahead of his compass.', 'Blackwood Press', 1969, 'Second Printing', 'English', 'Floor 2, Bay 1, Shelf C', null, true)
ON CONFLICT (isbn) DO NOTHING;

-- 4. BOOK COPIES
INSERT INTO book_copies (id, book_id, barcode, copy_number, shelf_location, condition, status, acquisition_date) VALUES
('c-101', 'b-1', 'BC-1001-A', 1, 'Floor 2, Bay 4, Shelf A-1', 'excellent', 'available', '2023-01-15'),
('c-102', 'b-1', 'BC-1001-B', 2, 'Floor 2, Bay 4, Shelf A-1', 'good', 'borrowed', '2023-01-15'),
('c-103', 'b-1', 'BC-1001-C', 3, 'Floor 2, Bay 4, Shelf A-1', 'fair', 'available', '2023-06-20'),
('c-104', 'b-1', 'BC-1001-D', 4, 'Floor 2, Bay 4, Shelf A-1', 'damaged', 'maintenance', '2024-02-10'),
('c-201', 'b-2', 'BC-1002-A', 1, 'Floor 2, Bay 4, Shelf B-1', 'excellent', 'available', '2023-03-12'),
('c-202', 'b-2', 'BC-1002-B', 2, 'Floor 2, Bay 4, Shelf B-1', 'good', 'borrowed', '2023-03-12'),
('c-301', 'b-3', 'BC-1003-A', 1, 'Floor 1, Bay 2, Shelf D-2', 'good', 'borrowed', '2022-11-04'),
('c-401', 'b-4', 'BC-1004-A', 1, 'Floor 1, Bay 5, Shelf C-1', 'excellent', 'available', '2023-05-18'),
('c-402', 'b-4', 'BC-1004-B', 2, 'Floor 1, Bay 5, Shelf C-1', 'excellent', 'available', '2023-05-18'),
('c-501', 'b-5', 'BC-1005-A', 1, 'Floor 2, Bay 1, Shelf C-1', 'good', 'available', '2023-07-22')
ON CONFLICT (barcode) DO NOTHING;

-- 5. SETTINGS
INSERT INTO library_settings (key, value) VALUES
('borrowing_policy', '{"max_days": 14, "max_renewals": 2, "overdue_fine_daily": 0.50}'::jsonb),
('opening_hours', '{"monday_friday": "08:00 - 21:00", "saturday_sunday": "10:00 - 18:00"}'::jsonb),
('facility_capacity', '{"max_visitors": 250, "desk_reservation_max_hours": 4}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
