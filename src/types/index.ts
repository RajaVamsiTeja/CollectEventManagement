export type UserRole = "admin" | "organizer" | "student";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  year: string;
  roll_number: string;
  avatar_url: string;
  phone: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export type EventCategory =
  | "Technical"
  | "Cultural"
  | "Sports"
  | "Workshop"
  | "Seminar"
  | "Hackathon"
  | "Fest"
  | "Club Activity";

export type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export interface Speaker {
  name: string;
  designation: string;
  photo: string;
}

export interface ScheduleItem {
  time: string;
  activity: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_building: string;
  venue_map_link: string;
  organizer_id: string | null;
  club_name: string;
  department: string;
  banner_image: string;
  poster_image: string;
  max_participants: number;
  registration_deadline: string | null;
  registration_fee: number;
  is_featured: boolean;
  tags: string[];
  speakers: Speaker[];
  schedule: ScheduleItem[];
  prizes: string;
  rules: string;
  contact_email: string;
  contact_phone: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  organizer?: Profile;
  registration_count?: number;
}

export type RegistrationStatus =
  | "registered"
  | "waitlist"
  | "attended"
  | "cancelled"
  | "rejected";

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  ticket_code: string;
  attended: boolean;
  registered_at: string;
  created_at: string;
  event?: EventItem;
  user?: Profile;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  event_id: string | null;
  cover_image: string;
  category: string;
  year: number;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  photo_count?: number;
  event?: EventItem;
}

export interface Photo {
  id: string;
  album_id: string;
  url: string;
  public_id: string;
  caption: string;
  tags: string[];
  uploaded_by: string | null;
  approved: boolean;
  likes_count: number;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  platform: "instagram" | "youtube";
  thumbnail: string;
  event_id: string | null;
  category: string;
  tags: string[];
  is_featured: boolean;
  is_pinned: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_ticker: boolean;
  category: string;
  created_by: string | null;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string;
  cover_image: string;
  head_name: string;
  head_email: string;
  members_count: number;
  meeting_schedule: string;
  social_links: Record<string, string>;
  created_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  tier: "Gold" | "Silver" | "Bronze";
  description: string;
  event_id: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: Profile;
}

export interface Comment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  user?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
  event?: EventItem;
}
