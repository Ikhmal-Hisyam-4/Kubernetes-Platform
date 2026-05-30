import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'GPUs', to: '/gpus' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Dashboard', to: '/dashboard' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle bg-bg-base/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent-green rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-sm">K</span>
          </div>
          <span className="font-semibold text-base text-text-primary">
            Kubex<span className="text-accent-green">.gpu</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                pathname === l.to
                  ? 'text-text-primary bg-bg-elevated font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="status-dot" />
            <span>All systems operational</span>
          </div>
          <Link to="/gpus" className="btn-primary">
            Deploy a GPU
          </Link>
        </div>

        <button className="md:hidden text-text-secondary" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border-subtle bg-bg-surface px-6 py-4 flex flex-col gap-2">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="text-sm text-text-secondary hover:text-text-primary py-2 transition-colors">
              {l.label}
            </Link>
          ))}
          <Link to="/gpus" className="btn-primary mt-2 justify-center">Deploy a GPU</Link>
        </div>
      )}
    </nav>
  )
}
