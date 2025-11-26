import { createClient } from '@/lib/supabase/server'
import { Member } from '@/lib/types'
import { MembersListClient } from '@/components/members-list-client'

export default async function MembersPage() {
  const supabase = await createClient()
  
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('full_name', { ascending: true })

  return <MembersListClient members={(members as Member[]) || []} />
}
