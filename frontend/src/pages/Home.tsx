import { Link } from 'react-router-dom'
import { ArrowRight, Cpu, Zap, Shield, Clock } from 'lucide-react'
import { gpus } from '../data/gpus'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base">

      {/* Announcement bar */}
      <div className="border-b border-border-subtle text-center py-2.5 px-4 mt-16 bg-bg-surface">
        <p className="text-xs text-text-muted">
          <span className="text-accent-green font-semibold">New:</span>{' '}
          NVIDIA Blackwell GB10 now available — 128 GB unified memory.{' '}
          <Link to="/gpus" className="text-accent-green hover:underline font-medium">Deploy now →</Link>
        </p>
      </div>

      {/* Hero */}
      <section className="pt-16 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <h1 className="font-bold text-5xl md:text-6xl text-text-primary leading-tight tracking-tight mb-6">
                Affordable{' '}
                <span className="text-accent-green">GPU servers</span>{' '}
                for every AI workload.
              </h1>
              <p className="text-text-secondary text-xl leading-relaxed mb-3">
                RTX 4090s from <span className="text-text-primary font-semibold">$1.49/hr.</span> No quotas, no commitments.
              </p>
              <p className="text-text-secondary text-base leading-relaxed mb-8">
                Kubex runs a private fleet of GPU servers on self-hosted Kubernetes —
                deploy in 60 seconds, pay per second.
              </p>

              <div className="flex flex-wrap gap-3 mb-12">
                <Link to="/gpus" className="btn-primary text-base px-6 py-3">
                  Deploy a GPU <ArrowRight size={15} />
                </Link>
                <Link to="/pricing" className="btn-outline text-base px-6 py-3">
                  View Pricing
                </Link>
              </div>

              <div className="flex items-center gap-10 pt-8 border-t border-border-subtle">
                {[
                  { value: '99.9%', label: 'Uptime SLA' },
                  { value: '< 60s', label: 'Deploy time' },
                  { value: 'Per-sec', label: 'Billing' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="font-bold text-2xl text-text-primary">{s.value}</div>
                    <div className="text-sm text-text-muted mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live availability widget */}
            <div className="hidden lg:block">
              <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Live Availability</span>
                  <div className="flex items-center gap-1.5">
                    <span className="status-dot" />
                    <span className="text-xs text-accent-green font-medium">Online</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {gpus.map((gpu, i) => (
                    <div key={gpu.id} className={`p-4 rounded-lg border transition-all ${
                      i === 1
                        ? 'border-accent-green bg-accent-light'
                        : 'border-border-subtle bg-bg-elevated'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm text-text-primary">{gpu.gpu}</p>
                          <p className="text-xs text-text-muted mt-0.5">{gpu.vram} GB vRAM · {gpu.cpu} vCPU</p>
                        </div>
                        <p className="font-bold text-sm text-text-primary">
                          ${gpu.pricePerHour}<span className="text-xs text-text-muted font-normal">/hr</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted whitespace-nowrap">{gpu.available}/{gpu.total} available</span>
                        <div className="h-1.5 flex-1 bg-border-subtle rounded-full overflow-hidden">
                          <div className="h-full bg-accent-green rounded-full"
                            style={{ width: `${(gpu.available / gpu.total) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/gpus" className="btn-primary w-full justify-center mt-5">
                  Browse All GPUs <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tech stack bar */}
      <section className="py-10 px-6 border-y border-border-subtle bg-bg-surface">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-medium text-text-muted uppercase tracking-widest mb-6">
            Built on enterprise-grade open source infrastructure
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {['RKE2 Kubernetes', 'Harvester HCI', 'Longhorn Storage', 'Prometheus', 'Rancher', 'Calico CNI'].map(t => (
              <span key={t} className="text-sm text-text-muted font-medium">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* GPU Tiers */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Hardware Tiers</p>
            <h2 className="font-bold text-4xl text-text-primary mb-4">Three tiers for every workload</h2>
            <p className="text-text-secondary text-base max-w-lg mx-auto">
              From development and small inference to large model fine-tuning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {gpus.map((gpu, i) => (
              <div key={gpu.id} className={`card p-6 flex flex-col gap-5 ${i === 1 ? 'border-accent-green shadow-glow' : ''}`}>
                {i === 1 && (
                  <span className="self-start bg-accent-green text-black text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div>
                  <p className="text-xs text-text-muted mb-1">{gpu.tier}</p>
                  <h3 className="font-semibold text-lg text-text-primary">{gpu.hardware}</h3>
                  <p className="text-sm text-accent-green font-medium mt-1">{gpu.gpu} · {gpu.vram} GB vRAM</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'vCPU', value: `${gpu.cpu} cores` },
                    { label: 'RAM', value: `${gpu.ram} GB` },
                    { label: 'Storage', value: `${gpu.storage} GB NVMe` },
                    { label: 'Network', value: `${gpu.bandwidth} Gbps` },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between text-sm">
                      <span className="text-text-muted">{s.label}</span>
                      <span className="text-text-primary font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-text-muted border-t border-border-subtle pt-4">{gpu.useCase}</p>

                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="font-bold text-2xl text-text-primary">${gpu.pricePerHour}</span>
                    <span className="text-sm text-text-muted ml-1">/ hr</span>
                  </div>
                  <Link to="/gpus" className="btn-primary text-sm">Deploy <ArrowRight size={13} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-bg-surface border-y border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Why Kubex</p>
            <h2 className="font-bold text-4xl text-text-primary">Built for serious AI workloads</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Zap size={20} className="text-accent-green" />, title: 'Per-Second Billing', desc: 'Only pay for active runtime. Billing stops the instant your instance terminates.' },
              { icon: <Cpu size={20} className="text-accent-green" />, title: 'Bare Metal Performance', desc: 'GPU passthrough via Harvester HCI. No noisy neighbours, no shared resources.' },
              { icon: <Shield size={20} className="text-accent-green" />, title: 'Private Infrastructure', desc: 'Your workloads never leave our on-premises cluster. Full network isolation.' },
              { icon: <Clock size={20} className="text-accent-green" />, title: 'Deploy in 60 Seconds', desc: 'Kubernetes-native provisioning via RKE2. Launch and be running fast.' },
            ].map(f => (
              <div key={f.title}>
                <div className="w-10 h-10 bg-bg-elevated border border-border-subtle rounded-lg flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-bold text-4xl text-text-primary mb-4">Ready to deploy?</h2>
          <p className="text-text-secondary text-base mb-8">No long-term commitment. GPU running in 60 seconds.</p>
          <Link to="/gpus" className="btn-primary text-base px-8 py-3">
            Browse Available GPUs <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  )
}
