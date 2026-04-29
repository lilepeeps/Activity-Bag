-- Activity Bag Database Setup for Supabase
-- Run this script in Supabase's SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

CREATE TABLE families (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_name text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE children (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_animal text NOT NULL DEFAULT 'unicorn',
  monetary_enabled boolean DEFAULT false,
  weekly_allowance_cents integer,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE activities (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  label text NOT NULL,
  category text NOT NULL CHECK (category IN ('fun', 'learning', 'creative', 'active', 'helpful')),
  custom boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE activity_completions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  completed_at timestamp DEFAULT now(),
  parent_approved boolean,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp,
  reward_claimed boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE TABLE default_activities (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  emoji text NOT NULL,
  label text NOT NULL,
  category text NOT NULL CHECK (category IN ('fun', 'learning', 'creative', 'active', 'helpful')),
  created_at timestamp DEFAULT now()
);

CREATE TABLE allowance_payouts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  paid_at timestamp DEFAULT now(),
  note text,
  created_at timestamp DEFAULT now()
);

-- ============================================
-- 2. SEED DEFAULT ACTIVITIES
-- ============================================

INSERT INTO default_activities (emoji, label, category) VALUES
('📺', 'Watch TV', 'fun'),
('💻', 'Use the computer', 'learning'),
('📚', 'Do my homework', 'learning'),
('🎨', 'Draw or colour', 'creative'),
('📖', 'Read a book', 'learning'),
('🧸', 'Play with toys', 'fun'),
('🧩', 'Do a puzzle', 'fun'),
('🧹', 'Tidy my room', 'helpful'),
('🌱', 'Water the plants', 'helpful'),
('🍪', 'Help bake something', 'helpful'),
('💃', 'Have a dance party', 'active'),
('🎲', 'Play a board game', 'fun'),
('✂️', 'Make something crafty', 'creative'),
('🚶', 'Go for a walk', 'active'),
('🧺', 'Help fold laundry', 'helpful'),
('🎵', 'Listen to music', 'fun'),
('📝', 'Write or make a comic', 'creative'),
('🤸', 'Do some stretches', 'active');

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowance_payouts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES - FAMILIES TABLE
-- ============================================

-- Parents can view their own family
CREATE POLICY "families_select_own"
  ON families FOR SELECT
  USING (auth.uid() = parent_user_id);

-- Parents can insert their own family
CREATE POLICY "families_insert_own"
  ON families FOR INSERT
  WITH CHECK (auth.uid() = parent_user_id);

-- Parents can update their own family
CREATE POLICY "families_update_own"
  ON families FOR UPDATE
  USING (auth.uid() = parent_user_id);

-- ============================================
-- 5. CREATE RLS POLICIES - CHILDREN TABLE
-- ============================================

-- Parents can view their family's children
CREATE POLICY "children_select_own_family"
  ON children FOR SELECT
  USING (
    family_id IN (
      SELECT id FROM families WHERE parent_user_id = auth.uid()
    )
  );

-- Parents can insert children in their family
CREATE POLICY "children_insert_own_family"
  ON children FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE parent_user_id = auth.uid()
    )
  );

-- Parents can update their family's children
CREATE POLICY "children_update_own_family"
  ON children FOR UPDATE
  USING (
    family_id IN (
      SELECT id FROM families WHERE parent_user_id = auth.uid()
    )
  );

-- ============================================
-- 6. CREATE RLS POLICIES - ACTIVITIES TABLE
-- ============================================

-- Parents can view activities for their children
CREATE POLICY "activities_select_own"
  ON activities FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- Parents can insert activities for their children
CREATE POLICY "activities_insert_own"
  ON activities FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- Parents can update activities for their children
CREATE POLICY "activities_update_own"
  ON activities FOR UPDATE
  USING (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- Parents can delete activities for their children
CREATE POLICY "activities_delete_own"
  ON activities FOR DELETE
  USING (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- ============================================
-- 7. CREATE RLS POLICIES - ACTIVITY_COMPLETIONS TABLE
-- ============================================

-- Parents can view completions for their children
CREATE POLICY "completions_select_own"
  ON activity_completions FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- Parents can insert/update completions for their children
CREATE POLICY "completions_insert_own"
  ON activity_completions FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- Parents can update completions for their children
CREATE POLICY "completions_update_own"
  ON activity_completions FOR UPDATE
  USING (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- ============================================
-- 8. CREATE RLS POLICIES - DEFAULT_ACTIVITIES TABLE
-- ============================================

-- Everyone can view default activities (public read)
CREATE POLICY "default_activities_select_public"
  ON default_activities FOR SELECT
  USING (true);

-- ============================================
-- 9. CREATE RLS POLICIES - ALLOWANCE_PAYOUTS TABLE
-- ============================================

-- Parents can view payouts for their children
CREATE POLICY "payouts_select_own"
  ON allowance_payouts FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- Parents can insert payouts for their children
CREATE POLICY "payouts_insert_own"
  ON allowance_payouts FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready to use.
-- Tables created and RLS policies configured.
