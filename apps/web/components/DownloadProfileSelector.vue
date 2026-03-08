<template>
  <div class="profile-selector">
    <div
      v-for="p in search.profiles"
      :key="p.id"
      class="profile-toggle"
      :class="{ active: search.activeProfileId === p.id }"
      @click="search.applyProfile(p.id)"
    >
      <div class="radio-indicator">
        <div class="radio-dot" />
      </div>
      <span class="profile-tag">{{ p.tag }}</span>
      <span class="profile-desc">{{ p.description }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const search = useSearchStore();
</script>

<style scoped>
.profile-selector {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.profile-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid rgba(199,210,254,0.1);
  background: rgba(9,14,26,0.7);
  cursor: pointer;
  transition: all 0.15s;
  flex: 1;
  min-width: 0;
}

.profile-toggle:hover {
  border-color: rgba(79,124,255,0.3);
  background: rgba(79,124,255,0.06);
}

.profile-toggle.active {
  border-color: rgba(79,124,255,0.5);
  background: rgba(79,124,255,0.12);
}

.radio-indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid rgba(199,210,254,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s;
}

.profile-toggle.active .radio-indicator {
  border-color: var(--accent);
}

.radio-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.15s;
}

.profile-toggle.active .radio-dot { opacity: 1; }

.profile-tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text);
  flex-shrink: 0;
}

.profile-toggle.active .profile-tag { color: var(--accent-2); }

.profile-desc {
  font-size: 10px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
