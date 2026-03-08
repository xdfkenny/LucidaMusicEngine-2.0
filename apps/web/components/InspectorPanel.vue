<template>
  <aside class="inspector-panel">
    <!-- Header -->
    <div class="inspector-header">
      <div class="inspector-title">
        <span class="eyebrow">{{ mode === 'job' ? 'Job Details' : 'Track Metadata' }}</span>
      </div>
      <button class="close-btn" @click="inspector.close()" aria-label="Close inspector">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Search Result view -->
    <div v-if="mode === 'result' && result" class="inspector-body">
      <div class="cover-container">
        <img
          v-if="result.cover"
          :src="result.cover"
          :alt="result.title"
          class="cover-art"
          loading="lazy"
        />
        <div v-else class="cover-placeholder">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(199,210,254,0.2)" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z"/><path d="M12 8v8"/></svg>
        </div>
        <div class="cover-glow" />
      </div>

      <div class="meta-primary">
        <h2 class="meta-title">{{ result.title }}</h2>
        <p class="meta-artist">{{ result.artist }}</p>
      </div>

      <div class="meta-badges">
        <span class="meta-badge source">Lucida</span>
        <span class="meta-badge quality">FLAC</span>
      </div>

      <div class="action-block">
        <div class="action-label">Queue for download</div>
        <DownloadProfileSelector />
        <button class="queue-btn" @click="queueDownload">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Queue Download
        </button>
      </div>

      <div class="divider" />

      <div class="track-list-section">
        <div class="section-label">Tracklist</div>
        <div class="track-placeholder">
          <div v-for="i in 8" :key="i" class="track-skeleton" :style="{ width: (60 + Math.random() * 40) + '%' }" />
        </div>
      </div>
    </div>

    <!-- Job view -->
    <div v-else-if="mode === 'job' && job" class="inspector-body">
      <div class="job-header-block">
        <span class="status-chip" :class="job.status">{{ job.status.toUpperCase() }}</span>
        <span class="job-id">{{ job.id.slice(0, 8) }}…</span>
      </div>

      <div class="job-url">{{ job.url }}</div>

      <div class="progress-block">
        <div class="progress-label">
          <span>Progress</span>
          <span>{{ job.progress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: job.progress + '%' }" />
        </div>
      </div>

      <div v-if="job.message" class="job-message">{{ job.message }}</div>

      <div class="job-timestamps">
        <div>
          <div class="ts-label">Created</div>
          <div class="ts-val">{{ fmtTime(job.createdAt) }}</div>
        </div>
        <div v-if="job.startedAt">
          <div class="ts-label">Started</div>
          <div class="ts-val">{{ fmtTime(job.startedAt) }}</div>
        </div>
        <div v-if="job.finishedAt">
          <div class="ts-label">Finished</div>
          <div class="ts-val">{{ fmtTime(job.finishedAt) }}</div>
        </div>
      </div>

      <div v-if="job.result" class="job-result">
        <div class="section-label">Result</div>
        <div class="result-album">{{ job.result.album?.title }} · {{ job.result.album?.tracks }} tracks</div>
        <div class="result-path">{{ job.result.albumPath }}</div>
      </div>

      <div v-if="job.error" class="job-error">{{ job.error }}</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useInspectorStore } from "../stores/useInspectorStore";
import { useSearchStore } from "../stores/useSearchStore";
import { useQueueStore } from "../stores/useQueueStore";

const inspector = useInspectorStore();
const search = useSearchStore();
const queue = useQueueStore();

const mode = computed(() => inspector.mode);
const result = computed(() => inspector.result);
const job = computed(() => inspector.job);

function fmtTime(ts: number | null) {
  if (!ts) return "–";
  return new Date(ts).toLocaleTimeString();
}

async function queueDownload() {
  if (!result.value) return;
  const opts = { ...search.downloadOptions, albumYear: search.downloadOptions.albumYear || null };
  await queue.startDownload(result.value.url, opts);
  inspector.close();
}
</script>

<style scoped>
.inspector-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--inspector-w);
  background: var(--panel);
  border-left: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  z-index: 90;
  overflow: hidden;
}

.inspector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}

.inspector-title { display: flex; flex-direction: column; gap: 2px; }

.eyebrow {
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 600;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  cursor: pointer;
}

.close-btn:hover { background: rgba(252,165,165,0.1); color: #fca5a5; border-color: rgba(252,165,165,0.3); }

.inspector-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cover-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-2);
  border: 1px solid var(--line);
  flex-shrink: 0;
}

.cover-art {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(79,124,255,0.05), rgba(103,232,249,0.05));
}

.cover-glow {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(180deg, transparent 60%, rgba(79,124,255,0.15));
  pointer-events: none;
}

.meta-primary { display: flex; flex-direction: column; gap: 4px; }

.meta-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
}

.meta-artist { font-size: 13px; color: var(--muted); }

.meta-badges { display: flex; gap: 6px; flex-wrap: wrap; }

.meta-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 999px;
}

.meta-badge.source { background: rgba(79,124,255,0.15); color: var(--accent); }
.meta-badge.quality { background: rgba(103,232,249,0.15); color: var(--accent-2); }

.action-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: rgba(9,14,26,0.5);
  border: 1px solid var(--line);
  border-radius: 10px;
}

.action-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.queue-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border-radius: 9px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border: none;
  color: #0B1220;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}

.queue-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.queue-btn:active { transform: translateY(0); }

.divider { height: 1px; background: var(--line); margin: 0 -16px; }

.track-list-section { display: flex; flex-direction: column; gap: 10px; }

.section-label {
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}

.track-placeholder { display: flex; flex-direction: column; gap: 8px; }

.track-skeleton {
  height: 10px;
  background: rgba(199,210,254,0.06);
  border-radius: 999px;
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}

/* Job view */
.job-header-block { display: flex; align-items: center; gap: 10px; }

.job-id {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  color: var(--muted);
}

.job-url {
  font-size: 11px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  word-break: break-all;
  background: rgba(9,14,26,0.5);
  padding: 8px 10px;
  border-radius: 7px;
  border: 1px solid var(--line);
}

.progress-block { display: flex; flex-direction: column; gap: 6px; }

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--muted);
}

.job-message {
  font-size: 12px;
  color: var(--muted);
  padding: 8px 10px;
  background: rgba(9,14,26,0.5);
  border-radius: 7px;
  border: 1px solid var(--line);
}

.job-timestamps {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.ts-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 2px;
}

.ts-val {
  font-size: 12px;
  font-family: "JetBrains Mono", monospace;
  color: var(--text);
}

.job-result {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: rgba(103,232,249,0.06);
  border: 1px solid rgba(103,232,249,0.15);
  border-radius: 8px;
}

.result-album { font-size: 13px; font-weight: 600; color: var(--accent-2); }

.result-path {
  font-size: 10px;
  font-family: "JetBrains Mono", monospace;
  color: var(--muted);
  word-break: break-all;
}

.job-error {
  font-size: 12px;
  color: #fca5a5;
  background: rgba(252,165,165,0.08);
  border: 1px solid rgba(252,165,165,0.2);
  padding: 8px 10px;
  border-radius: 7px;
}
</style>
