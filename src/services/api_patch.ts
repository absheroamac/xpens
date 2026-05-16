import { createClient } from '@/utils/supabase/client'
const supabase = createClient()
export async function getSpaceProfiles(spaceId: string) {
  if (!spaceId) return []
  const { data, error } = await supabase
    .from('space_members')
    .select('user_id, profiles!inner(name)')
    .eq('space_id', spaceId)
  if (error) throw error
  return data.map((m: any) => ({
    user_id: m.user_id,
    name: m.profiles?.name || 'Unknown'
  }))
}
