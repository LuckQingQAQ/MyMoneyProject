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

<style>
/* 覆盖 Element Plus 主题色为绿色 */
:root {
  --el-color-primary: #67c23a;
  --el-color-primary-light-3: #95d475;
  --el-color-primary-light-5: #b3e19d;
  --el-color-primary-light-7: #d1edc4;
  --el-color-primary-light-8: #e1f3d8;
  --el-color-primary-light-9: #f0f9eb;
  --el-color-primary-dark-2: #529b2e;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f5f7fa;
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
  overflow-y: auto;
  margin-left: 260px;
  min-height: 100vh;
}
</style>
