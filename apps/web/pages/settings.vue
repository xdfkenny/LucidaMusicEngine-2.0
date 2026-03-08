<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-sub">Configure your workstation preferences.</p>
    </div>

    <div class="settings-sections">

      <!-- API -->
      <div class="settings-section">
        <div class="section-title">API Connection</div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">API Base URL</div>
            <div class="setting-desc">The base URL of the Lucida backend server.</div>
          </div>
          <input v-model="settings.apiBase" class="setting-input" placeholder="http://localhost:3000" />
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Country</div>
            <div class="setting-desc">Default country for track availability.</div>
          </div>
          <select v-model="settings.country" class="setting-select">
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="CA">Canada</option>
            <option value="auto">Auto-detect</option>
          </select>
        </div>
      </div>

      <!-- Download -->
      <div class="settings-section">
        <div class="section-title">Download Defaults</div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Default Profile</div>
            <div class="setting-desc">The download quality profile applied by default.</div>
          </div>
          <select v-model="settings.defaultProfile" class="setting-select">
            <option value="flac">FLAC — Lossless</option>
            <option value="mp3">MP3 — Compact</option>
            <option value="metadata">Metadata Only</option>
          </select>
        </div>

        <div class="setting-toggle-group">
          <div v-for="opt in toggleOptions" :key="opt.key" class="toggle-row">
            <div class="setting-info">
              <div class="setting-label">{{ opt.label }}</div>
              <div class="setting-desc">{{ opt.desc }}</div>
            </div>
            <button
              class="toggle-switch"
              :class="{ on: (settings as any)[opt.key] }"
              @click="(settings as any)[opt.key] = !(settings as any)[opt.key]"
            >
              <div class="toggle-knob" />
            </button>
          </div>
        </div>
      </div>

      <!-- Interface -->
      <div class="settings-section">
        <div class="section-title">Interface</div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Console Auto-open</div>
            <div class="setting-desc">Automatically open the console drawer on app start.</div>
          </div>
          <button class="toggle-switch" :class="{ on: settings.autoOpenConsole }" @click="settings.autoOpenConsole = !settings.autoOpenConsole">
            <div class="toggle-knob" />
          </button>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Auto-scroll logs</div>
            <div class="setting-desc">Automatically scroll to the latest log entry.</div>
          </div>
          <button class="toggle-switch" :class="{ on: consoleStore.autoScroll }" @click="consoleStore.autoScroll = !consoleStore.autoScroll">
            <div class="toggle-knob" />
          </button>
        </div>
      </div>

    </div>

    <div class="save-row">
      <button class="save-btn" @click="save">Save Settings</button>
      <span v-if="saved" class="saved-msg">✓ Settings saved</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const consoleStore = useConsoleStore();
const saved = ref(false);

const settings = reactive({
  apiBase: "http://localhost:3000",
  country: "US",
  defaultProfile: "flac",
  groupSingles: true,
  flattenDirectories: false,
  skipCover: false,
  autoOpenConsole: false,
});

const toggleOptions = [
  { key: "groupSingles", label: "Group Singles", desc: "Organize single tracks under a dedicated folder." },
  { key: "flattenDirectories", label: "Flatten Folders", desc: "Put all tracks in a single flat directory." },
  { key: "skipCover", label: "Skip Cover Art", desc: "Do not embed or download album cover art." },
];

function save() {
  // Persist to localStorage (or API in a real app)
  localStorage.setItem("lucida-settings", JSON.stringify(settings));
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 2500);
}

onMounted(() => {
  const stored = localStorage.getItem("lucida-settings");
  if (stored) {
    try { Object.assign(settings, JSON.parse(stored)); } catch {}
  }
});
</script>

<style scoped>
.page-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 28px; max-width: 680px; animation: fadeSlideUp 0.4s ease; }
@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.page-header { display: flex; flex-direction: column; gap: 4px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.page-sub { font-size: 13px; color: var(--muted); }

.settings-sections { display: flex; flex-direction: column; gap: 20px; }

.settings-section {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
  background: rgba(79,124,255,0.04);
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(199,210,254,0.05);
}

.setting-row:last-child { border-bottom: none; }

.setting-info { flex: 1; }
.setting-label { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 2px; }
.setting-desc { font-size: 11px; color: var(--muted); line-height: 1.4; }

.setting-input, .setting-select {
  width: 220px;
  flex-shrink: 0;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(9,14,26,0.8);
  border: 1px solid var(--line);
  color: var(--text);
}

.setting-toggle-group { border-top: 1px solid rgba(199,210,254,0.05); }
.toggle-row { display: flex; align-items: center; gap: 16px; padding: 12px 18px; border-bottom: 1px solid rgba(199,210,254,0.05); }
.toggle-row:last-child { border-bottom: none; }

.toggle-switch {
  width: 38px;
  height: 21px;
  border-radius: 999px;
  background: rgba(199,210,254,0.1);
  border: 1px solid rgba(199,210,254,0.15);
  position: relative;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.toggle-switch.on {
  background: rgba(79,124,255,0.4);
  border-color: rgba(79,124,255,0.6);
}

.toggle-knob {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--muted);
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s, background 0.2s;
}

.toggle-switch.on .toggle-knob {
  transform: translateX(16px);
  background: var(--accent-2);
}

.save-row { display: flex; align-items: center; gap: 14px; }

.save-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border: none;
  border-radius: 9px;
  color: #0B1220;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.save-btn:hover { opacity: 0.9; transform: translateY(-1px); }

.saved-msg {
  font-size: 12px;
  color: var(--accent-2);
  animation: fadeSlideUp 0.3s ease;
}
</style>
