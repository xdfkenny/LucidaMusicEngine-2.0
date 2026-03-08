<script setup lang="ts">
const model = defineModel<string>({ required: true });
</script>

<template>
  <div class="console-search">
    <input v-model="model" placeholder="Search logs" />
    <button type="button" class="secondary" @click="model = ''">Clear</button>
  </div>
</template>
