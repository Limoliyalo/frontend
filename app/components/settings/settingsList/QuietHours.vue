<template>
    <div class="w-full flex flex-col items-center space-y-3">
        <span class="text-xs">Тихие часы</span>
        <div class="flex flex-col items-center">
            <span class="text-sm">с</span>
            <UInput v-model="quietHoursFrom" type="time" class="w-28" />
            <span class="text-sm">по</span>
            <UInput v-model="quietHoursTo" type="time" class="w-28" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const quietHoursFrom = ref('22:00')
const quietHoursTo = ref('08:00')
</script>

<style></style>
