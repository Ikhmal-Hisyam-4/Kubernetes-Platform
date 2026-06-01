import { Link } from 'react-router-dom'
import { ArrowRight, Cpu, Zap, Shield, Clock, ChevronRight } from 'lucide-react'
import { gpus } from '../data/gpus'

const features = [
  {
    icon: <Zap size={18} className="text-accent-green" />,
    title: 'Per-Second Billing',
    desc: 'Only pay for active runtime. Billing stops the instant your instance terminates.',
  },
  {
    icon: <Cpu size={18} className="text-accent-green" />,
    title: 'Bare Metal Performance',
    desc: 'GPU passthrough via Harvester HCI. No noisy neighbours, no shared resources.',
  },
  {
    icon: <Shield size={18} className="text-accent-green" />,
    title: 'Private Infrastructure',
    desc: 'Your workloads never leave our on-premises cluster. Full network isolation.',
  },
  {
    icon: <Clock size={18} className="text-accent-green" />,
    title: 'Deploy in 60 Seconds',
    desc: 'Kubernetes-native provisioning via RKE2. Launch and be running fast.',
  },
]

const techStack = ['RKE2 Kubernetes', 'Harvester HCI', 'Longhorn Storage', 'Prometheus', 'Rancher', 'Calico CNI']

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base">

      {/* Announcement bar */}
      <div className="border-b border-border-subtle text-center py-2.5 px-4 mt-[72px] bg-bg-surface/60 backdrop-blur-sm">
        <p className="text-xs text-text-secondary">
          <span className="text-accent-green font-semibold">New:</span>{' '}
          NVIDIA Blackwell GB10 — 128 GB unified memory, $6.99/hr.{' '}
          <Link to="/gpus" className="text-accent-green hover:underline font-medium inline-flex items-center gap-0.5">
            Deploy now <ChevronRight size={11} />
          </Link>
        </p>
      </div>

      {/* Hero */}
      <section className="relative pt-16 pb-28 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left copy */}
            <div className="animate-fade-up">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-accent-light border border-accent-green/20 text-accent-green text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                Self-hosted · On-premises · RKE2 Kubernetes
              </div>

              <h1 className="font-heading font-bold text-5xl md:text-6xl text-text-primary leading-[1.08] tracking-tight mb-6">
                Affordable{' '}
                <span className="text-gradient">GPU servers</span>{' '}
                for every AI workload.
              </h1>

              <p className="text-text-secondary text-xl leading-relaxed mb-2">
                RTX 4090s from{' '}
                <span className="text-text-primary font-semibold">$1.49/hr.</span>{' '}
                No quotas, no commitments.
              </p>
              <p className="text-text-muted text-base leading-relaxed mb-10">
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
                  { value: '99.9%',   label: 'Uptime SLA' },
                  { value: '< 60s',   label: 'Deploy time' },
                  { value: 'Per-sec', label: 'Billing' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="font-heading font-bold text-2xl text-text-primary">{s.value}</div>
                    <div className="text-sm text-text-muted mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live availability widget */}
            <div className="hidden lg:block animate-fade-up" style={{ animationDelay: '120ms' }}>
              <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-float">
                {/* Terminal header bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-bg-elevated border-b border-border-subtle">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-accent-green/70" />
                  <span className="ml-3 text-xs text-text-muted font-mono">kubex — live availability</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="status-dot" />
                    <span className="text-xs text-accent-green font-medium">Online</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {gpus.map((gpu, i) => (
                    <div
                      key={gpu.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-accent-green/40 ${
                        i === 1
                          ? 'border-accent-green/40 bg-accent-light'
                          : 'border-border-subtle bg-bg-elevated'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-heading font-semibold text-sm text-text-primary">{gpu.gpu}</p>
                          <p className="text-xs text-text-muted mt-0.5">{gpu.vram} GB vRAM · {gpu.cpu} vCPU</p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading font-bold text-sm text-text-primary">
                            ${gpu.pricePerHour}
                            <span className="text-xs text-text-muted font-normal">/hr</span>
                          </p>
                          {i === 1 && (
                            <span className="text-[10px] text-accent-green font-semibold">Popular</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted whitespace-nowrap">
                          {gpu.available}/{gpu.total} available
                        </span>
                        <div className="h-1 flex-1 bg-border-subtle rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-green rounded-full transition-all duration-700"
                            style={{ width: `${(gpu.available / gpu.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Link to="/gpus" className="btn-primary w-full justify-center mt-1">
                    Browse All GPUs <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tech stack bar */}
      <section className="py-10 px-6 border-y border-border-subtle bg-bg-surface">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-medium text-text-muted uppercase tracking-widest mb-7">
            Built on enterprise-grade open source infrastructure
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {techStack.map(t => (
              <span key={t} className="text-sm text-text-secondary font-medium hover:text-text-primary transition-colors cursor-default">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* GPU Tiers */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Hardware Tiers</p>
            <h2 className="font-heading font-bold text-4xl text-text-primary mb-4">
              Three tiers for every workload
            </h2>
            <p className="text-text-secondary text-base max-w-lg mx-auto">
              From development and small inference to large model fine-tuning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {gpus.map((gpu, i) => (
              <div
                key={gpu.id}
                className={`relative flex flex-col gap-5 p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.01] ${
                  i === 1
                    ? 'border-accent-green/40 bg-bg-surface shadow-glow'
                    : 'border-border-subtle bg-bg-surface hover:border-border-default'
                }`}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-green text-black text-xs font-bold px-4 py-1 rounded-full shadow-glow-sm">
                    Most Popular
                  </span>
                )}
                <div>
                  <p className="text-xs text-text-muted mb-1">{gpu.tier}</p>
                  <h3 className="font-heading font-semibold text-lg text-text-primary">{gpu.hardware}</h3>
                  <p className="text-sm text-accent-green font-medium mt-1">{gpu.gpu} · {gpu.vram} GB vRAM</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'vCPU',    value: `${gpu.cpu} cores` },
                    { label: 'RAM',     value: `${gpu.ram} GB` },
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
                    <span className="font-heading font-bold text-2xl text-text-primary">${gpu.pricePerHour}</span>
                    <span className="text-sm text-text-muted ml-1">/ hr</span>
                  </div>
                  <Link to="/gpus" className="btn-primary text-sm py-2">
                    Deploy <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-bg-surface/40 border-y border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why Kubex</p>
            <h2 className="font-heading font-bold text-4xl text-text-primary">
              Built for serious AI workloads
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="group p-5 rounded-2xl border border-border-subtle bg-bg-surface hover:border-accent-green/30 hover:bg-bg-elevated transition-all duration-200 cursor-default">
                <div className="w-10 h-10 bg-accent-light border border-accent-green/20 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow-sm transition-all">
                  {f.icon}
                </div>
                <h3 className="font-heading font-semibold text-base text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-xl mx-auto text-center">
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-text-primary mb-4">
            Ready to deploy?
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            No long-term commitment. GPU running in 60 seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/gpus" className="btn-primary text-base px-8 py-3">
              Browse Available GPUs <ArrowRight size={15} />
            </Link>
            <Link to="/pricing" className="btn-outline text-base px-8 py-3">
              See Pricing
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
