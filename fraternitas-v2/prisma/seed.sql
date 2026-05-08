-- Run this in Neon SQL Editor AFTER prisma db push

-- Seed default interests
INSERT INTO "Interest" (id, name, emoji, category) VALUES
  ('int_01', 'Lecture', '📚', 'Culture'),
  ('int_02', 'Théologie', '✝️', 'Foi'),
  ('int_03', 'Prière', '🙏', 'Foi'),
  ('int_04', 'Musique classique', '🎵', 'Culture'),
  ('int_05', 'Randonnée', '🥾', 'Sport'),
  ('int_06', 'Running', '🏃', 'Sport'),
  ('int_07', 'Cuisine', '🍳', 'Lifestyle'),
  ('int_08', 'Cinéma', '🎬', 'Culture'),
  ('int_09', 'Voyages', '✈️', 'Lifestyle'),
  ('int_10', 'Art & Design', '🎨', 'Culture'),
  ('int_11', 'Nature', '🌱', 'Lifestyle'),
  ('int_12', 'Entrepreneuriat', '💡', 'Pro'),
  ('int_13', 'Bénévolat', '🤲', 'Social'),
  ('int_14', 'Chant grégorien', '🎶', 'Foi'),
  ('int_15', 'Philosophie', '🧠', 'Culture'),
  ('int_16', 'Sport collectif', '⚽', 'Sport'),
  ('int_17', 'Jardinage', '🌻', 'Lifestyle'),
  ('int_18', 'Photographie', '📸', 'Culture')
ON CONFLICT (name) DO NOTHING;

-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
