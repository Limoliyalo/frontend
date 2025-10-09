<template>
    <div
        class="w-11 h-11 rounded-full bg-green-400 flex items-center justify-center text-black"
    >
        {{ level }}
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const level = ref(1)
</script>

<style></style>
