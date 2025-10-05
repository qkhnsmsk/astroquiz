-- Kategorileri ekle
INSERT INTO categories (name, description, icon) VALUES
  ('Gezegenler', 'Güneş sistemindeki gezegenler hakkında sorular', '🪐'),
  ('Yıldızlar', 'Yıldızlar ve yıldız sistemleri hakkında sorular', '⭐'),
  ('Galaksiler', 'Galaksiler ve evrenin yapısı hakkında sorular', '🌌'),
  ('Uzay Keşfi', 'Uzay misyonları ve keşifler hakkında sorular', '🚀'),
  ('Astronomi Tarihi', 'Astronominin tarihi ve önemli bilim insanları', '📚')
ON CONFLICT (name) DO NOTHING;

-- Rozetleri ekle
INSERT INTO badges (name, description, required_points, icon, color) VALUES
  ('Yeni Başlayan', 'İlk adımını attın!', 0, '🌟', '#CD7F32'),
  ('Uzay Kaşifi', '100 puan topladın', 100, '🔭', '#C0C0C0'),
  ('Yıldız Gözlemcisi', '250 puan topladın', 250, '✨', '#FFD700'),
  ('Galaksi Uzmanı', '500 puan topladın', 500, '🌠', '#E5E4E2'),
  ('Astronomi Dehası', '1000 puan topladın', 1000, '🏆', '#FFD700'),
  ('Evren Ustası', '2500 puan topladın', 2500, '🌌', '#B9F2FF')
ON CONFLICT (name) DO NOTHING;

-- Örnek kullanıcılar (test için)
INSERT INTO users (username, display_name, total_points) VALUES
  ('moderator', 'Moderatör', 0),
  ('test_user', 'Test Kullanıcı', 150)
ON CONFLICT (username) DO NOTHING;
