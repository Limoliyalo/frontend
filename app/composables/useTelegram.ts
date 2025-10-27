export const useTelegram = () => {
    // Проверяем, что приложение запущено в Telegram
    const isTelegram = () => {
        // @ts-ignore
        return typeof window !== 'undefined' && window.Telegram?.WebApp
    }

    // Получаем объект Telegram Web App
    const getWebApp = () => {
        if (!isTelegram()) return null
        // @ts-ignore
        return window.Telegram.WebApp
    }

    // Инициализация Telegram Web App
    const initTelegram = () => {
        const webApp = getWebApp()
        if (!webApp) return false

        webApp.ready()
        webApp.expand()
        return true
    }

    // Получение данных пользователя
    const getUser = () => {
        const webApp = getWebApp()
        if (!webApp) return null

        return webApp.initDataUnsafe?.user || null
    }

    // Получение initData для верификации
    const getInitData = () => {
        const webApp = getWebApp()
        if (!webApp) return null

        return webApp.initData || null
    }

    // Получение всех данных инициализации
    const getInitDataUnsafe = () => {
        const webApp = getWebApp()
        if (!webApp) return null

        return webApp.initDataUnsafe || null
    }

    return {
        isTelegram,
        getWebApp,
        initTelegram,
        getUser,
        getInitData,
        getInitDataUnsafe,
    }
}
