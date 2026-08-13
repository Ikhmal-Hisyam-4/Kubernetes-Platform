import type { ReactNode } from 'react'

export function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-8 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
          {icon}
        </div>
        <div>
          <h1 className="text-base font-semibold text-neutral-900">{title}</h1>
          <p className="text-sm text-neutral-500">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  )
}
