-- Seed sample schools with verification codes
-- These are example Liberian schools

INSERT INTO schools (name, verification_code, location) VALUES
  ('Monrovia Central High School', 'MCHS2025', 'Monrovia, Montserrado County'),
  ('Booker Washington Institute', 'BWI2025', 'Kakata, Margibi County'),
  ('Cuttington University Prep', 'CUP2025', 'Suakoko, Bong County'),
  ('St. Patrick''s High School', 'SPHS2025', 'Monrovia, Montserrado County'),
  ('William V.S. Tubman High School', 'WVST2025', 'Harper, Maryland County')
ON CONFLICT (verification_code) DO NOTHING;
