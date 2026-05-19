import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useMyUserStore } from '~/stores/user.store'
import type {
    Item,
    CharacterItem,
    ItemWithBackgroundPosition,
} from '~/types/items/items'

export const useItemsStore = defineStore('itemsStore', () => {
    const { apiRequest } = useApi()

    const items = ref<Item[]>([])
    const characterItems = ref<CharacterItem[]>([])
    const isLoading = ref(false)
    const itemsLoaded = ref(false)
    const characterItemsLoaded = ref(false)

    /** Кэш отфильтрованных позиций по background_id. Сбрасывается при equip/unequip. */
    const itemsWithPositionsCache = ref<
        Record<string, ItemWithBackgroundPosition[]>
    >({})

    let itemsPromise: Promise<void> | null = null
    let characterItemsPromise: Promise<void> | null = null
    const positionsPromises: Record<
        string,
        Promise<ItemWithBackgroundPosition[]> | undefined
    > = {}

    const allItems = computed<Item[]>(() => items.value)
    const allCharacterItems = computed<CharacterItem[]>(
        () => characterItems.value,
    )
    const itemById = computed(
        () => new Map(items.value.map(item => [item.id, item])),
    )
    const characterItemById = computed(
        () => new Map(characterItems.value.map(item => [item.id, item])),
    )
    const characterItemByItemId = computed(
        () => new Map(characterItems.value.map(item => [item.item_id, item])),
    )

    const favoriteItems = computed<Item[]>(() => {
        const favoriteItemIds = new Set(
            characterItems.value
                .filter(ci => ci.is_favorite)
                .map(ci => ci.item_id),
        )
        return items.value.filter(item => favoriteItemIds.has(item.id))
    })

    const nonFavoriteItems = computed<Item[]>(() =>
        items.value.filter(item => {
            const ci = characterItemByItemId.value.get(item.id)
            return !ci?.is_favorite
        }),
    )

    const getCharacterItemById = (id: string): CharacterItem | undefined =>
        characterItemById.value.get(id)

    const getCharacterItemByItemId = (
        itemId: string,
    ): CharacterItem | undefined =>
        characterItemByItemId.value.get(itemId)

    const getItemById = (id: string): Item | undefined =>
        itemById.value.get(id)

    function upsertCharacterItem(updated: CharacterItem): void {
        const index = characterItems.value.findIndex(
            ci => ci.item_id === updated.item_id,
        )
        if (index >= 0) {
            characterItems.value[index] = {
                ...characterItems.value[index]!,
                ...updated,
            }
        } else {
            characterItems.value.push(updated)
        }
    }

    function invalidateItemsWithPositions(): void {
        itemsWithPositionsCache.value = {}
        Object.keys(positionsPromises).forEach(key => {
            positionsPromises[key] = undefined
        })
    }

    async function loadItemsCatalog(force = false): Promise<void> {
        if (itemsLoaded.value && !force) return
        if (itemsPromise && !force) return itemsPromise

        isLoading.value = true
        itemsPromise = apiRequest<Item[]>('/items/catalog', {
            method: 'GET',
        })
            .then(data => {
                items.value = data
                itemsLoaded.value = true
            })
            .finally(() => {
                isLoading.value = false
                itemsPromise = null
            })

        return itemsPromise
    }

    async function loadCharacterItems(force = false): Promise<void> {
        if (characterItemsLoaded.value && !force) return
        if (characterItemsPromise && !force) return characterItemsPromise

        isLoading.value = true
        characterItemsPromise = apiRequest<CharacterItem[]>(
            '/character-items/me',
            { method: 'GET' },
        )
            .then(data => {
                characterItems.value = data
                characterItemsLoaded.value = true
            })
            .finally(() => {
                isLoading.value = false
                characterItemsPromise = null
            })

        return characterItemsPromise
    }

    async function ensureCharacterItemsLoaded(): Promise<void> {
        await loadCharacterItems()
    }

    async function ensureItemsCatalogLoaded(): Promise<void> {
        await loadItemsCatalog()
    }

    async function purchaseItem(item_id: string): Promise<void> {
        const userStore = useMyUserStore()
        const newCharacterItem = await apiRequest<CharacterItem>(
            '/character-items/me/purchase',
            {
                method: 'POST',
                body: JSON.stringify({ item_id }),
            },
        )
        upsertCharacterItem(newCharacterItem)
        invalidateItemsWithPositions()
        await userStore.loadUserStatistic(true)
    }

    async function equipItem(character_item_id: string): Promise<void> {
        await apiRequest('/character-items/me/equip', {
            method: 'PATCH',
            body: JSON.stringify({ character_item_id }),
        })

        const item = characterItemById.value.get(character_item_id)
        if (item) item.is_active = true
        invalidateItemsWithPositions()
    }

    async function unequipItem(character_item_id: string): Promise<void> {
        await apiRequest('/character-items/me/unequip', {
            method: 'PATCH',
            body: JSON.stringify({ character_item_id }),
        })

        const item = characterItemById.value.get(character_item_id)
        if (item) item.is_active = false
        invalidateItemsWithPositions()
    }

    async function toggleFavoriteItem(item_id: string): Promise<void> {
        const updated = await apiRequest<CharacterItem>(
            '/items/me/toggle-favorite',
            {
                method: 'POST',
                body: JSON.stringify({ item_id }),
            },
        )
        upsertCharacterItem(updated)
    }

    async function loadItemsWithPositionsForBackground(
        background_id: string,
        force = false,
    ): Promise<ItemWithBackgroundPosition[]> {
        if (!background_id) return []

        const cached = itemsWithPositionsCache.value[background_id]
        if (cached && !force) return cached

        const currentPromise = positionsPromises[background_id]
        if (currentPromise && !force) return currentPromise

        positionsPromises[background_id] = apiRequest<
            ItemWithBackgroundPosition[]
        >('/item-background-positions/me/items', {
            method: 'GET',
            query: { background_id },
        })
            .then(raw => {
                const filtered = raw.filter(entry => {
                    const ci = characterItemByItemId.value.get(entry.item.id)
                    return ci?.is_purchased === true && ci?.is_active === true
                })

                itemsWithPositionsCache.value[background_id] = filtered
                return filtered
            })
            .finally(() => {
                positionsPromises[background_id] = undefined
            })

        return positionsPromises[background_id]!
    }

    function getCachedItemsWithPositionsForBackground(
        background_id: string,
    ): ItemWithBackgroundPosition[] | undefined {
        if (!background_id) return undefined
        return itemsWithPositionsCache.value[background_id]
    }

    return {
        items,
        characterItems,
        isLoading,
        itemsLoaded,
        characterItemsLoaded,

        allItems,
        allCharacterItems,
        itemById,
        characterItemById,
        characterItemByItemId,
        favoriteItems,
        nonFavoriteItems,

        getItemById,
        getCharacterItemById,
        getCharacterItemByItemId,
        upsertCharacterItem,
        loadItemsCatalog,
        loadCharacterItems,
        ensureItemsCatalogLoaded,
        ensureCharacterItemsLoaded,
        purchaseItem,
        equipItem,
        unequipItem,
        toggleFavoriteItem,
        loadItemsWithPositionsForBackground,
        getCachedItemsWithPositionsForBackground,
        invalidateItemsWithPositions,
    }
})
