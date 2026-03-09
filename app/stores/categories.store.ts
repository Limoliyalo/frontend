import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
import type { Category } from '~/types/categories/categories'

export const useCategoriesStore = defineStore('categoriesStore', () => {
    const { apiRequest } = useApi()

    const categories = ref<Category[]>([])
    const isLoading = ref(false)

    const allCategories = computed<Category[]>(() => categories.value)

    const getCategoryById = (id: string): Category | undefined =>
        categories.value.find(c => c.id === id)

    async function loadCategories(): Promise<void> {
        isLoading.value = true
        try {
            categories.value = await apiRequest<Category[]>(
                '/item-categories/catalog',
                { method: 'GET' },
            )
        } finally {
            isLoading.value = false
        }
    }

    return {
        categories,
        isLoading,
        allCategories,
        getCategoryById,
        loadCategories,
    }
})
