<script setup>
import Sidedar from './component/Sidedar.vue';

</script>

<template>
  <div class="container">
    <Sidedar></Sidedar>
    <div class="main-contain">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
/* ---------- 基础 ---------- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f7fa;
  /* 浅灰背景 */
  color: #333;
  min-height: 100vh;
}

.container {
  display: flex;
  min-height: 100vh;
}

.main-contain {
  flex: 1;
  padding: 30px;
  background: #f5f7fa;
  /* 与 body 一致 */
  overflow-y: auto;
  margin-left: 260px;
  /* 与 sidebar 同宽 */
  min-height: 100vh;
}
</style>
