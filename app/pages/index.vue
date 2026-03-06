<template>
    <div>
        <video
            class="fullscreen-video"
            :src="lofiVideo"
            autoplay
            loop
            muted
        ></video>
        <progress-bar class="absolute left-4 top-10" />
        <div class="absolute top-7 right-2 z-10 flex flex-col items-center gap-2">
            <NuxtLink to="/settings">
                <div><Icon name="hugeicons:settings-05" size="32" /></div>
            </NuxtLink>
            <NuxtLink to="/friends">
                <div><Icon name="hugeicons:add-team" size="32" /></div>
            </NuxtLink>
        </div>
        <Register />
        <div
            v-if="showModal"
            class="fixed inset-0 flex items-center justify-center z-10"
        >
            <ChooseYourActivity @close="closeModal" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import lofiVideo from '~/assets/LoFi.mp4'
import ChooseYourActivity from '~/components/ChooseYourActivity.vue'

const showModal = ref(true)

function closeModal() {
    showModal.value = false
}
</script>

<style>
.fullscreen-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    z-index: -1; /* Optional: Keeps video in the background */
}
</style>
