<template>
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
                    backgroundColor:
                        activitiesStore.getCharacterBaseActivityColor(
                            activity.activity_type_id
                        ),
                }"
            >
                <div class="flex justify-between">
                    <div>
                        {{
                            activitiesStore.getCharacterBaseActivityName(
                                activity.activity_type_id
                            )
                        }}
                    </div>
                    <div>
                        {{ activity.goal }}
                    </div>
                </div>
            </NuxtLink>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useActivitiesStore } from '#imports'

const activities = computed(
    () => activitiesStore.getCharacterBaseActivities || []
)
const activitiesStore = useActivitiesStore()

onMounted(async () => {
    await activitiesStore.loadActivityTypesCatalog()
    await activitiesStore.loadCharacterBaseActivities()
})
</script>

<style></style>
