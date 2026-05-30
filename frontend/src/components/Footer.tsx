import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-base">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-accent-green rounded-md flex items-center justify-center">
                <span className="text-black font-bold text-xs">K</span>
              </div>
              <span className="font-semibold text-text-primary">
                Kubex<span className="text-accent-green">.gpu</span>
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              On-premises GPU cloud built on RKE2 Kubernetes. Transparent pricing, no hidden fees.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Platform</p>
            <ul className="space-y-3">
              {[{ label: 'GPUs', to: '/gpus' }, { label: 'Pricing', to: '/pricing' }, { label: 'Dashboard', to: '/dashboard' }].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-text-muted hover:text-text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Infrastructure</p>
            <ul className="space-y-3 text-sm text-text-muted">
              {['RKE2 Kubernetes', 'Harvester HCI', 'Longhorn Storage', 'Calico CNI'].map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">© 2025 gpu.kubex.my — Self-hosted GPU cloud</p>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="status-dot" />
            <span>rgx-cluster · RKE2 v1.35 · Harvester HCI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
