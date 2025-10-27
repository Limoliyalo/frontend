<template>
    <div>{{ user?.id || 'Загрузка...' }}</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMyUserStore } from '../../../stores/user.store'

const userStore = useMyUserStore()

// Используем computed для реактивности и безопасного доступа
const user = computed(() => userStore.getUser)
</script>

<style></style>
