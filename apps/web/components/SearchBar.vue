<template>
  <div class="search-bar-root">
    <!-- Main search input -->
    <div class="search-input-wrap">
      <div class="search-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <input
        v-model="search.query"
        class="search-input"
        type="text"
        placeholder="Search by artist, album, or URL…"
        spellcheck="false"
        autocomplete="off"
        @keydown.enter="search.runSearch"
      />
      <button
        class="search-btn"
        :disabled="search.isSearching"
        @click="search.runSearch"
      >
        <span v-if="search.isSearching" class="spin">⟳</span>
        <span v-else>Search</span>
      </button>
    </div>

    <!-- Filter row -->
    <div class="filter-row">
      <!-- Source -->
      <div class="filter-group">
        <span class="filter-label">Source</span>
        <div class="chip-group">
          <button
            v-for="s in sources"
            :key="s"
            class="chip"
            :class="{ active: search.filters.source === s }"
            @click="search.filters.source = s"
          >{{ s }}</button>
        </div>
      </div>

      <!-- Quality -->
      <div class="filter-group">
        <span class="filter-label">Quality</span>
        <div class="chip-group">
          <button
            v-for="q in qualities"
            :key="q"
            class="chip"
            :class="{ active: search.filters.quality === q }"
            @click="search.filters.quality = q"
          >{{ q }}</button>
        </div>
      </div>

      <!-- Type -->
      <div class="filter-group">
        <span class="filter-label">Type</span>
        <div class="chip-group">
          <button
            v-for="t in types"
            :key="t"
            class="chip"
            :class="{ active: search.filters.type === t }"
            @click="search.filters.type = t"
          >{{ t }}</button>
        </div>
      </div>
    </div>

    <p v-if="search.error" class="search-error">{{ search.error }}</p>
  </div>
</template>

<script setup lang="ts">
const search = useSearchStore();

const sources = ["All", "Lucida", "Tidal", "Spotify", "Baka"] as const;
const qualities = ["Any", "FLAC", "MP3"] as const;
const types = ["Album", "Artist", "Track"] as const;
</script>

<style scoped>
.search-bar-root {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(9,14,26,0.9);
  border: 1px solid rgba(199,210,254,0.12);
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input-wrap:focus-within {
  border-color: rgba(79,124,255,0.5);
  box-shadow: 0 0 0 3px rgba(79,124,255,0.12), 0 4px 24px rgba(79,124,255,0.08);
}

.search-icon {
  padding: 0 14px;
  color: var(--muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 15px;
  font-weight: 400;
  padding: 14px 0;
  caret-color: var(--accent);
  box-shadow: none;
}

.search-input::placeholder { color: rgba(122,146,188,0.5); }

.search-btn {
  flex-shrink: 0;
  padding: 10px 20px;
  margin: 6px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border: none;
  border-radius: 9px;
  color: #0B1220;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.search-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
.search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spin {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-group { display: flex; align-items: center; gap: 8px; }

.filter-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  flex-shrink: 0;
}

.chip-group { display: flex; gap: 4px; }

.chip {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(199,210,254,0.12);
  background: transparent;
  color: var(--muted);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.chip:hover { border-color: rgba(199,210,254,0.3); color: var(--text); }

.chip.active {
  border-color: rgba(79,124,255,0.5);
  background: rgba(79,124,255,0.14);
  color: var(--accent-2);
}

.search-error {
  font-size: 12px;
  color: #fca5a5;
  padding: 6px 10px;
  background: rgba(252,165,165,0.07);
  border: 1px solid rgba(252,165,165,0.2);
  border-radius: 7px;
}
</style>
