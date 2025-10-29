import { useMyUserStore } from '~/stores/user.store'

const BASE_URL = 'https://backend-3-4gbp.onrender.com/api/v1'

export const useApi = () => {
    const userStore = useMyUserStore()

    const apiRequest = async (
        endpoint: string,
        options: RequestInit = {}
    ): Promise<any> => {
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
            let errorBody: any = null
            const contentType = response.headers.get('content-type') || ''
            try {
                if (contentType.includes('application/json')) {
                    errorBody = await response.json()
                } else {
                    errorBody = await response.text()
                }
            } catch {
                errorBody = null
            }

            const error: any = new Error(
                `HTTP error ${response.status}: ${response.statusText}`
            )
            error.status = response.status
            error.body = errorBody
            error.url = url
            throw error
        }

        const resContentType = response.headers.get('content-type') || ''
        if (resContentType.includes('application/json')) {
            return response.json()
        }
        return response.text()
    }

    return {
        apiRequest,
    }
}
