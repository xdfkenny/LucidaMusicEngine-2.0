<script setup lang="ts">
import type { EnrichedMetadata, SearchResult } from "~/types/music";

const api = useApi();

const props = defineProps<{ item: SearchResult | null }>();

const metadata = ref<EnrichedMetadata | null>(null);
const loading = ref(false);
const error = ref("");

async function loadMetadata(item: SearchResult) {
  loading.value = true;
  error.value = "";
  try {
    const response = await api.enrichMetadata({
      title: item.title,
      artist: item.artist,
      url: item.url,
    });
    metadata.value = response.data;
  } catch (e: any) {
    error.value = e?.data?.error ?? e?.message ?? "Metadata enrichment failed";
    metadata.value = null;
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.item,
  (item) => {
    if (!item) {
      metadata.value = null;
      error.value = "";
      return;
    }
    void loadMetadata(item);
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="props.item" class="grid" style="gap: 12px;">
    <div class="badge">Metadata</div>

    <div v-if="loading" class="empty">Enriching metadata...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="metadata" class="grid" style="gap: 10px;">
      <div style="display: grid; gap: 6px;">
        <div style="font-size: 14px;">{{ metadata.merged.title || props.item.title }}</div>
        <div style="font-size: 12px; color: var(--muted)">Artist: {{ metadata.merged.artist || props.item.artist }}</div>
        <div v-if="metadata.merged.album" style="font-size: 12px; color: var(--muted)">Album: {{ metadata.merged.album }}</div>
        <div v-if="metadata.merged.releaseYear" style="font-size: 12px; color: var(--muted)">Year: {{ metadata.merged.releaseYear }}</div>
        <div v-if="metadata.merged.genres.length" style="font-size: 12px; color: var(--muted)">
          Genres: {{ metadata.merged.genres.join(", ") }}
        </div>
      </div>

      <img
        v-if="metadata.merged.coverArtUrl"
        :src="metadata.merged.coverArtUrl"
        alt="Cover art"
        class="album-cover"
      />

      <div class="grid" style="gap: 6px;">
        <div class="tag">Sources</div>
        <div v-for="source in metadata.sources" :key="source.source" style="display: flex; gap: 10px; align-items: center;">
          <div class="badge">{{ source.source }}</div>
          <div class="status" :class="source.status">{{ source.status }}</div>
          <div style="font-size: 12px; color: var(--muted);">{{ source.message }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty">Select a track or album to enrich metadata.</div>
</template>
