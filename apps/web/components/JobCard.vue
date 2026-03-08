<template>
  <div class="job-card" :class="{ active }">
    <!-- Header -->
    <div class="job-card-header">
      <span class="status-chip" :class="job.status">{{ job.status }}</span>
      <span class="job-id">{{ job.id.slice(0, 8) }}</span>
      <button
        v-if="job.status !== 'completed' && job.status !== 'error' && job.status !== 'cancelled'"
        class="inspect-btn"
        @click="emit('inspect', job)"
      >Inspect →</button>
    </div>

    <!-- URL -->
    <div class="job-url">{{ truncateUrl(job.url) }}</div>

    <!-- Progress bar -->
    <div class="progress-bar">
      <div class="progress-bar-fill" :style="{ width: job.progress + '%' }" />
    </div>

    <!-- Footer row -->
    <div class="job-card-footer">
      <span class="job-progress-pct">{{ job.progress }}%</span>
      <span v-if="job.message" class="job-msg">{{ job.message }}</span>
      <div class="job-actions">
        <button
          v-if="job.status === 'processing' || job.status === 'fetching'"
          class="act-btn"
          title="Pause"
          @click="emit('pause', job)"
        >⏸</button>
        <button
          v-if="job.control?.paused"
          class="act-btn"
          title="Resume"
          @click="emit('resume', job)"
        >▶</button>
        <button
          v-if="job.status === 'error'"
          class="act-btn retry"
          title="Retry"
          @click="emit('retry', job)"
        >↺</button>
        <button
          v-if="job.status !== 'completed'"
          class="act-btn cancel"
          title="Cancel"
          @click="emit('cancel', job)"
        >✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DownloadJob } from "~/types/music";

const props = defineProps<{
  job: DownloadJob;
  active?: boolean;
}>();

const emit = defineEmits<{
  inspect: [job: DownloadJob];
  pause:   [job: DownloadJob];
  resume:  [job: DownloadJob];
  retry:   [job: DownloadJob];
  cancel:  [job: DownloadJob];
}>();

function truncateUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname + u.pathname.slice(0, 40);
  } catch {
    return url.slice(0, 50);
  }
}
</script>

<style scoped>
.job-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(9,14,26,0.7);
  border: 1px solid rgba(199,210,254,0.07);
  border-radius: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;
  animation: fadeSlideUp 0.3s ease;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.job-card:hover {
  border-color: rgba(79,124,255,0.25);
}

.job-card.active {
  border-color: rgba(79,124,255,0.45);
  box-shadow: 0 0 0 1px rgba(79,124,255,0.2), 0 4px 20px rgba(79,124,255,0.08);
}

.job-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.job-id {
  font-size: 10px;
  font-family: "JetBrains Mono", monospace;
  color: var(--muted);
}

.inspect-btn {
  margin-left: auto;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(79,124,255,0.3);
  background: rgba(79,124,255,0.08);
  color: var(--accent-2);
  cursor: pointer;
  transition: all 0.15s;
}

.inspect-btn:hover {
  background: rgba(79,124,255,0.18);
  border-color: rgba(79,124,255,0.5);
}

.job-url {
  font-size: 11px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.job-progress-pct {
  font-size: 10px;
  font-family: "JetBrains Mono", monospace;
  color: var(--muted);
  min-width: 30px;
}

.job-msg {
  flex: 1;
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-actions { display: flex; gap: 4px; margin-left: auto; }

.act-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid rgba(199,210,254,0.12);
  background: rgba(9,14,26,0.8);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
}

.act-btn:hover { background: rgba(79,124,255,0.12); color: var(--text); border-color: rgba(79,124,255,0.3); }
.act-btn.retry:hover { color: #fbbf24; border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.08); }
.act-btn.cancel:hover { color: #fca5a5; border-color: rgba(252,165,165,0.3); background: rgba(252,165,165,0.08); }
</style>
