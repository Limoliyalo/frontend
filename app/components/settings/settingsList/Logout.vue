<template>
    <div class="flex items-center justify-between p-4">
        <div class="flex items-center space-x-3">
            <div
                class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
            >
                <Icon
                    name="hugeicons:logout-01"
                    size="20"
                    class="text-red-600"
                />
            </div>
            <div>
                <h3 class="text-lg font-medium text-gray-900">
                    Выйти из системы
                </h3>
                <p class="text-sm text-gray-500">Завершить текущую сессию</p>
            </div>
        </div>
        <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
            Выйти
        </button>
    </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/store/auth.store'

const authStore = useAuthStore()

const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        authStore.logout()
    }
}
</script>
