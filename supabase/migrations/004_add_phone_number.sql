-- Add phone_number column to profiles table
alter table public.profiles
  add column phone_number text;

-- Add comment to describe the column
comment on column public.profiles.phone_number is 'Optional phone number for user contact information';

-- Add index for faster lookups (optional, but useful if you need to search by phone)
create index profiles_phone_number_idx on public.profiles(phone_number) where phone_number is not null;
