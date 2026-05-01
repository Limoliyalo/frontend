<template>
    <div class="flex flex-col h-dvh">
        <div
            class="shrink-0 glass-container flex items-center gap-3 px-4 py-3 z-10 mx-4 mt-4 mb-4"
        >
            <ReturnBtn />
            <h1 class="flex-1 text-center text-white text-xl font-bold">
                {{ pageTitle }}
            </h1>
            <div class="w-9 shrink-0" />
        </div>

        <div
            class="flex min-h-0 flex-1 flex-col"
            :class="
                scrollMainContent ? 'overflow-y-auto' : 'overflow-y-hidden'
            "
        >
            <slot />
        </div>

        <div class="shrink-0 glass-container mx-4 my-4">
            <navbar />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ReturnBtn from '~/components/ui/ReturnBtn.vue'

const route = useRoute()
const pageTitle = computed(() => (route.meta.pageTitle as string) ?? '')
const scrollMainContent = computed(() =>
    Boolean(route.meta.scrollMainContent),
)
</script>
