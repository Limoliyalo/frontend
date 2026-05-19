import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
import type { Category } from '~/types/categories/categories'

export const useCategoriesStore = defineStore('categoriesStore', () => {
    const { apiRequest } = useApi()

    const categories = ref<Category[]>([])
    const isLoading = ref(false)
    const isLoaded = ref(false)
    let loadPromise: Promise<void> | null = null

    const allCategories = computed<Category[]>(() => categories.value)
    const categoryById = computed(
        () => new Map(categories.value.map(category => [category.id, category])),
    )

    const getCategoryById = (id: string): Category | undefined =>
        categoryById.value.get(id)

    async function loadCategories(force = false): Promise<void> {
        if (isLoaded.value && !force) return
        if (loadPromise && !force) return loadPromise

        isLoading.value = true
        loadPromise = apiRequest<Category[]>('/item-categories/catalog', {
            method: 'GET',
        })
            .then(data => {
                categories.value = data
                isLoaded.value = true
            })
            .finally(() => {
                isLoading.value = false
                loadPromise = null
            })

        return loadPromise
    }

    return {
        categories,
        isLoading,
        isLoaded,
        allCategories,
        categoryById,
        getCategoryById,
        loadCategories,
        ensureCategoriesLoaded: loadCategories,
    }
})
