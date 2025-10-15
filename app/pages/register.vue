<script setup lang="ts">
// Объявляем глобальный тип, чтобы TypeScript знал о window.Telegram
declare global {
    interface Window {
        Telegram?: any
    }
}

import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/store/auth.store'

const authStore = useAuthStore()

// Создаем переменные для Telegram ID и пароля
const tgId = ref<number | null>(null)
const password = ref('')

// onMounted() - эта функция выполнится, как только страница загрузится в браузере.
// Идеальное место, чтобы получить данные из Telegram.
onMounted(() => {
    try {
        // В настоящем приложении Telegram Mini App ID пользователя получают так:
        tgId.value = window.Telegram.WebApp.initDataUnsafe.user.id

        // ДЛЯ ТЕСТИРОВАНИЯ: мы временно подставим сюда тестовый ID.
        // Замените 123456789 на реальный ID для проверки работы логики.
        // tgId.value = 3

        if (!tgId.value) {
            console.error('Не удалось получить Telegram ID.')
            alert('Ошибка: не удалось определить ваш Telegram ID.')
        }
    } catch (error) {
        console.error('Ошибка при получении Telegram ID:', error)
        alert('Приложение должно быть запущено через Telegram.')
    }
})

// Функция для регистрации
const handleRegister = async () => {
    if (!tgId.value || !password.value) {
        alert('Пожалуйста, введите пароль.')
        return
    }
    // Вызываем действие 'register' для регистрации пользователя
    await authStore.regNewUser({
        telegram_id: Number(tgId.value),
        password: password.value,
    })
}
</script>

<template>
    <div class="login-container">
        <div class="login-box">
            <h2>Регистрация</h2>
            <form @submit.prevent="handleRegister">
                <div class="input-group">
                    <label for="tgId">Ваш Telegram ID</label>
                    <!-- 
            Это поле теперь нередактируемое (disabled).
            Оно просто отображает ID, который мы "получили" при загрузке.
           -->
                    <input
                        id="tgId"
                        v-model="tgId"
                        type="text"
                        name="tgId"
                        disabled
                    />
                </div>
                <div class="input-group">
                    <label for="password">Пароль</label>
                    <!-- Полю для пароля добавили autofocus, чтобы на нем сразу был курсор -->
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        name="password"
                        required
                        autofocus
                    />
                </div>
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    </div>
</template>

<!-- Стили можно оставить без изменений -->
<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
}
.login-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
}

h2 {
    margin-bottom: 1.5rem;
    color: #333;
}

.input-group {
    margin-bottom: 1.5rem;
    text-align: left;
}

.input-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
}

.input-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

button:hover {
    background-color: #0056b3;
}
</style>
