<template>
    <div>
        <div class="page-container mt-28 h-34 mx-8">
            <div class="glass-container h-full">
                <UTabs :items="items">
                    <template #water>
                        <UForm
                            :state="state"
                            class="flex items-center justify-center"
                        >
                            <Teleport
                                to="#display-content"
                                :disabled="false"
                                class=""
                            >
                                <userinfo-water-info />
                            </Teleport>
                        </UForm>
                    </template>
                    <template #timer>
                        <UForm :state="state" class="flex flex-col gap-4">
                            <Teleport to="#display-content" :disabled="false">
                                <userinfo-timer-info />
                            </Teleport>
                        </UForm>
                    </template>
                    <template #food>
                        <UForm :state="state" class="flex flex-col gap-4">
                            <Teleport to="#display-content" :disabled="false">
                                <userinfo-food-info />
                            </Teleport>
                        </UForm>
                    </template>
                </UTabs>
            </div>
        </div>
        <div class="page-container mt-28 h-98 mx-8">
            <div class="glass-container h-full">
                <div
                    id="display-content"
                    class="flex flex-col items-center py-4"
                ></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const items = [
    {
        label: 'Вода',
        icon: 'i-lucide-user',
        slot: 'water',
    },
    {
        label: 'Таймер',
        icon: 'i-lucide-lock',
        slot: 'timer',
    },
    {
        label: 'Еда',
        icon: 'i-lucide-lock',
        slot: 'food',
    },
]

const state = reactive({
    name: 'Benjamin Canac',
    username: 'benjamincanac',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
})
</script>
