-- Private tables are accessed only by the Edge Function, never the public Data API.
create schema if not exists ku_acoustic;
revoke all on schema ku_acoustic from public, anon, authenticated;
create table ku_acoustic.content (
  kind text not null check (kind in ('events', 'news')),
  id text not null, data text not null, primary key (kind, id)
);
create table ku_acoustic.submissions (
  id text primary key, kind text not null,
  email text not null, target text, data text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created text not null
);
create unique index unique_registration on ku_acoustic.submissions(email,target) where kind='registration';
create unique index unique_newsletter on ku_acoustic.submissions(email) where kind='newsletter';
create index registration_capacity on ku_acoustic.submissions(target) where kind='registration' and status!='rejected';
create index booking_status on ku_acoustic.submissions(status) where kind='booking';
create index submission_created on ku_acoustic.submissions(created desc);
create table ku_acoustic.sessions (id text primary key, expires bigint not null);
create index session_expiry on ku_acoustic.sessions(expires);
create table ku_acoustic.settings (key text primary key, value text not null);
create table ku_acoustic.rate_limits (key text primary key, count integer not null, expires timestamptz not null);
create index rate_expiry on ku_acoustic.rate_limits(expires);
alter table ku_acoustic.content enable row level security;
alter table ku_acoustic.submissions enable row level security;
alter table ku_acoustic.sessions enable row level security;
alter table ku_acoustic.settings enable row level security;
alter table ku_acoustic.rate_limits enable row level security;
revoke all on all tables in schema ku_acoustic from public, anon, authenticated;
