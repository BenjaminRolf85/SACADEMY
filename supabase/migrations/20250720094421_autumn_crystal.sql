/*
  # Create groups and materials schema

  1. New Tables
    - `groups` - Training groups
    - `materials` - Training materials and files
    - `group_members` - Many-to-many relationship between users and groups
    - `group_trainers` - Many-to-many relationship between trainers and groups
  
  2. Security
    - Enable RLS on all tables
    - Add policies for group access control
*/

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  company_id uuid REFERENCES companies(id),
  start_date date,
  end_date date,
  status text CHECK (status IN ('active', 'completed', 'upcoming')) DEFAULT 'upcoming',
  capacity integer DEFAULT 20,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('pdf', 'video', 'link', 'quiz')) NOT NULL,
  url text,
  file_path text,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES profiles(id),
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create group_members junction table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_trainers junction table
CREATE TABLE IF NOT EXISTS group_trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  trainer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(group_id, trainer_id)
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_trainers ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Users can read groups they belong to"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see groups they're members of
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
    OR
    -- Trainers can see groups they train
    EXISTS (
      SELECT 1 FROM group_trainers
      WHERE group_trainers.group_id = groups.id
      AND group_trainers.trainer_id = auth.uid()
    )
    OR
    -- Admins can see all groups
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Trainers and admins can create groups"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('trainer', 'admin')
    )
  );

CREATE POLICY "Trainers can update their groups"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_trainers
      WHERE group_trainers.group_id = groups.id
      AND group_trainers.trainer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Materials policies
CREATE POLICY "Group members can read materials"
  ON materials
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = materials.group_id
      AND group_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM group_trainers
      WHERE group_trainers.group_id = materials.group_id
      AND group_trainers.trainer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Trainers can manage materials"
  ON materials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_trainers
      WHERE group_trainers.group_id = materials.group_id
      AND group_trainers.trainer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Group membership policies
CREATE POLICY "Users can read group memberships"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Trainers and admins can manage group memberships"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_trainers
      WHERE group_trainers.group_id = group_members.group_id
      AND group_trainers.trainer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Group trainer policies
CREATE POLICY "Users can read group trainers"
  ON group_trainers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage group trainers"
  ON group_trainers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );