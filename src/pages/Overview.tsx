import { useQuery } from '@tanstack/react-query'
import { Users, FileText, MessageSquare, AlertTriangle, Bell, StickyNote } from 'lucide-react'
import { api, type AdminStats } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

const cards: { key: keyof AdminStats; label: string; icon: typeof Users; danger?: boolean }[] = [
  { key: 'users', label: 'Utilisateurs', icon: Users },
  { key: 'articles', label: 'Articles', icon: FileText },
  { key: 'comments', label: 'Commentaires', icon: MessageSquare },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'unresolvedErrors', label: 'Erreurs non résolues', icon: AlertTriangle, danger: true },
  { key: 'pushTokens', label: 'Appareils enregistrés', icon: Bell },
]

export default function Overview() {
  const { data, isLoading } = useQuery({ queryKey: ['stats'], queryFn: api.getStats })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Vue d'ensemble</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ key, label, icon: Icon, danger }) => (
            <Card key={key} className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${danger ? 'bg-danger/15 text-red-400' : 'bg-primary/15 text-primary'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.stats[key] ?? '—'}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
