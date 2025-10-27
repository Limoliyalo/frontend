<template>
    <div class="register-container">
        <div class="glass-container">
            <form @submit.prevent="handleSubmit">
                <div class="mb-4">
                    <label
                        for="characterName"
                        class="block text-sm font-medium mb-2"
                    >
                        Имя персонажа
                    </label>
                    <input
                        id="characterName"
                        v-model="characterName"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Введите имя персонажа"
                    />
                </div>

                <div class="mb-4">
                    <label for="gender" class="block text-sm font-medium mb-2">
                        Пол
                    </label>
                    <select
                        id="gender"
                        v-model="gender"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Выберите пол</option>
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                    </select>
                </div>

                <button
                    type="submit"
                    class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Подтвердить
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useMyUserStore } from '~/stores/user.store'

const characterName = ref('')
const gender = ref('')
const { apiRequest } = useApi()
const userStore = useMyUserStore()

const handleSubmit = async () => {
    try {
        const response = await apiRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify({
                telegram_id: userStore.getUserId,
            }),
        })
        console.log('Registration successful:', response)
    } catch (error) {
        console.error('Registration failed:', error)
        alert('Registration failed')
    }
}

onMounted(() => {
    // Автоматически вызываем регистрацию при монтировании
    handleSubmit()
})
</script>

<style scoped>
.register-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.glass-container {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    width: 400px;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>
