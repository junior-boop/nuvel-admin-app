import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-primary',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-primary',
        className
      )}
      {...props}
    />
  )
}
