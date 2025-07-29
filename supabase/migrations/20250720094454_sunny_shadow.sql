/*
  # Create terms and events schema

  1. New Tables
    - `terms_versions` - Terms and conditions versions
    - `terms_acceptances` - User acceptance tracking
    - `events` - Training events and calendar
    - `event_attendees` - Event attendance tracking
  
  2. Security
    - Enable RLS on all tables
    - Add policies for terms and events
*/

-- Create terms_versions table
CREATE TABLE IF NOT EXISTS terms_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create terms_acceptances table
CREATE TABLE IF NOT EXISTS terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  terms_version_id uuid REFERENCES terms_versions(id),
  accepted_at timestamptz DEFAULT now(),
  ip_address inet,
  UNIQUE(user_id, terms_version_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  group_id uuid REFERENCES groups(id),
  trainer_id uuid REFERENCES profiles(id),
  capacity integer DEFAULT 20,
  recurring_type text CHECK (recurring_type IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
  recurring_interval integer DEFAULT 1,
  recurring_end_date timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text CHECK (status IN ('invited', 'attending', 'declined', 'maybe')) DEFAULT 'invited',
  registered_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Terms versions policies
CREATE POLICY "Users can read active terms"
  ON terms_versions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage terms"
  ON terms_versions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Terms acceptances policies
CREATE POLICY "Users can read their acceptances"
  ON terms_acceptances
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their acceptances"
  ON terms_acceptances
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all acceptances"
  ON terms_acceptances
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Events policies
CREATE POLICY "Users can read relevant events"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    -- Events in user's groups
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = events.group_id
      AND group_members.user_id = auth.uid()
    )
    OR
    -- Events by user's trainers
    EXISTS (
      SELECT 1 FROM group_trainers
      WHERE group_trainers.group_id = events.group_id
      AND group_trainers.trainer_id = auth.uid()
    )
    OR
    -- Events user is attending
    EXISTS (
      SELECT 1 FROM event_attendees
      WHERE event_attendees.event_id = events.id
      AND event_attendees.user_id = auth.uid()
    )
    OR
    -- Admins can see all events
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Trainers can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('trainer', 'admin')
    )
  );

CREATE POLICY "Trainers can update their events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    trainer_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Event attendees policies
CREATE POLICY "Users can read event attendees"
  ON event_attendees
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see attendees of events they're part of
    EXISTS (
      SELECT 1 FROM event_attendees ea
      WHERE ea.event_id = event_attendees.event_id
      AND ea.user_id = auth.uid()
    )
    OR
    -- Trainers can see attendees of their events
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_attendees.event_id
      AND events.trainer_id = auth.uid()
    )
    OR
    -- Admins can see all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can manage their attendance"
  ON event_attendees
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());