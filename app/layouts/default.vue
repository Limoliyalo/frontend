<template>
    <div
        v-if="showReturnBtn"
        class="fixed top-4 left-4 z-[10001]"
    >
        <ReturnBtn />
    </div>
    <div class="glass-container fixed left-0 w-full bottom-4 z-10000">
        <navbar />
    </div>
    <div class="min-h-screen pb-[88px]">
        <slot />
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ReturnBtn from '~/components/ui/ReturnBtn.vue'

const route = useRoute()

const showReturnBtn = computed(() => route.path !== '/')
</script>

<style>
.glass-container {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px;
}
</style>
