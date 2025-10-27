/// <reference types="@twa-dev/types" />

import { useMyUserStore } from '~/stores/user.store'

export default defineNuxtPlugin(nuxtApp => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const WebApp = (window as any).Telegram.WebApp

        // Инициализируем WebApp
        WebApp.ready()
        WebApp.expand()

        // Получаем пользователя и сохраняем в store
        const user = WebApp.initDataUnsafe?.user
        if (user) {
            

            // Загружаем пользователя в store
            nuxtApp.hook('app:created', () => {
                const userStore = useMyUserStore()
                userStore.setUser(user)
            })
        }
    }
})
