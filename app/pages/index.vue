<template>
    <div>
        <video
            class="fullscreen-video"
            :src="lofiVideo"
            autoplay
            loop
            muted
        ></video>
        <progress-bar class="absolute w-xs left-4 top-10" />
    </div>
</template>

<script lang="ts" setup>
import lofiVideo from '~/assets/LoFi.mp4'
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
