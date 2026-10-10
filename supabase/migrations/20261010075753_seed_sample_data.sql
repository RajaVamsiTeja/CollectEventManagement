/*
# Seed Data - Sample Events, Announcements, Clubs, Sponsors, Videos, Albums

## Overview
Inserts sample data for the college event management system so the app has content
on first load. Includes 8 events (mix of upcoming/past), announcements, clubs,
sponsors, sample videos, and a photo album with placeholder images.

## Notes
- Events use dates relative to now (upcoming events are in the future, past events in the past)
- No user-specific data (registrations, bookmarks) is seeded since those require auth
- Sample images use Unsplash URLs for demonstration
*/

-- Insert sample events
INSERT INTO events (title, slug, description, category, status, event_date, start_time, end_time, venue_name, venue_building, venue_map_link, club_name, department, banner_image, max_participants, registration_deadline, registration_fee, is_featured, tags, speakers, schedule, prizes, rules, contact_email, contact_phone, created_at) VALUES
(
  'TechFest 2026: National Hackathon',
  'techfest-2026-national-hackathon',
  'A 36-hour national-level hackathon where teams build innovative solutions to real-world problems. Open to all college students across India. Cash prizes, internships and goodies await!',
  'Hackathon',
  'Upcoming',
  (now() + interval '14 days')::date,
  '09:00 AM',
  '06:00 PM',
  'Main Auditorium',
  'Innovation Block',
  'https://maps.google.com/?q=Innovation+Block',
  'Tech Club',
  'Computer Science',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200',
  200,
  (now() + interval '10 days')::date,
  0,
  true,
  ARRAY['hackathon','coding','innovation','prizes'],
  '[{"name":"Dr. Rajesh Kumar","designation":"CTO, TechCorp","photo":"https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200"},{"name":"Prof. Sarah Chen","designation":"Head of AI Lab","photo":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"}]',
  '[{"time":"09:00 AM","activity":"Check-in & Breakfast"},{"time":"10:00 AM","activity":"Opening Ceremony & Theme Reveal"},{"time":"11:00 AM","activity":"Coding Begins"},{"time":"09:00 PM","activity":"Dinner & Mentorship Round"},{"time":"09:00 AM (Day 2)","activity":"Coding Ends & Submissions"},{"time":"11:00 AM (Day 2)","activity":"Judging & Presentations"},{"time":"02:00 PM (Day 2)","activity":"Awards Ceremony"}]',
  '1st: Rs 50,000 | 2nd: Rs 25,000 | 3rd: Rs 10,000',
  'Teams of 2-4 members. All code must be written during the event. No external help.',
  'techclub@college.edu',
  '+91-9876543210',
  now() - interval '5 days'
),
(
  'Cultural Night: Rangmanch 2026',
  'cultural-night-rangmanch-2026',
  'An evening of music, dance, drama and comedy celebrating the diverse cultural talent of our college. Performances by students and a special guest band.',
  'Cultural',
  'Upcoming',
  (now() + interval '7 days')::date,
  '06:00 PM',
  '10:00 PM',
  'Open Air Theatre',
  'Cultural Block',
  'https://maps.google.com/?q=Open+Air+Theatre',
  'Cultural Committee',
  'Arts',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
  500,
  (now() + interval '5 days')::date,
  100,
  true,
  ARRAY['cultural','music','dance','drama'],
  '[{"name":"The Local Train","designation":"Guest Band","photo":"https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200"}]',
  '[{"time":"06:00 PM","activity":"Welcome & Lamp Lighting"},{"time":"06:30 PM","activity":"Classical Dance Performance"},{"time":"07:15 PM","activity":"Music Performance by Students"},{"time":"08:00 PM","activity":"Drama Skit"},{"time":"09:00 PM","activity":"Guest Band Performance"},{"time":"09:45 PM","activity":"Vote of Thanks"}]',
  'Best Performance Trophy + Certificate',
  'Performances limited to 8 minutes each.',
  'cultural@college.edu',
  '+91-9876543211',
  now() - interval '10 days'
),
(
  'AI & Machine Learning Workshop',
  'ai-machine-learning-workshop',
  'A hands-on workshop covering fundamentals of AI and ML, from neural networks to practical deployment. Bring your laptops!',
  'Workshop',
  'Upcoming',
  (now() + interval '3 days')::date,
  '10:00 AM',
  '04:00 PM',
  'Seminar Hall 2',
  'Academic Block',
  'https://maps.google.com/?q=Seminar+Hall+2',
  'AI Society',
  'Computer Science',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200',
  80,
  (now() + interval '1 day')::date,
  50,
  false,
  ARRAY['ai','ml','workshop','hands-on'],
  '[{"name":"Dr. Priya Sharma","designation":"AI Researcher, IIT Bombay","photo":"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200"}]',
  '[{"time":"10:00 AM","activity":"Introduction to AI/ML"},{"time":"11:00 AM","activity":"Neural Networks Basics"},{"time":"12:00 PM","activity":"Lunch Break"},{"time":"01:00 PM","activity":"Hands-on: Building Your First Model"},{"time":"03:00 PM","activity":"Model Deployment & Q&A"}]',
  'Certificate of Participation',
  'Basic Python knowledge required. Bring laptops with Python 3.8+ installed.',
  'aisociety@college.edu',
  '+91-9876543212',
  now() - interval '3 days'
),
(
  'Inter-College Basketball Tournament',
  'inter-college-basketball-tournament',
  'Annual inter-college basketball championship. 16 teams compete for the trophy over 3 days.',
  'Sports',
  'Upcoming',
  (now() + interval '21 days')::date,
  '08:00 AM',
  '06:00 PM',
  'Basketball Court',
  'Sports Complex',
  'https://maps.google.com/?q=Sports+Complex',
  'Sports Committee',
  'Physical Education',
  'https://images.unsplash.com/photo-1518481612222-68bbe820ecd1?w=1200',
  160,
  (now() + interval '18 days')::date,
  200,
  false,
  ARRAY['sports','basketball','tournament'],
  '[]',
  '[{"time":"08:00 AM","activity":"Opening Match"},{"time":"10:00 AM","activity":"Round 1 Matches"},{"time":"02:00 PM","activity":"Quarter Finals"},{"time":"04:00 PM","activity":"Semi Finals"}]',
  'Winner Trophy + Gold Medals | Runner-up Trophy + Silver Medals',
  'Teams of 5+3 substitutes. College ID mandatory.',
  'sports@college.edu',
  '+91-9876543213',
  now() - interval '7 days'
),
(
  'Entrepreneurship Seminar: Startup Stories',
  'entrepreneurship-seminar-startup-stories',
  'Learn from successful entrepreneurs who started their journey during college. Get inspired and network with like-minded innovators.',
  'Seminar',
  'Upcoming',
  (now() + interval '10 days')::date,
  '02:00 PM',
  '05:00 PM',
  'Main Auditorium',
  'Management Block',
  'https://maps.google.com/?q=Main+Auditorium',
  'E-Cell',
  'Management Studies',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200',
  300,
  (now() + interval '8 days')::date,
  0,
  true,
  ARRAY['entrepreneurship','startup','seminar','networking'],
  '[{"name":"Mr. Aditya Verma","designation":"Founder, EduTech","photo":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"},{"name":"Ms. Neha Gupta","designation":"CEO, GreenCart","photo":"https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200"}]',
  '[{"time":"02:00 PM","activity":"Registration & Welcome"},{"time":"02:30 PM","activity":"Keynote: Journey of a Student Entrepreneur"},{"time":"03:30 PM","activity":"Panel Discussion"},{"time":"04:30 PM","activity":"Networking Session"}]',
  'Networking opportunities + Mentorship slots',
  'Open to all departments.',
  'ecell@college.edu',
  '+91-9876543214',
  now() - interval '2 days'
),
(
  'Annual Tech Symposium 2025',
  'annual-tech-symposium-2025',
  'A full-day symposium featuring talks from industry leaders, project showcase, and a panel on the future of technology.',
  'Technical',
  'Completed',
  (now() - interval '30 days')::date,
  '09:00 AM',
  '05:00 PM',
  'Convention Center',
  'Main Building',
  'https://maps.google.com/?q=Convention+Center',
  'IEEE Student Branch',
  'Computer Science',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  400,
  (now() - interval '35 days')::date,
  0,
  false,
  ARRAY['technical','symposium','ieee'],
  '[{"name":"Dr. Vikram Patel","designation":"VP Engineering, Google","photo":"https://images.unsplash.com/photo-1472099645785-5658c4a8161b?w=200"}]',
  '[{"time":"09:00 AM","activity":"Registration"},{"time":"10:00 AM","activity":"Keynote Speech"},{"time":"11:00 AM","activity":"Technical Talks"},{"time":"01:00 PM","activity":"Lunch"},{"time":"02:00 PM","activity":"Project Showcase"},{"time":"04:00 PM","activity":"Panel Discussion & Awards"}]',
  'Best Project: Rs 10,000',
  'IEEE membership preferred but not mandatory.',
  'ieee@college.edu',
  '+91-9876543215',
  now() - interval '40 days'
),
(
  'Robotics Challenge 2025',
  'robotics-challenge-2025',
  'Build and program robots to navigate obstacles and complete tasks. A thrilling competition for engineering enthusiasts.',
  'Technical',
  'Completed',
  (now() - interval '60 days')::date,
  '10:00 AM',
  '06:00 PM',
  'Robotics Lab',
  'Engineering Block',
  'https://maps.google.com/?q=Robotics+Lab',
  'Robotics Club',
  'Electronics',
  'https://images.unsplash.com/photo-1565043666747-89df1259a5d3?w=1200',
  100,
  (now() - interval '65 days')::date,
  100,
  false,
  ARRAY['robotics','electronics','competition'],
  '[]',
  '[{"time":"10:00 AM","activity":"Robot Inspection"},{"time":"11:00 AM","activity":"Round 1: Obstacle Course"},{"time":"02:00 PM","activity":"Round 2: Task Completion"},{"time":"05:00 PM","activity":"Finals & Awards"}]',
  '1st: Rs 15,000 | 2nd: Rs 7,500',
  'Teams of up to 4. Robots must be autonomous.',
  'robotics@college.edu',
  '+91-9876543216',
  now() - interval '70 days'
),
(
  'Photography Workshop & Exhibition',
  'photography-workshop-exhibition',
  'Learn the art of photography from professionals and showcase your best shots at the exhibition.',
  'Workshop',
  'Upcoming',
  (now() + interval '28 days')::date,
  '11:00 AM',
  '03:00 PM',
  'Art Gallery',
  'Arts Block',
  'https://maps.google.com/?q=Art+Gallery',
  'Photography Club',
  'Arts',
  'https://images.unsplash.com/photo-1452587925148-ce4e909fac81?w=1200',
  50,
  (now() + interval '25 days')::date,
  0,
  false,
  ARRAY['photography','art','workshop','exhibition'],
  '[{"name":"Mr. Arjun Nair","designation":"Professional Photographer","photo":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"}]',
  '[{"time":"11:00 AM","activity":"Basics of Photography"},{"time":"12:00 PM","activity":"Outdoor Shoot Session"},{"time":"01:00 PM","activity":"Lunch"},{"time":"02:00 PM","activity":"Editing Workshop & Exhibition"}]',
  'Best Photo Award + Exhibition Feature',
  'Bring your own camera or smartphone.',
  'photography@college.edu',
  '+91-9876543217',
  now() - interval '1 day'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert announcements
INSERT INTO announcements (title, content, is_pinned, is_ticker, category, created_at) VALUES
(
  'TechFest 2026 Registrations Now Open!',
  'Register now for the biggest hackathon of the year. 36 hours of coding, prizes worth Rs 50,000.',
  true, true, 'event', now() - interval '2 days'
),
(
  'Cultural Night Auditions',
  'Auditions for Cultural Night performances on Oct 12-13 at the Cultural Block.',
  false, true, 'event', now() - interval '1 day'
),
(
  'Mid-Semester Exams Schedule Released',
  'Check the academic portal for the mid-sem exam schedule.',
  true, false, 'academic', now() - interval '5 days'
),
(
  'Library Extended Hours',
  'Library will remain open until 10 PM during exam weeks.',
  false, false, 'general', now() - interval '3 days'
),
(
  'AI Workshop - Last Few Seats!',
  'Only 10 seats left for the AI & ML Workshop. Register now!',
  false, true, 'event', now() - interval '6 hours'
)
ON CONFLICT DO NOTHING;

-- Insert clubs
INSERT INTO clubs (name, description, category, logo_url, cover_image, head_name, head_email, members_count, meeting_schedule, social_links, created_at) VALUES
(
  'Tech Club',
  'The premier technology club for coding enthusiasts. We organize hackathons, coding competitions, and tech talks.',
  'Technical',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
  'Rahul Mehta',
  'techclub@college.edu',
  85,
  'Every Friday, 4 PM at Innovation Block',
  '{"instagram":"@techclub","linkedin":"tech-club"}',
  now() - interval '90 days'
),
(
  'Cultural Committee',
  'Celebrating diversity through music, dance, drama and art. We organize the annual cultural fest and regular events.',
  'Cultural',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=200',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  'Ananya Singh',
  'cultural@college.edu',
  120,
  'Every Monday, 5 PM at Cultural Block',
  '{"instagram":"@culturalcomm"}',
  now() - interval '120 days'
),
(
  'AI Society',
  'Exploring the frontiers of artificial intelligence and machine learning through workshops, projects and research.',
  'Technical',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
  'Karthik Reddy',
  'aisociety@college.edu',
  60,
  'Every Wednesday, 3 PM at CS Lab',
  '{"instagram":"@aisociety","github":"ai-society"}',
  now() - interval '60 days'
),
(
  'Sports Committee',
  'Promoting sports and fitness across the college. Organizing inter-college and intra-college tournaments.',
  'Sports',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200',
  'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800',
  'Vikram Singh',
  'sports@college.edu',
  95,
  'Daily practice, 6 AM at Sports Complex',
  '{"instagram":"@sportscomm"}',
  now() - interval '100 days'
),
(
  'E-Cell (Entrepreneurship Cell)',
  'Fostering entrepreneurship and innovation on campus. Pitch competitions, startup mentoring, and networking.',
  'Management',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
  'Sneha Patil',
  'ecell@college.edu',
  70,
  'Every Saturday, 2 PM at Management Block',
  '{"instagram":"@ecell","linkedin":"e-cell"}',
  now() - interval '75 days'
),
(
  'Photography Club',
  'For those who see the world through a lens. Photo walks, workshops, and exhibitions.',
  'Arts',
  'https://images.unsplash.com/photo-1452587925148-ce4c229fac81?w=200',
  'https://images.unsplash.com/photo-1452587925148-ce4e909fac81?w=800',
  'Arjun Nair',
  'photography@college.edu',
  45,
  'Every Sunday, 9 AM photo walk',
  '{"instagram":"@photoclub"}',
  now() - interval '50 days'
)
ON CONFLICT DO NOTHING;

-- Insert sponsors
INSERT INTO sponsors (name, logo_url, website_url, tier, description, created_at) VALUES
(
  'TechCorp India',
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
  'https://techcorp.example.com',
  'Gold',
  'Leading technology solutions provider and proud sponsor of TechFest 2026.',
  now() - interval '5 days'
),
(
  'EduTech Solutions',
  'https://images.unsplash.com/photo-1572044162444-ad60e33bca0b?w=200',
  'https://edutech.example.com',
  'Gold',
  'Revolutionizing education through technology.',
  now() - interval '5 days'
),
(
  'CloudNet Systems',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
  'https://cloudnet.example.com',
  'Silver',
  'Cloud infrastructure partner.',
  now() - interval '4 days'
),
(
  'GreenCart',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200',
  'https://greencart.example.com',
  'Silver',
  'Sustainable shopping platform.',
  now() - interval '4 days'
),
(
  'ByteBakers',
  'https://images.unsplash.com/photo-1611162616305-c69b5db08783?w=200',
  'https://bytebakers.example.com',
  'Bronze',
  'Software development agency.',
  now() - interval '3 days'
)
ON CONFLICT DO NOTHING;

-- Insert sample videos
INSERT INTO videos (title, description, url, platform, thumbnail, category, tags, is_featured, is_pinned, sort_order, created_at) VALUES
(
  'TechFest 2025 After Movie',
  'Relive the excitement of TechFest 2025 - 36 hours of coding, innovation and fun!',
  'https://www.instagram.com/reel/Cxyz123/',
  'instagram',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
  'Hackathon',
  ARRAY['techfest','aftermovie','hackathon'],
  true, true, 1,
  now() - interval '20 days'
),
(
  'Cultural Night 2025 Highlights',
  'The best performances from Rangmanch 2025 - music, dance and drama at its finest.',
  'https://www.instagram.com/reel/Cabc456/',
  'instagram',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
  'Cultural',
  ARRAY['cultural','dance','music'],
  false, false, 2,
  now() - interval '25 days'
),
(
  'Robotics Challenge 2025 Finals',
  'Watch the thrilling finale of the robotics competition!',
  'https://www.instagram.com/reel/Cdef789/',
  'instagram',
  'https://images.unsplash.com/photo-1565043666747-89df1259a5d3?w=400',
  'Technical',
  ARRAY['robotics','competition'],
  false, false, 3,
  now() - interval '15 days'
),
(
  'Campus Tour - Spring 2026',
  'Take a virtual tour of our beautiful campus.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'youtube',
  'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
  'General',
  ARRAY['campus','tour'],
  false, false, 4,
  now() - interval '10 days'
),
(
  'E-Cell Pitch Competition Highlights',
  'Students pitch their startup ideas to investors.',
  'https://www.instagram.com/reel/Cghi012/',
  'instagram',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400',
  'Seminar',
  ARRAY['entrepreneurship','pitch','startup'],
  false, false, 5,
  now() - interval '12 days'
)
ON CONFLICT DO NOTHING;

-- Insert sample album and photos
INSERT INTO albums (title, description, category, year, cover_image, created_at) VALUES
(
  'Tech Symposium 2025',
  'Photos from the Annual Tech Symposium 2025',
  'Technical',
  2025,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  now() - interval '25 days'
)
ON CONFLICT DO NOTHING;

-- Insert photos into the album
INSERT INTO photos (album_id, url, caption, tags, approved, likes_count, created_at)
SELECT
  a.id,
  p.url,
  p.caption,
  p.tags,
  true,
  p.likes,
  now() - interval '25 days'
FROM albums a
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'Keynote speech by Dr. Vikram Patel', ARRAY['keynote','speech']::text[], 45),
  ('https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800', 'Panel discussion on future of tech', ARRAY['panel','discussion']::text[], 32),
  ('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800', 'Hackathon in progress', ARRAY['hackathon','coding']::text[], 67),
  ('https://images.unsplash.com/photo-1517048676732-d65bc937f957?w=800', 'Project showcase highlights', ARRAY['project','showcase']::text[], 28),
  ('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'Networking session', ARRAY['networking']::text[], 19),
  ('https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800', 'Award ceremony', ARRAY['awards','ceremony']::text[], 52)
) AS p(url, caption, tags, likes)
WHERE a.title = 'Tech Symposium 2025'
ON CONFLICT DO NOTHING;

