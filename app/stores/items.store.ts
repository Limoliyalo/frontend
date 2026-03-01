import { defineStore } from 'pinia'
import { useApi } from '#imports'
import type { ItemState } from '~/types/items/items'

export const useItemsStore = defineStore('itemsStore', {
    state: (): ItemState => ({
        items: [],
        characterItems: [],
        isLoading: false,
    }),
    getters: {
        allItems: state => state.items,
        allCharacterItems: state => state.characterItems,
        getCharacterItemById: state => (id: string) => {
            return state.characterItems.find(item => item.id === id)
        },
        getCharacterItemByItemId: state => (itemId: string) => {
            return state.characterItems.find(ci => ci.item_id === itemId)
        },
        getItemById: state => (id: string) => {
            return state.items.find(item => item.id === id)
        },
        getAllFavoriteCharacterItems: state => {
            const favoriteItemIds = new Set(
                state.characterItems
                    .filter(charItem => charItem.is_favorite)
                    .map(charItem => charItem.item_id),
            )
            return state.items.filter(item => favoriteItemIds.has(item.id))
        },
        getNonFavoriteCatalogItems: state => {
            return state.items.filter(item => {
                const charItem = state.characterItems.find(
                    ci => ci.item_id === item.id,
                )
                return !charItem || !charItem.is_favorite
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
                    data,
                )
            } catch (error) {
                console.error(
                    'Ошибка при загрузке пользовательских предметов:',
                    error,
                )
            } finally {
                this.isLoading = false
            }
        },
        async purchaseItem(item_id: string) {
            const { apiRequest } = useApi()
            try {
                const newCharacterItem = await apiRequest(
                    '/character-items/me/purchase',
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            item_id: item_id,
                        }),
                    },
                )
                if (newCharacterItem) {
                    this.characterItems.push(newCharacterItem)
                }
                console.log(`Предмет ${item_id} успешно куплен`)
            } catch (error) {
                console.error(`Ошибка при покупке предмета ${item_id}:`, error)
            }
        },
        async giveMeMoney(amount: number) {
            const { apiRequest } = useApi()
            try {
                await apiRequest('/users/me/deposit', {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: amount,
                    }),
                })
                console.log('Деньги успешно выдано')
            } catch (error) {
                console.error('Ошибка при выдаче денег:', error)
            }
        },
        async equipMyItem(character_item_id: string) {
            const { apiRequest } = useApi()
            try {
                await apiRequest(
                    `/character-items/me/${character_item_id}/equip`,
                    {
                        method: 'PATCH',
                    },
                )
                console.log('Предмет успешно экипирован')
                const equippedItem = this.characterItems.find(
                    item => item.id === character_item_id,
                )
                if (!equippedItem) return
                equippedItem.is_active = true
            } catch (error) {
                console.error('Ошибка при экипировке предмета:', error)
            }
        },
        async unequipMyItem(character_item_id: string) {
            const { apiRequest } = useApi()
            try {
                await apiRequest(
                    `/character-items/me/${character_item_id}/unequip`,
                    {
                        method: 'PATCH',
                    },
                )
                console.log('Предмет успешно снят с экипировки')
                const itemToUnequip = this.characterItems.find(
                    item => item.id === character_item_id,
                )
                if (itemToUnequip) {
                    itemToUnequip.is_active = false
                }
            } catch (error) {
                console.error('Ошибка при снятии с экипировки предмета:', error)
            }
        },
        async toggleFavoriteCharacterItem(item_id: string): Promise<void> {
            const { apiRequest } = useApi()
            try {
                const updatedItem = await apiRequest(
                    `/items/me/toggle-favorite`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            item_id: item_id,
                        }),
                    },
                )
                console.log('Предмет успешно добавлен/удален из избранного')
            } catch (error) {
                console.error(
                    'Ошибка при добавлении/удалении предмета из избранного:',
                    error,
                )
            }
        },
    },
})
