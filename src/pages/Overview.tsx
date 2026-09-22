import { useQuery } from '@tanstack/react-query'
import { Users, FileText, MessageSquare, AlertTriangle, Bell, StickyNote } from 'lucide-react'
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { api, type AdminStats, type StatsHistory } from '@/lib/api'
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

function TrendChart({ data, danger }: { data: StatsHistory[keyof StatsHistory]; danger?: boolean }) {
  const color = danger ? '#f87171' : '#818cf8'
  const gradientId = `trend-${danger ? 'danger' : 'primary'}`
  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={(date: string) => date.slice(-2)}
          tick={{ fontSize: 10, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#a1a1aa' }}
          formatter={(value: number) => [value, 'Nouveaux']}
        />
        <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default function Overview() {
  const { data, isLoading } = useQuery({ queryKey: ['stats'], queryFn: api.getStats })
  const { data: historyData } = useQuery({
    queryKey: ['stats-history'],
    queryFn: () => api.getStatsHistory(30),
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Vue d'ensemble</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ key, label, icon: Icon, danger }) => {
            const history = historyData?.history[key as keyof StatsHistory]
            return (
              <Card key={key} className="overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${danger ? 'bg-danger/15 text-red-400' : 'bg-primary/15 text-primary'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{data?.stats[key] ?? '—'}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                </div>
                <div className="-mx-5 -mb-5 mt-3">
                  {history ? <TrendChart data={history} danger={danger} /> : <div className="h-16" />}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