-- Insert a second album
INSERT INTO albums (title, description, category, year, cover_image, created_at) VALUES
(
  'Robotics Challenge 2025',
  'Action shots from the Robotics Challenge competition',
  'Technical',
  2025,
  'https://images.unsplash.com/photo-1565043666747-89df1259a5d3?w=800',
  now() - interval '55 days'
)
ON CONFLICT DO NOTHING;

INSERT INTO photos (album_id, url, caption, tags, approved, likes_count, created_at)
SELECT
  a.id,
  p.url,
  p.caption,
  p.tags,
  true,
  p.likes,
  now() - interval '55 days'
FROM albums a
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1565043666747-89df1259a5d3?w=800', 'Robot inspection round', ARRAY['robotics','inspection']::text[], 38),
  ('https://images.unsplash.com/photo-1535378917042-2a4753c60659?w=800', 'Obstacle course navigation', ARRAY['robotics','obstacle']::text[], 41),
  ('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', 'Team debugging their robot', ARRAY['robotics','debugging']::text[], 25),
  ('https://images.unsplash.com/photo-1555252828-29d5f40d2f6e?w=800', 'Finals match in progress', ARRAY['robotics','finals']::text[], 56)
) AS p(url, caption, tags, likes)
WHERE a.title = 'Robotics Challenge 2025'
ON CONFLICT DO NOTHING;

-- Insert a third album
INSERT INTO albums (title, description, category, year, cover_image, created_at) VALUES
(
  'Cultural Night 2025',
  'Memorable moments from Rangmanch 2025',
  'Cultural',
  2025,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  now() - interval '45 days'
)
ON CONFLICT DO NOTHING;

INSERT INTO photos (album_id, url, caption, tags, approved, likes_count, created_at)
SELECT
  a.id,
  p.url,
  p.caption,
  p.tags,
  true,
  p.likes,
  now() - interval '45 days
'
FROM albums a
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'Opening ceremony lamp lighting', ARRAY['cultural','ceremony']::text[], 72),
  ('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800', 'Classical dance performance', ARRAY['cultural','dance']::text[], 85),
  ('https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800', 'Guest band performance', ARRAY['cultural','music']::text[], 93),
  ('https://images.unsplash.com/photo-1518544801976-3e1594b67ec7?w=800', 'Drama skit by students', ARRAY['cultural','drama']::text[], 44),
  ('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'Grand finale', ARRAY['cultural','finale']::text[], 61)
) AS p(url, caption, tags, likes)
WHERE a.title = 'Cultural Night 2025'
ON CONFLICT DO NOTHING;
