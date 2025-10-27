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
            console.log('Пользователь Telegram:', user)

            // Загружаем пользователя в store
            const userStore = useMyUserStore()
            userStore.setUser(user)
            console.log(user)
        }
    }
})
