import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { KeyIcon, LockIcon } from '../components/icons'
import { useConfirm } from '../lib/useConfirm'
import type { SshKey } from '../lib/types'

export function SecretsPage() {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [publicKey, setPublicKey] = useState('')

  const { data: keys } = useQuery({
    queryKey: queryKeys.sshKeys,
    queryFn: async () => (await api.get<SshKey[]>('/ssh-keys')).data,
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/ssh-keys', { name, public_key: publicKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sshKeys })
      setShowForm(false)
      setName('')
      setPublicKey('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/ssh-keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sshKeys }),
  })

  return (
    <div>
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <LockIcon className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-neutral-900">Secrets</h1>
            <p className="text-sm text-neutral-500">Manage your organization's secrets and credentials</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="text-neutral-500">Total Secrets</p>
            <p className="font-bold text-neutral-900">{keys?.length ?? 0}</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            + Add Secret
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl border border-neutral-200 bg-white">
          {showForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate()
              }}
              className="space-y-3 border-b border-neutral-100 p-5"
            >
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Key name (e.g. laptop)"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
              />
              <textarea
                required
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="ssh-ed25519 AAAA..."
                rows={3}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-xs outline-none focus:border-neutral-400"
              />
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Save Secret
              </button>
            </form>
          )}

          {keys && keys.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-xs text-neutral-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-neutral-900">{key.name}</td>
                    <td className="px-5 py-3 text-neutral-500">SSH Key</td>
                    <td className="px-5 py-3 text-neutral-500">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={async () => {
                          const ok = await confirm({
                            title: `Delete SSH key "${key.name}"?`,
                            description: 'This cannot be undone.',
                          })
                          if (ok) deleteMutation.mutate(key.id)
                        }}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-12 text-center text-sm text-neutral-400">
              No secrets found. Create your first secret to get started.
            </p>
          )}
        </div>

        <div className="h-fit rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-3 text-base font-semibold text-neutral-900">About Secrets</h2>
          <p className="mb-4 text-sm text-neutral-500">
            SSH keys are a pair of cryptographic keys used to authenticate and establish secure
            connections to your virtual machines.
          </p>
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2">
              <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
              <span>
                <span className="font-medium text-neutral-900">Public Key</span>
                <br />
                <span className="text-neutral-500">Stored on your VM — safe to share</span>
              </span>
            </p>
            <p className="flex items-start gap-2">
              <KeyIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
              <span>
                <span className="font-medium text-neutral-900">Private Key</span>
                <br />
                <span className="text-neutral-500">Kept secret on your computer — never share</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
