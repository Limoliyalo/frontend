import { defineStore } from 'pinia'
import { useApi } from '#imports'
import { useMyUserStore } from '~/stores/user.store'
import type {
    BackgroundState,
    CharacterBackground,
} from '~/types/backgrounds/backgrounds'

const mergeCharacterBackground = (
    current: CharacterBackground,
    patch: Partial<CharacterBackground>,
): CharacterBackground => ({
    ...current,
    ...patch,
    purchased_at: patch.purchased_at ?? current.purchased_at,
    is_favorite: patch.is_favorite ?? current.is_favorite,
})

export const useMyBackgroundsStore = defineStore('backgroundsStore', {
    state: (): BackgroundState => ({
        backgrounds: [],
        characterBackgrounds: [],
        activeBackgroundForHome: null,
    }),

    getters: {
        allBackgrounds: state => state.backgrounds,
    },

    actions: {
        updateActiveBackgroundForHome() {
            const active = this.characterBackgrounds.find(cb => cb.is_active)
            this.activeBackgroundForHome = active
                ? (this.backgrounds.find(b => b.id === active.background_id) ??
                  null)
                : null
        },

        async loadBackgroundsCatalog() {
            const { apiRequest } = useApi()
            try {
                this.backgrounds = await apiRequest('/backgrounds/catalog', {
                    method: 'GET',
                })
                this.updateActiveBackgroundForHome()
            } catch (error) {
                console.error('Ошибка при загрузке каталога фонов:', error)
            }
        },

        async loadCharacterBackgrounds() {
            const { apiRequest } = useApi()
            try {
                this.characterBackgrounds = await apiRequest(
                    '/character-backgrounds/me',
                    { method: 'GET' },
                )
                this.updateActiveBackgroundForHome()
            } catch (error) {
                console.error(
                    'Ошибка при загрузке пользовательских фонов:',
                    error,
                )
            }
        },

        async purchaseBackground(background_id: string) {
            const { apiRequest } = useApi()
            const userStore = useMyUserStore()

            try {
                const response: CharacterBackground = await apiRequest(
                    '/character-backgrounds/me/purchase',
                    {
                        method: 'POST',
                        body: JSON.stringify({ background_id }),
                    },
                )

                const existingIndex = this.characterBackgrounds.findIndex(
                    cb => cb.background_id === background_id,
                )

                if (existingIndex >= 0) {
                    const current = this.characterBackgrounds[existingIndex]!
                    this.characterBackgrounds[existingIndex] = {
                        ...mergeCharacterBackground(current, response),
                        is_purchased: true,
                        purchased_at:
                            response.purchased_at ??
                            current.purchased_at ??
                            new Date().toISOString(),
                    }
                } else {
                    this.characterBackgrounds.push({
                        ...response,
                        is_purchased: true,
                        purchased_at:
                            response.purchased_at ?? new Date().toISOString(),
                    })
                }

                await userStore.loadUserStatistic()
            } catch (error) {
                console.error(
                    `Ошибка при покупке фона ${background_id}:`,
                    error,
                )
            }
        },

        async equipMyBackground(character_background_id: string) {
            const char = this.characterBackgrounds.find(
                cb => cb.id === character_background_id,
            )
            if (!char) return

            const { apiRequest } = useApi()
            try {
                await apiRequest('/character-backgrounds/me/equip', {
                    method: 'POST',
                    body: JSON.stringify({ background_id: char.id }),
                })

                this.characterBackgrounds.forEach(cb => {
                    cb.is_active = false
                })
                char.is_active = true
                this.updateActiveBackgroundForHome()
            } catch (error) {
                console.error('Ошибка при экипировке фона:', error)
            }
        },

        async unequipMyBackground(character_background_id: string) {
            const char = this.characterBackgrounds.find(
                cb => cb.id === character_background_id,
            )
            if (!char) return

            const { apiRequest } = useApi()
            try {
                await apiRequest('/character-backgrounds/me/unequip', {
                    method: 'POST',
                    body: JSON.stringify({ background_id: char.id }),
                })

                char.is_active = false
                this.updateActiveBackgroundForHome()
            } catch (error) {
                console.error('Ошибка при снятии фона:', error)
            }
        },

        async toggleFavoriteCharacterBackground(
            background_id: string,
        ): Promise<void> {
            const { apiRequest } = useApi()

            try {
                const response: CharacterBackground = await apiRequest(
                    '/backgrounds/me/toggle-favorite',
                    {
                        method: 'POST',
                        body: JSON.stringify({ background_id }),
                    },
                )

                const existingIndex = this.characterBackgrounds.findIndex(
                    cb => cb.background_id === background_id,
                )

                if (existingIndex >= 0) {
                    this.characterBackgrounds[existingIndex] =
                        mergeCharacterBackground(
                            this.characterBackgrounds[existingIndex]!,
                            response,
                        )
                } else {
                    this.characterBackgrounds.push(response)
                }
            } catch (error) {
                console.error('Ошибка при переключении избранного фона:', error)
            }
        },
    },
})
