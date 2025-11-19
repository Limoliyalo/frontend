<template>
    <nuxt-link :to="`/userActivity/${props.id}`">
        <div
            class="glass-container flex items-center justify-between p-4 border rounded-lg"
            :style="{ backgroundColor: props.color }"
        >
            <p class="text-lg font-semibold">{{ props.text }}</p>
            <p class="text-sm">
                {{ props.value }} / {{ props.goal }} {{ props.unit }}
            </p>
        </div>
    </nuxt-link>
</template>

<script lang="ts" setup>
const props = defineProps<{
    text: string
    goal: number
    color: string
    unit: string
    value: number
    id: number
}>()
</script>
