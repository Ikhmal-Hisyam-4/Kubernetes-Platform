import { Check } from 'lucide-react'
import { gpus } from '../data/gpus'
import { Link } from 'react-router-dom'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Pricing</p>
          <h1 className="font-bold text-5xl text-text-primary mb-4">Simple, honest pricing</h1>
          <p className="text-text-secondary text-lg max-w-lg mx-auto">Per-second billing. Pay only for active runtime. All prices in USD.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 items-stretch">
          {gpus.map((gpu, i) => (
            <div key={gpu.id} className={`card p-8 flex flex-col gap-6 ${i === 1 ? 'border-accent-green shadow-glow' : ''}`}>
              {i === 1 && (
                <span className="self-start bg-accent-green text-black text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div>
                <p className="text-xs text-text-muted mb-1">{gpu.tier}</p>
                <h2 className="font-semibold text-xl text-text-primary">{gpu.hardware}</h2>
                <p className="text-sm text-accent-green font-medium mt-1">{gpu.gpu}</p>
              </div>

              <div>
                <div className="flex items-end gap-1">
                  <span className="font-bold text-5xl text-text-primary">${gpu.pricePerHour}</span>
                  <span className="text-text-muted text-sm mb-2">/ hour</span>
                </div>
                <p className="text-xs text-text-muted">Billed per second · ~${(gpu.pricePerHour * 24 * 30).toFixed(0)}/mo</p>
              </div>

              <div className="space-y-3">
                {[
                  `${gpu.vram} GB vRAM`,
                  `${gpu.cpu} vCPU cores`,
                  `${gpu.ram} GB system RAM`,
                  `${gpu.storage} GB NVMe storage`,
                  `${gpu.bandwidth} Gbps network`,
                  'Kubernetes-native deploy',
                  'Prometheus metrics included',
                  'Grafana dashboard access',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <Check size={14} className="text-accent-green flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{f}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-subtle pt-4 space-y-2">
                {[
                  { label: 'Hourly', value: `$${gpu.pricePerHour}` },
                  { label: 'Daily', value: `$${(gpu.pricePerHour * 24).toFixed(2)}` },
                  { label: 'Monthly est.', value: `$${(gpu.pricePerHour * 24 * 30).toFixed(0)}` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-text-muted">{r.label}</span>
                    <span className="text-text-primary font-medium">{r.value}</span>
                  </div>
                ))}
              </div>

              <Link to="/gpus" className={`mt-auto ${i === 1 ? 'btn-primary justify-center' : 'btn-outline justify-center'}`}>
                Deploy {gpu.tier}
              </Link>
            </div>
          ))}
        </div>

        <div className="border-t border-border-subtle pt-14">
          <h2 className="font-bold text-2xl text-text-primary mb-8">Frequently asked questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: 'How does billing work?', a: 'Billing starts when your instance is Running and stops the moment you terminate it. Billed per second, rounded up to the nearest minute.' },
              { q: 'Where is the infrastructure?', a: 'All hardware is hosted on-premises in our private data centre running Harvester HCI with RKE2 Kubernetes. No public cloud involved.' },
              { q: 'What operating systems are supported?', a: 'Ubuntu 24.04 LTS and Rocky Linux 9.7 are available on all tiers. Additional images available on request.' },
              { q: 'Is there a minimum commitment?', a: 'No minimum. Run an instance for 5 minutes or 5 months. No contracts, no quotas.' },
            ].map(item => (
              <div key={item.q} className="p-6 bg-bg-surface rounded-xl border border-border-subtle">
                <h3 className="font-semibold text-base text-text-primary mb-2">{item.q}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
