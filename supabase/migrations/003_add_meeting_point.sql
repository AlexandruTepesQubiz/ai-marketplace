-- Add meeting_point column to products table
alter table public.products
  add column meeting_point text;

-- Add comment to describe the column
comment on column public.products.meeting_point is 'Physical location where the product can be picked up or exchanged, provided by the seller';
