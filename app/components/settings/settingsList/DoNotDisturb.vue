<template>
    <div class="flex items-center justify-around">
        <span class="text-xs text-start">Включить режим не беспокоить</span>
        <USwitch v-model="doNotDisturb" />
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const doNotDisturb = ref(true)
</script>

<style></style>
