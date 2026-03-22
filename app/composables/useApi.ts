import { useMyUserStore } from '~/stores/user.store'

const BASE_URL = 'https://healthity.ru/api/v1'

type ApiRequestOptions = RequestInit & {
    query?: Record<string, any>
}

export const useApi = () => {
    const userStore = useMyUserStore()

    const apiRequest = async <T = unknown>(
        endpoint: string,
        options: ApiRequestOptions = {},
    ): Promise<T> => {
        const { query, ...fetchOptions } = options

        const initData = userStore.initData

        let url = endpoint.startsWith('http')
            ? endpoint
            : `${BASE_URL}${endpoint}`

        if (query) {
            const definedQueryParams = Object.entries(query).reduce(
                (acc, [key, value]) => {
                    if (value !== null && value !== undefined) {
                        acc[key] = value
                    }
                    return acc
                },
                {} as Record<string, any>,
            )

            const queryParams = new URLSearchParams(
                definedQueryParams,
            ).toString()
            if (queryParams) {
                url += `?${queryParams}`
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(initData && { Authorization: `Bearer ${initData}` }),
            ...fetchOptions.headers,
        }

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
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
