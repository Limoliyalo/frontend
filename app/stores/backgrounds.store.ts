import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useMyUserStore } from '~/stores/user.store'
import type {
    Background,
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
    const backgroundsLoaded = ref(false)
    const characterBackgroundsLoaded = ref(false)

    let backgroundsPromise: Promise<void> | null = null
    let characterBackgroundsPromise: Promise<void> | null = null
    let ensurePromise: Promise<void> | null = null

    const allBackgrounds = computed<Background[]>(() => backgrounds.value)
    const backgroundById = computed(
        () => new Map(backgrounds.value.map(background => [background.id, background])),
    )

    function updateActiveBackgroundForHome(): void {
        const active = characterBackgrounds.value.find(cb => cb.is_active)
        activeBackgroundForHome.value = active
            ? (backgroundById.value.get(active.background_id) ?? null)
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

    async function loadBackgroundsCatalog(force = false): Promise<void> {
        if (backgroundsLoaded.value && !force) return
        if (backgroundsPromise && !force) return backgroundsPromise

        backgroundsPromise = apiRequest<Background[]>('/backgrounds/catalog', {
            method: 'GET',
        })
            .then(data => {
                backgrounds.value = data
                backgroundsLoaded.value = true
                updateActiveBackgroundForHome()
            })
            .finally(() => {
                backgroundsPromise = null
            })

        return backgroundsPromise
    }

    async function loadCharacterBackgrounds(force = false): Promise<void> {
        if (characterBackgroundsLoaded.value && !force) return
        if (characterBackgroundsPromise && !force) {
            return characterBackgroundsPromise
        }

        characterBackgroundsPromise = apiRequest<CharacterBackground[]>(
            '/character-backgrounds/me',
            { method: 'GET' },
        )
            .then(data => {
                characterBackgrounds.value = data
                characterBackgroundsLoaded.value = true
                updateActiveBackgroundForHome()
            })
            .finally(() => {
                characterBackgroundsPromise = null
            })

        return characterBackgroundsPromise
    }

    async function ensureBackgroundsLoaded(force = false): Promise<void> {
        if (isLoaded.value && !force) return
        if (ensurePromise && !force) return ensurePromise

        ensurePromise = Promise.all([
            loadBackgroundsCatalog(force),
            loadCharacterBackgrounds(force),
        ])
            .then(() => {
                isLoaded.value = true
            })
            .finally(() => {
                ensurePromise = null
            })

        return ensurePromise
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

        await userStore.loadUserStatistic(true)
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
            body: JSON.stringify({ background_id: char.background_id }),
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
            body: JSON.stringify({ background_id: char.background_id }),
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
        backgroundsLoaded,
        characterBackgroundsLoaded,

        allBackgrounds,
        backgroundById,

        loadBackgroundsCatalog,
        loadCharacterBackgrounds,
        ensureBackgroundsLoaded,
        purchaseBackground,
        equipBackground,
        unequipBackground,
        toggleFavoriteBackground,
    }
})
