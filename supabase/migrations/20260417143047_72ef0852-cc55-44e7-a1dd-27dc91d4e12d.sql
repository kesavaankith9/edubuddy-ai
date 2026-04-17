create table public.students (
  id uuid primary key default gen_random_uuid(),
  enrollment_no text unique not null,
  password_hash text not null,
  name text not null,
  email text,
  semester int not null default 1,
  branch text not null default 'CSE',
  created_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  semester int not null,
  name text not null,
  code text not null,
  total_sessions int not null default 60,
  attended_sessions int not null default 0,
  created_at timestamptz not null default now()
);
create index subjects_student_idx on public.subjects(student_id);

create table public.marks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  exam_type text not null,
  marks_obtained numeric not null,
  max_marks numeric not null default 100,
  created_at timestamptz not null default now()
);
create index marks_student_idx on public.marks(student_id);

create table public.student_sessions (
  token text primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index sessions_student_idx on public.student_sessions(student_id);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index chat_msgs_idx on public.chat_messages(student_id, created_at);

alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.marks enable row level security;
alter table public.student_sessions enable row level security;
alter table public.chat_messages enable row level security;