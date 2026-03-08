<script setup lang="ts">
const consoleState = useConsole();
const { logs, expanded, toggleExpanded, status, paused } = consoleState;

const latestLog = computed(() => {
  if (!logs.value.length) return null;
  return logs.value[logs.value.length - 1];
});
</script>

<template>
  <div class="mini-console" :class="{ expanded }">
    <button class="console-toggle" type="button" @click="toggleExpanded">
      {{ expanded ? "Hide Console" : "Show Console" }}
    </button>
    <div class="mini-console-status">
      <span>Backend: {{ status.backend }}</span>
      <span>Scraper: {{ status.scraper }}</span>
      <span>Queue: {{ status.queue }}</span>
      <span v-if="paused" class="mini-console-paused">Paused</span>
    </div>
    <div class="mini-console-log">
      <span v-if="latestLog">{{ new Date(latestLog.ts).toLocaleTimeString() }} {{ latestLog.message }}</span>
      <span v-else>No activity yet.</span>
    </div>
  </div>

  <div v-if="expanded" class="console-drawer">
    <ConsolePanel />
  </div>
</template>
