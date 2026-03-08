<template>
  <div class="pipeline-root">
    <!-- Stages -->
    <div class="pipeline-track">
      <template v-for="(stage, i) in stages" :key="stage.key">
        <div class="stage-item">
          <div
            class="stage-dot"
            :class="{
              done: isDone(stage.key),
              active: isActive(stage.key),
            }"
          />
          <span class="stage-label" :class="{ active: isActive(stage.key) || isDone(stage.key) }">
            {{ stage.label }}
          </span>
        </div>

        <!-- Connector (except after last) -->
        <div v-if="i < stages.length - 1" class="stage-connector">
          <div
            class="connector-fill"
            :style="{ width: getConnectorFill(stage.key) }"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  status?: string;
}>();

const stages = [
  { key: "queued",     label: "Queued" },
  { key: "fetching",   label: "Fetching" },
  { key: "processing", label: "Processing" },
  { key: "completed",  label: "Completed" },
];

const stageOrder = ["queued", "fetching", "processing", "completed"];

const currentIndex = computed(() => {
  const s = props.status ?? "queued";
  if (s === "error" || s === "cancelled") return -1;
  const idx = stageOrder.indexOf(s);
  return idx !== -1 ? idx : 0;
});

function isDone(key: string) {
  const idx = stageOrder.indexOf(key);
  return idx < currentIndex.value;
}

function isActive(key: string) {
  const idx = stageOrder.indexOf(key);
  return idx === currentIndex.value;
}

function getConnectorFill(key: string) {
  const idx = stageOrder.indexOf(key);
  if (idx < currentIndex.value) return "100%";
  if (idx === currentIndex.value) return "50%";
  return "0%";
}
</script>

<style scoped>
.pipeline-root {
  padding: 8px 0;
}

.pipeline-track {
  display: flex;
  align-items: center;
  gap: 0;
}

.stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.stage-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(199,210,254,0.1);
  border: 2px solid rgba(199,210,254,0.18);
  transition: all 0.4s ease;
  position: relative;
}

.stage-dot.done {
  background: var(--accent-2);
  border-color: transparent;
  box-shadow: 0 0 8px rgba(103,232,249,0.4);
}

.stage-dot.active {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border-color: transparent;
  box-shadow: 0 0 0 0 rgba(79,124,255,0);
  animation: pipelinePulse 2s ease-in-out infinite;
}

@keyframes pipelinePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(79,124,255,0); }
  50%       { box-shadow: 0 0 0 8px rgba(79,124,255,0.2); }
}

.stage-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(199,210,254,0.3);
  white-space: nowrap;
  transition: color 0.3s;
}

.stage-label.active { color: var(--text); }

.stage-connector {
  flex: 1;
  height: 2px;
  background: rgba(199,210,254,0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 16px;
  min-width: 24px;
}

.connector-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: 999px;
  transition: width 0.6s ease;
}
</style>
