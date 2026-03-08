<script setup lang="ts">
import type { DownloadJob } from "~/types/music";

const props = defineProps<{ job: DownloadJob | null }>();

const formatTime = (value?: number | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};
</script>

<template>
  <div v-if="props.job" class="grid" style="gap: 12px;">
    <div class="badge">{{ props.job.id }}</div>
    <div class="status" :class="props.job.status">{{ props.job.status }}</div>
    <div style="font-size: 13px; color: var(--muted)">{{ props.job.message }}</div>
    <div class="grid" style="gap: 6px; font-size: 12px; color: var(--muted)">
      <div><strong>URL:</strong> {{ props.job.url }}</div>
      <div><strong>Created:</strong> {{ formatTime(props.job.createdAt) }}</div>
      <div><strong>Started:</strong> {{ formatTime(props.job.startedAt) }}</div>
      <div><strong>Updated:</strong> {{ formatTime(props.job.updatedAt) }}</div>
      <div><strong>Finished:</strong> {{ formatTime(props.job.finishedAt) }}</div>
    </div>
    <div class="grid" style="gap: 8px;">
      <div style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted)">
        Progress Timeline
      </div>
      <QueuePipeline :status="props.job.status" />
    </div>
  </div>
  <div v-else class="empty">Select a job to inspect timeline, metadata, and logs.</div>
</template>
