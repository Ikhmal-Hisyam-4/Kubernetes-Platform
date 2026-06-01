import { useState } from 'react'
import { Check, ChevronDown, ArrowRight } from 'lucide-react'
import { gpus } from '../data/gpus'
import { Link } from 'react-router-dom'

const faqs = [
  {
    q: 'How does billing work?',
    a: 'Billing starts when your instance is Running and stops the moment you terminate it. Billed per second, rounded up to the nearest minute.',
  },
  {
    q: 'Where is the infrastructure?',
    a: 'All hardware is hosted on-premises in our private data centre running Harvester HCI with RKE2 Kubernetes. No public cloud involved.',
  },
  {
    q: 'What operating systems are supported?',
    a: 'Ubuntu 24.04 LTS and Rocky Linux 9.7 are available on all tiers. Additional images available on request.',
  },
  {
    q: 'Is there a minimum commitment?',
    a: 'No minimum. Run an instance for 5 minutes or 5 months. No contracts, no quotas.',
  },
]

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-border-subtle rounded-2xl overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-bg-elevated transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-heading font-semibold text-base text-text-primary">{q}</span>
        <ChevronDown
          size={16}
          className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-border-subtle bg-bg-surface">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-bg-base">

      {/* Page hero */}
      <section className="relative pt-28 pb-16 px-6 border-b border-border-subtle overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-green/4 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto text-center">
          <p className="section-label mb-3">Pricing</p>
          <h1 className="font-heading font-bold text-5xl text-text-primary mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-text-secondary text-lg max-w-lg mx-auto mb-8">
            Per-second billing. Pay only for active runtime. All prices in USD.
          </p>
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              'No setup fees',
              'No minimum commitment',
              'Cancel any time',
              'Per-second billing',
            ].map(b => (
              <div key={b} className="flex items-center gap-2 text-sm text-text-secondary">
                <Check size={14} className="text-accent-green flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-6 py-14">
      <div className="max-w-6xl mx-auto">

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20 items-stretch">
          {gpus.map((gpu, i) => (
            <div
              key={gpu.id}
              className={`relative flex flex-col gap-6 p-8 rounded-2xl border transition-all ${
                i === 1
                  ? 'border-accent-green/40 bg-bg-surface shadow-glow'
                  : 'border-border-subtle bg-bg-surface'
              }`}
            >
              {i === 1 && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent-green text-black text-xs font-bold px-4 py-1 rounded-full shadow-glow-sm">
                  Most Popular
                </span>
              )}

              <div>
                <p className="text-xs text-text-muted mb-1">{gpu.tier}</p>
                <h2 className="font-heading font-semibold text-xl text-text-primary">{gpu.hardware}</h2>
                <p className="text-sm text-accent-green font-medium mt-1">{gpu.gpu}</p>
              </div>

              <div>
                <div className="flex items-end gap-1">
                  <span className="font-heading font-bold text-5xl text-text-primary">${gpu.pricePerHour}</span>
                  <span className="text-text-muted text-sm mb-2">/ hour</span>
                </div>
                <p className="text-xs text-text-muted">
                  Billed per second · ~${(gpu.pricePerHour * 24 * 30).toFixed(0)}/mo
                </p>
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
                    <div className="w-4 h-4 rounded-full bg-accent-light border border-accent-green/20 flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-accent-green" />
                    </div>
                    <span className="text-sm text-text-secondary">{f}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-subtle pt-5 space-y-2.5">
                {[
                  { label: 'Hourly',       value: `$${gpu.pricePerHour}` },
                  { label: 'Daily',        value: `$${(gpu.pricePerHour * 24).toFixed(2)}` },
                  { label: 'Monthly est.', value: `$${(gpu.pricePerHour * 24 * 30).toFixed(0)}` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-text-muted">{r.label}</span>
                    <span className="text-text-primary font-medium">{r.value}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/gpus"
                className={`mt-auto justify-center ${i === 1 ? 'btn-primary' : 'btn-outline'}`}
              >
                Deploy {gpu.tier}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading font-bold text-2xl text-text-primary mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <FAQItem
                key={item.q}
                q={item.q}
                a={item.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>

      </div>
      </div>

      {/* Bottom CTA */}
      <section className="py-16 px-6 border-t border-border-subtle bg-bg-surface">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-text-primary mb-1">
              Ready to get started?
            </h2>
            <p className="text-text-secondary text-sm">
              Deploy your first GPU in under 60 seconds. No credit card lock-in.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/gpus" className="btn-outline">
              Browse GPUs
            </Link>
            <Link to="/dashboard" className="btn-primary">
              Deploy Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
