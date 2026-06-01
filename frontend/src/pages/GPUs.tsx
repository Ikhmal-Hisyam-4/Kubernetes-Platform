import { useState } from 'react'
import { ArrowRight, SlidersHorizontal, MemoryStick, Cpu, HardDrive, Wifi, Zap, Clock, ShieldCheck } from 'lucide-react'
import { gpus } from '../data/gpus'
import type { GPU } from '../data/gpus'
import { useNavigate, Link } from 'react-router-dom'

const tiers = ['All', 'Entry', 'Pro', 'AI Workstation'] as const

export default function GPUs() {
  const [selected, setSelected] = useState<string>('All')
  const navigate = useNavigate()
  const filtered = selected === 'All' ? gpus : gpus.filter(g => g.tier === selected)
  const totalAvailable = gpus.reduce((a, g) => a + g.available, 0)

  return (
    <div className="min-h-screen bg-bg-base">

      {/* Page hero */}
      <section className="relative pt-28 pb-16 px-6 border-b border-border-subtle overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-accent-green/4 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <p className="section-label mb-3">Marketplace</p>
              <h1 className="font-heading font-bold text-5xl text-text-primary mb-4">
                GPU Instances
              </h1>
              <p className="text-text-secondary text-lg max-w-xl">
                Enterprise-grade GPUs on bare-metal Kubernetes. Per-second billing,
                no minimum commitment, no hidden fees.
              </p>
            </div>
            {/* Quick stats */}
            <div className="flex gap-8 lg:gap-10 flex-shrink-0">
              {[
                { icon: <Zap size={14} className="text-accent-green" />,        value: `${totalAvailable}`,  label: 'Available now' },
                { icon: <Clock size={14} className="text-accent-green" />,       value: '< 60s',              label: 'Deploy time' },
                { icon: <ShieldCheck size={14} className="text-accent-green" />, value: '99.9%',              label: 'Uptime SLA' },
              ].map(s => (
                <div key={s.label} className="text-center lg:text-right">
                  <div className="flex items-center justify-center lg:justify-end gap-1.5 mb-1">
                    {s.icon}
                    <span className="font-heading font-bold text-xl text-text-primary">{s.value}</span>
                  </div>
                  <p className="text-xs text-text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter + cards */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <SlidersHorizontal size={14} className="text-text-muted flex-shrink-0" />
            <div className="flex gap-2 flex-wrap">
              {tiers.map(t => (
                <button
                  key={t}
                  onClick={() => setSelected(t)}
                  className={`text-sm px-4 py-1.5 rounded-full border transition-all duration-150 cursor-pointer font-medium ${
                    selected === t
                      ? 'border-accent-green text-accent-green bg-accent-light'
                      : 'border-border-subtle text-text-muted hover:border-border-default hover:text-text-secondary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-text-muted">
              {filtered.length} {filtered.length === 1 ? 'instance' : 'instances'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {filtered.map(gpu => (
              <GPUCard key={gpu.id} gpu={gpu} onDeploy={() => navigate('/dashboard')} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-6 border-t border-border-subtle bg-bg-surface">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-text-primary mb-1">
              Not sure which tier to pick?
            </h2>
            <p className="text-text-secondary text-sm">
              Compare pricing side by side or go straight to the dashboard.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/pricing" className="btn-outline">
              Compare Pricing
            </Link>
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

function GPUCard({ gpu, onDeploy }: { gpu: GPU; onDeploy: () => void }) {
  const tierColor = {
    'AI Workstation': 'border-accent-green text-accent-green bg-accent-light',
    'Pro':            'border-border-default text-text-secondary bg-bg-elevated',
    'Entry':          'border-border-subtle text-text-muted bg-bg-elevated',
  }[gpu.tier]

  return (
    <div className="group flex flex-col gap-5 p-6 rounded-2xl border border-border-subtle bg-bg-surface transition-all duration-200 hover:border-accent-green/40 hover:shadow-glow-sm cursor-default">
      <div className="flex items-start justify-between">
        <span className={`tag ${tierColor}`}>{gpu.tier}</span>
        <div className="flex items-center gap-1.5">
          <span className="status-dot" />
          <span className="text-xs text-text-muted">{gpu.available} available</span>
        </div>
      </div>

      <div>
        <h3 className="font-heading font-semibold text-xl text-text-primary">{gpu.hardware}</h3>
        <p className="text-sm text-accent-green font-medium mt-1">{gpu.gpu} · {gpu.vram} GB vRAM</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: <Cpu size={12} className="text-text-muted" />,         label: 'vCPU',    value: `${gpu.cpu} cores` },
          { icon: <MemoryStick size={12} className="text-text-muted" />, label: 'RAM',     value: `${gpu.ram} GB` },
          { icon: <HardDrive size={12} className="text-text-muted" />,   label: 'Storage', value: `${gpu.storage} GB` },
          { icon: <Wifi size={12} className="text-text-muted" />,        label: 'Network', value: `${gpu.bandwidth} Gbps` },
        ].map(s => (
          <div key={s.label} className="bg-bg-elevated rounded-xl p-3 border border-border-subtle group-hover:border-border-default transition-colors">
            <div className="flex items-center gap-1.5 mb-1">{s.icon}<span className="text-xs text-text-muted">{s.label}</span></div>
            <div className="text-sm text-text-primary font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-xs text-text-muted mb-2">
          <span>Availability</span>
          <span>{gpu.available}/{gpu.total} instances</span>
        </div>
        <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
          <div className="h-full bg-accent-green rounded-full" style={{ width: `${(gpu.available / gpu.total) * 100}%` }} />
        </div>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">{gpu.useCase}</p>

      <div className="flex items-end justify-between pt-4 border-t border-border-subtle mt-auto">
        <div>
          <span className="font-heading font-bold text-2xl text-text-primary">${gpu.pricePerHour}</span>
          <span className="text-sm text-text-muted ml-1">/hr</span>
          <div className="text-xs text-text-muted mt-0.5">~${(gpu.pricePerHour * 24 * 30).toFixed(0)}/mo</div>
        </div>
        <button onClick={onDeploy} className="btn-primary text-sm py-2 cursor-pointer">
          Deploy <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}
