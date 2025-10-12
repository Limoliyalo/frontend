<template>
    <div class="p-4">
        <UserinfoUserDayProgress
            :segments="[
                { progress: 0, color: '#3b82f6' },
                { progress: 0, color: '#10b981' },
                { progress: 0, color: '#f59e0b' },
            ]"
            :background-color="['#bfdbfe', '#a7f3d0', '#fde68a']"
        />
        <UserinfoUserActivities />
    </div>
</template>

<script lang="ts" setup></script>

<style scoped></style>
