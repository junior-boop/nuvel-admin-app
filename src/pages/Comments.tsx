import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DetailPanel, DetailField } from '@/components/ui/detail-panel'

export default function Comments() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['reported-comments'],
    queryFn: api.getReportedComments,
  })

  const selected = data?.reportedComments?.find((c) => c.id === selectedId) ?? null

  const deleteMutation = useMutation({
    mutationFn: api.deleteComment,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['reported-comments'] })
      setSelectedId((cur) => (cur === id ? null : cur))
    },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Commentaires signalés</h1>
      {isLoading ? (
        <Spinner />
      ) : !data?.reportedComments.length ? (
        <Card>
          <p className="text-sm text-gray-500">Aucun commentaire signalé.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {data.reportedComments.map((comment) => (
            <Card
              key={comment.id}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => setSelectedId(comment.id)}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <Badge tone="danger">{comment.signalsCount} signalement(s)</Badge>
                <span className="text-xs text-gray-500">{new Date(comment.created).toLocaleString('fr-FR')}</span>
              </div>
              <p className="truncate text-sm text-gray-100">{comment.content}</p>
              <p className="mt-1 text-xs text-gray-500">Auteur : {comment.creator} · Article : {comment.articleId}</p>
            </Card>
          ))}
        </div>
      )}

      <DetailPanel
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title="Commentaire signalé"
        subtitle={selected ? new Date(selected.created).toLocaleString('fr-FR') : undefined}
        footer={
          selected && (
            <Button variant="danger" onClick={() => deleteMutation.mutate(selected.id)}>
              <Trash2 className="h-4 w-4" /> Supprimer le commentaire
            </Button>
          )
        }
      >
        {selected && (
          <div>
            <div className="mb-3">
              <Badge tone="danger">{selected.signalsCount} signalement(s)</Badge>
            </div>
            <DetailField label="Contenu" value={selected.content} />
            <DetailField label="Auteur" value={selected.creator} />
            <DetailField label="Article" value={selected.articleId} />
            <DetailField label="Identifiant" value={selected.id} />
          </div>
        )}
      </DetailPanel>
    </div>
  )
}
