import { Link } from 'react-router-dom'
import { Cpu, ExternalLink } from 'lucide-react'

const platform = [
  { label: 'GPUs',       to: '/gpus' },
  { label: 'Pricing',    to: '/pricing' },
  { label: 'Dashboard',  to: '/dashboard' },
]

const infra = ['RKE2 Kubernetes', 'Harvester HCI', 'Longhorn Storage', 'Calico CNI', 'Prometheus', 'Loki']

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-surface">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4" aria-label="Kubex home">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-dim flex items-center justify-center shadow-glow-sm">
                <Cpu size={14} className="text-black" strokeWidth={2.5} />
              </div>
              <span className="font-heading font-bold text-base text-text-primary">
                Kubex<span className="text-accent-green">.gpu</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs mb-5">
              On-premises GPU cloud built on RKE2 Kubernetes. Transparent pricing,
              no hidden fees, no public cloud.
            </p>
            <a
              href="https://github.com/Ikhmal-Hisyam-4/Kubernetes-Platform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-secondary transition-colors"
            >
              {/* GitHub mark SVG */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View on GitHub
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Platform links */}
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-5">Platform</p>
            <ul className="space-y-3">
              {platform.map(item => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Infrastructure */}
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-5">Infrastructure</p>
            <ul className="space-y-3">
              {infra.map(t => (
                <li key={t} className="text-sm text-text-secondary">{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border-subtle pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-secondary">
            © 2025 gpu.kubex.my — Self-hosted GPU cloud
          </p>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="status-dot" />
            <span>rgx-cluster · RKE2 · Harvester HCI · All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
