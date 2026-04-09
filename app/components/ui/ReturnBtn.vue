<template>
    <button
        class="glass-container h-9 w-9 flex items-center justify-center rounded-full"
        type="button"
        aria-label="Назад"
        @click="handleBack"
    >
        <Icon name="hugeicons:arrow-left-01" size="20" />
    </button>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function handleBack() {
    // Vue Router history state includes `back` when a back entry exists.
    // On direct entry (no back), we fallback to home.
    const state = (router.options.history.state ?? {}) as { back?: unknown }

    if (state.back) {
        router.back()
        return
    }

    router.push('/')
}
</script>

<style></style>
