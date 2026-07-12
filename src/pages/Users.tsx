import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function Users() {
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: api.getUsers })

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
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-gray-100">{user.first_name} {user.name}</td>
                  <td className="px-4 py-3 text-gray-400">{user.email}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">{user.biography || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
