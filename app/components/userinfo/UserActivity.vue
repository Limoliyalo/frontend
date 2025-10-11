<template>
    <NuxtLink
        :to="props.linkto"
        class="glass-container flex items-center justify-start border"
        :style="glassStyle"
    >
        <div
            class="shadow-inner shadow-black rounded-full flex items-center justify-center w-10 h-10"
        >
            <Icon :name="props.iconName" size="32" />
        </div>

        <p class="text ml-auto">{{ props.text }}</p>
    </NuxtLink>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
    linkto: string
    iconName: string
    text: string
    color: string
}>()

const glassStyle = computed(() => {
    let backgroundColor = 'rgba(255, 255, 255, 0.1)'
    let borderColor = 'rgba(255, 255, 255, 0.2)'

    switch (props.color) {
        case 'blue':
            backgroundColor = 'rgba(59, 130, 246, 0.25)'
            borderColor = 'rgba(59, 130, 246, 0.6)'
            break
        case 'green':
            backgroundColor = 'rgba(34, 197, 94, 0.25)'
            borderColor = 'rgba(34, 197, 94, 0.6)'
            break
        case 'yellow':
            backgroundColor = 'rgba(245, 158, 11, 0.25)'
            borderColor = 'rgba(245, 158, 11, 0.6)'
            break
    }

    return {
        backgroundColor,
        borderColor,
    }
})
</script>
