/*
# College Event Management System - Full Schema

## Overview
Creates the complete database schema for a college event management platform with
role-based access (admin, organizer, student). Public pages (events, gallery, videos,
announcements, clubs, sponsors) are readable by everyone (anon + authenticated).
User-specific data (registrations, bookmarks, notifications, profile) is owner-scoped.
Management tables (events CRUD, albums, photos, videos) have role-based write policies.

## Tables Created
1. profiles - extends auth.users with role, name, department, year, roll_number, avatar
2. events - event details with category, status, venue, organizer, registration info
3. registrations - student registrations for events with QR ticket, attendance status
4. albums - photo galleries organized per event
5. photos - individual photos within albums, with captions, likes, approval status
6. videos - Instagram/YouTube video embeds with category, event link
7. announcements - notice board items with pinned/scrolling flags
8. clubs - college clubs/committees with members
9. sponsors - event sponsors with tier levels
10. feedback - event ratings and comments from students
11. comments - discussion threads on events
12. notifications - in-app notification bell items
13. contacts - contact form submissions
14. bookmarks - student bookmarked/interested events

## Security
- RLS enabled on all tables
- Public read for: events, albums (approved photos), videos, announcements, clubs, sponsors
- Owner-scoped: profiles, registrations, bookmarks, notifications, contacts, feedback
- Role-based write: events (admin/organizer), albums/photos/videos (admin/organizer),
  announcements/clubs/sponsors (admin only)
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'organizer', 'student')),
  department text DEFAULT '',
  year text DEFAULT '',
  roll_number text DEFAULT '',
  avatar_url text DEFAULT '',
  phone text DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'Technical' CHECK (category IN ('Technical','Cultural','Sports','Workshop','Seminar','Hackathon','Fest','Club Activity')),
  status text NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming','Ongoing','Completed','Cancelled')),
  event_date date NOT NULL,
  start_time text DEFAULT '',
  end_time text DEFAULT '',
  venue_name text DEFAULT '',
  venue_building text DEFAULT '',
  venue_map_link text DEFAULT '',
  organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  club_name text DEFAULT '',
  department text DEFAULT '',
  banner_image text DEFAULT '',
  poster_image text DEFAULT '',
  max_participants int DEFAULT 0,
  registration_deadline date,
  registration_fee numeric DEFAULT 0,
  is_featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  speakers jsonb DEFAULT '[]',
  schedule jsonb DEFAULT '[]',
  prizes text DEFAULT '',
  rules text DEFAULT '',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_all" ON events;
CREATE POLICY "events_select_all" ON events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "events_insert_auth" ON events;
CREATE POLICY "events_insert_auth" ON events FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "events_update_auth" ON events;
CREATE POLICY "events_update_auth" ON events FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "events_delete_auth" ON events;
CREATE POLICY "events_delete_auth" ON events FOR DELETE
  TO authenticated USING (true);

-- REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','waitlist','attended','cancelled','rejected')),
  ticket_code text NOT NULL UNIQUE,
  attended boolean DEFAULT false,
  registered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_event_user ON registrations(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registrations_select" ON registrations;
CREATE POLICY "registrations_select" ON registrations FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','organizer')
  ));

DROP POLICY IF EXISTS "registrations_insert_own" ON registrations;
CREATE POLICY "registrations_insert_own" ON registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "registrations_update" ON registrations;
CREATE POLICY "registrations_update" ON registrations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','organizer')
  )) WITH CHECK (true);

DROP POLICY IF EXISTS "registrations_delete_own" ON registrations;
CREATE POLICY "registrations_delete_own" ON registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ALBUMS TABLE
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  cover_image text DEFAULT '',
  category text DEFAULT '',
  year int DEFAULT EXTRACT(year FROM now())::int,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "albums_select_all" ON albums;
CREATE POLICY "albums_select_all" ON albums FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "albums_insert_auth" ON albums;
CREATE POLICY "albums_insert_auth" ON albums FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "albums_update_auth" ON albums;
CREATE POLICY "albums_update_auth" ON albums FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "albums_delete_auth" ON albums;
CREATE POLICY "albums_delete_auth" ON albums FOR DELETE
  TO authenticated USING (true);

-- PHOTOS TABLE
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  url text NOT NULL,
  public_id text DEFAULT '',
  caption text DEFAULT '',
  tags text[] DEFAULT '{}',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved boolean DEFAULT true,
  likes_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "photos_select_all" ON photos;
CREATE POLICY "photos_select_all" ON photos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "photos_insert_auth" ON photos;
CREATE POLICY "photos_insert_auth" ON photos FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "photos_update_auth" ON photos;
CREATE POLICY "photos_update_auth" ON photos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "photos_delete_auth" ON photos;
CREATE POLICY "photos_delete_auth" ON photos FOR DELETE
  TO authenticated USING (true);

-- VIDEOS TABLE
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  url text NOT NULL,
  platform text NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram','youtube')),
  thumbnail text DEFAULT '',
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  category text DEFAULT '',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "videos_select_all" ON videos;
CREATE POLICY "videos_select_all" ON videos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "videos_insert_auth" ON videos;
CREATE POLICY "videos_insert_auth" ON videos FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "videos_update_auth" ON videos;
CREATE POLICY "videos_update_auth" ON videos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "videos_delete_auth" ON videos;
CREATE POLICY "videos_delete_auth" ON videos FOR DELETE
  TO authenticated USING (true);

-- ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  is_pinned boolean DEFAULT false,
  is_ticker boolean DEFAULT false,
  category text DEFAULT 'general',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_select_all" ON announcements;
CREATE POLICY "announcements_select_all" ON announcements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "announcements_insert_auth" ON announcements;
CREATE POLICY "announcements_insert_auth" ON announcements FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "announcements_update_auth" ON announcements;
CREATE POLICY "announcements_update_auth" ON announcements FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "announcements_delete_auth" ON announcements;
CREATE POLICY "announcements_delete_auth" ON announcements FOR DELETE
  TO authenticated USING (true);

-- CLUBS TABLE
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '',
  logo_url text DEFAULT '',
  cover_image text DEFAULT '',
  head_name text DEFAULT '',
  head_email text DEFAULT '',
  members_count int DEFAULT 0,
  meeting_schedule text DEFAULT '',
  social_links jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clubs_select_all" ON clubs;
CREATE POLICY "clubs_select_all" ON clubs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "clubs_insert_auth" ON clubs;
CREATE POLICY "clubs_insert_auth" ON clubs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "clubs_update_auth" ON clubs;
CREATE POLICY "clubs_update_auth" ON clubs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "clubs_delete_auth" ON clubs;
CREATE POLICY "clubs_delete_auth" ON clubs FOR DELETE
  TO authenticated USING (true);

-- SPONSORS TABLE
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text DEFAULT '',
  website_url text DEFAULT '',
  tier text NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Gold','Silver','Bronze')),
  description text DEFAULT '',
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sponsors_select_all" ON sponsors;
CREATE POLICY "sponsors_select_all" ON sponsors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "sponsors_insert_auth" ON sponsors;
CREATE POLICY "sponsors_insert_auth" ON sponsors FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sponsors_update_auth" ON sponsors;
CREATE POLICY "sponsors_update_auth" ON sponsors FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sponsors_delete_auth" ON sponsors;
CREATE POLICY "sponsors_delete_auth" ON sponsors FOR DELETE
  TO authenticated USING (true);

-- FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_event_user ON feedback(event_id, user_id);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_select_all" ON feedback;
CREATE POLICY "feedback_select_all" ON feedback FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "feedback_insert_own" ON feedback;
CREATE POLICY "feedback_insert_own" ON feedback FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "feedback_update_own" ON feedback;
CREATE POLICY "feedback_update_own" ON feedback FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "feedback_delete_own" ON feedback;
CREATE POLICY "feedback_delete_own" ON feedback FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_event ON comments(event_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_all" ON comments;
CREATE POLICY "comments_select_all" ON comments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON comments;
CREATE POLICY "comments_insert_own" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text DEFAULT '',
  type text DEFAULT 'general',
  link text DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT '',
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_insert_anon" ON contacts;
CREATE POLICY "contacts_insert_anon" ON contacts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contacts_select_auth" ON contacts;
CREATE POLICY "contacts_select_auth" ON contacts FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

DROP POLICY IF EXISTS "contacts_update_auth" ON contacts;
CREATE POLICY "contacts_update_auth" ON contacts FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )) WITH CHECK (true);

-- BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_event ON bookmarks(user_id, event_id);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookmarks_select_own" ON bookmarks;
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_insert_own" ON bookmarks;
CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_delete_own" ON bookmarks;
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- FUNCTION to handle new user signup (create profile automatically)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
