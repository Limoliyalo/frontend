import { defineStore } from 'pinia'
import { useApi } from '#imports'

export interface Character {
    name: string
    sex: string
    current_mood: string
    level: number
    total_experience: number
    id: string
    user_tg_id: number
    created_at: string
    updated_at: string
}

export interface CharacterState {
    character: Character | null
}

export const useMyCharacterStore = defineStore('characterStore', {
    state: (): CharacterState => ({
        character: null,
    }),
    getters: {
        getMyCharacter: state => state.character,
        isRegistered: state => !!state.character,
    },
    actions: {
        async loadMyCharacter() {
            const { apiRequest } = useApi()
            try {
                this.character = await apiRequest('/characters/me', {
                    method: 'GET',
                })
                console.log('Персонаж успешно загружен:', this.character)
                return true
            } catch (error) {
                console.error('Ошибка при загрузке персонажа:', error)
                return false
            }
        },
        async createCharacter(name: string, sex: string) {
            const { apiRequest } = useApi()
            try {
                const response = await apiRequest('/characters/me', {
                    method: 'POST',
                    body: JSON.stringify({
                        name,
                        sex,
                    }),
                })
                console.log('Character creation successful:', response)
                await this.loadMyCharacter()
                return true
            } catch (error) {
                console.error('Character creation failed:', error)
                return false
            }
        },
    },
})
