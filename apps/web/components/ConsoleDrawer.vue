<template>
  <Transition name="console-drawer">
    <div v-if="console_.drawerOpen" class="console-drawer">
      <div class="console-drawer-header">
        <div class="drawer-title-row">
          <span class="drawer-title">Console</span>
          <div class="conn-indicators">
            <span class="ind-dot" :class="console_.connectionState" />
            <span class="ind-text">{{ connLabel }}</span>
            <span class="ind-sep">·</span>
            <span class="ind-text">Backend: {{ console_.status.backend }}</span>
            <span class="ind-sep">·</span>
            <span class="ind-text">Queue: {{ console_.status.queue }}</span>
          </div>
        </div>

        <div class="drawer-actions">
          <!-- Filter pills -->
          <div class="filter-row">
            <button
              v-for="f in shortFilters"
              :key="f.type"
              class="filter-pill"
              :class="{ active: console_.filter === f.type }"
              @click="console_.setFilter(f.type)"
            >{{ f.label }}</button>
          </div>

          <!-- Search -->
          <input
            v-model="console_.search"
            class="log-search"
            placeholder="Search logs…"
            spellcheck="false"
          />

          <!-- Controls -->
          <button class="ctrl-btn" :class="{ paused: console_.paused }" @click="console_.togglePause">
            {{ console_.paused ? '▶ Resume' : '⏸ Pause' }}
          </button>
          <button class="ctrl-btn" @click="console_.clear">✕ Clear</button>
          <button class="ctrl-btn" :class="{ active: console_.autoScroll }" @click="console_.autoScroll = !console_.autoScroll">
            ↓ Scroll {{ console_.autoScroll ? 'On' : 'Off' }}
          </button>
          <button class="ctrl-btn close" @click="console_.toggleDrawer">✕</button>
        </div>
      </div>

      <!-- Log list -->
      <div ref="logList" class="log-list">
        <TransitionGroup name="log-entry">
          <ConsoleLogItem
            v-for="log in console_.filteredLogs.slice(-200)"
            :key="log.id"
            :log="log"
          />
        </TransitionGroup>
        <div v-if="!console_.filteredLogs.length" class="log-empty">
          No logs match the current filter.
        </div>
      </div>

      <!-- Paused indicator -->
      <div v-if="console_.paused" class="paused-bar">
        ⏸ PAUSED — {{ console_.filteredLogs.length }} buffered entries
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const console_ = useConsoleStore();
const logList = ref<HTMLElement | null>(null);

const shortFilters = [
  { type: "All", label: "ALL" },
  { type: "API_REQUEST", label: "REQ" },
  { type: "API_RESPONSE", label: "RES" },
  { type: "SCRAPER_EVENT", label: "SCRAPER" },
  { type: "DOWNLOAD_PROGRESS", label: "DLOAD" },
  { type: "DOWNLOAD_COMPLETE", label: "DONE" },
  { type: "ERROR", label: "ERR" },
];

const connLabel = computed(() => {
  const s = console_.connectionState;
  return s === "open" ? "Live" : s === "closed" ? "Offline" : "Connecting";
});

// Auto-scroll
watch(() => console_.filteredLogs.length, async () => {
  if (!console_.autoScroll || !logList.value) return;
  await nextTick();
  logList.value.scrollTop = logList.value.scrollHeight;
});
</script>

<style scoped>
.console-drawer {
  position: fixed;
  bottom: 0;
  left: var(--sidebar-w);
  right: 0;
  height: var(--console-h);
  background: rgba(7, 11, 20, 0.98);
  border-top: 1px solid rgba(79,124,255,0.25);
  display: flex;
  flex-direction: column;
  z-index: 80;
  backdrop-filter: blur(12px);
  font-family: "JetBrains Mono", monospace;
  box-shadow: 0 -20px 60px rgba(0,0,0,0.5);
}

.console-drawer-header {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(199,210,254,0.06);
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.drawer-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
}

.conn-indicators {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
}

.ind-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--muted);
}

.ind-dot.open { background: #67E8F9; box-shadow: 0 0 6px rgba(103,232,249,0.5); }
.ind-dot.closed { background: #fca5a5; }
.ind-dot.connecting { background: #fbbf24; animation: pulse 2s infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
}

.ind-sep { color: rgba(199,210,254,0.2); }

.drawer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
}

.filter-row { display: flex; gap: 4px; flex-shrink: 0; }

.filter-pill {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 3px 7px;
  border-radius: 999px;
  border: 1px solid rgba(199,210,254,0.15);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: "JetBrains Mono", monospace;
  white-space: nowrap;
}

.filter-pill.active {
  border-color: rgba(79,124,255,0.5);
  background: rgba(79,124,255,0.15);
  color: var(--accent-2);
}

.filter-pill:hover:not(.active) {
  border-color: rgba(199,210,254,0.3);
  color: var(--text);
}

.log-search {
  flex: 1;
  min-width: 80px;
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
  background: rgba(9,14,26,0.8);
  border: 1px solid rgba(199,210,254,0.1);
  border-radius: 5px;
  color: var(--text);
  font-family: "JetBrains Mono", monospace;
}

.log-search:focus {
  outline: none;
  border-color: rgba(79,124,255,0.4);
}

.ctrl-btn {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid rgba(199,210,254,0.12);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  font-family: "JetBrains Mono", monospace;
}

.ctrl-btn:hover { background: rgba(199,210,254,0.06); color: var(--text); }
.ctrl-btn.paused { color: #fbbf24; border-color: rgba(251,191,36,0.3); }
.ctrl-btn.active { color: var(--accent-2); border-color: rgba(103,232,249,0.3); }
.ctrl-btn.close:hover { color: #fca5a5; border-color: rgba(252,165,165,0.3); }

.log-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.log-empty {
  padding: 20px;
  text-align: center;
  font-size: 11px;
  color: var(--muted);
}

.paused-bar {
  padding: 4px 12px;
  background: rgba(251,191,36,0.08);
  border-top: 1px solid rgba(251,191,36,0.2);
  color: #fbbf24;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  flex-shrink: 0;
}

/* Transition */
.console-drawer-enter-active,
.console-drawer-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.console-drawer-enter-from,
.console-drawer-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Log entry transition */
.log-entry-enter-active { animation: slideInLog 0.2s ease; }
</style>
