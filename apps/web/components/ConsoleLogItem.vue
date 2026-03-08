<template>
  <div class="log-item" :class="[`level-${log.level}`, `type-${log.type}`]">
    <span class="log-time">{{ fmtTime(log.ts) }}</span>
    <span class="log-type" :class="`log-type-${log.type}`">{{ log.type }}</span>
    <span class="log-msg">{{ log.message }}</span>
    <span v-if="log.data" class="log-data" :title="JSON.stringify(log.data, null, 2)">
      {{ truncateData(log.data) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ConsoleLog } from "~/stores/useConsoleStore";

const props = defineProps<{ log: ConsoleLog }>();

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toTimeString().slice(0, 8) + "." + String(d.getMilliseconds()).padStart(3, "0");
}

function truncateData(data: any) {
  const str = JSON.stringify(data);
  return str.length > 80 ? str.slice(0, 80) + "…" : str;
}
</script>

<style scoped>
.log-item {
  display: grid;
  grid-template-columns: 98px 160px 1fr auto;
  gap: 10px;
  align-items: baseline;
  padding: 4px 12px;
  border-bottom: 1px solid rgba(199,210,254,0.04);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  color: var(--text);
  animation: slideInLog 0.2s ease;
  transition: background 0.1s;
}

.log-item:hover { background: rgba(199,210,254,0.03); }
.log-item:last-child { border-bottom: none; }

.log-time { color: rgba(199,210,254,0.3); font-size: 10px; white-space: nowrap; }

.log-type {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* type colors */
.log-type-API_REQUEST       { color: #93c5fd; }
.log-type-API_RESPONSE      { color: #86efac; }
.log-type-SCRAPER_EVENT     { color: #c4b5fd; }
.log-type-DOWNLOAD_PROGRESS { color: #fde68a; }
.log-type-DOWNLOAD_COMPLETE { color: #67E8F9; }
.log-type-ERROR             { color: #fca5a5; }
.log-type-SYSTEM_STATUS     { color: #7a92bc; }

.log-msg {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-data {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(199,210,254,0.3);
  font-size: 10px;
  cursor: help;
}

/* level tints */
.level-error  .log-msg { color: #fca5a5; }
.level-warning .log-msg { color: #fde68a; }
.level-success .log-msg { color: #86efac; }
</style>
