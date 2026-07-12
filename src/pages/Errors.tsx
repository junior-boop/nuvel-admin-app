import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Check, Trash2 } from 'lucide-react'
import { api, type ErrorLog } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const levelTone = { fatal: 'danger', error: 'danger', warning: 'warning' } as const

export default function Errors() {
  const [resolved, setResolved] = useState<'unresolved' | 'resolved' | 'all'>('unresolved')
  const [expanded, setExpanded] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['errors', resolved],
    queryFn: () =>
      api.getErrors({
        resolved: resolved === 'all' ? undefined : resolved === 'resolved',
        limit: 100,
      }),
  })

  const resolveMutation = useMutation({
    mutationFn: api.resolveError,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['errors'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteError,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['errors'] }),
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Erreurs applicatives</h1>
        <div className="flex gap-2">
          {(['unresolved', 'resolved', 'all'] as const).map((f) => (
            <Button
              key={f}
              variant={resolved === f ? 'primary' : 'secondary'}
              onClick={() => setResolved(f)}
              className="px-3 py-1.5 text-xs"
            >
              {f === 'unresolved' ? 'Non résolues' : f === 'resolved' ? 'Résolues' : 'Toutes'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data?.errors.length ? (
        <Card>
          <p className="text-sm text-gray-500">Aucune erreur à afficher.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {data.errors.map((err: ErrorLog) => (
            <Card key={err.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge tone={levelTone[err.level] ?? 'default'}>{err.level}</Badge>
                    <Badge>{err.platform}</Badge>
                    <Badge tone={err.environment === 'production' ? 'danger' : 'default'}>{err.environment}</Badge>
                    {err.screen && <Badge>{err.screen}</Badge>}
                    <span className="text-xs text-gray-500">{new Date(err.created).toLocaleString('fr-FR')}</span>
                  </div>
                  <p className="truncate text-sm font-medium text-gray-100">{err.message}</p>
                  {err.stack && (
                    <button
                      onClick={() => setExpanded(expanded === err.id ? null : err.id)}
                      className="mt-1 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
                    >
                      {expanded === err.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      Stack trace
                    </button>
                  )}
                  {expanded === err.id && err.stack && (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-bg p-3 text-xs text-gray-400">{err.stack}</pre>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {!err.resolved && (
                    <Button
                      variant="secondary"
                      className="px-2.5 py-1.5"
                      onClick={() => resolveMutation.mutate(err.id)}
                      title="Marquer comme résolu"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="px-2.5 py-1.5 text-red-400"
                    onClick={() => deleteMutation.mutate(err.id)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
