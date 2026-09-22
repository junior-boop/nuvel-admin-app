import { type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DetailPanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function DetailPanel({ open, onClose, title, subtitle, children, footer }: DetailPanelProps) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-[30vw] min-w-90 flex-col border-l border-border bg-surface shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-sm text-gray-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-surface-hover hover:text-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-border p-4">{footer}</div>}
      </aside>
    </>
  )
}

export function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-border/60 py-2.5 last:border-0">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">{label}</p>
      <div className="mt-0.5 break-words text-sm text-gray-200" dangerouslySetInnerHTML={{ __html: value?.toString() ?? '—' }} />
    </div>
  )
}
