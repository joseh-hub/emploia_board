-- Backfill existing users from auth.users to profiles table
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  created_at,
  now()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;