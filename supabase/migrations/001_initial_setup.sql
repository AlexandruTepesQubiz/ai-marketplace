-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  phone_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Add comments
comment on column public.profiles.first_name is 'User first name';
comment on column public.profiles.last_name is 'User last name';
comment on column public.profiles.phone_number is 'Optional phone number for user contact information';

-- Create index for faster phone number lookups
create index profiles_phone_number_idx on public.profiles(phone_number) where phone_number is not null;

-- Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone_number)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone_number'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically create a profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to update the updated_at column
create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- PRODUCTS TABLE
-- ============================================

-- Create quantity units enum
create type quantity_unit as enum (
  'item',
  'kg',
  'g',
  'lb',
  'oz',
  'liter',
  'ml',
  'gallon',
  'dozen',
  'pack',
  'box',
  'bag',
  'bundle',
  'unit'
);

-- Create products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  price numeric(10, 2) not null check (price > 0),
  quantity_unit quantity_unit not null default 'item',
  seller_id uuid references auth.users(id) on delete cascade not null,
  description text,
  meeting_point text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.products enable row level security;

-- Products policies
create policy "Products are viewable by everyone"
  on products for select
  using ( true );

create policy "Users can insert their own products"
  on products for insert
  with check ( auth.uid() = seller_id );

create policy "Users can update their own products"
  on products for update
  using ( auth.uid() = seller_id );

create policy "Users can delete their own products"
  on products for delete
  using ( auth.uid() = seller_id );

-- Add comments
comment on column public.products.meeting_point is 'Physical location where the product can be picked up or exchanged, provided by the seller';

-- Create a trigger to update the updated_at column for products
create trigger on_product_updated
  before update on public.products
  for each row execute procedure public.handle_updated_at();

-- Create indexes for faster queries
create index products_seller_id_idx on public.products(seller_id);
create index products_created_at_idx on public.products(created_at desc);
