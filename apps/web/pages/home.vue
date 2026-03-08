<script setup lang="ts">
import type { DownloadJob, LibraryArtist } from "~/types/music";

const api = useApi();

const jobs = ref<DownloadJob[]>([]);
const files = ref<LibraryArtist[]>([]);
const loading = ref(true);

async function loadOverview() {
  loading.value = true;
  try {
    const [jobsResponse, filesResponse] = await Promise.all([
      api.listDownloads(),
      api.listDownloadedFiles(),
    ]);
    jobs.value = jobsResponse.data;
    files.value = filesResponse.data;
  } finally {
    loading.value = false;
  }
}

const stats = computed(() => {
  const artists = files.value.length;
  const albums = files.value.reduce((total, artist) => total + artist.albums.length, 0);
  const tracks = files.value.reduce(
    (total, artist) => total + artist.albums.reduce((sum, album) => sum + (album.trackCount ?? 0), 0),
    0,
  );
  const activeJobs = jobs.value.filter((job) => !["completed", "error", "cancelled"].includes(job.status)).length;
  return { artists, albums, tracks, activeJobs };
});

const latestJob = computed(() => {
  if (!jobs.value.length) return null;
  return [...jobs.value].sort((a, b) => b.updatedAt - a.updatedAt)[0];
});

onMounted(loadOverview);
</script>

<template>
  <div class="workspace">
    <WorkspaceHeader
      title="Home"
      eyebrow="Studio Overview"
      subtitle="Your current acquisition status and library footprint."
    >
      <template #actions>
        <button class="secondary" type="button" @click="loadOverview">Refresh</button>
      </template>
    </WorkspaceHeader>

    <section class="panel">
      <div class="panel-title">Workspace Health</div>
      <div class="kpi-grid">
        <div class="kpi">
          <div class="kpi-label">Active Jobs</div>
          <div class="kpi-value">{{ stats.activeJobs }}</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Artists</div>
          <div class="kpi-value">{{ stats.artists }}</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Albums</div>
          <div class="kpi-value">{{ stats.albums }}</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Tracks</div>
          <div class="kpi-value">{{ stats.tracks }}</div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-title">Latest Job</div>
      <div v-if="loading" class="empty">Loading workspace telemetry...</div>
      <div v-else-if="latestJob" class="grid" style="gap: 10px;">
        <div class="badge">{{ latestJob.id }}</div>
        <strong style="font-size: 14px;">{{ latestJob.url }}</strong>
        <div class="status" :class="latestJob.status">{{ latestJob.status }}</div>
        <div style="color: var(--muted); font-size: 12px;">{{ latestJob.message }}</div>
      </div>
      <div v-else class="empty">No jobs yet. Start a search to begin acquisition.</div>
    </section>
  </div>
</template>
