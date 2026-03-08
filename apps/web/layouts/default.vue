<template>
  <div class="app-root">
    <!-- Fixed Sidebar -->
    <SidebarNav />

    <!-- Main area offset by sidebar width -->
    <div class="app-body">
      <!-- Scrollable workspace -->
      <main class="workspace" :class="{ 'has-inspector': inspector.open, 'has-console': console_.drawerOpen }">
        <slot />
      </main>

      <!-- Inspector (fixed, slides in from right) -->
      <Transition name="inspector">
        <InspectorPanel v-if="inspector.open" />
      </Transition>
    </div>

    <!-- Console drawer (fixed bottom, left=sidebar-w) -->
    <ConsoleDrawer />
  </div>
</template>

<script setup lang="ts">
const inspector = useInspectorStore();
const console_ = useConsoleStore();

function handleKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  if (e.key === "`" && !["INPUT", "TEXTAREA"].includes(target.tagName)) {
    e.preventDefault();
    console_.toggleDrawer();
  }
  if (e.key === "Escape" && inspector.open) {
    inspector.close();
  }
}

onMounted(() => window.addEventListener("keydown", handleKey));
onBeforeUnmount(() => window.removeEventListener("keydown", handleKey));
</script>

<style scoped>
.app-root {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

.app-body {
  margin-left: var(--sidebar-w);
  flex: 1;
  display: flex;
  min-width: 0;
  position: relative;
  overflow: hidden;
}

.workspace {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  transition: padding-right 0.3s ease, padding-bottom 0.3s ease;
}

.workspace.has-inspector {
  padding-right: var(--inspector-w);
}

.workspace.has-console {
  padding-bottom: var(--console-h);
}

/* Inspector transition */
.inspector-enter-active,
.inspector-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.inspector-enter-from,
.inspector-leave-to {
  transform: translateX(40px);
  opacity: 0;
}
</style>
