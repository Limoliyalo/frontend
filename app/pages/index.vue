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
        <NuxtLink to="/settings" class="absolute top-7 right-2 z-10">
            <div><Icon name="hugeicons:settings-05" size="32" /></div>
        </NuxtLink>
        <Register />
        <div class="fixed inset-0 flex items-center justify-center z-10">
            <ChooseYourActivity />
        </div>
    </div>
</template>

<script lang="ts" setup>
import lofiVideo from '~/assets/LoFi.mp4'
import ChooseYourActivity from '~/components/ChooseYourActivity.vue'
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
