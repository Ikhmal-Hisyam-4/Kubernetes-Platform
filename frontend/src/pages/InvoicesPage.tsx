import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { formatCents } from '../lib/money'
import { PageHeader } from '../components/PageHeader'
import { CalendarIcon, DocumentIcon } from '../components/icons'
import { useAuth } from '../lib/auth'
import type { UsageResponse } from '../lib/types'

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7)
}

function formatMonthLabel(month: string) {
  const [year, mon] = month.split('-').map(Number)
  return new Date(year, mon - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function InvoicesPage() {
  const { user } = useAuth()
  const [month, setMonth] = useState(currentMonthValue())

  const { data: invoice } = useQuery({
    queryKey: queryKeys.invoice(month),
    queryFn: async () => (await api.get<UsageResponse>(`/invoices?month=${month}`)).data,
  })

  const isCurrentMonth = month === currentMonthValue()

  return (
    <div>
      <PageHeader
        icon={<DocumentIcon className="h-4 w-4" />}
        title="Monthly Invoice"
        subtitle={user?.full_name ?? ''}
      />

      <div className="p-8">
        <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-neutral-400 uppercase">
              <CalendarIcon className="h-3.5 w-3.5" />
              Select Period
            </span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
            />
            {isCurrentMonth && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                Current Month (Up to Now)
              </span>
            )}
          </div>
          <p className="mt-3 text-sm text-neutral-500">
            Showing charges for {formatMonthLabel(month)}
            {isCurrentMonth && ' up to the current moment'}.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white">
          {invoice && invoice.items.length > 0 ? (
            <>
              <div className="divide-y divide-neutral-100 px-6">
                {invoice.items.map((item) => (
                  <div key={item.instance_id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-neutral-900">{item.instance_name}</p>
                      <p className="text-xs text-neutral-400">{item.hours} hours billed</p>
                    </div>
                    <p className="font-semibold text-neutral-900">
                      {formatCents(item.total_cost_cents)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4">
                <p className="font-semibold text-neutral-900">Total</p>
                <p className="text-lg font-bold text-neutral-900">
                  {formatCents(invoice.total_cents)}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <DocumentIcon className="h-6 w-6" />
              </div>
              <p className="mb-1 text-base font-semibold text-neutral-900">No Charges Found</p>
              <p className="max-w-sm text-sm text-neutral-500">
                There were no virtual machine charges for {formatMonthLabel(month)}. Select a
                different month to view invoices for periods with activity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
