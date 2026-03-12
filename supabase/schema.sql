-- ============================================================
-- CinaTech Client Analysis — Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  agency_name text,
  created_at  timestamptz default now() not null
);

-- Auto-create a profile row when a new user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── CLIENTS ─────────────────────────────────────────────────────────────────
create table if not exists clients (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles (id) on delete cascade,
  name       text not null,
  is_shared  boolean default false not null,
  created_at timestamptz default now() not null
);

-- ─── DOCUMENTS ───────────────────────────────────────────────────────────────
create table if not exists documents (
  id          uuid primary key default uuid_generate_v4(),
  client_id   uuid not null references clients (id) on delete cascade,
  user_id     uuid not null references profiles (id) on delete cascade,
  file_name   text not null,
  file_path   text not null,
  file_type   text not null check (file_type in ('pdf', 'docx', 'image', 'txt', 'csv')),
  status      text not null default 'uploading'
                check (status in ('uploading', 'analysing', 'ready', 'error')),
  share_token uuid not null default uuid_generate_v4() unique,
  created_at  timestamptz default now() not null
);

-- ─── ANALYSES ────────────────────────────────────────────────────────────────
create table if not exists analyses (
  id                uuid primary key default uuid_generate_v4(),
  document_id       uuid not null references documents (id) on delete cascade,
  version           integer not null default 1,
  structured_result jsonb not null,
  summary           text not null default '',
  created_at        timestamptz default now() not null,
  unique (document_id, version)
);

-- ─── EXPORTS ─────────────────────────────────────────────────────────────────
create table if not exists exports (
  id          uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents (id) on delete cascade,
  analysis_id uuid not null references analyses (id) on delete cascade,
  type        text not null check (type in ('google_doc', 'pdf')),
  url         text not null,
  created_at  timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles  enable row level security;
alter table clients   enable row level security;
alter table documents enable row level security;
alter table analyses  enable row level security;
alter table exports   enable row level security;

-- Profiles: users can only read/update their own
create policy "profiles: select own" on profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

-- Clients: owned by user
create policy "clients: select own" on clients
  for select using (auth.uid() = user_id);
create policy "clients: insert own" on clients
  for insert with check (auth.uid() = user_id);
create policy "clients: update own" on clients
  for update using (auth.uid() = user_id);
create policy "clients: delete own" on clients
  for delete using (auth.uid() = user_id);

-- Documents: owned by user OR publicly accessible via share_token
create policy "documents: select own" on documents
  for select using (auth.uid() = user_id);
create policy "documents: select by share_token" on documents
  for select using (true); -- public share links handled at API level
create policy "documents: insert own" on documents
  for insert with check (auth.uid() = user_id);
create policy "documents: update own" on documents
  for update using (auth.uid() = user_id);
create policy "documents: delete own" on documents
  for delete using (auth.uid() = user_id);

-- Analyses: readable by document owner
create policy "analyses: select own" on analyses
  for select using (
    exists (
      select 1 from documents d
      where d.id = analyses.document_id and d.user_id = auth.uid()
    )
  );
create policy "analyses: insert via service role" on analyses
  for insert with check (true);

-- Exports: readable by document owner
create policy "exports: select own" on exports
  for select using (
    exists (
      select 1 from documents d
      where d.id = exports.document_id and d.user_id = auth.uid()
    )
  );
create policy "exports: insert via service role" on exports
  for insert with check (true);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these separately in the Supabase Storage section or uncomment here:
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
-- insert into storage.buckets (id, name, public) values ('exports', 'exports', false);

-- Storage RLS policies (run after creating buckets):
-- create policy "storage: documents upload own" on storage.objects
--   for insert with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "storage: documents read own" on storage.objects
--   for select using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_clients_user_id     on clients   (user_id);
create index if not exists idx_documents_client_id on documents (client_id);
create index if not exists idx_documents_user_id   on documents (user_id);
create index if not exists idx_documents_share     on documents (share_token);
create index if not exists idx_analyses_document   on analyses  (document_id, version desc);
create index if not exists idx_exports_document    on exports   (document_id);
