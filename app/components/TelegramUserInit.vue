<template>
    <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMyUserStore } from '../stores/user.store'

onMounted(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const WebApp = (window as any).Telegram.WebApp
        const user = WebApp.initDataUnsafe?.user

        if (user) {
            console.log('Пользователь Telegram:', user)
            const userStore = useMyUserStore()
            userStore.setUser(user)
        }
    }
})
</script>
