<script setup lang="ts">
import type { SearchResult } from "~/types/music";

const props = defineProps<{ item: SearchResult }>();
const emit = defineEmits<{ (e: "download", item: SearchResult): void }>();
</script>

<template>
  <article class="card">
    <img
      :src="props.item.cover || 'https://picsum.photos/seed/lucida/400/400'"
      :alt="props.item.title"
      style="width: 100%; height: 180px; object-fit: cover; border-radius: 12px"
    />
    <div>
      <h3 style="font-size: 16px">{{ props.item.title }}</h3>
      <p style="color: var(--muted); font-size: 13px">{{ props.item.artist }}</p>
    </div>
    <button class="ghost" @click="emit('download', props.item)">Queue Download</button>
  </article>
</template>
