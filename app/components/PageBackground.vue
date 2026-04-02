<template>
    <img v-if="url" class="fullscreen-bg" :src="url" :alt="alt" />
</template>

<script lang="ts" setup>
defineProps<{
    url?: string | null
    alt?: string
}>()
</script>
