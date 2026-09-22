import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type AppUser } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { DetailPanel, DetailField } from '@/components/ui/detail-panel'

export default function Users() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })

  const selected = data?.find((u) => u.id === selectedId) ?? null

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Utilisateurs</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Biographie</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((user) => (
                <tr
                  key={user.id}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface-hover"
                  onClick={() => setSelectedId(user.id)}
                >
                  <td className="px-4 py-3 text-gray-100">{user.first_name} {user.name}</td>
                  <td className="px-4 py-3 text-gray-400">{user.email}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">{user.biography || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <DetailPanel
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.first_name} ${selected.name}` : ''}
        subtitle={selected?.email}
      >
        {selected && <UserDetail user={selected} />}
      </DetailPanel>
    </div>
  )
}

function UserDetail({ user }: { user: AppUser }) {
  return (
    <div>
      {user.photo && (
        <img src={`https://${user.photo}`} alt="" className="mb-4 h-20 w-20 rounded-full object-cover" />
      )}
      <DetailField label="Prénom" value={user.first_name} />
      <DetailField label="Nom" value={user.name} />
      <DetailField label="Email" value={user.email} />
      <DetailField label="Biographie" value={user.biography} />
      <DetailField label="Identifiant" value={user.id} />
    </div>
  )
}
