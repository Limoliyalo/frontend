import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'

export interface Character {
    id: string
    user_tg_id: number
    name: string
    sex: string
    current_mood: string
    level: number
    total_experience: number
    created_at: string
    updated_at: string
}

export const useMyCharacterStore = defineStore('characterStore', () => {
    const { apiRequest } = useApi()

    const character = ref<Character | null>(null)

    const myCharacter = computed<Character | null>(() => character.value)
    const isRegistered = computed<boolean>(() => character.value !== null)

    async function loadMyCharacter(): Promise<void> {
        character.value = await apiRequest<Character>('/characters/me', {
            method: 'GET',
        })
    }

    async function createCharacter(name: string, sex: string): Promise<void> {
        await apiRequest<Character>('/characters/me', {
            method: 'POST',
            body: JSON.stringify({ name, sex }),
        })
        await loadMyCharacter()
    }

    return {
        character,
        myCharacter,
        isRegistered,
        loadMyCharacter,
        createCharacter,
    }
})
