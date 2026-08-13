create table if not exists desk_keys (
  user_id text primary key,
  justtcg text,
  pricecharting text,
  pokemontcg text,
  updated_at timestamptz not null default now()
);
