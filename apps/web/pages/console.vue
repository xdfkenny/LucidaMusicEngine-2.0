<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Console</h1>
      <p class="page-sub">Real-time backend event stream.</p>
    </div>

    <!-- Full console panel (expanded) -->
    <div class="console-full-panel">
      <!-- Header controls -->
      <div class="console-controls">
        <div class="filter-row">
          <button
            v-for="f in console_.LOG_TYPES"
            :key="f"
            class="filter-pill"
            :class="{ active: console_.filter === f }"
            @click="console_.setFilter(f)"
          >{{ f === 'All' ? 'ALL' : f }}</button>
        </div>

        <div class="control-actions">
          <input v-model="console_.search" class="search-input" placeholder="Search logs…" />
          <button class="ctrl-btn" :class="{ paused: console_.paused }" @click="console_.togglePause">
            {{ console_.paused ? '▶ Resume' : '⏸ Pause' }}
          </button>
          <button class="ctrl-btn" @click="console_.clear">✕ Clear</button>
          <button class="ctrl-btn" :class="{ on: console_.autoScroll }" @click="console_.autoScroll = !console_.autoScroll">
            ↓ Auto-scroll: {{ console_.autoScroll ? 'On' : 'Off' }}
          </button>
        </div>

        <!-- Status bar -->
        <div class="conn-bar">
          <span class="conn-dot" :class="console_.connectionState" />
          <span class="conn-text">{{ connLabel }}</span>
          <span class="sep">·</span>
          <span class="conn-text">Backend: {{ console_.status.backend }}</span>
          <span class="sep">·</span>
          <span class="conn-text">Scraper: {{ console_.status.scraper }}</span>
          <span class="sep">·</span>
          <span class="conn-text">Queue: {{ console_.status.queue }}</span>
          <span class="log-count">{{ console_.filteredLogs.length }} entries</span>
        </div>
      </div>

      <!-- Log viewport -->
      <div ref="logList" class="log-viewport">
        <TransitionGroup name="log-entry" tag="div">
          <ConsoleLogItem
            v-for="log in console_.filteredLogs"
            :key="log.id"
            :log="log"
          />
        </TransitionGroup>
        <div v-if="!console_.filteredLogs.length" class="log-empty">
          <div>No entries match the current filter.</div>
          <div v-if="console_.connectionState !== 'open'" class="offline-note">
            Stream is {{ console_.connectionState }}. Make sure the API server is running.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const console_ = useConsoleStore();
const logList = ref<HTMLElement | null>(null);

const connLabel = computed(() => {
  const s = console_.connectionState;
  return s === "open" ? "● Live" : s === "closed" ? "● Offline" : "● Connecting";
});

watch(() => console_.filteredLogs.length, async () => {
  if (!console_.autoScroll || !logList.value) return;
  await nextTick();
  logList.value.scrollTop = logList.value.scrollHeight;
});
</script>

<style scoped>
.page-content {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  animation: fadeSlideUp 0.4s ease;
}

@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.page-header { display: flex; flex-direction: column; gap: 4px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.page-sub { font-size: 13px; color: var(--muted); }

.console-full-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(7,11,20,0.95);
  border: 1px solid rgba(79,124,255,0.2);
  border-radius: 12px;
  overflow: hidden;
  font-family: "JetBrains Mono", monospace;
  min-height: 0;
}

.console-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(199,210,254,0.06);
  flex-shrink: 0;
}

.filter-row { display: flex; flex-wrap: wrap; gap: 4px; }

.filter-pill {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(199,210,254,0.12);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  font-family: "JetBrains Mono", monospace;
  white-space: nowrap;
}

.filter-pill.active { border-color: rgba(79,124,255,0.5); background: rgba(79,124,255,0.15); color: var(--accent-2); }
.filter-pill:hover:not(.active) { border-color: rgba(199,210,254,0.3); color: var(--text); }

.control-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.search-input {
  flex: 1;
  min-width: 140px;
  max-width: 300px;
  height: 26px;
  padding: 0 10px;
  font-size: 11px;
  background: rgba(9,14,26,0.8);
  border: 1px solid rgba(199,210,254,0.1);
  border-radius: 5px;
  color: var(--text);
  font-family: "JetBrains Mono", monospace;
}

.search-input:focus { outline: none; border-color: rgba(79,124,255,0.4); }

.ctrl-btn {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 4px 10px;
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
.ctrl-btn.on { color: var(--accent-2); border-color: rgba(103,232,249,0.3); }

.conn-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--muted);
}

.conn-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--muted);
  flex-shrink: 0;
}
.conn-dot.open { background: #67E8F9; box-shadow: 0 0 6px rgba(103,232,249,0.5); }
.conn-dot.closed { background: #fca5a5; }
.conn-dot.connecting { background: #fbbf24; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.sep { color: rgba(199,210,254,0.2); }
.conn-text { color: var(--muted); }
.log-count { margin-left: auto; color: rgba(199,210,254,0.3); font-size: 10px; }

.log-viewport {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
}

.log-empty {
  padding: 48px;
  text-align: center;
  font-size: 12px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.offline-note { color: #fca5a5; }
</style>
