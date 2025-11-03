import { defineStore } from 'pinia'
import { useApi } from '#imports'
import type { CategoryState } from '~/types/categories/categories'

export const useCategoriesStore = defineStore('categoriesStore', {
    state: (): CategoryState => ({
        categories: [],
        isLoading: false,
    }),
    getters: {
        allCategories: state => state.categories,
        getCategoryById: state => {
            return (id: string) => state.categories.find(c => c.id === id)
        },
    },
    actions: {
        async loadCategories() {
            const { apiRequest } = useApi()
            this.isLoading = true

            try {
                const data = await apiRequest('/item-categories/catalog', {
                    method: 'GET',
                })
                this.categories = data
                console.log('Категории предметов успешно загружены:', data)
            } catch (error) {
                console.error('Ошибка при загрузке категорий предметов:', error)
            } finally {
                this.isLoading = false
            }
        },
    },
})
