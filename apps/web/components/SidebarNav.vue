<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="brand">
      <div class="brand-mark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L3 8.5V15.5L12 21L21 15.5V8.5L12 3Z" fill="url(#grad)" stroke="none"/>
          <path d="M12 8v8M8 10l4 2 4-2" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <stop stop-color="#4F7CFF"/>
              <stop offset="1" stop-color="#67E8F9"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <div class="brand-name">Lucida Studio</div>
        <div class="brand-sub">v2.0 Workstation</div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="nav">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item) }"
      >
        <span class="nav-icon" v-html="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <!-- Connection status -->
      <div class="conn-status">
        <span class="conn-dot" :class="consoleStore.connectionState" />
        <span class="conn-label">{{ connectionLabel }}</span>
      </div>

      <!-- Console toggle -->
      <button class="console-toggle-btn" @click="consoleStore.toggleDrawer">
        <span class="btn-icon">⌨</span>
        Console
        <kbd class="kbd">`</kbd>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute();
const consoleStore = useConsoleStore();
const queueStore = useQueueStore();

const activeJobs = computed(() =>
  queueStore.jobs.filter(j => !["completed","error","cancelled"].includes(j.status)).length
);

const navItems = computed(() => [
  { to: "/", label: "Search", icon: searchIcon, exact: true },
  { to: "/queue", label: "Queue", icon: queueIcon, badge: activeJobs.value || null },
  { to: "/downloads", label: "Downloads", icon: downloadIcon },
  { to: "/library", label: "Library", icon: libraryIcon },
  { to: "/playlists", label: "Playlists", icon: playlistIcon },
  { to: "/analytics", label: "Analytics", icon: analyticsIcon },
  { to: "/console", label: "Console", icon: consoleIcon },
  { to: "/settings", label: "Settings", icon: settingsIcon },
]);

function isActive(item: { to: string; exact?: boolean }) {
  if (item.exact) return route.path === item.to;
  return route.path.startsWith(item.to);
}

const connectionLabel = computed(() => {
  const s = consoleStore.connectionState;
  if (s === "open") return "Live";
  if (s === "closed") return "Offline";
  return "Connecting";
});

// SVG icons
const searchIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
const queueIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const downloadIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const libraryIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
const playlistIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
const analyticsIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;
const consoleIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`;
const settingsIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-w);
  background: var(--panel);
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  padding: 20px 14px 16px;
  gap: 8px;
  z-index: 100;
  overflow: hidden;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px 14px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 8px;
}

.brand-mark {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, rgba(79,124,255,0.2), rgba(103,232,249,0.2));
  border: 1px solid rgba(79,124,255,0.4);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 16px rgba(79,124,255,0.25);
}

.brand-name {
  font-size: 13px;
  font-weight: 600;
  color: #c7d2fe;
  letter-spacing: 0.06em;
}

.brand-sub {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-top: 1px;
}

.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 450;
  color: var(--muted);
  transition: all 0.15s ease;
  position: relative;
  text-decoration: none;
  border: 1px solid transparent;
}

.nav-item:hover {
  color: var(--text);
  background: rgba(79,124,255,0.07);
}

.nav-item.active {
  color: var(--text);
  background: rgba(79,124,255,0.14);
  border-color: rgba(79,124,255,0.3);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 2px;
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.8;
}

.nav-item.active .nav-icon { opacity: 1; }

.nav-label { flex: 1; }

.nav-badge {
  font-size: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #0B1220;
  padding: 2px 6px;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
  line-height: 14px;
}

.sidebar-footer {
  border-top: 1px solid var(--line);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conn-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 6px;
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.08em;
}

.conn-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--muted);
  flex-shrink: 0;
}

.conn-dot.open { background: #67E8F9; box-shadow: 0 0 8px rgba(103,232,249,0.5); }
.conn-dot.closed { background: #fca5a5; }
.conn-dot.connecting { background: #fbbf24; animation: pulse 2s infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.console-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 9px;
  border: 1px solid rgba(79,124,255,0.2);
  background: rgba(79,124,255,0.06);
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.console-toggle-btn:hover {
  background: rgba(79,124,255,0.12);
  color: var(--text);
  border-color: rgba(79,124,255,0.4);
}

.btn-icon { font-size: 13px; }

.kbd {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border: 1px solid rgba(199,210,254,0.2);
  border-radius: 4px;
  color: var(--muted);
  background: rgba(0,0,0,0.3);
}
</style>
