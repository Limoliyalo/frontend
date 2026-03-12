<template>
    <div>
        <img
            v-if="activeBackgroundForHome?.picture_url"
            class="fullscreen-bg"
            :src="activeBackgroundForHome.picture_url"
            :alt="activeBackgroundForHome.name"
        />
        <video
            v-else
            class="fullscreen-bg"
            :src="lofiVideo"
            autoplay
            loop
            muted
        ></video>
        <div v-for="item in itemsWithPositions" :key="item.item.id">
            <div
                :style="{
                    top: item.position.position_y + 'px',
                    left: item.position.position_x + 'px',
                    zIndex: item.position.position_z,
                }"
                class="absolute"
            >
                <img :src="item.item.picture_url ?? ''" :alt="item.item.name" />
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
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import lofiVideo from '~/assets/LoFi.mp4'
import ChooseYourActivity from '~/components/ChooseYourActivity.vue'
import { useMyBackgroundsStore } from '~/stores/backgrounds.store'
import { useItemsStore } from '~/stores/items.store'
import type { ItemWithBackgroundPosition } from '~/types/items/items'

const backgroundsStore = useMyBackgroundsStore()
const itemsStore = useItemsStore()
const { activeBackgroundForHome } = storeToRefs(backgroundsStore)
const itemsWithPositions = ref<ItemWithBackgroundPosition[]>([])

const showModal = ref(true)

function closeModal() {
    showModal.value = false
}

onMounted(async () => {
    await Promise.all([
        backgroundsStore.loadBackgroundsCatalog(),
        backgroundsStore.loadCharacterBackgrounds(),
        itemsStore.loadCharacterItems(),
    ])

    itemsWithPositions.value =
        await itemsStore.loadItemsWithPositionsForBackground(
            activeBackgroundForHome.value?.id ?? '',
        )
})
</script>

<style>
.fullscreen-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    z-index: -1;
}
</style>
