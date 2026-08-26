import { useNavigate } from 'react-router-dom'

export function DemoBanner() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between bg-neutral-900 px-8 py-2.5">
      <div className="flex items-center gap-3">
        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          Demo Mode
        </span>
        <span className="text-sm text-neutral-300">You're viewing demo data</span>
      </div>
      <button
        onClick={() => navigate('/signin')}
        className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
      >
        Sign in →
      </button>
    </div>
  )
}
