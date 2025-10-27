export const useApi = () => {
    const { getUser, getInitData } = useTelegram()

    // Базовый URL вашего API
    const baseURL = 'https://your-api-url.com/api' // Замените на ваш URL

    // Функция для создания заголовков с данными пользователя
    const createHeaders = () => {
        const user = getUser()
        const initData = getInitData()

        return {
            'Content-Type': 'application/json',
            'X-User-ID': user?.id?.toString() || '',
            'X-Init-Data': initData || '',
            'X-User-Data': JSON.stringify(user || {}),
        }
    }
    // GET запрос
    const get = async (endpoint: string) => {
        const response = await $fetch(`${baseURL}${endpoint}`, {
            method: 'GET',
            headers: createHeaders(),
        })
        return response
    }

    // POST запрос
    const post = async (endpoint: string, data: any) => {
        const response = await $fetch(`${baseURL}${endpoint}`, {
            method: 'POST',
            headers: createHeaders(),
            body: data,
        })
        return response
    }

    // PUT запрос
    const put = async (endpoint: string, data: any) => {
        const response = await $fetch(`${baseURL}${endpoint}`, {
            method: 'PUT',
            headers: createHeaders(),
            body: data,
        })
        return response
    }

    // DELETE запрос
    const del = async (endpoint: string) => {
        const response = await $fetch(`${baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: createHeaders(),
        })
        return response
    }

    return {
        get,
        post,
        put,
        delete: del,
        createHeaders,
    }
}
