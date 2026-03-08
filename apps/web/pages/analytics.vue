<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Analytics</h1>
      <p class="page-sub">Library statistics and acquisition metrics.</p>
    </div>

    <div class="kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card">
        <div class="kpi-icon" v-html="kpi.icon" />
        <div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>
    </div>

    <div class="chart-placeholder">
      <div class="chart-title">Download Activity</div>
      <div class="chart-bars">
        <div
          v-for="(bar, i) in activityBars"
          :key="i"
          class="bar-col"
        >
          <div class="bar" :style="{ height: bar + '%' }" />
          <div class="bar-label">{{ days[i] }}</div>
        </div>
      </div>
    </div>

    <div class="two-col">
      <div class="section-card">
        <div class="section-title">Top Formats</div>
        <div class="format-list">
          <div v-for="f in formats" :key="f.name" class="format-row">
            <span class="fmt-name">{{ f.name }}</span>
            <div class="fmt-bar-wrap">
              <div class="fmt-bar" :style="{ width: f.pct + '%' }" />
            </div>
            <span class="fmt-pct">{{ f.pct }}%</span>
          </div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">Job Status Distribution</div>
        <div class="status-list">
          <div v-for="s in statusDist" :key="s.status" class="status-dist-row">
            <span class="status-chip" :class="s.status">{{ s.status }}</span>
            <div class="dist-bar-wrap">
              <div class="dist-bar" :style="{ width: s.pct + '%', background: s.color }" />
            </div>
            <span class="dist-num">{{ s.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi();
const queue = useQueueStore();

const totalArtists = ref(0);
const totalAlbums = ref(0);
const totalTracks = ref(0);

onMounted(async () => {
  try {
    const res = await api.listDownloadedFiles();
    totalArtists.value = res.data.length;
    totalAlbums.value = res.data.reduce((s, a) => s + a.albums.length, 0);
    totalTracks.value = res.data.reduce((s, a) => s + a.albums.reduce((ss, alb) => ss + (alb.trackCount ?? 0), 0), 0);
  } catch {}
  await queue.refresh();
});

const activeJobs = computed(() => queue.jobs.filter(j => !["completed","error","cancelled"].includes(j.status)).length);
const completedJobs = computed(() => queue.jobs.filter(j => j.status === "completed").length);

const kpis = computed(() => [
  { label: "Artists", value: totalArtists.value, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F7CFF" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
  { label: "Albums", value: totalAlbums.value, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#67E8F9" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>` },
  { label: "Tracks", value: totalTracks.value, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>` },
  { label: "Active Jobs", value: activeJobs.value, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
  { label: "Completed", value: completedJobs.value, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86efac" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>` },
]);

// Mock activity bars (7 days)
const activityBars = [42, 67, 18, 89, 55, 30, 78];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formats = [
  { name: "FLAC", pct: 65 },
  { name: "MP3", pct: 28 },
  { name: "META", pct: 7 },
];

const statusDist = computed(() => {
  const total = Math.max(queue.jobs.length, 1);
  return [
    { status: "completed", count: completedJobs.value, pct: Math.round(completedJobs.value / total * 100), color: "#67E8F9" },
    { status: "error",     count: queue.jobs.filter(j => j.status === "error").length,     pct: Math.round(queue.jobs.filter(j => j.status === "error").length / total * 100),     color: "#fca5a5" },
    { status: "processing",count: queue.jobs.filter(j => j.status === "processing").length, pct: Math.round(queue.jobs.filter(j => j.status === "processing").length / total * 100), color: "#4F7CFF" },
  ];
});
</script>

<style scoped>
.page-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; animation: fadeSlideUp 0.4s ease; }
@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.page-header { display: flex; flex-direction: column; gap: 4px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.page-sub { font-size: 13px; color: var(--muted); }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.kpi-card { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; transition: border-color 0.2s, box-shadow 0.2s; }
.kpi-card:hover { border-color: rgba(79,124,255,0.25); box-shadow: 0 4px 20px rgba(79,124,255,0.08); }
.kpi-icon { width: 36px; height: 36px; border-radius: 9px; background: rgba(9,14,26,0.8); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-value { font-size: 24px; font-weight: 700; color: var(--text); line-height: 1; }
.kpi-label { font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-top: 2px; }

.chart-placeholder { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 18px 20px; }
.chart-title { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }
.chart-bars { display: flex; align-items: flex-end; gap: 10px; height: 100px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
.bar { width: 100%; background: linear-gradient(180deg, var(--accent), var(--accent-2)); border-radius: 4px 4px 2px 2px; opacity: 0.7; transition: opacity 0.2s; }
.bar-col:hover .bar { opacity: 1; }
.bar-label { font-size: 10px; color: var(--muted); }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.section-card { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; }
.section-title { font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); }

.format-list { display: flex; flex-direction: column; gap: 10px; }
.format-row { display: flex; align-items: center; gap: 10px; }
.fmt-name { font-size: 12px; font-weight: 600; color: var(--text); min-width: 40px; }
.fmt-bar-wrap { flex: 1; height: 5px; background: rgba(199,210,254,0.08); border-radius: 999px; overflow: hidden; }
.fmt-bar { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); border-radius: 999px; }
.fmt-pct { font-size: 11px; color: var(--muted); min-width: 30px; text-align: right; }

.status-list { display: flex; flex-direction: column; gap: 10px; }
.status-dist-row { display: flex; align-items: center; gap: 10px; }
.dist-bar-wrap { flex: 1; height: 5px; background: rgba(199,210,254,0.08); border-radius: 999px; overflow: hidden; }
.dist-bar { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
.dist-num { font-size: 11px; color: var(--muted); min-width: 20px; text-align: right; }
</style>
