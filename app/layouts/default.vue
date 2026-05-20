<template>
    <div>
        <div
            class="glass-container fixed bottom-4 left-0 right-0 mx-4 z-10000"
        >
            <navbar />
        </div>
        <div class="min-h-screen pb-[88px]">
            <slot />
        </div>
    </div>
</template>

<script lang="ts" setup></script>
