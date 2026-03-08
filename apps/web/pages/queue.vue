<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Queue</h1>
      <p class="page-sub">Active downloads and job pipeline status.</p>
      <div class="page-actions">
        <button class="btn-secondary" @click="queue.refresh">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Pipeline overview (current/latest job) -->
    <div class="pipeline-card">
      <div class="pipeline-card-header">
        <span class="card-eyebrow">Pipeline Status</span>
        <span v-if="latestActive" class="status-chip" :class="latestActive.status">
          {{ latestActive.status }}
        </span>
      </div>
      <QueuePipeline :status="latestActive?.status" />
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div v-for="stat in stats" :key="stat.label" class="stat-chip">
        <div class="stat-val">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>

    <p v-if="queue.error" class="err-msg">{{ queue.error }}</p>

    <!-- Job list -->
    <div v-if="queue.jobs.length" class="jobs-section">
      <div class="section-label">Active & Recent Jobs</div>
      <TransitionGroup name="job-list" tag="div" class="jobs-list">
        <JobCard
          v-for="job in queue.jobs"
          :key="job.id"
          :job="job"
          :active="queue.inspectedJob?.id === job.id"
          @inspect="openInspect(job)"
          @pause="queue.handleAction(job, 'pause')"
          @resume="queue.handleAction(job, 'resume')"
          @retry="queue.handleAction(job, 'retry')"
          @cancel="queue.handleAction(job, 'cancel')"
        />
      </TransitionGroup>
    </div>

    <div v-else-if="!queue.loading" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(199,210,254,0.12)" stroke-width="1.2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <div class="empty-title">Queue is empty</div>
      <div class="empty-sub">Go to Search to start a download.</div>
      <NuxtLink to="/">
        <button class="btn-primary">→ Go to Search</button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DownloadJob } from "~/types/music";

const queue = useQueueStore();
const inspector = useInspectorStore();

const latestActive = computed(() =>
  queue.jobs.find(j => ["fetching","processing","queued"].includes(j.status)) ?? queue.jobs[0] ?? null
);

const stats = computed(() => [
  { label: "Total",      value: queue.jobs.length },
  { label: "Active",     value: queue.jobs.filter(j => ["fetching","processing"].includes(j.status)).length },
  { label: "Queued",     value: queue.jobs.filter(j => j.status === "queued").length },
  { label: "Completed",  value: queue.jobs.filter(j => j.status === "completed").length },
  { label: "Errors",     value: queue.jobs.filter(j => j.status === "error").length },
]);

function openInspect(job: DownloadJob) {
  queue.inspect(job);
  inspector.inspectJob(job);
}

onMounted(() => queue.refresh());
</script>

<style scoped>
.page-content {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeSlideUp 0.4s ease;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  flex: 1;
}

.page-sub { font-size: 13px; color: var(--muted); }

.page-actions { margin-left: auto; }

.pipeline-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pipeline-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}

.stats-row { display: flex; gap: 10px; flex-wrap: wrap; }

.stat-chip {
  padding: 10px 16px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 70px;
}

.stat-val { font-size: 20px; font-weight: 700; color: var(--text); }

.stat-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.err-msg {
  font-size: 12px;
  color: #fca5a5;
  background: rgba(252,165,165,0.07);
  border: 1px solid rgba(252,165,165,0.2);
  border-radius: 7px;
  padding: 8px 12px;
}

.jobs-section { display: flex; flex-direction: column; gap: 10px; }

.section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}

.jobs-list { display: flex; flex-direction: column; gap: 8px; }

.job-list-enter-active { transition: all 0.3s ease; }
.job-list-leave-active { transition: all 0.2s ease; }
.job-list-enter-from   { opacity: 0; transform: translateY(8px); }
.job-list-leave-to     { opacity: 0; transform: translateX(-8px); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon { opacity: 0.6; }
.empty-title { font-size: 16px; font-weight: 600; color: var(--text); }
.empty-sub { font-size: 13px; color: var(--muted); }

.btn-primary {
  padding: 9px 20px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border: none;
  border-radius: 9px;
  color: #0B1220;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover { opacity: 0.9; }

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(9,14,26,0.7);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover { border-color: rgba(79,124,255,0.3); color: var(--text); background: rgba(79,124,255,0.06); }
</style>
