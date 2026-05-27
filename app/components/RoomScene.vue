<template>
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
            class="absolute inset-0 h-full w-full object-fill"
            :src="backgroundUrl"
            :alt="background?.name ?? 'Комната персонажа'"
        >
        <div
            v-for="item in itemsWithPositions"
            :key="`${item.item.id}-${item.position.id}`"
            class="absolute"
            :style="{
                top: `${item.position.position_y}%`,
                left: `${item.position.position_x}%`,
                zIndex: item.position.position_z ?? 0,
            }"
        >
            <img
                v-if="item.item.picture_url"
                :src="item.item.picture_url"
                :alt="item.item.name"
                class="h-36 w-36 object-contain"
            >
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import synthWaveGirlImage from '~/assets/SynthWave_Girl.png'
import type { Background } from '~/types/backgrounds/backgrounds'
import type { ItemWithBackgroundPosition } from '~/types/items/items'

const props = defineProps<{
    background?: Background | null
    itemsWithPositions: ItemWithBackgroundPosition[]
}>()

const backgroundUrl = computed(
    () => props.background?.picture_url ?? synthWaveGirlImage,
)
</script>
