<template>
    <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center z-10"
    >
        <ChooseYourActivity @close="closeModal" />
    </div>

    <div class="glass-container p-4 rounded-2xl max-h-85 overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4 text-center text-white">
            Ваши активности
        </h3>
        <div class="flex flex-col gap-2 justify-center">
            <NuxtLink
                v-for="activity in activities"
                :key="activity.id"
                :to="`/userActivity/${activity.id}`"
                class="bg-white/10 backdrop-blur-sm text-white py-6 px-4 rounded-full text-sm cursor-pointer hover:bg-white/20 transition-colors duration-300"
                :style="{
                    backgroundColor: activitiesStore.getActivityTypeColor(
                        activity.activity_type_id,
                    ),
                }"
            >
                <div class="flex justify-between">
                    <div>
                        {{
                            activitiesStore.getActivityTypeName(
                                activity.activity_type_id,
                            )
                        }}
                    </div>
                    <div>
                        {{
                            activitiesStore.getDailyActivityForType(
                                activity.activity_type_id,
                                today,
                            )?.value || 0
                        }}
                        / {{ activity.goal }}
                    </div>
                </div>
            </NuxtLink>
            <div
                class="bg-white/10 backdrop-blur-sm text-white py-6 px-4 rounded-full text-sm  hover:bg-white/20 transition-colors duration-300"
            >
                <div class="flex items-center justify-between">
                    <span>Сменить активности</span>
                    <div
                        class="rounded-full w-12 h-12 shadow shadow-black flex justify-center items-center text-center active:shadow-inner "
                        @click.stop="showModal = true"
                    >
                        <Icon name="hugeicons:add-01" size="24" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useActivitiesStore } from '#imports'

const activities = computed(() => activitiesStore.characterBaseActivities || [])

const activitiesStore = useActivitiesStore()
const today = new Date().toISOString().split('T')[0] || '' // YYYY-MM-DD
const showModal = ref(false)

function closeModal() {
    showModal.value = false
}

onMounted(async () => {
    await activitiesStore.loadActivityTypesCatalog()
    await activitiesStore.loadCharacterBaseActivities()
    await activitiesStore.loadCharacterDailyActivities()
})
</script>

<style></style>
