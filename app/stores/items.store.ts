import { defineStore } from 'pinia'
import { useApi } from '#imports'
import type { ItemState } from '~/types/items/items'

export const useItemsStore = defineStore('itemsStore', {
    state: (): ItemState => ({
        items: [],
        isLoading: false,
    }),
    getters: {
        allItems: state => state.items,
        availableItems: state => state.items.filter(i => i.is_available),
        itemsByCategory: state => {
            return (categoryId: string) =>
                state.items.filter(i => i.category_id === categoryId)
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
    },
})
