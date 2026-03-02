import { defineStore } from 'pinia'
import { useApi } from '#imports'
import type { BackgroundState } from '~/types/backgrounds/backgrounds'

export const useMyBackgroundsStore = defineStore('backgroundsStore', {
    state: (): BackgroundState => ({
        backgrounds: [],
        characterBackgrounds: [],
    }),
    getters: {
        allBackgrounds: state => state.backgrounds,
    },
    actions: {
        async loadBackgroundsCatalog() {
            const { apiRequest } = useApi()
            try {
                const data = await apiRequest('/backgrounds/catalog', {
                    method: 'GET',
                })
                this.backgrounds = data
                console.log('Каталог фонов успешно загружен:', data)
            } catch (error) {
                console.error('Ошибка при загрузке каталога фонов:', error)
            }
        },
        async loadCharacterBackgrounds() {
            const { apiRequest } = useApi()

            try {
                const data = await apiRequest('/character-backgrounds/me', {
                    method: 'GET',
                })
                this.characterBackgrounds = data
                console.log('Пользовательские Фоны успешно загружены:', data)
            } catch (error) {
                console.error(
                    'Ошибка при загрузке пользовательских Фонов:',
                    error,
                )
            }
        },
        async purchaseBackground(background_id: string) {
            const { apiRequest } = useApi()
            try {
                const newCharacterItem = await apiRequest(
                    '/character-backgrounds/me/purchase',
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            background_id: background_id,
                        }),
                    },
                )
                if (newCharacterItem) {
                    await this.loadCharacterBackgrounds()
                    const added = this.characterBackgrounds.find(
                        cb => cb.background_id === background_id,
                    )
                    if (added && !added.purchased_at) {
                        added.purchased_at =
                            newCharacterItem.purchased_at ??
                            new Date().toISOString()
                    }
                }
                console.log(`Фон ${background_id} успешно куплен`)
            } catch (error) {
                console.error(
                    `Ошибка при покупке Фона ${background_id}:`,
                    error,
                )
            }
        },
        async equipMyBackground(character_background_id: string) {
            const char = this.characterBackgrounds.find(
                item => item.id === character_background_id,
            )
            if (!char) return

            const { apiRequest } = useApi()
            try {
                await apiRequest('/character-backgrounds/me/equip', {
                    method: 'POST',
                    body: JSON.stringify({ background_id: char.id }),
                })
                console.log('Фон успешно экипирован')

                this.characterBackgrounds.forEach(item => {
                    if (item.is_active) {
                        item.is_active = false
                    }
                })
                char.is_active = true
            } catch (error) {
                console.error('Ошибка при экипировке Фона:', error)
            }
        },
        async unequipMyBackground(character_background_id: string) {
            const char = this.characterBackgrounds.find(
                item => item.id === character_background_id,
            )
            if (!char) return

            const { apiRequest } = useApi()
            try {
                await apiRequest('/character-backgrounds/me/unequip', {
                    method: 'POST',
                    body: JSON.stringify({ background_id: char.id }),
                })
                console.log('Фон успешно снят с экипировки')
                char.is_active = false
            } catch (error) {
                console.error('Ошибка при снятии с экипировки Фона:', error)
            }
        },
        async toggleFavoriteCharacterBackground(
            background_id: string,
        ): Promise<void> {
            const { apiRequest } = useApi()
            try {
                const updated = await apiRequest(
                    '/backgrounds/me/toggle-favorite',
                    {
                        method: 'POST',
                        body: JSON.stringify({ background_id }),
                    },
                )

                const existingIndex = this.characterBackgrounds.findIndex(
                    cb => cb.background_id === background_id,
                )
                const existingBackground =
                    existingIndex >= 0
                        ? this.characterBackgrounds[existingIndex]
                        : null

                if (
                    updated &&
                    typeof updated === 'object' &&
                    'background_id' in updated &&
                    typeof updated.background_id === 'string'
                ) {
                    const payload = updated as Partial<
                        (typeof this.characterBackgrounds)[number]
                    > & { background_id: string }

                    const targetIndex = this.characterBackgrounds.findIndex(
                        cb => cb.background_id === payload.background_id,
                    )

                    if (targetIndex >= 0) {
                        const currentBackground =
                            this.characterBackgrounds[targetIndex]
                        if (!currentBackground) return
                        this.characterBackgrounds[targetIndex] = {
                            ...currentBackground,
                            id:
                                typeof payload.id === 'string'
                                    ? payload.id
                                    : currentBackground.id,
                            character_id:
                                typeof payload.character_id === 'string'
                                    ? payload.character_id
                                    : currentBackground.character_id,
                            background_id: payload.background_id,
                            is_active:
                                typeof payload.is_active === 'boolean'
                                    ? payload.is_active
                                    : currentBackground.is_active,
                            purchased_at:
                                payload.purchased_at ?? currentBackground.purchased_at,
                            is_favorite:
                                typeof payload.is_favorite === 'boolean'
                                    ? payload.is_favorite
                                    : !currentBackground.is_favorite,
                        }
                    } else if (
                        typeof payload.id === 'string' &&
                        typeof payload.character_id === 'string'
                    ) {
                        this.characterBackgrounds.push({
                            character_id: payload.character_id,
                            background_id: payload.background_id,
                            is_active: !!payload.is_active,
                            is_favorite:
                                typeof payload.is_favorite === 'boolean'
                                    ? payload.is_favorite
                                    : true,
                            id: payload.id,
                            purchased_at: payload.purchased_at ?? null,
                        })
                    } else if (existingBackground) {
                        existingBackground.is_favorite =
                            !existingBackground.is_favorite
                    } else {
                        await this.loadCharacterBackgrounds()
                    }
                } else if (existingBackground) {
                    existingBackground.is_favorite =
                        !existingBackground.is_favorite
                } else {
                    await this.loadCharacterBackgrounds()
                }
                console.log('Фон успешно добавлен/удален из избранного')
            } catch (error) {
                console.error(
                    'Ошибка при добавлении/удалении фона из избранного:',
                    error,
                )
            }
        },
    },
})
