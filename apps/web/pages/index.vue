<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Search</h1>
      <p class="page-sub">Acquire music from Lucida, Tidal, and more.</p>
    </div>

    <SearchBar />
    <DownloadProfileSelector />

    <div v-if="search.isSearching" class="results-loading">
      <div class="loading-grid">
        <div v-for="i in 8" :key="i" class="card-skeleton" />
      </div>
    </div>

    <div v-else-if="search.results.length" class="results-section">
      <div class="results-header">
        <span class="results-count">{{ search.results.length }} results</span>
        <span class="results-query">for "{{ search.query }}"</span>
      </div>
      <div class="album-grid">
        <AlbumCard
          v-for="item in search.results"
          :key="item.url"
          :item="item"
          :selected="inspector.result?.url === item.url"
          @inspect="inspector.inspectResult(item)"
          @queue="queueItem(item)"
        />
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(199,210,254,0.15)" stroke-width="1.2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <div class="empty-title">Ready to Acquire</div>
      <div class="empty-sub">Search by artist name, album title, Tidal/Spotify URL, or any supported source to begin.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchResult } from "~/types/music";

const search = useSearchStore();
const inspector = useInspectorStore();
const queue = useQueueStore();

async function queueItem(item: SearchResult) {
  inspector.inspectResult(item);
  const opts = { ...search.downloadOptions, albumYear: search.downloadOptions.albumYear || null };
  await queue.startDownload(item.url, opts);
}
</script>

<style scoped>
.page-content {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeSlideUp 0.4s ease;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.page-header { display: flex; flex-direction: column; gap: 4px; }

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.page-sub { font-size: 13px; color: var(--muted); }

.results-section { display: flex; flex-direction: column; gap: 14px; }

.results-header { display: flex; align-items: center; gap: 8px; }

.results-count { font-size: 12px; font-weight: 600; color: var(--accent-2); }

.results-query { font-size: 12px; color: var(--muted); }

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}

.card-skeleton {
  aspect-ratio: 1;
  border-radius: 12px;
  background: rgba(199,210,254,0.04);
  animation: shimmer 1.6s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.9; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon { opacity: 0.6; }

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.empty-sub {
  font-size: 13px;
  color: var(--muted);
  max-width: 440px;
  line-height: 1.6;
}
</style>
