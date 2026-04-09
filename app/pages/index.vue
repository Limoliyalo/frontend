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
            v-if="showModal"
            class="fixed inset-0 flex items-center justify-center z-10"
        >
            <ChooseYourActivity @close="closeModal" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import synthWaveGirlImage from '~/assets/SynthWave_Girl.png'
import ChooseYourActivity from '~/components/ChooseYourActivity.vue'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import { useItemsStore } from '~/stores/items.store'
import type { ItemWithBackgroundPosition } from '~/types/items/items'
import { useActivitiesStore } from '#imports'
import { useMyCharacterStore } from '~/stores/character.store'

const backgroundsStore = useMyBackgroundsStore()
const itemsStore = useItemsStore()
const characterStore = useMyCharacterStore()
const { activeBackgroundForHome } = storeToRefs(backgroundsStore)

const backgroundId = activeBackgroundForHome.value?.id ?? ''
const itemsWithPositions = ref<ItemWithBackgroundPosition[]>(
    itemsStore.getCachedItemsWithPositionsForBackground(backgroundId) ?? [],
)

const showModal = ref(false)
const activitiesStore = useActivitiesStore()

function closeModal() {
    showModal.value = false
}

function maybeShowActivityPicker(): void {
    if (
        characterStore.isRegistered &&
        activitiesStore.characterBaseActivities.length === 0
    ) {
        showModal.value = true
    }
}

async function syncItemsForActiveBackground(): Promise<void> {
    const backgroundId = activeBackgroundForHome.value?.id ?? ''
    if (!backgroundId) return

    itemsWithPositions.value =
        await itemsStore.loadItemsWithPositionsForBackground(backgroundId)
}

onMounted(async () => {
    await Promise.all([
        backgroundsStore.ensureBackgroundsLoaded(),
        itemsStore.ensureCharacterItemsLoaded(),
        activitiesStore.loadCharacterBaseActivities(),
    ])

    await syncItemsForActiveBackground()

    maybeShowActivityPicker()
})

watch(
    () => characterStore.isRegistered,
    async registered => {
        if (!registered) return
        await activitiesStore.loadCharacterBaseActivities()
        maybeShowActivityPicker()
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
