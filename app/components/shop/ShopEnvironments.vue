<template>
    <div class="p-4 flex items-center justify-center">
        <UCarousel
            v-slot="{ item: carouselItem }"
            :items="environments"
            orientation="vertical"
            :ui="{
                container:
                    'h-[336px] w-64 flex items-center justify-center [@media(max-height:595px)]:h-[260px]',
            }"
        >
            <div
                class="h-[320px] w-40 p-4 rounded-lg glass-container-2 flex flex-col items-center justify-center [@media(max-height:595px)]:h-[240px] [@media(max-height:595px)]:w-32 [@media(max-height:595px)]:p-2"
            >
                <Icon
                    :name="carouselItem.icon"
                    class="w-32 h-32 mb-4 [@media(max-height:595px)]:w-24 [@media(max-height:595px)]:h-24 [@media(max-height:595px)]:mb-2"
                />
                <span
                    class="text-2xl font-bold [@media(max-height:595px)]:text-xl"
                    >{{ carouselItem.name }}</span
                >
            </div>
        </UCarousel>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const environments = ref([
    { id: 1, name: 'Лес', icon: 'i-lucide-trees' },
    { id: 2, name: 'Пляж', icon: 'i-lucide-umbrella' },
    { id: 3, name: 'Город', icon: 'i-lucide-building-2' },
    { id: 4, name: 'Горы', icon: 'i-lucide-mountain' },
    { id: 5, name: 'Космос', icon: 'i-lucide-rocket' },
])
</script>

<style></style>
