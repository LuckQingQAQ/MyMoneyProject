<template>
    <div class="card">
        <h3 style="padding-bottom: 20px;">快速操作</h3>
        <div class="quick-buttom-div">
            <button>➕ 记一笔收入</button>
            <button>➖ 记一笔支出</button>
            <button>📊 查看报表</button>
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.card {
    background: #ffffff;
    border-radius: 16px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, .06);
    transition: transform .3s, box-shadow .3s;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, .08);
    }
}
.quick-buttom-div{
    display: flex;
    flex-direction: row;
    gap: 20px;
}

button {
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .2s;
  &:hover {
  opacity: .9;
}
}
/* 收入按钮：淡青 */
button:nth-of-type(1) {
  background: #ccfbf1;
  color: #047857;
  box-shadow: 0 4px 14px rgba(5, 150, 105, .15);
}

/* 支出按钮：淡玫瑰 */
button:nth-of-type(2) {
  background: #fee2e2;
  color: #b91c1c;
  box-shadow: 0 4px 14px rgba(239, 68, 68, .15);
}

/* 报表按钮：淡灰 */
button:nth-of-type(3) {
  background: #f3f4f6;
  color: #374151;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .08);
}
</style>