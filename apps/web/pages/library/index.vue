<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Library</h1>
      <p class="page-sub">Your downloaded music collection.</p>
    </div>
    <input v-model="filter" class="filter-input" placeholder="Search artists, albums, tracks…" />

    <div v-if="loading" class="loading-text">Loading library…</div>
    <div v-else-if="filteredArtists.length" class="library-list">
      <details v-for="artist in filteredArtists" :key="artist.name" class="artist-group" open>
        <summary class="artist-summary">
          <div class="artist-avatar">{{ artist.name.charAt(0).toUpperCase() }}</div>
          <span class="artist-name">{{ artist.name }}</span>
          <span class="artist-badge">{{ artist.albums.length }} albums</span>
        </summary>
        <div class="albums-grid">
          <div v-for="album in artist.albums" :key="album.name" class="album-tile">
            <img v-if="album.coverUrl" :src="album.coverUrl" class="tile-cover" :alt="album.name" loading="lazy" />
            <div v-else class="tile-cover-fallback">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(199,210,254,0.12)" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
            </div>
            <div class="tile-name">{{ album.name }}</div>
            <div class="tile-count">{{ album.trackCount }} tracks</div>
          </div>
        </div>
      </details>
    </div>
    <div v-else class="empty-state">
      <div class="empty-title">No library files found</div>
      <div class="empty-sub">Download some music first to populate your library.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LibraryArtist } from "~/types/music";

const api = useApi();
const filter = ref("");
const loading = ref(true);
const artists = ref<LibraryArtist[]>([]);

async function loadLibrary() {
  loading.value = true;
  try {
    const res = await api.listDownloadedFiles();
    artists.value = res.data.map((a) => ({
      ...a,
      albums: a.albums.map((alb) => ({
        ...alb,
        coverUrl: alb.coverFile ? api.coverUrl(a.name, alb.name) : null,
      })),
    }));
  } finally {
    loading.value = false;
  }
}

const filteredArtists = computed(() => {
  const term = filter.value.trim().toLowerCase();
  if (!term) return artists.value;
  return artists.value.map((a) => {
    const matched = a.albums.filter((alb) => alb.name.toLowerCase().includes(term));
    if (a.name.toLowerCase().includes(term)) return a;
    if (matched.length) return { ...a, albums: matched };
    return null;
  }).filter(Boolean) as LibraryArtist[];
});

onMounted(loadLibrary);
</script>

<style scoped>
.page-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; animation: fadeSlideUp 0.4s ease; }
@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.page-header { display: flex; flex-direction: column; gap: 4px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.page-sub { font-size: 13px; color: var(--muted); }
.filter-input { max-width: 320px; font-size: 12px; padding: 9px 14px; border-radius: 9px; background: rgba(9,14,26,0.8); border: 1px solid var(--line); color: var(--text); }
.loading-text { font-size: 13px; color: var(--muted); }
.library-list { display: flex; flex-direction: column; gap: 10px; }
.artist-group { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.artist-summary { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; list-style: none; transition: background 0.15s; }
.artist-summary:hover { background: rgba(79,124,255,0.04); }
.artist-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, rgba(79,124,255,0.2), rgba(103,232,249,0.2)); border: 1px solid rgba(79,124,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--accent-2); flex-shrink: 0; }
.artist-name { font-size: 15px; font-weight: 600; color: var(--text); flex: 1; }
.artist-badge { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; background: rgba(79,124,255,0.12); color: var(--accent); padding: 3px 8px; border-radius: 999px; }
.albums-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; padding: 10px 16px 16px; }
.album-tile { border-radius: 8px; overflow: hidden; background: rgba(9,14,26,0.6); border: 1px solid var(--line); display: flex; flex-direction: column; transition: border-color 0.2s, box-shadow 0.2s; }
.album-tile:hover { border-color: rgba(79,124,255,0.35); box-shadow: 0 4px 16px rgba(79,124,255,0.1); }
.tile-cover { width: 100%; aspect-ratio: 1; object-fit: cover; }
.tile-cover-fallback { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: rgba(79,124,255,0.03); }
.tile-name { font-size: 11px; font-weight: 600; color: var(--text); padding: 6px 8px 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tile-count { font-size: 10px; color: var(--muted); padding: 0 8px 8px; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; text-align: center; }
.empty-title { font-size: 16px; font-weight: 600; color: var(--text); }
.empty-sub { font-size: 13px; color: var(--muted); }
</style>
