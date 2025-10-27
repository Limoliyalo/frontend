<template>
    <div></div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useMyUserStore } from '../stores/user.store'

const initUser = async () => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const WebApp = (window as any).Telegram.WebApp
        const user = WebApp.initDataUnsafe?.user

        if (user) {
            console.log('Пользователь Telegram:', user)

            // Ждем полной инициализации Vue и Pinia
            await nextTick()

            // Дополнительная задержка для гарантии готовности store
            setTimeout(() => {
                try {
                    const userStore = useMyUserStore()
                    userStore.setUser(user)
                    console.log('Пользователь успешно загружен в store')
                } catch (error) {
                    console.error(
                        'Ошибка при загрузке пользователя в store:',
                        error
                    )
                    // Повторяем попытку через некоторое время
                    setTimeout(() => {
                        try {
                            const userStore = useMyUserStore()
                            userStore.setUser(user)
                            console.log(
                                'Пользователь успешно загружен в store (повторная попытка)'
                            )
                        } catch (retryError) {
                            console.error(
                                'Ошибка при повторной загрузке пользователя:',
                                retryError
                            )
                        }
                    }, 100)
                }
            }, 50)
        }
    }
}

onMounted(() => {
    initUser()
})
</script>
