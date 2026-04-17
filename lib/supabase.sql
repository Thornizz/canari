-- Profiles (créé automatiquement à l'inscription)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  streak_count int default 0,
  last_played_date date,
  created_at timestamptz default now()
);

-- Quiz scores
create table quiz_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  score int not null check (score >= 0 and score <= 10),
  played_at timestamptz default now()
);

-- Badges
create table badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_key)
);

-- Bird progress
create table bird_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  bird_id text not null,
  seen_at timestamptz default now(),
  unique(user_id, bird_id)
);

-- RLS
alter table profiles enable row level security;
alter table quiz_scores enable row level security;
alter table badges enable row level security;
alter table bird_progress enable row level security;

create policy "Profil visible par son propriétaire" on profiles
  for all using (auth.uid() = id);

create policy "Scores visibles par leur propriétaire" on quiz_scores
  for all using (auth.uid() = user_id);

create policy "Badges visibles par leur propriétaire" on badges
  for all using (auth.uid() = user_id);

create policy "Progression visible par son propriétaire" on bird_progress
  for all using (auth.uid() = user_id);

create policy "Scores publics pour le leaderboard" on quiz_scores
  for select using (true);

create policy "Profils publics (username uniquement)" on profiles
  for select using (true);

-- Trigger: créer le profil automatiquement à l'inscription
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
