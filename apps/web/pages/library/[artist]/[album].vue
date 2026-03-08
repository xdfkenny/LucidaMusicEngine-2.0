<script setup lang="ts">
import type { AlbumDetail, EnrichedMetadata } from "~/types/music";

const route = useRoute();
const api = useApi();

const artist = computed(() => decodeURIComponent(String(route.params.artist ?? "")));
const albumName = computed(() => decodeURIComponent(String(route.params.album ?? "")));

const detail = ref<AlbumDetail | null>(null);
const metadata = ref<EnrichedMetadata | null>(null);
const loading = ref(true);
const error = ref("");
const metadataLoading = ref(false);
const metadataError = ref("");

const coverUrl = computed(() => {
  if (!detail.value) return null;
  return detail.value.coverFile ? api.coverUrl(detail.value.artist, detail.value.name) : null;
});

async function loadMetadata() {
  if (!detail.value) return;
  metadataLoading.value = true;
  metadataError.value = "";
  try {
    const response = await api.enrichMetadata({
      artist: detail.value.artist,
      album: detail.value.name,
      title: detail.value.name,
    });
    metadata.value = response.data;
  } catch (e: any) {
    metadataError.value = e?.data?.error ?? e?.message ?? "Metadata enrichment failed";
    metadata.value = null;
  } finally {
    metadataLoading.value = false;
  }
}

async function loadAlbum() {
  loading.value = true;
  error.value = "";
  detail.value = null;
  metadata.value = null;

  try {
    const response = await api.getAlbumDetail(artist.value, albumName.value);
    detail.value = response.data;
    await loadMetadata();
  } catch (e: any) {
    error.value = e?.data?.error ?? e?.message ?? "Failed to load album";
  } finally {
    loading.value = false;
  }
}

watch([artist, albumName], () => {
  void loadAlbum();
}, { immediate: true });
</script>

<template>
  <div class="workspace">
    <WorkspaceHeader
      :title="albumName"
      eyebrow="Library Detail"
      :subtitle="artist"
    >
      <template #actions>
        <NuxtLink to="/library">
          <button class="secondary" type="button">Back to Library</button>
        </NuxtLink>
        <button class="secondary" type="button" @click="loadAlbum">Refresh</button>
      </template>
    </WorkspaceHeader>

    <p v-if="loading" class="empty">Loading album...</p>
    <p v-if="error" class="status error">{{ error }}</p>

    <div v-if="detail" class="workspace-grid">
      <section class="panel">
        <div class="panel-title">Album Overview</div>
        <div class="grid" style="grid-template-columns: 180px 1fr; gap: 16px; align-items: start;">
          <img
            :src="coverUrl || 'https://picsum.photos/seed/lucida/600/600'"
            :alt="detail.name"
            class="album-cover"
          />
          <div class="grid" style="gap: 8px;">
            <div class="tag">Artist</div>
            <div style="font-size: 16px;">{{ detail.artist }}</div>
            <div class="tag">Album</div>
            <div style="font-size: 16px;">{{ detail.name }}</div>
            <div class="tag">Tracks</div>
            <div style="font-size: 14px; color: var(--muted);">{{ detail.trackCount }}</div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">Metadata Overlay</div>
        <div v-if="metadataLoading" class="empty">Enriching metadata...</div>
        <div v-else-if="metadataError" class="status error">{{ metadataError }}</div>
        <div v-else-if="metadata" class="grid" style="gap: 12px;">
          <div class="grid" style="gap: 6px;">
            <div style="font-size: 14px;">{{ metadata.merged.title || detail.name }}</div>
            <div style="font-size: 12px; color: var(--muted)">Artist: {{ metadata.merged.artist || detail.artist }}</div>
            <div v-if="metadata.merged.releaseYear" style="font-size: 12px; color: var(--muted)">Year: {{ metadata.merged.releaseYear }}</div>
            <div v-if="metadata.merged.genres.length" style="font-size: 12px; color: var(--muted)">
              Genres: {{ metadata.merged.genres.join(", ") }}
            </div>
          </div>

          <img
            v-if="metadata.merged.coverArtUrl"
            :src="metadata.merged.coverArtUrl"
            alt="Metadata cover"
            class="album-cover"
          />

          <div class="grid" style="gap: 6px;">
            <div class="tag">Sources</div>
            <div v-for="source in metadata.sources" :key="source.source" style="display: flex; gap: 10px; align-items: center;">
              <div class="badge">{{ source.source }}</div>
              <div class="status" :class="source.status">{{ source.status }}</div>
              <div style="font-size: 12px; color: var(--muted);">{{ source.message }}</div>
            </div>
            <div style="font-size: 11px; color: var(--muted);">
              Cached at: {{ new Date(metadata.enrichedAt).toLocaleString() }}
            </div>
          </div>
        </div>
        <div v-else class="empty">No metadata overlay available.</div>
      </section>
    </div>

    <section v-if="detail" class="panel">
      <div class="panel-title">Track List</div>
      <div v-if="!detail.tracks.length" class="empty">No tracks found.</div>
      <div v-else class="track-list">
        <div v-for="track in detail.tracks" :key="track.filename" class="track-row">
          <div class="track-number">{{ track.trackNumber ?? "--" }}</div>
          <div>
            <div style="font-size: 13px;">{{ track.title }}</div>
            <div style="font-size: 11px; color: var(--muted);">{{ track.filename }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
