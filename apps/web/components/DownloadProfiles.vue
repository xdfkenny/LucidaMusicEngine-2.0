<script setup lang="ts">
interface DownloadProfile {
  id: string;
  label: string;
  description: string;
  tag: string;
}

const props = defineProps<{
  profiles: DownloadProfile[];
  activeId: string;
}>();
const emit = defineEmits<{ (e: "select", id: string): void }>();
</script>

<template>
  <div class="grid" style="gap: 10px;">
    <div class="panel-title">Smart Download Profiles</div>
    <div class="grid" style="gap: 10px;">
      <button
        v-for="profile in props.profiles"
        :key="profile.id"
        type="button"
        class="card"
        :style="profile.id === props.activeId ? 'border-color: rgba(79, 124, 255, 0.6);' : ''"
        @click="emit('select', profile.id)"
      >
        <div class="badge">{{ profile.tag }}</div>
        <strong style="text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px;">
          {{ profile.label }}
        </strong>
        <div style="color: var(--muted); font-size: 12px;">{{ profile.description }}</div>
      </button>
    </div>
  </div>
</template>
