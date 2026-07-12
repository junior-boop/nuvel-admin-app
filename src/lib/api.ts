const API_URL = import.meta.env.VITE_API_URL as string

const TOKEN_KEY = 'nuvel_admin_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    clearToken()
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(data?.message || data?.error || 'Une erreur est survenue', res.status)
  }

  return data as T
}

export interface AdminStats {
  users: number
  articles: number
  comments: number
  notes: number
  unresolvedErrors: number
  totalErrors: number
  pushTokens: number
}

export interface ErrorLog {
  id: string
  message: string
  stack: string | null
  level: 'fatal' | 'error' | 'warning'
  source: string
  platform: string
  appVersion: string | null
  environment: 'development' | 'production'
  userId: string | null
  screen: string | null
  extra: string | null
  resolved: number
  created: string
}

export interface ReportedComment {
  id: string
  articleId: string
  content: string
  creator: string
  signalsCount: number
  created: string
}

export interface AppUser {
  id: string
  email: string
  name: string
  first_name: string
  photo: string | null
  biography: string | null
}

export const api = {
  login: (email: string, password: string) =>
    request<{ success: boolean; accessToken: string; refreshToken: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getStats: () => request<{ success: boolean; stats: AdminStats }>('/admin/stats'),

  getErrors: (params: { resolved?: boolean; level?: string; platform?: string; environment?: string; limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.resolved !== undefined) query.set('resolved', String(params.resolved))
    if (params.level) query.set('level', params.level)
    if (params.platform) query.set('platform', params.platform)
    if (params.environment) query.set('environment', params.environment)
    if (params.limit) query.set('limit', String(params.limit))
    if (params.offset) query.set('offset', String(params.offset))
    const qs = query.toString()
    return request<{ success: boolean; errors: ErrorLog[] }>(`/errors${qs ? `?${qs}` : ''}`)
  },

  resolveError: (id: string) =>
    request<{ success: boolean }>(`/errors/${id}/resolve`, { method: 'PATCH' }),

  deleteError: (id: string) =>
    request<{ success: boolean }>(`/errors/${id}`, { method: 'DELETE' }),

  broadcastNotification: (title: string, body: string, type: 'announcement' | 'prayer_topic') =>
    request<{ success: boolean; notified: number }>('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, body, type }),
    }),

  getReportedComments: () =>
    request<{ reportedComments: ReportedComment[]; count: number }>('/comments/reported'),

  deleteComment: (commentId: string) =>
    request<{ success: boolean }>(`/comments/${commentId}/admin`, { method: 'DELETE' }),

  getUsers: () => request<AppUser[]>('/users'),
}
