<template>
    <UApp>
        <AppLoader
            v-if="!bootstrapStore.isReady"
            :progress="bootstrapStore.progress"
            :message="bootstrapStore.message"
            :show-retry="bootstrapStore.status === 'error'"
            @retry="bootstrapStore.retry"
        />
        <NuxtLayout v-else>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAppBootstrapStore } from '~/stores/app-bootstrap.store'

const bootstrapStore = useAppBootstrapStore()

onMounted(() => {
    void bootstrapStore.start()
})
</script>
