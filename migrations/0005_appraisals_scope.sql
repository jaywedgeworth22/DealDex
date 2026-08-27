-- Scope the saved-ledger primary key to the owner.
--
-- `appraisals.id` was a bare primary key on a CLIENT-SUPPLIED value. Two users
-- could therefore collide on an id, and the loser's insert threw a 500 that
-- doubled as an oracle for "does this id exist for anyone". Scoping the key to
-- (user_id, id) makes a collision the owner's own business, and lets a re-save
-- of the same row be idempotent instead of an error.
alter table appraisals drop constraint if exists appraisals_pkey;

-- Idempotent: re-running must not fail once the composite key exists.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'appraisals_user_id_id_pkey'
  ) then
    alter table appraisals add constraint appraisals_user_id_id_pkey primary key (user_id, id);
  end if;
end $$;
