import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function Comments() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['reported-comments'],
    queryFn: api.getReportedComments,
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reported-comments'] }),
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
            <Card key={comment.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge tone="danger">{comment.signalsCount} signalement(s)</Badge>
                    <span className="text-xs text-gray-500">{new Date(comment.created).toLocaleString('fr-FR')}</span>
                  </div>
                  <p className="text-sm text-gray-100">{comment.content}</p>
                  <p className="mt-1 text-xs text-gray-500">Auteur : {comment.creator} · Article : {comment.articleId}</p>
                </div>
                <Button
                  variant="ghost"
                  className="shrink-0 px-2.5 py-1.5 text-red-400"
                  onClick={() => deleteMutation.mutate(comment.id)}
                  title="Supprimer le commentaire"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
