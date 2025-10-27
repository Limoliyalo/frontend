<template>
    <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMyUserStore } from '../stores/user.store'

onMounted(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return

    // Проверяем наличие Telegram WebApp
    if (!(window as any).Telegram?.WebApp) return

    const WebApp = (window as any).Telegram.WebApp
    const user = WebApp.initDataUnsafe?.user

    try {
        const userStore = useMyUserStore()

        // Загружаем initData
        userStore.loadInitData()

        if (user) {
            console.log('Пользователь Telegram:', user)
            userStore.setUser(user)
            console.log('Пользователь успешно загружен в store')
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных в store:', error)
    }
})
</script>
