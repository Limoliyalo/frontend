import { defineStore } from 'pinia'
import { useApi } from '#imports'
import { useMyUserStore } from '~/stores/user.store'
import type {
    BackgroundState,
    CharacterBackground,
} from '~/types/backgrounds/backgrounds'

const resolveBackgroundPurchaseState = (
    payload: Partial<CharacterBackground>,
    fallbackIsPurchased = false,
) => {
    if (typeof payload.is_purchased === 'boolean') {
        return payload.is_purchased
    }

    return typeof payload.purchased_at === 'string' || fallbackIsPurchased
}

const normalizeCharacterBackground = (
    payload: unknown,
): CharacterBackground | null => {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const data = payload as Partial<CharacterBackground>

    if (
        typeof data.id !== 'string' ||
        typeof data.character_id !== 'string' ||
        typeof data.background_id !== 'string'
    ) {
        return null
    }

    return {
        id: data.id,
        character_id: data.character_id,
        background_id: data.background_id,
        is_active: !!data.is_active,
        is_favorite: !!data.is_favorite,
        is_purchased: resolveBackgroundPurchaseState(data),
        purchased_at:
            typeof data.purchased_at === 'string' ? data.purchased_at : null,
    }
}

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
            const activeChar = this.characterBackgrounds.find(
                cb => cb.is_active === true,
            )
            if (!activeChar) {
                this.activeBackgroundForHome = null
                return
            }
            const fromCatalog = this.backgrounds.find(
                b => b.id === activeChar.background_id,
            )
            this.activeBackgroundForHome = fromCatalog ?? null
        },
        async loadBackgroundsCatalog() {
            const { apiRequest } = useApi()
            try {
                const data = await apiRequest('/backgrounds/catalog', {
                    method: 'GET',
                })
                this.backgrounds = data
                this.updateActiveBackgroundForHome()
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
                this.characterBackgrounds = Array.isArray(data)
                    ? data
                          .map(background =>
                              normalizeCharacterBackground(background),
                          )
                          .filter(
                              (
                                  background,
                              ): background is CharacterBackground =>
                                  background !== null,
                          )
                    : []
                this.updateActiveBackgroundForHome()
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
            const userStore = useMyUserStore()
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

                const normalized = normalizeCharacterBackground({
                    ...(newCharacterItem && typeof newCharacterItem === 'object'
                        ? newCharacterItem
                        : {}),
                    background_id,
                    is_purchased: true,
                })

                if (normalized) {
                    const existingIndex = this.characterBackgrounds.findIndex(
                        cb => cb.background_id === background_id,
                    )

                    if (existingIndex >= 0) {
                        const currentBackground =
                            this.characterBackgrounds[existingIndex]
                        if (!currentBackground) return

                        this.characterBackgrounds[existingIndex] = {
                            ...currentBackground,
                            ...normalized,
                            is_favorite:
                                normalized.is_favorite ||
                                currentBackground.is_favorite,
                            is_purchased: true,
                            purchased_at:
                                normalized.purchased_at ??
                                currentBackground.purchased_at ??
                                new Date().toISOString(),
                        }
                    } else {
                        this.characterBackgrounds.push({
                            ...normalized,
                            is_purchased: true,
                            purchased_at:
                                normalized.purchased_at ??
                                new Date().toISOString(),
                        })
                    }
                } else {
                    const existingBackground = this.characterBackgrounds.find(
                        cb => cb.background_id === background_id,
                    )

                    if (existingBackground) {
                        existingBackground.is_purchased = true
                        existingBackground.purchased_at =
                            existingBackground.purchased_at ??
                            new Date().toISOString()
                    } else {
                        await this.loadCharacterBackgrounds()
                    }
                }

                await userStore.loadUserStatistic()
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
                this.updateActiveBackgroundForHome()
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
                this.updateActiveBackgroundForHome()
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
                            is_purchased: resolveBackgroundPurchaseState(
                                payload,
                                currentBackground.is_purchased,
                            ),
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
                            is_purchased: resolveBackgroundPurchaseState(
                                payload,
                            ),
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
