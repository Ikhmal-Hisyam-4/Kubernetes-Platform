import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { formatCents } from '../lib/money'
import { PageHeader } from '../components/PageHeader'
import { CardIcon } from '../components/icons'
import type { Threshold, Transaction } from '../lib/types'

export function BillingPage() {
  const queryClient = useQueryClient()
  const [depositAmount, setDepositAmount] = useState('')
  const [alertsEnabled, setAlertsEnabled] = useState(false)
  const [alertThreshold, setAlertThreshold] = useState('')
  const [topupAmount, setTopupAmount] = useState('')

  const { data: balance } = useQuery({
    queryKey: queryKeys.balance,
    queryFn: async () => (await api.get<{ balance_cents: number }>('/billing/balance')).data,
  })

  const { data: threshold } = useQuery({
    queryKey: queryKeys.threshold,
    queryFn: async () => (await api.get<Threshold>('/billing/threshold')).data,
  })

  const { data: transactions } = useQuery({
    queryKey: queryKeys.transactions,
    queryFn: async () => (await api.get<Transaction[]>('/billing/transactions')).data,
  })

  useEffect(() => {
    if (threshold) {
      setAlertsEnabled(threshold.alert_threshold_cents > 0)
      setAlertThreshold((threshold.alert_threshold_cents / 100).toFixed(2))
      setTopupAmount((threshold.topup_amount_cents / 100).toFixed(2))
    }
  }, [threshold])

  const depositMutation = useMutation({
    mutationFn: () =>
      api.post('/billing/deposit', {
        amount_cents: Math.round(parseFloat(depositAmount || '0') * 100),
        method: 'Card',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.balance })
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      setDepositAmount('')
    },
  })

  const thresholdMutation = useMutation({
    mutationFn: () =>
      api.put('/billing/threshold', {
        alert_threshold_cents: alertsEnabled
          ? Math.round(parseFloat(alertThreshold || '0') * 100)
          : 0,
        topup_amount_cents: Math.round(parseFloat(topupAmount || '0') * 100),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threshold })
    },
  })

  return (
    <div>
      <PageHeader
        icon={<CardIcon className="h-4 w-4" />}
        title="Billing & Payments"
        subtitle="Manage your balance and payment methods"
      />

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-1 text-base font-semibold text-neutral-900">Current Balance</h2>
            <p className="mb-3 text-sm text-neutral-500">Your account's current balance</p>
            <p className="text-4xl font-bold text-neutral-900">
              {formatCents(balance?.balance_cents ?? 0)}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Balance Threshold</h2>
                <p className="text-sm text-neutral-500">
                  Configure automatic actions when your balance runs low
                </p>
              </div>
              <button
                onClick={() => setAlertsEnabled((v) => !v)}
                className={`h-6 w-11 rounded-full transition ${
                  alertsEnabled ? 'bg-emerald-500' : 'bg-neutral-200'
                }`}
              >
                <span
                  className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition ${
                    alertsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {alertsEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-900">
                    Alert threshold
                  </label>
                  <input
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                    placeholder="$25.00"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-900">
                    Auto top-up amount
                  </label>
                  <input
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="$100.00"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => thresholdMutation.mutate()}
                disabled={thresholdMutation.isPending}
                className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Save changes
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-1 text-base font-semibold text-neutral-900">Deposit History</h2>
            <p className="mb-4 text-sm text-neutral-500">View your recent deposits and transactions</p>

            {transactions && transactions.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {tx.type === 'auto_topup' ? 'Auto top-up' : 'Manual deposit'}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(tx.created_at).toLocaleDateString()}
                        {tx.method && ` · ${tx.method}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-900">
                        +{formatCents(tx.amount_cents)}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {tx.status[0].toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-neutral-400">No transactions yet.</p>
            )}
          </div>
        </div>

        <div className="h-fit space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-3 text-base font-semibold text-neutral-900">Add Funds</h2>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">Amount</label>
            <input
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="$50.00"
              className="mb-3 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
            />
            <button
              onClick={() => depositMutation.mutate()}
              disabled={depositMutation.isPending || !depositAmount}
              className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-40"
            >
              + Add Funds
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
