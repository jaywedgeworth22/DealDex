create table if not exists appraisals (
  id text primary key,
  user_id text not null,
  created_at timestamptz not null default now(),
  marketplace text not null,
  listing_title text not null,
  listing_url text,
  listing_price numeric not null,
  shipping numeric not null default 0,
  condition text not null,
  grade text not null,
  finish text,
  card_id text not null,
  card_name text not null,
  set_name text not null,
  market_price numeric,
  all_in numeric,
  spread numeric,
  verdict text not null,
  snapshot text
);
create index if not exists appraisals_user_id_idx on appraisals (user_id, created_at desc);
