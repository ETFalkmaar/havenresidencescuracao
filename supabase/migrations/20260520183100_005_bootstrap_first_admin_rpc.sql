create or replace function public.claim_admin_if_first()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_admin_count int;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;

  select count(*) into v_admin_count from public.admin_users;

  if v_admin_count = 0 then
    insert into public.admin_users (user_id) values (v_user_id);
    return true;
  end if;

  return false;
end;
$$;

revoke execute on function public.claim_admin_if_first() from anon;
grant execute on function public.claim_admin_if_first() to authenticated;
