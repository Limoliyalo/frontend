export default defineNuxtPlugin(() => {
    // Проверяем, что мы на клиенте
    // @ts-ignore
    if (process.client) {
        // Проверяем наличие Telegram Web App
        // @ts-ignore
        if (window.Telegram?.WebApp) {
            // @ts-ignore
            const webApp = window.Telegram.WebApp

            // Инициализируем Telegram Web App
            webApp.ready()
            webApp.expand()

            console.log('Telegram Web App инициализирован')

            // Можно добавить обработчики событий
            webApp.onEvent('viewportChanged', () => {
                console.log('Viewport изменился')
            })

            webApp.onEvent('themeChanged', () => {
                console.log('Тема изменилась')
            })
        } else {
            console.log('Приложение запущено не в Telegram')
        }
    }
})
