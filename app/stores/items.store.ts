import { defineStore } from 'pinia'
import { useApi } from '#imports'
import type { ItemState, CharacterItemsCatalog } from '~/types/items/items'

export const useItemsStore = defineStore('itemsStore', {
    state: (): ItemState => ({
        items: [],
        characterItems: [],
        isLoading: false,
    }),
    getters: {
        allItems: state => state.items,
        getCombinedItemsCatalog(state): CharacterItemsCatalog[] {
            // Создаем Map для быстрого поиска предметов пользователя
            const characterItemsMap = new Map(
                state.characterItems.map(ci => [ci.item_id, ci])
            )

            // Проходим по каждому предмету из общего каталога
            return state.items.map(item => {
                const characterItem = characterItemsMap.get(item.id)
                return {
                    ...item,
                    is_active: characterItem?.is_active ?? false,
                    is_favorite: characterItem?.is_favorite ?? false,
                    character_item_id: characterItem?.id ?? null,
                }
            })
        },
    },
    actions: {
        async loadItemsCatalog() {
            const { apiRequest } = useApi()
            this.isLoading = true

            try {
                const data = await apiRequest('/items/catalog', {
                    method: 'GET',
                })
                this.items = data
                console.log('Каталог предметов успешно загружен:', data)
            } catch (error) {
                console.error('Ошибка при загрузке каталога предметов:', error)
            } finally {
                this.isLoading = false
            }
        },
        async loadCharacterItems() {
            const { apiRequest } = useApi()
            this.isLoading = true

            try {
                const data = await apiRequest('/character-items/me', {
                    method: 'GET',
                })
                this.characterItems = data
                console.log(
                    'Пользовательские предметы успешно загружены:',
                    data
                )
            } catch (error) {
                console.error(
                    'Ошибка при загрузке пользовательских предметов:',
                    error
                )
            } finally {
                this.isLoading = false
            }
        },
        async toggleFavorite(character_item_id: string | null) {
            const itemToUpdate = this.characterItems.find(
                item => item.id === character_item_id
            )
            if (!itemToUpdate) return

            itemToUpdate.is_favorite = !itemToUpdate.is_favorite

            const { apiRequest } = useApi()
            try {
                await apiRequest(
                    `/character-items/me/${character_item_id}/favourite`,
                    {
                        method: 'PATCH',
                    }
                )
            } catch (error) {
                console.error('Ошибка при изменении статуса избранного:', error)
                // 4. Откат в случае ошибки: если сервер вернул ошибку,
                // возвращаем локальное состояние в прежний вид
                itemToUpdate.is_favorite = !itemToUpdate.is_favorite
            }
        },
    },
})
