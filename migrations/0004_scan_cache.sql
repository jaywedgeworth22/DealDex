create table if not exists scan_cache (
  cache_key text primary key,
  q text not null,
  sources text not null,
  at timestamptz not null default now(),
  ebay int not null default 0,
  mercari int not null default 0,
  notes text not null default '[]',
  rows text not null default '[]'
);
