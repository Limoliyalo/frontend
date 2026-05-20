<template>
    <div class="flex flex-col h-dvh">
        <div
            class="shrink-0 glass-container flex items-center gap-3 px-4 py-3 z-10 mx-4 mt-4 mb-4"
        >
            <ReturnBtn />
            <h1
                class="min-w-0 flex-1 truncate text-center text-white text-xl font-bold"
            >
                {{ pageTitle }}
            </h1>
            <PageHelpPopover v-if="pageHelp" :help="pageHelp" />
            <div v-else class="h-9 w-9 shrink-0" aria-hidden="true" />
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
import PageHelpPopover from '~/components/ui/PageHelpPopover.vue'
import ReturnBtn from '~/components/ui/ReturnBtn.vue'

interface PageHelp {
    title?: string
    body: string
}

const route = useRoute()
const pageTitle = computed(() => (route.meta.pageTitle as string) ?? '')
const pageHelp = computed(() => {
    const help = route.meta.pageHelp
    if (!help || typeof help !== 'object') return null
    if (typeof help.body !== 'string') return null
    return help as PageHelp
})
const scrollMainContent = computed(() =>
    Boolean(route.meta.scrollMainContent),
)
</script>
