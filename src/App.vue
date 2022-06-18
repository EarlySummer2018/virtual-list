<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import VirtualList from "./components/VirtualList.vue";
</script>

<template>
  <VirtualList />
</template>

<style>
body,
html,
h3,
ul {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
*,
*::before,
*::after {
  box-sizing: border-box;
  list-style: none;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
