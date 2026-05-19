import { useMyUserStore } from '~/stores/user.store'
import { useRuntimeConfig } from '#imports'

type ApiQueryValue = string | number | boolean | null | undefined
type ApiQuery = Record<string, ApiQueryValue | ApiQueryValue[]>

type ApiRequestOptions = RequestInit & {
    query?: ApiQuery
}

export class ApiError extends Error {
    status: number
    url: string
    body: string | null

    constructor(status: number, url: string, body: string | null) {
        super(`HTTP error! status: ${status}`)
        this.name = 'ApiError'
        this.status = status
        this.url = url
        this.body = body
    }
}

export const isApiError = (error: unknown): error is ApiError =>
    error instanceof ApiError

export const isApiStatus = (error: unknown, status: number): boolean =>
    isApiError(error) && error.status === status

export const useApi = () => {
    const runtimeConfig = useRuntimeConfig()

    const apiRequest = async <T = unknown>(
        endpoint: string,
        options: ApiRequestOptions = {},
    ): Promise<T> => {
        const { query, ...fetchOptions } = options

        const userStore = useMyUserStore()
        const initData = userStore.initData

        let url = endpoint.startsWith('http')
            ? endpoint
            : `${runtimeConfig.public.apiBase}${endpoint}`

        if (query) {
            const queryParams = new URLSearchParams()
            Object.entries(query).forEach(([key, value]) => {
                const values = Array.isArray(value) ? value : [value]
                values.forEach(entry => {
                    if (entry !== null && entry !== undefined) {
                        queryParams.append(key, String(entry))
                    }
                })
            })
            const queryString = queryParams.toString()
            if (queryString) url += `?${queryString}`
        }

        const headers = new Headers(fetchOptions.headers)
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
        }
        if (!headers.has('Accept')) {
            headers.set('Accept', 'application/json')
        }
        if (initData && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${initData}`)
        }

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        })

        if (!response.ok) {
            const body = await response.text().catch(() => null)
            throw new ApiError(response.status, url, body)
        }

        if (response.status === 204) {
            return null as T
        }

        const text = await response.text()
        if (!text.trim()) {
            return null as T
        }

        return JSON.parse(text) as T
    }

    return {
        apiRequest,
    }
}
