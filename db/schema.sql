-- Base de données des espaces membres (Siroxtag et Wyatt). PostgreSQL.
-- À exécuter une fois sur la base (par exemple dans la console SQL de Neon).
create extension if not exists pgcrypto;

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  pseudo      text not null,
  email       text unique,                -- seulement pour l’inscription par e-mail
  pass_hash   text,                       -- scrypt, jamais le mot de passe en clair
  discord_id  text unique,                -- seulement pour la connexion Discord
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  constraint one_method check (email is not null or discord_id is not null)
);
create unique index if not exists users_pseudo_lower on users (lower(pseudo));

create table if not exists sessions (
  token_hash  text primary key,           -- empreinte SHA-256 du jeton du cookie
  user_id     uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index if not exists sessions_user on sessions (user_id);

create table if not exists ideas (
  id          bigserial primary key,
  user_id     uuid not null references users(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 160),
  body        text not null default '' check (char_length(body) <= 2000),
  status      text not null default 'idee' check (status in ('idee', 'a-tourner', 'tourne', 'publie')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ideas_user on ideas (user_id);

create table if not exists scores (
  user_id     uuid not null references users(id) on delete cascade,
  game        text not null,
  best        integer not null check (best >= 0),
  updated_at  timestamptz not null default now(),
  primary key (user_id, game)
);
create index if not exists scores_game on scores (game, best desc);

create table if not exists rate_limits (
  key         text primary key,
  hits        integer not null,
  reset_at    timestamptz not null
);
