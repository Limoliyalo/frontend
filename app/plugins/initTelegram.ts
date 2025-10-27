/// <reference types="@twa-dev/types" />

export default defineNuxtPlugin(nuxtApp => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const WebApp = (window as any).Telegram.WebApp

        // Инициализируем WebApp
        WebApp.ready()
        WebApp.expand()
    }
})
