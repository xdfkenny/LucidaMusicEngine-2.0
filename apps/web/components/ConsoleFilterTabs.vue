<script setup lang="ts">
const props = defineProps<{
  filters: string[];
  active: string;
}>();
const emit = defineEmits<{ (e: "change", value: string): void }>();
</script>

<template>
  <div class="console-filters">
    <button
      v-for="item in props.filters"
      :key="item"
      type="button"
      :class="['console-filter', { active: item === props.active }]"
      @click="emit('change', item)"
    >
      {{ item }}
    </button>
  </div>
</template>
