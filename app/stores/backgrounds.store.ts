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
                    error
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
                    }
                )
                if (newCharacterItem) {
                    this.characterBackgrounds.push(newCharacterItem)
                }
                console.log(`Фон ${background_id} успешно куплен`)
            } catch (error) {
                console.error(
                    `Ошибка при покупке Фона ${background_id}:`,
                    error
                )
            }
        },
        async equipMyBackground(character_background_id: string) {
            const { apiRequest } = useApi()
            try {
                await apiRequest(
                    `/character-backgrounds/me/${character_background_id}/equip`,
                    {
                        method: 'POST',
                    }
                )
                console.log('Фон успешно экипирован')
                const equippedItem = this.characterBackgrounds.find(
                    item => item.id === character_background_id
                )
                if (!equippedItem) return
                equippedItem.is_active = true
            } catch (error) {
                console.error('Ошибка при экипировке Фона:', error)
            }
        },
        async unequipMyBackground(character_background_id: string) {
            const { apiRequest } = useApi()
            try {
                await apiRequest(
                    `/character-backgrounds/me/${character_background_id}/unequip`,
                    {
                        method: 'POST',
                    }
                )
                console.log('Фон успешно снят с экипировки')
                const itemToUnequip = this.characterBackgrounds.find(
                    item => item.id === character_background_id
                )
                if (itemToUnequip) {
                    itemToUnequip.is_active = false
                }
            } catch (error) {
                console.error('Ошибка при снятии с экипировки Фона:', error)
            }
        },
    },
})
