<script setup lang="ts">
import type { LibraryArtist } from "~/types/music";

const props = defineProps<{
  library: LibraryArtist[];
}>();

const albumLink = (artist: string, album: string) => {
  return `/library/${encodeURIComponent(artist)}/${encodeURIComponent(album)}`;
};
</script>

<template>
  <div class="grid" style="gap: 18px;">
    <div v-if="!props.library.length" class="empty">No files found in the library.</div>
    <article v-for="artist in props.library" :key="artist.name" class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 16px">{{ artist.name }}</h3>
        <div class="badge">{{ artist.albums.length }} albums</div>
      </div>
      <div class="album-grid">
        <NuxtLink
          v-for="album in artist.albums"
          :key="album.name"
          :to="albumLink(artist.name, album.name)"
          class="card album-card"
          style="background: rgba(10, 15, 24, 0.7);"
        >
          <img
            :src="album.coverUrl || 'https://picsum.photos/seed/lucida/400/400'"
            :alt="album.name"
            class="album-cover"
          />
          <div>
            <strong style="font-size: 13px">{{ album.name }}</strong>
            <div style="font-size: 12px; color: var(--muted)">
              {{ album.trackCount }} tracks
            </div>
          </div>
        </NuxtLink>
      </div>
    </article>
  </div>
</template>
