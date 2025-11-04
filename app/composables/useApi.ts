import { useMyUserStore } from '~/stores/user.store'

const BASE_URL = 'https://healthity.ru/api/v1'

// Define a new options type that includes 'query'
type ApiRequestOptions = RequestInit & {
    query?: Record<string, any>;
};

export const useApi = () => {
    const userStore = useMyUserStore()

    const apiRequest = async (
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<any> => {
        // Destructure our custom 'query' option from the standard fetch options
        const { query, ...fetchOptions } = options;

        const initData = userStore.getInitData
        
        let url = endpoint.startsWith('http')
            ? endpoint
            : `${BASE_URL}${endpoint}`

        // If a query object is provided, construct the query string
        if (query) {
            const definedQueryParams = Object.entries(query).reduce((acc, [key, value]) => {
                if (value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);
    
            const queryParams = new URLSearchParams(definedQueryParams).toString();
            if (queryParams) {
                url += `?${queryParams}`;
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(initData && { Authorization: `Bearer ${initData}` }),
            ...fetchOptions.headers,
        }

        const response = await fetch(url, {
            ...fetchOptions, // Pass the original fetch options (without query)
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
