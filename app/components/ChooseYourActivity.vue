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
                class="p-3 mb-2 rounded-lg flex justify-between items-center transition-colors"
                :class="
                    defaultActivityIds.includes(type.id)
                        ? 'bg-white/10 opacity-90 cursor-default'
                        : 'bg-white/10 hover:bg-white/20 cursor-pointer'
                "
                :style="{ background: type.color }"
            >
                <span>{{ type.name }}</span>
                <UCheckbox
                    v-model="checked[type.id]"
                    :disabled="defaultActivityIds.includes(type.id)"
                />
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
const defaultActivityIds = computed(() =>
    activityTypesCatalog.value.slice(0, 3).map(t => t.id)
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
    for (const id of defaultActivityIds.value) {
        checked.value[id] = true
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
