import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '#imports'
import { useMyUserStore } from '~/stores/user.store'
import type {
    Background,
    BackgroundState,
    CharacterBackground,
} from '~/types/backgrounds/backgrounds'

const mergeCharacterBackground = (
    current: CharacterBackground,
    patch: Partial<CharacterBackground>,
): CharacterBackground => ({
    ...current,
    ...patch,
    purchased_at: patch.purchased_at ?? current.purchased_at,
    is_favorite: patch.is_favorite ?? current.is_favorite,
})

export const useMyBackgroundsStore = defineStore('backgroundsStore', () => {
    const { apiRequest } = useApi()

    const backgrounds = ref<Background[]>([])
    const characterBackgrounds = ref<CharacterBackground[]>([])
    const activeBackgroundForHome = ref<Background | null>(null)
    const isLoaded = ref(false)

    const allBackgrounds = computed<Background[]>(() => backgrounds.value)

    function updateActiveBackgroundForHome(): void {
        const active = characterBackgrounds.value.find(cb => cb.is_active)
        activeBackgroundForHome.value = active
            ? (backgrounds.value.find(b => b.id === active.background_id) ??
              null)
            : null
    }

    function upsertCharacterBackground(updated: CharacterBackground): void {
        const index = characterBackgrounds.value.findIndex(
            cb => cb.background_id === updated.background_id,
        )
        if (index >= 0) {
            characterBackgrounds.value[index] = mergeCharacterBackground(
                characterBackgrounds.value[index]!,
                updated,
            )
        } else {
            characterBackgrounds.value.push(updated)
        }
    }

    async function loadBackgroundsCatalog(): Promise<void> {
        backgrounds.value = await apiRequest<Background[]>(
            '/backgrounds/catalog',
            {
                method: 'GET',
            },
        )
        updateActiveBackgroundForHome()
    }

    async function loadCharacterBackgrounds(): Promise<void> {
        characterBackgrounds.value = await apiRequest<CharacterBackground[]>(
            '/character-backgrounds/me',
            { method: 'GET' },
        )
        updateActiveBackgroundForHome()
    }

    async function ensureBackgroundsLoaded(): Promise<void> {
        if (isLoaded.value) return
        await Promise.all([loadBackgroundsCatalog(), loadCharacterBackgrounds()])
        isLoaded.value = true
    }

    async function purchaseBackground(background_id: string): Promise<void> {
        const userStore = useMyUserStore()

        const response = await apiRequest<CharacterBackground>(
            '/character-backgrounds/me/purchase',
            {
                method: 'POST',
                body: JSON.stringify({ background_id }),
            },
        )

        upsertCharacterBackground({
            ...response,
            is_purchased: true,
            purchased_at: response.purchased_at ?? new Date().toISOString(),
        })

        await userStore.loadUserStatistic()
    }

    async function equipBackground(
        character_background_id: string,
    ): Promise<void> {
        const char = characterBackgrounds.value.find(
            cb => cb.id === character_background_id,
        )
        if (!char) return

        await apiRequest('/character-backgrounds/me/equip', {
            method: 'POST',
            body: JSON.stringify({ background_id: char.id }),
        })

        characterBackgrounds.value.forEach(cb => (cb.is_active = false))
        char.is_active = true
        updateActiveBackgroundForHome()
    }

    async function unequipBackground(
        character_background_id: string,
    ): Promise<void> {
        const char = characterBackgrounds.value.find(
            cb => cb.id === character_background_id,
        )
        if (!char) return

        await apiRequest('/character-backgrounds/me/unequip', {
            method: 'POST',
            body: JSON.stringify({ background_id: char.id }),
        })

        char.is_active = false
        updateActiveBackgroundForHome()
    }

    async function toggleFavoriteBackground(
        background_id: string,
    ): Promise<void> {
        const response = await apiRequest<CharacterBackground>(
            '/backgrounds/me/toggle-favorite',
            {
                method: 'POST',
                body: JSON.stringify({ background_id }),
            },
        )

        upsertCharacterBackground(response)
    }

    return {
        backgrounds,
        characterBackgrounds,
        activeBackgroundForHome,
        isLoaded,

        allBackgrounds,

        loadBackgroundsCatalog,
        loadCharacterBackgrounds,
        ensureBackgroundsLoaded,
        purchaseBackground,
        equipBackground,
        unequipBackground,
        toggleFavoriteBackground,
    }
})
