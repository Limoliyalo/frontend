<template>
    <div class="glass-container absolute w-full bottom-4 z-10000">
        <navbar />
    </div>
    <TelegramUserInit />
    <slot />
</template>

<script lang="ts" setup></script>

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
