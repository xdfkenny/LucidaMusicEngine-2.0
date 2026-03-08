<script setup lang="ts">
import type { DownloadJob } from "~/types/music";

const props = defineProps<{ job: DownloadJob; active?: boolean }>();
const emit = defineEmits<{
  (e: "inspect", job: DownloadJob): void;
  (e: "pause", job: DownloadJob): void;
  (e: "resume", job: DownloadJob): void;
  (e: "retry", job: DownloadJob): void;
  (e: "cancel", job: DownloadJob): void;
}>();

const status = computed(() => props.job.status);
const isPaused = computed(() => status.value === "paused");
const isFinished = computed(() => ["completed", "error", "cancelled"].includes(status.value));
const canPause = computed(() => !isPaused.value && !isFinished.value);
const canResume = computed(() => isPaused.value);
const canRetry = computed(() => ["error", "cancelled"].includes(status.value));
const canCancel = computed(() => !isFinished.value);
</script>

<template>
  <article class="card" :style="props.active ? 'border-color: rgba(79, 124, 255, 0.6);' : ''">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
      <div class="badge">{{ props.job.id }}</div>
      <button class="secondary" style="font-size: 10px;" @click="emit('inspect', props.job)">Inspect</button>
    </div>
    <strong style="font-size: 13px; word-break: break-word">{{ props.job.url }}</strong>
    <div class="status" :class="props.job.status">{{ props.job.status }}</div>
    <div style="font-size: 12px; color: var(--muted)">{{ props.job.message }}</div>
    <progress :value="props.job.progress" max="100" style="width: 100%"></progress>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button class="ghost" :disabled="!canPause" @click="emit('pause', props.job)">Pause</button>
      <button class="ghost" :disabled="!canResume" @click="emit('resume', props.job)">Resume</button>
      <button class="ghost" :disabled="!canRetry" @click="emit('retry', props.job)">Retry</button>
      <button class="ghost" :disabled="!canCancel" @click="emit('cancel', props.job)">Cancel</button>
    </div>
  </article>
</template>
