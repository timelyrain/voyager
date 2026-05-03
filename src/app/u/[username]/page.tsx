import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicProfileView from './PublicProfileView'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('display_name').eq('username', username).single()
  const name = data?.display_name || username
  return {
    title: `${name}'s Travel Map — Voyager`,
    description: `See which countries ${name} has visited on an interactive world map.`,
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, username, display_name')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const [{ data: visited }, { data: bucket }] = await Promise.all([
    supabase.from('visited_countries').select('country_code').eq('user_id', profile.user_id),
    supabase.from('bucketlist_countries').select('country_code').eq('user_id', profile.user_id),
  ])

  return (
    <PublicProfileView
      profile={{ username: profile.username, display_name: profile.display_name }}
      visitedCodes={(visited || []).map((r: { country_code: string }) => r.country_code)}
      bucketCodes={(bucket || []).map((r: { country_code: string }) => r.country_code)}
    />
  )
}
