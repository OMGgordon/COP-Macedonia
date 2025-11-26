import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Member } from '@/lib/types'
import { EditMemberClient } from '@/components/edit-member-client'

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !member) {
    notFound()
  }

  return <EditMemberClient member={member as Member} />
}
