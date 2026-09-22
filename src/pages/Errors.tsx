import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Trash2 } from 'lucide-react'
import { api, type ErrorLog } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DetailPanel, DetailField } from '@/components/ui/detail-panel'

const levelTone = { fatal: 'danger', error: 'danger', warning: 'warning' } as const

export default function Errors() {
  const [resolved, setResolved] = useState<'unresolved' | 'resolved' | 'all'>('unresolved')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['errors', resolved],
    queryFn: () =>
      api.getErrors({
        resolved: resolved === 'all' ? undefined : resolved === 'resolved',
        limit: 100,
      }),
  })

  const selected = data?.errors?.find((e) => e.id === selectedId) ?? null

  const resolveMutation = useMutation({
    mutationFn: api.resolveError,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['errors'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteError,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['errors'] })
      setSelectedId((cur) => (cur === id ? null : cur))
    },
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
            <Card
              key={err.id}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => setSelectedId(err.id)}
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Badge tone={levelTone[err.level] ?? 'default'}>{err.level}</Badge>
                <Badge>{err.platform}</Badge>
                <Badge tone={err.environment === 'production' ? 'danger' : 'default'}>{err.environment}</Badge>
                {err.screen && <Badge>{err.screen}</Badge>}
                <span className="text-xs text-gray-500">{new Date(err.created).toLocaleString('fr-FR')}</span>
              </div>
              <p className="truncate text-sm font-medium text-gray-100">{err.message}</p>
            </Card>
          ))}
        </div>
      )}

      <DetailPanel
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.message ?? ''}
        subtitle={selected ? new Date(selected.created).toLocaleString('fr-FR') : undefined}
        footer={
          selected && (
            <>
              {!selected.resolved && (
                <Button variant="secondary" onClick={() => resolveMutation.mutate(selected.id)}>
                  <Check className="h-4 w-4" /> Marquer comme résolu
                </Button>
              )}
              <Button variant="danger" onClick={() => deleteMutation.mutate(selected.id)}>
                <Trash2 className="h-4 w-4" /> Supprimer
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone={levelTone[selected.level] ?? 'default'}>{selected.level}</Badge>
              <Badge>{selected.platform}</Badge>
              <Badge tone={selected.environment === 'production' ? 'danger' : 'default'}>{selected.environment}</Badge>
              <Badge tone={selected.resolved ? 'success' : 'warning'}>
                {selected.resolved ? 'Résolue' : 'Non résolue'}
              </Badge>
            </div>
            <DetailField label="Écran" value={selected.screen} />
            <DetailField label="Version app" value={selected.appVersion} />
            <DetailField label="Utilisateur" value={selected.userId} />
            <DetailField label="Source" value={selected.source} />
            <DetailField label="Contexte" value={selected.extra} />
            <DetailField
              label="Stack trace"
              value={selected.stack && <pre className="overflow-x-auto rounded-lg bg-bg p-3 text-xs text-gray-400">{selected.stack}</pre>}
            />
          </div>
        )}
      </DetailPanel>
    </div>
  )
}
