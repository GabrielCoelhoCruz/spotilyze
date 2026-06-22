import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { DEMO_USER_ID, ensureDemoDataSeeded } from '@/lib/demo-data'
import { loadDashboardData } from '@/lib/dashboard/queries'

export const metadata = {
  title: 'Demo Dashboard — Spotilyze',
  description: 'Explore Spotilyze with sample listening data. No Spotify account required.',
}

export default async function DemoDashboardPage() {
  await ensureDemoDataSeeded()
  const data = await loadDashboardData(DEMO_USER_ID)

  return (
    <DashboardContent
      data={data}
      displayName="Demo User"
      isDemo
    />
  )
}
