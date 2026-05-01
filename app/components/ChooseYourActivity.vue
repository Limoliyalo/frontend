<template>
    <div
        class="glass-container h-[310px] w-[280px] flex flex-col p-4 rounded-lg"
    >
        <h2 class="text-2xl font-bold text-center mb-4 shrink-0">
            Выберите активность
        </h2>

        <div class="min-h-0 flex-1 overflow-y-auto rounded-lg">
            <div
                v-if="activityTypesCatalog.length === 0"
                class="text-center text-white p-4"
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
        </div>
        <div class="mt-3 flex shrink-0 items-center justify-center gap-3">
            <UButton @click="createBaseActivities">Выбрать</UButton>
            <UButton
                v-if="showCloseButton"
                variant="ghost"
                color="neutral"
                @click="closeWithoutSaving"
            >
                Закрыть
            </UButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useActivitiesStore } from '~/stores/activities.store'

withDefaults(
    defineProps<{
        showCloseButton?: boolean
    }>(),
    { showCloseButton: false },
)
const activitiesStore = useActivitiesStore()
const checked = ref<Record<string, boolean>>({})
const activityTypesCatalog = computed(
    () => activitiesStore.activityTypesCatalog || [],
)
const defaultActivityIds = computed(
    () => activitiesStore.defaultActivityTypeIds,
)
const selectedActivities = computed(() =>
    Object.keys(checked.value).filter(id => checked.value[id]),
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
})

function createBaseActivities() {
    activitiesStore.createCharacterBaseActivities(selectedActivities.value)
    emit('close')
}

function closeWithoutSaving() {
    emit('close')
}
</script>

<style></style>
