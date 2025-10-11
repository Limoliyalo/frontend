<template>
    <NuxtLink
        :to="props.linkto"
        class="glass-container flex items-center justify-start"
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
const props = defineProps<{
    linkto: string
    iconName: string
    text: string
}>()
</script>

<style></style>
