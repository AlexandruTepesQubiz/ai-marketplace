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

-- Create a trigger to update the updated_at column
create trigger on_product_updated
  before update on public.products
  for each row execute procedure public.handle_updated_at();

-- Create index for faster queries
create index products_seller_id_idx on public.products(seller_id);
create index products_created_at_idx on public.products(created_at desc);
