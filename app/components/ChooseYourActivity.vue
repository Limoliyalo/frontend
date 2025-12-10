<template>
    <div
        class="glass-container h-[310px] w-[280px] flex flex-col p-4 rounded-lg"
    >
        <h2 class="text-2xl font-bold text-center mb-4 shrink-0">
            Выберите активность
        </h2>

        <div class="overflow-y-auto flex-grow rounded-lg">
            <div
                v-if="activityTypesCatalog.length === 0"
                class="text-center text-gray-400 p-4"
            >
                Загрузка активностей...
            </div>
            <div
                v-else
                v-for="type in activityTypesCatalog"
                :key="type.id"
                class="p-3 mb-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors flex justify-between items-center"
                :style="{ background: type.color }"
            >
                <span>{{ type.name }}</span>
                <UCheckbox v-model="checked[type.id]" />
            </div>
            <UButton @click="createBaseActivities">Выбрать</UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useActivitiesStore } from '~/stores/activities.store'

const activitiesStore = useActivitiesStore()
const checked = ref<Record<string, boolean>>({})
const activityTypesCatalog = computed(
    () => activitiesStore.getActivityTypesCatalog || []
)
const selectedActivities = computed(() =>
    Object.keys(checked.value).filter(id => checked.value[id])
)
const emit = defineEmits(['close'])

onMounted(async () => {
    await activitiesStore.loadActivityTypesCatalog()
    await activitiesStore.loadCharacterBaseActivities()
    for (const type of activityTypesCatalog.value) {
        if (!(type.id in checked.value)) {
            checked.value[type.id] = false
        }
    }
    if (activitiesStore.getCharacterBaseActivities.length > 0) {
        emit('close')
    }
})

function createBaseActivities() {
    activitiesStore.createCharacterBaseActivities(selectedActivities.value)
    emit('close')
}
</script>

<style></style>
