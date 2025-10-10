<template>
    <div class="glass-container h-9 w-full flex items-center justify-start">
        <Icon name="flat-color-icons:search" />
        <input
            v-model="searchQuery"
            @input="handleInput"
            type="text"
            placeholder="Искать товары"
            class="w-full ml-4"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const emit = defineEmits<(e: 'search', query: string) => void>()

const searchQuery = ref('')

const handleInput = () => {
    emit('search', searchQuery.value)
}
</script>

<style></style>
