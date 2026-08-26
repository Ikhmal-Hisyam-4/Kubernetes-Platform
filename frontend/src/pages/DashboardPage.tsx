import type { ComponentType } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from '../lib/auth'
import { formatCents } from '../lib/money'
import { demoDashboardSummary } from '../lib/demoData'
import { DemoBanner } from '../components/DemoBanner'
import { DatabaseIcon, DollarIcon, GridIcon, ServerIcon } from '../components/icons'
import type { DashboardSummary } from '../lib/types'

function StatCard({
  label,
  value,
  sub,
  Icon,
  iconBg,
}: {
  label: string
  value: string
  sub: string
  Icon: ComponentType<{ className?: string }>
  iconBg: string
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-500">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-400">{sub}</p>
    </div>
  )
}

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth()

  const { data: summary } = useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: async () => (await api.get<DashboardSummary>('/dashboard/summary')).data,
    enabled: isAuthenticated,
  })

  const display = isAuthenticated ? summary : demoDashboardSummary

  return (
    <div>
      {!isAuthenticated && <DemoBanner />}

      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
            {isAuthenticated ? (user?.full_name?.[0]?.toUpperCase() ?? '?') : 'D'}
          </div>
          <div>
            <h1 className="text-base font-semibold text-neutral-900">
              {isAuthenticated ? `Welcome back, ${user?.full_name}` : 'Dashboard'}
            </h1>
            <p className="text-sm text-neutral-500">Monitor your virtual machines and resource usage</p>
          </div>
        </div>
        <Link
          to="/deploy/gpu"
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          <GridIcon className="h-4 w-4" />
          Deploy New Instance
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 p-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Instances"
          value={String(display?.active_instances ?? 0)}
          sub={isAuthenticated ? 'vs. last month' : 'demo data'}
          Icon={GridIcon}
          iconBg="bg-emerald-100"
        />
        <StatCard
          label="Total Storage"
          value={`${display?.total_storage_gb ?? 0} GB`}
          sub={isAuthenticated ? 'across all instances' : 'demo data'}
          Icon={DatabaseIcon}
          iconBg="bg-blue-100"
        />
        <StatCard
          label="Total GPUs"
          value={String(display?.total_gpus ?? 0)}
          sub={isAuthenticated ? 'active GPU count' : 'demo data'}
          Icon={ServerIcon}
          iconBg="bg-orange-100"
        />
        <StatCard
          label="Monthly Cost"
          value={formatCents(display?.monthly_cost_cents ?? 0)}
          sub={isAuthenticated ? 'estimated this cycle' : 'demo data'}
          Icon={DollarIcon}
          iconBg="bg-neutral-100"
        />
      </div>
    </div>
  )
}
