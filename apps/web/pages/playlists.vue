<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Playlists</h1>
      <p class="page-sub">Curated collections from your library.</p>
    </div>

    <div class="playlist-grid">
      <div
        v-for="pl in playlists"
        :key="pl.id"
        class="playlist-card"
        @click="selectedPlaylist = pl"
      >
        <div class="pl-mosaic">
          <div v-for="i in 4" :key="i" class="pl-mosaic-cell" :style="{ background: pl.colors[i - 1] }" />
        </div>
        <div class="pl-info">
          <div class="pl-name">{{ pl.name }}</div>
          <div class="pl-meta">{{ pl.trackCount }} tracks · {{ pl.duration }}</div>
        </div>
      </div>
    </div>

    <div v-if="selectedPlaylist" class="playlist-detail">
      <div class="pl-detail-header">
        <div class="pl-detail-mosaic">
          <div v-for="i in 4" :key="i" class="pl-mosaic-cell lg" :style="{ background: selectedPlaylist.colors[i - 1] }" />
        </div>
        <div>
          <div class="eyebrow">Playlist</div>
          <h2 class="pl-detail-name">{{ selectedPlaylist.name }}</h2>
          <div class="pl-detail-meta">{{ selectedPlaylist.trackCount }} tracks · {{ selectedPlaylist.duration }}</div>
        </div>
      </div>
      <div class="pl-tracks">
        <div v-for="(track, i) in selectedPlaylist.tracks" :key="i" class="pl-track-row">
          <span class="track-num">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="track-info">
            <div class="track-name">{{ track.title }}</div>
            <div class="track-artist">{{ track.artist }}</div>
          </div>
          <span class="track-duration">{{ track.duration }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectedPlaylist = ref<any>(null);

const playlists = [
  {
    id: 1,
    name: "Late Night Sessions",
    trackCount: 24,
    duration: "1h 42m",
    colors: ["rgba(79,124,255,0.4)", "rgba(103,232,249,0.4)", "rgba(167,139,250,0.4)", "rgba(79,124,255,0.2)"],
    tracks: [
      { title: "Midnight Haze", artist: "Tycho", duration: "4:20" },
      { title: "Awake", artist: "Tycho", duration: "5:12" },
      { title: "Dive", artist: "Tycho", duration: "4:47" },
      { title: "A Walk", artist: "Tycho", duration: "4:10" },
      { title: "Coastal Brake", artist: "Tycho", duration: "4:28" },
    ],
  },
  {
    id: 2,
    name: "Cinematic Acquisition",
    trackCount: 18,
    duration: "1h 15m",
    colors: ["rgba(251,191,36,0.3)", "rgba(252,165,165,0.3)", "rgba(103,232,249,0.3)", "rgba(167,139,250,0.3)"],
    tracks: [
      { title: "Experience", artist: "Ludovico Einaudi", duration: "5:30" },
      { title: "Nuvole Bianche", artist: "Ludovico Einaudi", duration: "5:57" },
      { title: "Una Mattina", artist: "Ludovico Einaudi", duration: "3:51" },
    ],
  },
  {
    id: 3,
    name: "High Fidelity FLAC",
    trackCount: 42,
    duration: "2h 58m",
    colors: ["rgba(134,239,172,0.3)", "rgba(103,232,249,0.3)", "rgba(79,124,255,0.3)", "rgba(134,239,172,0.2)"],
    tracks: [
      { title: "Time", artist: "Hans Zimmer", duration: "4:35" },
      { title: "Cornfield Chase", artist: "Hans Zimmer", duration: "2:07" },
      { title: "Stay", artist: "Hans Zimmer", duration: "5:48" },
    ],
  },
];
</script>

<style scoped>
.page-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; animation: fadeSlideUp 0.4s ease; }
@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.page-header { display: flex; flex-direction: column; gap: 4px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.page-sub { font-size: 13px; color: var(--muted); }

.playlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }

.playlist-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
  border-color: rgba(79,124,255,0.3);
  box-shadow: 0 8px 28px rgba(79,124,255,0.1);
}

.pl-mosaic { display: grid; grid-template-columns: 1fr 1fr; aspect-ratio: 1; }
.pl-mosaic-cell { transition: opacity 0.2s; }
.pl-mosaic-cell.lg { width: 48px; height: 48px; }
.playlist-card:hover .pl-mosaic-cell { opacity: 1.2; }

.pl-info { padding: 10px 12px 12px; }
.pl-name { font-size: 13px; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pl-meta { font-size: 11px; color: var(--muted); margin-top: 3px; }

.playlist-detail {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeSlideUp 0.3s ease;
}

.pl-detail-header { display: flex; align-items: center; gap: 16px; }

.pl-detail-mosaic { display: grid; grid-template-columns: 1fr 1fr; width: 80px; height: 80px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }

.eyebrow { font-size: 10px; color: var(--accent); letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; }
.pl-detail-name { font-size: 20px; font-weight: 700; color: var(--text); margin: 4px 0 2px; letter-spacing: -0.01em; }
.pl-detail-meta { font-size: 12px; color: var(--muted); }

.pl-tracks { display: flex; flex-direction: column; gap: 2px; }

.pl-track-row {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  transition: background 0.15s;
  cursor: default;
}

.pl-track-row:hover { background: rgba(79,124,255,0.06); }

.track-num { font-size: 12px; font-family: "JetBrains Mono", monospace; color: var(--muted); text-align: right; }
.track-info { display: flex; flex-direction: column; gap: 2px; }
.track-name { font-size: 13px; font-weight: 500; color: var(--text); }
.track-artist { font-size: 11px; color: var(--muted); }
.track-duration { font-size: 12px; font-family: "JetBrains Mono", monospace; color: var(--muted); }
</style>
