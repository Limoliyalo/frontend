import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
import type { Item, CharacterItem } from '~/types/items/items'

export const useItemsStore = defineStore('itemsStore', () => {
    const { apiRequest } = useApi()

    const items = ref<Item[]>([])
    const characterItems = ref<CharacterItem[]>([])
    const isLoading = ref(false)

    const allItems = computed<Item[]>(() => items.value)
    const allCharacterItems = computed<CharacterItem[]>(
        () => characterItems.value,
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
            const ci = characterItems.value.find(ci => ci.item_id === item.id)
            return !ci?.is_favorite
        }),
    )

    const getCharacterItemById = (id: string): CharacterItem | undefined =>
        characterItems.value.find(ci => ci.id === id)

    const getCharacterItemByItemId = (
        itemId: string,
    ): CharacterItem | undefined =>
        characterItems.value.find(ci => ci.item_id === itemId)

    const getItemById = (id: string): Item | undefined =>
        items.value.find(item => item.id === id)

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

    async function loadItemsCatalog(): Promise<void> {
        isLoading.value = true
        try {
            items.value = await apiRequest<Item[]>('/items/catalog', {
                method: 'GET',
            })
        } finally {
            isLoading.value = false
        }
    }

    async function loadCharacterItems(): Promise<void> {
        isLoading.value = true
        try {
            characterItems.value = await apiRequest<CharacterItem[]>(
                '/character-items/me',
                { method: 'GET' },
            )
        } finally {
            isLoading.value = false
        }
    }

    async function purchaseItem(item_id: string): Promise<void> {
        const newCharacterItem = await apiRequest<CharacterItem>(
            '/character-items/me/purchase',
            {
                method: 'POST',
                body: JSON.stringify({ item_id }),
            },
        )
        characterItems.value.push(newCharacterItem)
    }

    async function equipItem(character_item_id: string): Promise<void> {
        await apiRequest('/character-items/me/equip', {
            method: 'PATCH',
            body: JSON.stringify({ character_item_id }),
        })

        const item = characterItems.value.find(
            ci => ci.id === character_item_id,
        )
        if (item) item.is_active = true
    }

    async function unequipItem(character_item_id: string): Promise<void> {
        await apiRequest('/character-items/me/unequip', {
            method: 'PATCH',
            body: JSON.stringify({ character_item_id }),
        })

        const item = characterItems.value.find(
            ci => ci.id === character_item_id,
        )
        if (item) item.is_active = false
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

    // dev-only helper, remove before production
    async function giveMeMoney(amount: number): Promise<void> {
        await apiRequest('/users/me/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        })
    }

    return {
        items,
        characterItems,
        isLoading,

        allItems,
        allCharacterItems,
        favoriteItems,
        nonFavoriteItems,

        getItemById,
        getCharacterItemById,
        getCharacterItemByItemId,
        upsertCharacterItem,
        loadItemsCatalog,
        loadCharacterItems,
        purchaseItem,
        equipItem,
        unequipItem,
        toggleFavoriteItem,
        giveMeMoney,
    }
})
