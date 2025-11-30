<template>
    <div class="card">
        <div class="card-Value">¥ {{ formateValue }}</div>
        <div class="card-Laber">{{ label }}</div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    value: Number,
    label: String
})

const formateValue = computed(() => {
    const result = props.value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return result
})

</script>

<style lang="scss" scoped>
.card {
    text-align: center;
    background: #ffffff;
    border-radius: 16px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, .06);
    transition: transform .3s, box-shadow .3s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, .08);
}

.card-Value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 6px;
}

.card-Laber {
  font-size: 14px;
  color: #6b7280;
}

</style>