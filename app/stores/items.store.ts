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
        async purchaseItem(item_id: string) {
            const { apiRequest } = useApi()
            try {
                const newCharacterItem = await apiRequest(
                    '/character-items/me/purchase',
                    {
                        method: 'POST',
                        query: {
                            item_id: item_id,
                        },
                    }
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
                    }
                )
                console.log('Предмет успешно экипирован')
                const equippedItem = this.characterItems.find(
                    item => item.id === character_item_id
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
                    }
                )
                console.log('Предмет успешно снят с экипировки')
                const itemToUnequip = this.characterItems.find(
                    item => item.id === character_item_id
                )
                if (itemToUnequip) {
                    itemToUnequip.is_active = false
                }
            } catch (error) {
                console.error('Ошибка при снятии с экипировки предмета:', error)
            }
        },
    },
})
