<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Downloads</h1>
      <p class="page-sub">Completed downloads and library files.</p>
      <button class="btn-secondary" @click="loadAll">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh
      </button>
    </div>

    <p v-if="error" class="err-msg">{{ error }}</p>

    <div v-if="loading" class="loading-text">Loading downloads…</div>

    <template v-else>
      <!-- Completed jobs -->
      <div class="section-block">
        <div class="section-label">Recent Jobs</div>
        <div v-if="jobs.length" class="jobs-list">
          <JobCard
            v-for="job in jobs"
            :key="job.id"
            :job="job"
            :active="inspectedJob?.id === job.id"
            @inspect="openInspect(job)"
            @pause="handleAction(job, 'pause')"
            @resume="handleAction(job, 'resume')"
            @retry="handleAction(job, 'retry')"
            @cancel="handleAction(job, 'cancel')"
          />
        </div>
        <div v-else class="empty-row">No download jobs found.</div>
      </div>

      <!-- Library files -->
      <div class="section-block">
        <div class="section-header-row">
          <div class="section-label">Library Files</div>
          <input v-model="libraryFilter" class="filter-input" placeholder="Filter artists, albums, tracks…" />
        </div>
        <div v-if="filteredLibrary.length" class="library-list">
          <details
            v-for="artist in filteredLibrary"
            :key="artist.name"
            class="artist-group"
          >
            <summary class="artist-summary">
              <span class="artist-name">{{ artist.name }}</span>
              <span class="artist-meta">{{ artist.albums.length }} albums</span>
            </summary>
            <div class="albums-grid">
              <div
                v-for="album in artist.albums"
                :key="album.name"
                class="library-album-card"
              >
                <img v-if="album.coverUrl" :src="album.coverUrl" :alt="album.name" class="lib-cover" loading="lazy" />
                <div v-else class="lib-cover-fallback">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(199,210,254,0.15)" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
                </div>
                <div class="lib-album-name">{{ album.name }}</div>
                <div class="lib-track-count">{{ album.trackCount }} tracks</div>
              </div>
            </div>
          </details>
        </div>
        <div v-else class="empty-row">No library files found.</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DownloadJob, LibraryArtist } from "~/types/music";

const api = useApi();
const inspector = useInspectorStore();

const jobs = ref<DownloadJob[]>([]);
const files = ref<LibraryArtist[]>([]);
const loading = ref(true);
const error = ref("");
const inspectedJob = ref<DownloadJob | null>(null);
const libraryFilter = ref("");

async function loadAll() {
  loading.value = true;
  error.value = "";
  try {
    const [jr, fr] = await Promise.all([api.listDownloads(), api.listDownloadedFiles()]);
    jobs.value = jr.data;
    files.value = fr.data;
    if (!inspectedJob.value && jobs.value.length) inspectedJob.value = jobs.value[0];
  } catch (e: any) {
    error.value = e?.data?.error ?? e?.message ?? "Load failed";
  } finally {
    loading.value = false;
  }
}

function openInspect(job: DownloadJob) {
  inspectedJob.value = job;
  inspector.inspectJob(job);
}

function applyUpdate(updated: DownloadJob) {
  if (inspectedJob.value?.id === updated.id) inspectedJob.value = updated;
  jobs.value = jobs.value.map((j) => (j.id === updated.id ? updated : j));
}

async function handleAction(job: DownloadJob, action: "pause" | "resume" | "retry" | "cancel") {
  try {
    let response;
    if (action === "pause")  response = await api.pauseDownload(job.id);
    if (action === "resume") response = await api.resumeDownload(job.id);
    if (action === "retry")  response = await api.retryDownload(job.id);
    if (action === "cancel") response = await api.cancelDownload(job.id);
    if (response?.data) applyUpdate(response.data);
  } catch {}
}

const libraryWithCovers = computed(() =>
  files.value.map((artist) => ({
    ...artist,
    albums: artist.albums.map((album) => ({
      ...album,
      coverUrl: album.coverFile ? api.coverUrl(artist.name, album.name) : null,
    })),
  }))
);

const filteredLibrary = computed(() => {
  const term = libraryFilter.value.trim().toLowerCase();
  if (!term) return libraryWithCovers.value;
  return libraryWithCovers.value
    .map((artist) => {
      const matched = artist.albums.filter(
        (a) => a.name.toLowerCase().includes(term) || a.files.some((f) => f.toLowerCase().includes(term))
      );
      if (artist.name.toLowerCase().includes(term)) return artist;
      if (matched.length) return { ...artist, albums: matched };
      return null;
    })
    .filter(Boolean) as LibraryArtist[];
});

onMounted(loadAll);
</script>

<style scoped>
.page-content {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeSlideUp 0.4s ease;
}
@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.page-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.page-title { font-size: 22px; font-weight: 700; color: var(--text); flex: 1; letter-spacing: -0.02em; }
.page-sub { font-size: 13px; color: var(--muted); width: 100%; margin-top: -8px; }

.err-msg { font-size: 12px; color: #fca5a5; background: rgba(252,165,165,0.07); border: 1px solid rgba(252,165,165,0.2); border-radius: 7px; padding: 8px 12px; }
.loading-text { font-size: 13px; color: var(--muted); }
.empty-row { font-size: 13px; color: var(--muted); padding: 16px 0; }

.section-block { display: flex; flex-direction: column; gap: 12px; }

.section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}

.section-header-row { display: flex; align-items: center; gap: 12px; }

.filter-input {
  flex: 1;
  max-width: 280px;
  font-size: 12px;
  padding: 7px 12px;
  border-radius: 8px;
  background: rgba(9,14,26,0.8);
  border: 1px solid var(--line);
  color: var(--text);
}

.jobs-list { display: flex; flex-direction: column; gap: 8px; }

.library-list { display: flex; flex-direction: column; gap: 6px; }

.artist-group {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.artist-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  list-style: none;
  transition: background 0.15s;
}

.artist-summary:hover { background: rgba(79,124,255,0.04); }

.artist-name { font-size: 14px; font-weight: 600; color: var(--text); flex: 1; }
.artist-meta { font-size: 11px; color: var(--muted); }

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  padding: 10px 16px 14px;
}

.library-album-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(9,14,26,0.5);
  border: 1px solid var(--line);
}

.lib-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.lib-cover-fallback {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(79,124,255,0.03);
}

.lib-album-name { font-size: 12px; font-weight: 600; color: var(--text); padding: 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lib-track-count { font-size: 10px; color: var(--muted); padding: 0 8px 8px; }

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
