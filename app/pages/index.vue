<template>
    <div>
        <img
            v-if="activeBackgroundForHome?.picture_url"
            class="fullscreen-bg"
            :src="activeBackgroundForHome.picture_url"
            :alt="activeBackgroundForHome.name"
        />
        <img v-else class="fullscreen-bg" :src="synthWaveGirlImage" />
        <div v-for="item in itemsWithPositions" :key="item.item.id">
            <div
                :style="{
                    top: item.position.position_y + '%',
                    left: item.position.position_x + '%',
                    zIndex: item.position.position_z,
                }"
                class="absolute"
            >
                <img
                    :src="item.item.picture_url ?? ''"
                    :alt="item.item.name"
                    class="w-36 h-36 object-contain"
                />
            </div>
        </div>
        <progress-bar class="absolute left-4 top-10" />
        <div
            class="absolute top-7 right-2 z-10 flex flex-col items-center gap-2"
        >
            <NuxtLink to="/settings">
                <div><Icon name="hugeicons:settings-05" size="32" /></div>
            </NuxtLink>
            <NuxtLink to="/friends">
                <div><Icon name="hugeicons:add-team" size="32" /></div>
            </NuxtLink>
        </div>
        <Register />
        <div
            v-if="showOnboarding || showActivityPicker"
            class="fixed inset-0 z-10 flex items-center justify-center p-4"
        >
            <div
                class="absolute inset-0 bg-black/40 backdrop-blur-md"
                aria-hidden="true"
            />
            <div class="relative z-10">
                <OnboardingTutorial
                    v-if="showOnboarding"
                    @complete="completeOnboarding"
                />
                <ChooseYourActivity
                    v-else-if="showActivityPicker"
                    @close="closeActivityPicker"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import synthWaveGirlImage from '~/assets/SynthWave_Girl.png'
import ChooseYourActivity from '~/components/ChooseYourActivity.vue'
import OnboardingTutorial from '~/components/OnboardingTutorial.vue'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import { useItemsStore } from '~/stores/items.store'
import type { ItemWithBackgroundPosition } from '~/types/items/items'
import { useActivitiesStore } from '#imports'
import { useMyCharacterStore } from '~/stores/character.store'

const ONBOARDING_STORAGE_PREFIX = 'healthity:onboarding:v1'

const backgroundsStore = useMyBackgroundsStore()
const itemsStore = useItemsStore()
const characterStore = useMyCharacterStore()
const { activeBackgroundForHome } = storeToRefs(backgroundsStore)

const backgroundId = activeBackgroundForHome.value?.id ?? ''
const itemsWithPositions = ref<ItemWithBackgroundPosition[]>(
    itemsStore.getCachedItemsWithPositionsForBackground(backgroundId) ?? [],
)

const showOnboarding = ref(false)
const showActivityPicker = ref(false)
const activitiesStore = useActivitiesStore()

function closeActivityPicker(): void {
    showActivityPicker.value = false
}

function getOnboardingStorageKey(): string | null {
    const character = characterStore.myCharacter
    if (!character) return null

    return `${ONBOARDING_STORAGE_PREFIX}:${character.user_tg_id}:${character.id}`
}

function hasCompletedOnboarding(): boolean {
    if (!import.meta.client) return false

    const storageKey = getOnboardingStorageKey()
    if (!storageKey) return false

    try {
        return localStorage.getItem(storageKey) === 'true'
    } catch {
        return false
    }
}

function markOnboardingComplete(): void {
    if (!import.meta.client) return

    const storageKey = getOnboardingStorageKey()
    if (!storageKey) return

    try {
        localStorage.setItem(storageKey, 'true')
    } catch {
        // Storage can be unavailable in restricted WebView modes.
    }
}

function needsInitialActivityFlow(): boolean {
    return (
        characterStore.isRegistered &&
        activitiesStore.characterBaseActivities.length === 0
    )
}

function maybeShowInitialActivityFlow(): void {
    if (!needsInitialActivityFlow()) {
        showOnboarding.value = false
        showActivityPicker.value = false
        return
    }

    if (showOnboarding.value || showActivityPicker.value) return

    if (hasCompletedOnboarding()) {
        showActivityPicker.value = true
        return
    }

    showOnboarding.value = true
}

function completeOnboarding(): void {
    markOnboardingComplete()
    showOnboarding.value = false
    if (
        characterStore.isRegistered &&
        activitiesStore.characterBaseActivities.length === 0
    ) {
        showActivityPicker.value = true
    }
}

async function syncItemsForActiveBackground(): Promise<void> {
    const backgroundId = activeBackgroundForHome.value?.id ?? ''
    if (!backgroundId) return

    itemsWithPositions.value =
        await itemsStore.loadItemsWithPositionsForBackground(backgroundId)
}

onMounted(async () => {
    await syncItemsForActiveBackground()
    maybeShowInitialActivityFlow()
})

watch(
    () => characterStore.isRegistered,
    async registered => {
        if (!registered) return
        await activitiesStore.ensureCharacterBaseActivitiesLoaded()
        maybeShowInitialActivityFlow()
    },
)

watch(
    () => activitiesStore.characterBaseActivities.length,
    () => {
        maybeShowInitialActivityFlow()
    },
)

watch(
    () => activeBackgroundForHome.value?.id,
    async () => {
        await syncItemsForActiveBackground()
    },
)
</script>

<style></style>
