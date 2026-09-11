-- Generate 100 sample access codes (Format: XXXX-XXXX)
INSERT INTO access_codes (code) VALUES
('AB2C-D34E'), ('FGHJ-KMNP'), ('QRST-VWXY'), ('Z789-2345'), ('6789-ABCD'),
('EFGH-JKMN'), ('PQR2-STVW'), ('XYZ7-8923'), ('4567-89AB'), ('CDEF-GHJK'),
('MNPQ-RSTV'), ('WXYZ-7892'), ('3456-789A'), ('BCDE-FGHJ'), ('KMNP-QRST'),
('VWXY-Z789'), ('2345-6789'), ('ABCD-EFGH'), ('JKMN-PQRS'), ('TVWX-YZ78'),
('9234-5678'), ('9ABC-DEFG'), ('HJKM-NPQR'), ('STVW-XYZ7'), ('8923-4567'),
('89AB-CDEF'), ('GHJK-MNPQ'), ('RSTV-WXYZ'), ('7892-3456'), ('789A-BCDE'),
('FGH2-KMNP'), ('QRS3-VWXY'), ('Z784-2345'), ('6785-ABCD'), ('EFG6-JKMN'),
('PQR7-STVW'), ('XYZ8-8923'), ('4569-89AB'), ('CDE2-GHJK'), ('MNP3-RSTV'),
('WXY4-7892'), ('3455-789A'), ('BCD6-FGHJ'), ('KMN7-QRST'), ('VWX8-Z789'),
('2349-6789'), ('ABC2-EFGH'), ('JKM3-PQRS'), ('TVW4-YZ78'), ('9235-5678'),
('9AB6-DEFG'), ('HJK7-NPQR'), ('STV8-XYZ7'), ('8929-4567'), ('89A2-CDEF'),
('GHJ3-MNPQ'), ('RST4-WXYZ'), ('7895-3456'), ('7896-BCDE'), ('FGH7-KMNP'),
('QRS8-VWXY'), ('Z789-2342'), ('6782-ABCD'), ('EFG3-JKMN'), ('PQR4-STVW'),
('XYZ5-8923'), ('4566-89AB'), ('CDE7-GHJK'), ('MNP8-RSTV'), ('WXY9-7892'),
('3452-789A'), ('BCD3-FGHJ'), ('KMN4-QRST'), ('VWX5-Z789'), ('2346-6789'),
('ABC7-EFGH'), ('JKM8-PQRS'), ('TVW9-YZ78'), ('9232-5678'), ('9AB3-DEFG'),
('HJK4-NPQR'), ('STV5-XYZ7'), ('8926-4567'), ('89A7-CDEF'), ('GHJ8-MNPQ'),
('RST9-WXYZ'), ('7892-3452'), ('7893-BCDE'), ('FGH4-KMNP'), ('QRS5-VWXY'),
('Z786-2345'), ('6787-ABCD'), ('EFG8-JKMN'), ('PQR9-STVW'), ('XYZ2-8923'),
('4563-89AB'), ('CDE4-GHJK'), ('MNP5-RSTV'), ('WXY6-7892'), ('3457-789A')
ON CONFLICT (code) DO NOTHING;

-- Insert sample votes
INSERT INTO votes (id, question_index, answer, is_other) VALUES
('11111111-1111-1111-1111-111111111111', 1, 'Dr. Smith', false),
('22222222-2222-2222-2222-222222222222', 1, 'Prof. Johnson', false),
('33333333-3333-3333-3333-333333333333', 2, 'Dr. Williams', false),
('44444444-4444-4444-4444-444444444444', 3, 'Mr. Davis', true),
('55555555-5555-5555-5555-555555555555', 4, 'Dr. Miller', false),
('66666666-6666-6666-6666-666666666666', 10, 'Prof. Wilson', true),
('77777777-7777-7777-7777-777777777777', 15, 'Dr. Moore', false),
('88888888-8888-8888-8888-888888888888', 20, 'Dr. Taylor', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample duo_votes
INSERT INTO duo_votes (id, faculty_1, faculty_2, is_other) VALUES
('99999999-9999-9999-9999-999999999999', 'Dr. Smith', 'Prof. Johnson', false),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dr. Williams', 'Dr. Moore', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample other_mappings
INSERT INTO other_mappings (table_name, vote_id, original_text, mapped_to, dismissed) VALUES
('votes', '44444444-4444-4444-4444-444444444444', 'Mr. Davis', 'Dr. Davis', false),
('votes', '66666666-6666-6666-6666-666666666666', 'Prof. Wilson', NULL, true),
('duo_votes', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dr. Williams / Dr. Moore', NULL, false)
ON CONFLICT (id) DO NOTHING;
