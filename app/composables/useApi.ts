import { useMyUserStore } from '~/stores/user.store'

const BASE_URL = 'http://localhost:8000/api/v1'

export const useApi = () => {
    const userStore = useMyUserStore()

    const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
        const initData = userStore.getInitData
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${BASE_URL}${endpoint}`

        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(initData && { Authorization: `Bearer ${initData}` }),
            ...options.headers,
        }

        const response = await fetch(url, {
            ...options,
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
    }

    return {
        apiRequest,
    }
}
