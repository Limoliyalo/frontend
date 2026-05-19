<template>
    <div v-if="!characterStore.isRegistered" class="register-container">
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
                        class="w-full px-3 py-2 rounded-md bg-black/20 text-white border border-white/30 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
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
                        class="w-full px-3 py-2 rounded-md bg-black/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
                    >
                        <option value="">Выберите пол</option>
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                    </select>
                </div>

                <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {{ isSubmitting ? 'Создаем...' : 'Подтвердить' }}
                </button>
                <p
                    v-if="errorMessage"
                    class="mt-3 text-center text-sm text-white/80"
                >
                    {{ errorMessage }}
                </p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppBootstrapStore } from '~/stores/app-bootstrap.store'
import { useMyCharacterStore } from '~/stores/character.store'

defineOptions({ name: 'CharacterRegister' })

const characterName = ref('')
const gender = ref('')
const characterStore = useMyCharacterStore()
const bootstrapStore = useAppBootstrapStore()
const isSubmitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
    errorMessage.value = ''
    isSubmitting.value = true
    try {
        await characterStore.createCharacter(characterName.value, gender.value)
        await bootstrapStore.retry()
    } catch {
        errorMessage.value = 'Ошибка создания персонажа'
    } finally {
        isSubmitting.value = false
    }
}
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
