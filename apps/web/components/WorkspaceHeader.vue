<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
}>();
</script>

<template>
  <header class="workspace-header">
    <div>
      <div v-if="props.eyebrow" class="eyebrow">{{ props.eyebrow }}</div>
      <h1>{{ props.title }}</h1>
      <p v-if="props.subtitle" class="subtitle">{{ props.subtitle }}</p>
    </div>
    <div class="actions">
      <slot name="actions" />
    </div>
  </header>
</template>
