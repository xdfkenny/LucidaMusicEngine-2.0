<script setup lang="ts">
const consoleState = useConsole();

const {
  filteredLogs,
  filters,
  filter,
  search,
  paused,
  autoScroll,
  status,
  connectionState,
  togglePause,
  clear,
  setFilter,
} = consoleState;
</script>

<template>
  <section class="console-panel">
    <div class="console-header">
      <div>
        <div class="panel-title">Developer Console</div>
        <div class="console-status">
          <span>Backend: {{ status.backend }}</span>
          <span>Scraper: {{ status.scraper }}</span>
          <span>Queue: {{ status.queue }}</span>
          <span>Stream: {{ connectionState }}</span>
        </div>
      </div>
      <div class="console-actions">
        <button type="button" class="secondary" @click="togglePause">
          {{ paused ? "Resume" : "Pause" }}
        </button>
        <button type="button" class="secondary" @click="clear">Clear</button>
        <button type="button" class="secondary" @click="autoScroll = !autoScroll">
          Auto-scroll: {{ autoScroll ? "On" : "Off" }}
        </button>
      </div>
    </div>

    <ConsoleFilterTabs :filters="filters" :active="filter" @change="setFilter" />
    <ConsoleSearch v-model="search" />

    <ConsoleLogList :logs="filteredLogs" :auto-scroll="autoScroll" />
  </section>
</template>
