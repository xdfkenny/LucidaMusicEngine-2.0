<script setup lang="ts">
import type { ConsoleLog } from "~/composables/useConsole";

const props = defineProps<{
  logs: ConsoleLog[];
  autoScroll: boolean;
}>();

const containerRef = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const containerHeight = ref(300);

const rowHeight = 28;
const overscan = 10;

function updateDimensions() {
  if (!containerRef.value) return;
  containerHeight.value = containerRef.value.clientHeight || 300;
}

const totalHeight = computed(() => props.logs.length * rowHeight);
const visibleCount = computed(() => Math.ceil(containerHeight.value / rowHeight));
const startIndex = computed(() => Math.max(0, Math.floor(scrollTop.value / rowHeight) - overscan));
const endIndex = computed(() => Math.min(props.logs.length, startIndex.value + visibleCount.value + overscan * 2));
const visibleLogs = computed(() => props.logs.slice(startIndex.value, endIndex.value));
const offsetY = computed(() => startIndex.value * rowHeight);

function onScroll() {
  if (!containerRef.value) return;
  scrollTop.value = containerRef.value.scrollTop;
}

watch(
  () => props.logs.length,
  () => {
    if (!props.autoScroll || !containerRef.value) return;
    requestAnimationFrame(() => {
      if (!containerRef.value) return;
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    });
  },
);

onMounted(() => {
  updateDimensions();
  window.addEventListener("resize", updateDimensions);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateDimensions);
});
</script>

<template>
  <div ref="containerRef" class="console-log-list" @scroll="onScroll">
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <ConsoleLogItem v-for="log in visibleLogs" :key="log.id" :log="log" />
      </div>
    </div>
  </div>
</template>
