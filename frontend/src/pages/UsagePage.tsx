import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { formatCents } from '../lib/money'
import { PageHeader } from '../components/PageHeader'
import { ChartIcon } from '../components/icons'
import { useAuth } from '../lib/auth'
import { demoUsage } from '../lib/demoData'
import { DemoBanner } from '../components/DemoBanner'
import type { InstanceStatus, UsageResponse } from '../lib/types'

const statusStyles: Record<InstanceStatus, string> = {
  running: 'bg-emerald-50 text-emerald-700',
  stopped: 'bg-neutral-100 text-neutral-500',
  provisioning: 'bg-amber-50 text-amber-700',
  terminated: 'bg-red-50 text-red-600',
}

const filters: { label: string; value: InstanceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Running', value: 'running' },
  { label: 'Stopped', value: 'stopped' },
  { label: 'Terminated', value: 'terminated' },
]

export function UsagePage() {
  const { user, isAuthenticated } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InstanceStatus | 'all'>('all')

  const { data: usageData } = useQuery({
    queryKey: queryKeys.usage,
    queryFn: async () => (await api.get<UsageResponse>('/usage')).data,
    enabled: isAuthenticated,
  })

  const usage = isAuthenticated ? usageData : demoUsage

  const items = usage?.items
    .filter((item) => statusFilter === 'all' || item.status === statusFilter)
    .filter((item) => item.instance_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      {!isAuthenticated && <DemoBanner />}

      <PageHeader
        icon={<ChartIcon className="h-4 w-4" />}
        title="Usage"
        subtitle={isAuthenticated ? (user?.full_name ?? '') : 'Demo account'}
      />

      <div className="p-8">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-neutral-900">Usage per VM</h2>
          <p className="mb-4 text-sm text-neutral-500">
            Detailed breakdown of compute and storage costs for each virtual machine
          </p>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by VM name..."
              className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
            />
            <div className="flex gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    statusFilter === f.value
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {items && items.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {items.map((item) => (
                <div key={item.instance_id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-sm font-semibold text-neutral-700">
                      {item.instance_name[0]?.toUpperCase()}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-neutral-900">{item.instance_name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[item.status]}`}
                        >
                          {item.status[0].toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">{item.hours} hours billed</p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-right text-sm">
                    <div>
                      <p className="text-xs text-neutral-400">Compute</p>
                      <p className="font-semibold text-neutral-900">
                        {formatCents(item.compute_cost_cents)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">Storage</p>
                      <p className="font-semibold text-neutral-900">
                        {formatCents(item.storage_cost_cents)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">This Month</p>
                      <p className="font-bold text-neutral-900">
                        {formatCents(item.total_cost_cents)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-neutral-400">
              No usage recorded yet this month.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
