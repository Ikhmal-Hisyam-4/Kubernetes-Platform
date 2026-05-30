import { useState } from 'react'
import { ArrowRight, Filter } from 'lucide-react'
import { gpus } from '../data/gpus'
import type { GPU } from '../data/gpus'
import { useNavigate } from 'react-router-dom'

const tiers = ['All', 'Entry', 'Pro', 'AI Workstation']

export default function GPUs() {
  const [selected, setSelected] = useState('All')
  const navigate = useNavigate()
  const filtered = selected === 'All' ? gpus : gpus.filter(g => g.tier === selected)

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="section-label mb-2">Marketplace</p>
          <h1 className="font-bold text-4xl text-text-primary mb-2">GPU Instances</h1>
          <p className="text-text-secondary text-base">Per-second billing, no minimum commitment. All on RKE2 Kubernetes.</p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Filter size={14} className="text-text-muted" />
          <div className="flex gap-2">
            {tiers.map(t => (
              <button key={t} onClick={() => setSelected(t)}
                className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
                  selected === t
                    ? 'border-accent-green text-accent-green bg-accent-light font-medium'
                    : 'border-border-subtle text-text-muted hover:border-border-default'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {filtered.map(gpu => <GPUCard key={gpu.id} gpu={gpu} onDeploy={() => navigate('/dashboard')} />)}
        </div>
      </div>
    </div>
  )
}

function GPUCard({ gpu, onDeploy }: { gpu: GPU; onDeploy: () => void }) {
  return (
    <div className="card p-6 flex flex-col gap-5 hover:border-accent-green/50">
      <div className="flex items-start justify-between">
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
          gpu.tier === 'AI Workstation' ? 'border-accent-green text-accent-green bg-accent-light' :
          gpu.tier === 'Pro' ? 'border-border-default text-text-secondary' :
          'border-border-subtle text-text-muted'
        }`}>{gpu.tier}</span>
        <div className="flex items-center gap-1.5">
          <span className="status-dot" />
          <span className="text-xs text-text-muted">{gpu.available} available</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-xl text-text-primary">{gpu.hardware}</h3>
        <p className="text-sm text-accent-green font-medium mt-1">{gpu.gpu} · {gpu.vram} GB vRAM</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'vCPU', value: `${gpu.cpu} cores` },
          { label: 'RAM', value: `${gpu.ram} GB` },
          { label: 'Storage', value: `${gpu.storage} GB` },
          { label: 'Network', value: `${gpu.bandwidth} Gbps` },
        ].map(s => (
          <div key={s.label} className="bg-bg-elevated rounded-lg p-3 border border-border-subtle">
            <div className="text-xs text-text-muted">{s.label}</div>
            <div className="text-sm text-text-primary font-medium mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-xs text-text-muted mb-1.5">
          <span>Availability</span>
          <span>{gpu.available}/{gpu.total} instances</span>
        </div>
        <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
          <div className="h-full bg-accent-green rounded-full" style={{ width: `${(gpu.available / gpu.total) * 100}%` }} />
        </div>
      </div>

      <p className="text-xs text-text-muted">{gpu.useCase}</p>

      <div className="flex items-end justify-between pt-3 border-t border-border-subtle">
        <div>
          <span className="font-bold text-2xl text-text-primary">${gpu.pricePerHour}</span>
          <span className="text-sm text-text-muted ml-1">/hr</span>
          <div className="text-xs text-text-muted">~${(gpu.pricePerHour * 24 * 30).toFixed(0)}/mo</div>
        </div>
        <button onClick={onDeploy} className="btn-primary text-sm">Deploy <ArrowRight size={13} /></button>
      </div>
    </div>
  )
}
