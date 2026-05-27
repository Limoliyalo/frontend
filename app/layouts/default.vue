<template>
    <div>
        <div
            class="glass-container fixed bottom-4 left-0 right-0 mx-4 z-10000"
        >
            <navbar />
        </div>
        <div :class="pageClasses">
            <slot />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageClasses = computed(() =>
    route.meta.guestRoom
        ? 'h-dvh overflow-hidden'
        : 'min-h-screen pb-[88px]',
)
</script>
