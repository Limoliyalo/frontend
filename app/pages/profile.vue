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
        <CharacterBaseActivityList class="mt-5"/>
    </div>
</template>

<script lang="ts" setup>
import CharacterBaseActivityList from '~/components/userinfo/CharacterBaseActivityList.vue'
</script>

<style scoped></style>
