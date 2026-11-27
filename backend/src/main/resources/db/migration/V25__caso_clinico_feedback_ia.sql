create table caso_clinico_feedback_ia (
    caso_id uuid primary key references caso_clinico(id) on delete cascade,
    assinatura char(64) not null,
    gerado_em timestamptz not null default now(),
    feedback jsonb not null check (octet_length(feedback::text) <= 4096)
);
alter table caso_clinico_feedback_ia enable row level security;
