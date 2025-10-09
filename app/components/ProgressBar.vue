<template>
    <div>
        <div><ui-level-circle class="absolute -top-4 -left-2 z-10" /></div>
        <UProgress v-model="value" class="w-3xs" />
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref(50)
</script>

<style></style>
