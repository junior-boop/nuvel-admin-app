import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'default' | 'danger' | 'warning' | 'success'

const tones: Record<Tone, string> = {
  default: 'bg-surface-hover text-gray-300',
  danger: 'bg-danger/15 text-red-400',
  warning: 'bg-warning/15 text-amber-400',
  success: 'bg-success/15 text-emerald-400',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
      {...props}
    />
  )
}
