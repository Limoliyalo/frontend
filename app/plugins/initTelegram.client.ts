/// <reference types="@twa-dev/types" />

import { useMyUserStore } from '~/stores/user.store'

export default defineNuxtPlugin(() => {
    if (process.server) return

    const tg = window.Telegram?.WebApp
    const userStore = useMyUserStore()

    // Telegram SDK доступен
    if (tg) {
        tg.ready()
        tg.expand()

        const user = tg.initDataUnsafe?.user
        const initData = tg.initData

        if (user && initData) {
            userStore.setUser(user, initData)
        } else {
            // Если Telegram не передал initData — пробуем восстановить из localStorage
            userStore.loadFromStorage()
        }
    } else {
        console.warn('Telegram WebApp SDK не найден, загружаем из localStorage')
        userStore.loadFromStorage()
    }
})
