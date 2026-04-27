// Minimal fetch wrapper: base URL, auth header, and structured errors.
export type TokenPair = {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown) {
    super(`API error ${status}`)
    this.status = status
    this.body = body
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(opts.headers)
  headers.set('Accept', 'application/json')
  if (opts.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (opts.token) {
    headers.set('Authorization', `Bearer ${opts.token}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...opts, headers })
  if (!res.ok) {
    const body = await parseJsonSafe(res)
    throw new ApiError(res.status, body)
  }
  return (await parseJsonSafe(res)) as T
}

