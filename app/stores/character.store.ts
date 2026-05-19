import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isApiStatus, useApi } from '~/composables/useApi'

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
    const isLoaded = ref(false)
    let loadPromise: Promise<Character | null> | null = null

    const myCharacter = computed<Character | null>(() => character.value)
    const isRegistered = computed<boolean>(() => character.value !== null)

    async function loadMyCharacter(force = false): Promise<Character | null> {
        if (isLoaded.value && !force) return character.value
        if (loadPromise && !force) return loadPromise

        loadPromise = apiRequest<Character>('/characters/me', {
            method: 'GET',
        })
            .then(data => {
                character.value = data
                isLoaded.value = true
                return data
            })
            .catch((error: unknown) => {
                if (!isApiStatus(error, 404)) throw error
                character.value = null
                isLoaded.value = true
                return null
            })
            .finally(() => {
                loadPromise = null
            })

        return loadPromise
    }

    async function createCharacter(name: string, sex: string): Promise<void> {
        await apiRequest<Character>('/characters/me', {
            method: 'POST',
            body: JSON.stringify({ name, sex }),
        })
        await loadMyCharacter(true)
    }

    return {
        character,
        isLoaded,
        myCharacter,
        isRegistered,
        loadMyCharacter,
        ensureMyCharacterLoaded: loadMyCharacter,
        createCharacter,
    }
})
