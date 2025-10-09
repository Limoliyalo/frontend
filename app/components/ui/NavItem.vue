<template>
    <NuxtLink :to="navBtn.linkto">
        <!-- TODO Активная кнопка должна быть прожата пока пользователь не покинет страничку -->
        <div
            class="rounded-full w-12 h-12 shadow shadow-black flex justify-center items-center text-center active:shadow-inner"
            @mousedown="isCliked = true"
            @mouseup="isCliked = false"
            @mouseleave="isCliked = false"
        >
            <Icon class="flex" :name="navBtn.iconName" :size="size" />
        </div>
    </NuxtLink>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
interface NavBtn {
    linkto: string
    iconName: string
}

const props = defineProps<{
    navBtn: NavBtn
}>()

const isCliked = ref(false)

const size = computed(() => (isCliked.value ? '28px' : '30px'))
</script>

<style></style>
