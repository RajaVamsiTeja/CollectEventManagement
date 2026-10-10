/*
# Fix handle_new_user trigger function

## Problem
The `handle_new_user()` SECURITY DEFINER function lacks an explicit `search_path`,
which is now required by Supabase/Postgres. Without it, the trigger fails with
"Database error saving new user" (HTTP 500) during signup because Postgres
blocks execution of functions without a configured search_path for security reasons.

## Fix
Recreate the function with `SET search_path = public, auth` and re-attach the trigger.
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
