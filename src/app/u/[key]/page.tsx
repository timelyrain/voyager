import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicProfileView from './PublicProfileView'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ key: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('display_name').eq('share_key', key).single()
  const name = data?.display_name || 'A traveller'
  return {
    title: `${name}'s Travel Map — My Travel Log`,
    description: `See which countries ${name} has visited on an interactive world map.`,
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { key } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, display_name, theme')
    .eq('share_key', key)
    .single()

  if (!profile) notFound()

  const [{ data: visited }, { data: bucket }] = await Promise.all([
    supabase.from('visited_countries').select('country_code').eq('user_id', profile.user_id),
    supabase.from('bucketlist_countries').select('country_code').eq('user_id', profile.user_id),
  ])

  return (
    <PublicProfileView
      displayName={profile.display_name}
      theme={profile.theme}
      visitedCodes={(visited || []).map((r: { country_code: string }) => r.country_code)}
      bucketCodes={(bucket || []).map((r: { country_code: string }) => r.country_code)}
    />
  )
}
